-- One-time, server-only bootstrap for the first TOKYOBS administrator.
-- The shared secret is checked by the Edge Function and is never stored in SQL.
create table if not exists public.admin_bootstrap_state (
  id boolean primary key default true check (id),
  consumed_at timestamptz,
  consumed_email text
);
insert into public.admin_bootstrap_state (id, consumed_at, consumed_email)
values (true, null, null) on conflict (id) do nothing;
alter table public.admin_bootstrap_state enable row level security;
revoke all on table public.admin_bootstrap_state from public, anon, authenticated;

create or replace function public.consume_admin_bootstrap(p_email text)
returns table(email text, role text)
language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid;
begin
  perform 1 from public.admin_bootstrap_state where id = true for update;
  if not exists (select 1 from public.admin_bootstrap_state where id = true and consumed_at is null) then
    raise exception 'Admin bootstrap already consumed';
  end if;
  select u.id into v_user_id from auth.users u
    where lower(u.email) = lower(trim(p_email)) limit 1;
  if v_user_id is null then raise exception 'Target account not found'; end if;
  update public.profiles p set role = 'admin', updated_at = now() where p.id = v_user_id;
  if not found then raise exception 'Profile not found for target account'; end if;
  update public.admin_bootstrap_state set consumed_at = now(), consumed_email = lower(trim(p_email))
    where id = true and consumed_at is null;
  if not found then raise exception 'Admin bootstrap already consumed'; end if;
  return query select p.email, p.role from public.profiles p where p.id = v_user_id;
end;
$$;
revoke all on function public.consume_admin_bootstrap(text) from public, anon, authenticated;
grant execute on function public.consume_admin_bootstrap(text) to service_role;
