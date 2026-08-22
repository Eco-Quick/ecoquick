-- Admin console: notify admins in real time when someone signs up, or a
-- guest booking session converts to a permanent account.
--
-- Why: components/admin/AdminActivityBell.tsx only watched delivery_orders,
-- so admins had no way to notice new signups without manually re-checking
-- the Customers page. auth.users lives in a schema Realtime can't watch
-- directly, so a trigger mirrors qualifying signups into this public table,
-- which the admin feed subscribes to instead.

create table if not exists public.admin_signup_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  full_name text,
  user_type text,
  event text not null default 'signup', -- 'signup' | 'guest_converted'
  created_at timestamptz not null default now()
);

alter table public.admin_signup_events enable row level security;

drop policy if exists "Admins read signup events" on public.admin_signup_events;

create policy "Admins read signup events"
  on public.admin_signup_events
  for select
  to authenticated
  using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Mirrors a qualifying auth.users row into the public table above.
-- security definer because it needs to read/write across the auth/public
-- schema boundary from a trigger on auth.users.
create or replace function public.notify_admin_of_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event text;
  v_full_name text;
begin
  if tg_op = 'INSERT' then
    -- Skip anonymous booking sessions — only real account creation counts.
    if new.is_anonymous is true then
      return new;
    end if;
    v_event := 'signup';
  elsif tg_op = 'UPDATE' then
    -- Guest -> permanent account conversion (see /api/auth/convert-guest).
    if not (old.is_anonymous is true and new.is_anonymous is false) then
      return new;
    end if;
    v_event := 'guest_converted';
  else
    return new;
  end if;

  v_full_name := trim(both ' ' from
    coalesce(new.raw_user_meta_data ->> 'first_name', '') || ' ' ||
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  if v_full_name = '' then
    v_full_name := new.raw_user_meta_data ->> 'full_name';
  end if;

  insert into public.admin_signup_events (user_id, email, full_name, user_type, event)
  values (
    new.id,
    new.email,
    v_full_name,
    coalesce(new.raw_user_meta_data ->> 'user_type', 'customer'),
    v_event
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_signup on auth.users;
create trigger on_auth_user_signup
  after insert on auth.users
  for each row execute function public.notify_admin_of_signup();

drop trigger if exists on_auth_user_guest_converted on auth.users;
create trigger on_auth_user_guest_converted
  after update on auth.users
  for each row execute function public.notify_admin_of_signup();

-- Ensure Realtime broadcasts these events to the admin feed (safe no-op if already added).
do $$
begin
  alter publication supabase_realtime add table public.admin_signup_events;
exception
  when duplicate_object then null;
end $$;
