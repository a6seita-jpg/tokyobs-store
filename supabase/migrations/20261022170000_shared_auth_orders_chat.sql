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

-- Customer payment submission is restricted to the order owner and cannot mark an order delivered.
create or replace function public.submit_order_payment(
  p_order_id text,
  p_comprovante text default null,
  p_observacao text default null,
  p_expire boolean default false
) returns void
language plpgsql
security definer
set search_path = ''
as $
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.orders
  set comprovante = case when p_expire then comprovante else p_comprovante end,
      observacao = case when p_expire then observacao else p_observacao end,
      status = case when p_expire then 'expirado' else 'em_analise' end
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'aguardando_pagamento'
    and (expires_at > now() or p_expire);
  if not found then raise exception 'Order not found or no longer payable'; end if;
end;
$;
revoke all on function public.submit_order_payment(text,text,text,boolean) from public;
grant execute on function public.submit_order_payment(text,text,text,boolean) to authenticated;


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


create or replace function public.send_chat_message(
  p_thread_id uuid,
  p_body text,
  p_author text default ''
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_owner uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_body)) < 1 or char_length(p_body) > 5000 then raise exception 'Invalid message'; end if;
  select owner_id into v_owner from public.chat_threads where id = p_thread_id;
  if not found then raise exception 'Conversation not found'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role = 'admin' then
    insert into public.chat_messages(thread_id, sender_id, sender_role, author, body)
    values (p_thread_id, auth.uid(), 'admin', coalesce(p_author, ''), trim(p_body));
    update public.chat_threads set unread_for_user = unread_for_user + 1, updated_at = now() where id = p_thread_id;
  elsif v_owner = auth.uid() then
    insert into public.chat_messages(thread_id, sender_id, sender_role, author, body)
    values (p_thread_id, auth.uid(), 'user', coalesce(p_author, ''), trim(p_body));
    update public.chat_threads set unread_for_admin = unread_for_admin + 1, updated_at = now() where id = p_thread_id;
  else
    raise exception 'Not allowed';
  end if;
end;
$$;
revoke all on function public.send_chat_message(uuid,text,text) from public;
grant execute on function public.send_chat_message(uuid,text,text) to authenticated;

create or replace function public.mark_chat_read(p_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_threads
  set unread_for_user = case when owner_id = auth.uid() then 0 else unread_for_user end,
      unread_for_admin = case when (select public.is_admin()) then 0 else unread_for_admin end
  where id = p_thread_id and (owner_id = auth.uid() or (select public.is_admin()));
  if not found then raise exception 'Not allowed'; end if;
end;
$$;
revoke all on function public.mark_chat_read(uuid) from public;
grant execute on function public.mark_chat_read(uuid) to authenticated;
