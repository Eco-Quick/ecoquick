-- Fix: Supabase Security Advisor flagged public.order_status_history as
-- "RLS Disabled in Public" (critical) — with no RLS at all, anyone holding
-- the project's anon key could read, edit, or delete every row in this
-- table (order_id, old/new status, who changed it, notes).
--
-- This table isn't referenced anywhere in the ecoquick codebase — it's
-- written to at the database level (trigger or another system) — so this
-- migration only adds read policies mirroring delivery_orders' existing
-- RLS model. With RLS enabled and no insert/update/delete policies, direct
-- writes from the anon/authenticated roles stay blocked (only the
-- service-role key, which bypasses RLS, or a SECURITY DEFINER trigger can
-- write); this does not touch whatever currently populates the table.

alter table public.order_status_history enable row level security;

drop policy if exists "Customers read their own order history" on public.order_status_history;

create policy "Customers read their own order history"
  on public.order_status_history
  for select
  to authenticated
  using (
    exists (
      select 1 from public.delivery_orders o
      where o.id = order_status_history.order_id
        and o.customer_id = auth.uid()
    )
  );

drop policy if exists "Admins read all order history" on public.order_status_history;

create policy "Admins read all order history"
  on public.order_status_history
  for select
  to authenticated
  using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );
