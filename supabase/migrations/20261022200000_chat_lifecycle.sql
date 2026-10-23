-- Lifecycle controls for existing TOKYOBS chat_threads. Keeps existing order IDs/history intact.
alter table public.chat_threads
  add column if not exists status text not null default 'aberto'
    check (status in ('aberto','fechado','arquivado')),
  add column if not exists closed_by uuid references auth.users(id) on delete set null,
  add column if not exists closed_at timestamptz,
  add column if not exists last_message_at timestamptz;

update public.chat_threads
set last_message_at = coalesce(last_message_at, updated_at, created_at)
where last_message_at is null;

create index if not exists chat_threads_status_last_message_idx
  on public.chat_threads(status, last_message_at desc);

-- Resolve legacy duplicate open order threads before adding the partial unique index.
-- Keep the most recently updated thread open and preserve older threads as history.
with ranked as (
  select id, row_number() over (partition by order_id order by updated_at desc, created_at desc, id desc) as rn
  from public.chat_threads
  where kind = 'order' and status = 'aberto' and order_id is not null
)
update public.chat_threads t
set status = 'fechado', closed_at = coalesce(t.closed_at, now()), updated_at = now()
from ranked r
where t.id = r.id and r.rn > 1;

-- Allow a new conversation after a previous order chat was closed, while retaining history.
drop index if exists public.chat_order_unique;
create unique index if not exists chat_order_open_unique
  on public.chat_threads(order_id) where kind = 'order' and status = 'aberto';

-- Keep last_message_at in sync and automatically close after 48h without a customer reply.
create or replace function public.sync_chat_thread_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.chat_threads
  set last_message_at = new.created_at,
      updated_at = new.created_at
  where id = new.thread_id;
  return new;
end;
$$;
drop trigger if exists chat_message_activity_trigger on public.chat_messages;
create trigger chat_message_activity_trigger
after insert on public.chat_messages
for each row execute function public.sync_chat_thread_activity();

-- Enforce lifecycle status at the database boundary, not only in the UI.
create or replace function public.send_chat_message(
  p_thread_id uuid,
  p_body text,
  p_author text default ''
) returns void
language plpgsql security definer set search_path = '' as $ 
declare v_role text; v_owner uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_body)) < 1 or char_length(p_body) > 5000 then raise exception 'Invalid message'; end if;
  select owner_id into v_owner from public.chat_threads where id = p_thread_id;
  if not found then raise exception 'Conversation not found'; end if;
  if not exists (select 1 from public.chat_threads where id = p_thread_id and status = 'aberto') then
    raise exception 'Conversation is closed';
  end if;
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
$;
revoke all on function public.send_chat_message(uuid,text,text) from public;
grant execute on function public.send_chat_message(uuid,text,text) to authenticated;

create or replace function public.admin_close_chat(p_thread_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Admin only'; end if;
  update public.chat_threads
  set status = 'fechado', closed_by = auth.uid(), closed_at = now(), updated_at = now()
  where id = p_thread_id and status = 'aberto';
  if not found then raise exception 'Chat não está aberto'; end if;
  insert into public.chat_messages(thread_id, sender_id, sender_role, author, body)
  values (p_thread_id, auth.uid(), 'admin', 'Sistema',
    'Este atendimento foi encerrado. Se precisar, abra novamente pela sua compra.');
end;
$$;
revoke all on function public.admin_close_chat(uuid) from public;
grant execute on function public.admin_close_chat(uuid) to authenticated;

create or replace function public.admin_archive_chat(p_thread_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Admin only'; end if;
  update public.chat_threads set status = 'arquivado', updated_at = now()
  where id = p_thread_id;
  if not found then raise exception 'Chat não encontrado'; end if;
end;
$$;
revoke all on function public.admin_archive_chat(uuid) from public;
grant execute on function public.admin_archive_chat(uuid) to authenticated;

create or replace function public.customer_reopen_order_chat(p_order_id text, p_owner_name text default '')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_thread uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.orders o where o.id = p_order_id and o.user_id = v_user) then
    raise exception 'Pedido não encontrado';
  end if;
  select id into v_thread from public.chat_threads
  where owner_id = v_user and kind = 'order' and order_id = p_order_id and status = 'aberto'
  order by created_at desc limit 1;
  if v_thread is not null then return v_thread; end if;
  insert into public.chat_threads(kind, owner_id, owner_email, owner_name, order_id, status)
  select 'order', v_user, coalesce(u.email,''), coalesce(nullif(p_owner_name,''), u.email, ''), p_order_id, 'aberto'
  from auth.users u where u.id = v_user
  returning id into v_thread;
  return v_thread;
end;
$$;
revoke all on function public.customer_reopen_order_chat(text,text) from public;
grant execute on function public.customer_reopen_order_chat(text,text) to authenticated;

create or replace function public.admin_close_inactive_chats()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if not (select public.is_admin()) then raise exception 'Admin only'; end if;
  with changed as (
    update public.chat_threads
    set status = 'fechado', closed_by = auth.uid(), closed_at = now(), updated_at = now()
    where status = 'aberto'
      and coalesce(last_message_at, updated_at, created_at) < now() - interval '7 days'
    returning id
  )
  select count(*) into v_count from changed;
  return v_count;
end;
$$;
revoke all on function public.admin_close_inactive_chats() from public;
grant execute on function public.admin_close_inactive_chats() to authenticated;

-- Cron is optional on Supabase projects; schedule only when pg_cron is installed.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute $cmd$
      select cron.schedule(
        'tokyobs-auto-close-inactive-customer-chats',
        '15 * * * *',
        $job$
          update public.chat_threads t
          set status = 'fechado', closed_at = now(), updated_at = now()
          where t.status = 'aberto'
            and exists (
              select 1 from public.chat_messages m
              where m.thread_id = t.id and m.sender_role = 'user'
            )
            and coalesce(t.last_message_at, t.updated_at) < now() - interval '48 hours'
            and (
              select m.sender_role from public.chat_messages m
              where m.thread_id = t.id order by m.created_at desc limit 1
            ) = 'user';
        $job$
      )
    $cmd$;
  end if;
exception when others then
  raise notice 'Auto-close cron was not scheduled; pg_cron may not be enabled: %', sqlerrm;
end $$;
