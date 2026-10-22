-- TOKYOBS: shared orders and support chat with owner/admin RLS.
-- Apply this migration in the linked Supabase project before enabling these features.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null default '',
  avatar text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nickname, avatar)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'nickname', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  buyer_email text not null,
  buyer_nickname text not null default '',
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento','em_analise','expirado','entregue')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  comprovante text,
  observacao text
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('support','order')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_email text not null,
  owner_name text not null default '',
  order_id text references public.orders(id) on delete cascade,
  unread_for_admin integer not null default 0 check (unread_for_admin >= 0),
  unread_for_user integer not null default 0 check (unread_for_user >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_order_kind_consistency check (
    (kind = 'support' and order_id is null) or (kind = 'order' and order_id is not null)
  )
);

create unique index if not exists chat_support_owner_unique on public.chat_threads(owner_id) where kind = 'support';
create unique index if not exists chat_order_unique on public.chat_threads(order_id) where kind = 'order';
create index if not exists chat_threads_updated_idx on public.chat_threads(updated_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('user','admin')),
  author text not null default '',
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_created_idx on public.chat_messages(thread_id, created_at);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users read own profile or admins read all" on public.profiles;
create policy "Users read own profile or admins read all" on public.profiles
for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if new.role is distinct from old.role and not (select public.is_admin()) then
    raise exception 'Only administrators can change profile roles';
  end if;
  new.updated_at = now();
  return new;
end;
$;
drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger before update on public.profiles
for each row execute procedure public.protect_profile_role();

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update to authenticated using (id = (select auth.uid()) or (select public.is_admin()))
with check (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders" on public.orders
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users read own orders and admins read all" on public.orders;
create policy "Users read own orders and admins read all" on public.orders
for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Thread owner and admins read threads" on public.chat_threads;
create policy "Thread owner and admins read threads" on public.chat_threads
for select to authenticated using (owner_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "Thread owner creates support or own-order threads" on public.chat_threads;
create policy "Thread owner creates support or own-order threads" on public.chat_threads
for insert to authenticated with check (
  owner_id = (select auth.uid()) and
  (kind = 'support' or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())
  ))
);
drop policy if exists "Admins update thread counters" on public.chat_threads;
create policy "Admins update thread counters" on public.chat_threads
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Thread participants read messages" on public.chat_messages;
create policy "Thread participants read messages" on public.chat_messages
for select to authenticated using (
  exists (select 1 from public.chat_threads t where t.id = thread_id and
    (t.owner_id = (select auth.uid()) or (select public.is_admin())))
);
drop policy if exists "Thread participants send messages as themselves" on public.chat_messages;
create policy "Thread participants send messages as themselves" on public.chat_messages
for insert to authenticated with check (
  sender_id = (select auth.uid()) and
  exists (select 1 from public.chat_threads t where t.id = thread_id and
    (t.owner_id = (select auth.uid()) or (select public.is_admin())) and
    ((sender_role = 'admin' and (select public.is_admin())) or (sender_role = 'user' and t.owner_id = (select auth.uid())))
  )
);

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update on public.chat_threads to authenticated;
grant select, insert on public.chat_messages to authenticated;

-- Enable Realtime for cross-device chat/order updates (safe if already present).
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chat_threads;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
