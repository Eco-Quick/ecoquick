-- Harden admin checks: move the admin designation from user_metadata to
-- app_metadata everywhere.
--
-- Why: Supabase's Security Advisor flagged every RLS policy checking
-- user_metadata.role (delivery_orders, admin_signup_events,
-- order_status_history) as "RLS references user metadata" — user_metadata
-- can be edited by the user themselves via the client SDK, so in principle
-- a compromised account could try to set role: "admin" on itself.
-- app_metadata can only be written with the service-role key (e.g. via
-- supabase.auth.admin.updateUserById), never by the user, so it's the
-- correct place for an authorization flag. The two existing admin
-- accounts' role has already been migrated to app_metadata via the Admin
-- API (and removed from user_metadata) as part of this change; this
-- migration just updates the RLS policies to match what the application
-- code now checks (see middleware.ts, lib/admin-auth.ts, and every
-- /api/admin/* and /api/auth/*-admin-code route).

drop policy if exists "Admins read all orders" on public.delivery_orders;

create policy "Admins read all orders"
  on public.delivery_orders
  for select
  to authenticated
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

drop policy if exists "Admins read signup events" on public.admin_signup_events;

create policy "Admins read signup events"
  on public.admin_signup_events
  for select
  to authenticated
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

drop policy if exists "Admins read all order history" on public.order_status_history;

create policy "Admins read all order history"
  on public.order_status_history
  for select
  to authenticated
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );
