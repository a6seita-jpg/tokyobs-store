-- Secure foundation for shared orders and support chat.
-- Application code must authenticate with Supabase Auth before these tables are used.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null default '',
  avatar text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin" on public.profiles
  for select to authenticated using (
    id = (select auth.uid()) or exists (
      select 1 from public.profiles me where me.id = (select auth.uid()) and me.role = 'admin'
    )
  );
drop policy if exists "Users can create their own basic profile" on public.profiles;
create policy "Users can create their own basic profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()) and role = 'user');
drop policy if exists "Users can update their own profile without changing role" on public.profiles;
create policy "Users can update their own profile without changing role" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select p.role from public.profiles p where p.id = (select auth.uid())));

alter table public.tokyobs_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.tokyobs_chats add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists tokyobs_orders_user_id_idx on public.tokyobs_orders(user_id);
create index if not exists tokyobs_chats_user_id_idx on public.tokyobs_chats(user_id);

alter table public.tokyobs_orders enable row level security;
alter table public.tokyobs_chats enable row level security;
revoke all on public.tokyobs_orders from anon;
revoke all on public.tokyobs_chats from anon;
grant select, insert, update on public.tokyobs_orders to authenticated;
grant select, insert, update on public.tokyobs_chats to authenticated;

drop policy if exists "Buyers read their own orders" on public.tokyobs_orders;
create policy "Buyers read their own orders" on public.tokyobs_orders
  for select to authenticated using (
    user_id = (select auth.uid()) or exists (
      select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
drop policy if exists "Buyers create their own orders" on public.tokyobs_orders;
create policy "Buyers create their own orders" on public.tokyobs_orders
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Admins update orders" on public.tokyobs_orders;
create policy "Admins update orders" on public.tokyobs_orders
  for update to authenticated using (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  )) with check (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  ));

drop policy if exists "Chat participants read their conversations" on public.tokyobs_chats;
create policy "Chat participants read their conversations" on public.tokyobs_chats
  for select to authenticated using (
    user_id = (select auth.uid()) or exists (
      select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
drop policy if exists "Users create their own conversations" on public.tokyobs_chats;
create policy "Users create their own conversations" on public.tokyobs_chats
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Chat participants update conversations" on public.tokyobs_chats;
create policy "Chat participants update conversations" on public.tokyobs_chats
  for update to authenticated using (
    user_id = (select auth.uid()) or exists (
      select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
    )
  ) with check (
    user_id = (select auth.uid()) or exists (
      select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Realtime is enabled only after the client migrates to Supabase subscriptions.
