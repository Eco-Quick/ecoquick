-- Admin console: let admin sessions read every delivery order.
--
-- Why: the admin pages and the live activity feed (components/admin/AdminActivityBell.tsx)
-- subscribe to `delivery_orders` over Supabase Realtime, which enforces RLS. The base
-- policy only exposes a customer's own rows (auth.uid() = customer_id), so without this an
-- admin session sees nothing and the feed/toasts stay empty. This grants read access to any
-- authenticated user whose JWT marks them as an admin — the same trust model used by
-- requireAdmin() (lib/admin-auth.ts) and every /api/admin/* route.
--
-- Note: this trusts user_metadata.role, which by Supabase default a user can self-set.
-- That is a pre-existing property of the whole admin gate, not introduced here. Harden
-- later by moving the role into app_metadata or a dedicated admins table.

drop policy if exists "Admins read all orders" on public.delivery_orders;

create policy "Admins read all orders"
  on public.delivery_orders
  for select
  to authenticated
  using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Ensure Realtime broadcasts order changes to the admin feed (safe no-op if already added).
do $$
begin
  alter publication supabase_realtime add table public.delivery_orders;
exception
  when duplicate_object then null;
end $$;
