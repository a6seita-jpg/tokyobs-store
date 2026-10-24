-- TOKYOBS catalog editor + chat compatibility.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  theme_color text not null default '#1B74E4',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  theme_color text not null default '#1B74E4',
  price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.categories enable row level security;
alter table public.catalog_products enable row level security;
drop policy if exists "categories_read_active" on public.categories;
create policy "categories_read_active" on public.categories for select using (active = true or (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')));
drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage" on public.categories for all using (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "catalog_products_read_active" on public.catalog_products;
create policy "catalog_products_read_active" on public.catalog_products for select using (active = true or (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')));
drop policy if exists "catalog_products_admin_manage" on public.catalog_products;
create policy "catalog_products_admin_manage" on public.catalog_products for all using (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
alter table public.reviews add column if not exists demo boolean not null default false;
alter table public.reviews add column if not exists active boolean not null default true;
alter table public.reviews add column if not exists updated_at timestamptz not null default now();
-- Chat UI expects these fields; this migration is safe to re-run.
alter table public.chat_threads add column if not exists status text not null default 'aberto' check (status in ('aberto','fechado','arquivado'));
alter table public.chat_threads add column if not exists closed_by uuid references auth.users(id) on delete set null;
alter table public.chat_threads add column if not exists closed_at timestamptz;
alter table public.chat_threads add column if not exists last_message_at timestamptz;
update public.chat_threads set last_message_at=coalesce(last_message_at,updated_at,created_at) where last_message_at is null;
create index if not exists chat_threads_status_last_message_idx on public.chat_threads(status,last_message_at desc);
create or replace function public.sync_chat_thread_activity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 update public.chat_threads set last_message_at=new.created_at, updated_at=new.created_at where id=new.thread_id;
 return new;
end; $$;
drop trigger if exists chat_messages_activity on public.chat_messages;
create trigger chat_messages_activity after insert on public.chat_messages for each row execute function public.sync_chat_thread_activity();
-- Uploads are restricted to authenticated admins; bucket remains private by default.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('banners','banners',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
drop policy if exists "banners_admin_upload" on storage.objects;
create policy "banners_admin_upload" on storage.objects for insert to authenticated with check (bucket_id='banners' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "banners_admin_update" on storage.objects;
create policy "banners_admin_update" on storage.objects for update to authenticated using (bucket_id='banners' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (bucket_id='banners' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "banners_admin_delete" on storage.objects;
create policy "banners_admin_delete" on storage.objects for delete to authenticated using (bucket_id='banners' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "banners_public_read" on storage.objects;
create policy "banners_public_read" on storage.objects for select using (bucket_id='banners');
