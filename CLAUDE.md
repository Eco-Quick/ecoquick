# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Maintenance rule**: Update this file whenever major logic, architecture, schema, or file structure changes. Keep "In-Progress Work" current — mark tasks done and update the status date as work completes.

---

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint (Next.js core-web-vitals + TypeScript rules)
```

No test suite is configured. There is no `test` script.

**Environment**: Copy `.env.local.example` → `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before running locally.

---

## Architecture

**Stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Supabase (`@supabase/ssr`)

**Companion codebase**: `/Users/roshanichede/ecoquick-platform` — production reference for schema/patterns. Do not edit it.

### Two distinct user roles

| Role | Entry | Layout |
|------|-------|--------|
| Customer | `/login` → `/dashboard` | `app/layout.tsx` + `CustomerTopBar` + `CustomerSidebar`/`CustomerMobileNav` |
| Driver | `/login` → `/driver` | `app/driver/layout.tsx` (self-contained — no shared nav components) |
| Admin | `/login` → `/admin` | `app/admin/layout.tsx` (server-gated via `requireAdmin()`) + `AdminSidebar` |

### Route map
```
app/
  page.tsx              # Landing (public)
  login/ signup/        # Auth (public)
  dashboard/            # Customer home
  book/
    type/               # Wizard step 1 — instant vs scheduled
    route/              # Wizard step 2 — pickup + dropoff
    parcel/             # Wizard step 3 — package details
    confirm/            # Wizard step 4 — review + Supabase INSERT
  order/confirmed/      # Post-booking confirmation page (?id=<uuid>)
  orders/               # Customer order history
  driver/               # Driver dashboard + sub-pages (jobs, track, earnings)
  admin/                # Admin console — page.tsx (KPIs), orders/, drivers/, customers/, verifications/
  account/ notifications/ about/ business/ impact/ help/
```

### Auth pattern
- **Customer pages**: call `useCustomerAuth()` (from `hooks/useCustomerAuth.ts`) at component top. Returns `{ id, name, email } | null`; redirects to `/login` if unauthenticated. Never call `supabase.auth.getUser()` directly in customer pages — use the hook.
- **Supabase client**: always use `createClient()` from `lib/supabase/client.ts` (wraps `createBrowserClient` from `@supabase/ssr`).
- **Driver pages**: auth handled inline in `app/driver/layout.tsx`.
- **Admin pages**: server components only. Call `await requireAdmin()` from `lib/admin-auth.ts` at the top of any admin server component or API route. It redirects unauthenticated users to `/login`, non-admins to their own area. Admin API routes additionally re-check `user_metadata.role === "admin"` before using the service client. Admin role is set via Supabase `user_metadata.role = "admin"` — there is no hardcoded credential.

### Navigation config
`lib/nav-config.ts` is the single source of truth for all customer + admin nav structures: `CUSTOMER_TOP_NAV`, `CUSTOMER_SIDEBAR_NAV`, `CUSTOMER_MOBILE_NAV`, `ADMIN_SIDEBAR_NAV`. Each item has `href`, `label`, `icon`, and a `match(pathname)` function. Do not hardcode nav items in layout components.

---

## Booking Wizard

Multi-step form (`/book/type` → `/book/route` → `/book/parcel` → `/book/confirm`) uses **sessionStorage** to persist state across steps — no React Context, no layout wrapper.

**Key**: `"deliveryRequest"` (matches ecoquick-platform for future compatibility)

**Shape**:
```typescript
{
  deliveryType: 'instant' | 'scheduled',
  pickupAddress: string, pickupPostcode: string, pickupCity: string,
  senderName: string, senderPhone: string,
  dropoffAddress: string, dropoffPostcode: string, dropoffCity: string,
  recipientName: string, recipientPhone: string,
  packageCategory: string, packageSize: string,
  weight: number, totalItems: number, handlingInstructions: string,
}
```

**Pattern per step**: read sessionStorage on mount (preserves state on back-nav) → controlled inputs → merge updated fields on Continue → navigate forward. Clear the key after successful Supabase INSERT.

---

## Supabase: `delivery_orders` Table

Single table — no separate parcels table. Column names match ecoquick-platform for future unification.

```
id · customer_id · driver_id · scheduling_type · status
pickup_address · pickup_postcode · pickup_city · sender_name · sender_phone
delivery_address · delivery_postcode · delivery_city · recipient_name · recipient_phone
product_category · package_size · weight · total_items · driver_instructions
base_price · size_fee · scheduling_fee · discount_amount · total_price
estimated_pickup · estimated_delivery · created_at
```

RLS policy: `auth.uid() = customer_id` (customers see only their own rows).

**Pricing function** (inlined in `app/book/confirm/page.tsx` — not a separate file):
```typescript
function calculatePrice(packageSize: string, deliveryType: string) {
  const base = 8.00;
  const sizeFees = { envelope: 0, small: 3.50, medium: 6.50, large: 12.00 };
  const sizeFee = sizeFees[packageSize] ?? 6.50;
  const schedulingFee = deliveryType === 'instant' ? 4.00 : 0;
  const discount = 1.50; // eco-incentive
  return { base, sizeFee, schedulingFee, discount, total: base + sizeFee + schedulingFee - discount };
}
```

---

## Admin Console

Server-rendered admin area under `/admin/*`. All pages are React Server Components that fetch directly via the service-role client — no client-side data layer.

**Pages**
- `/admin` — KPI overview (revenue, orders today, active orders, drivers online, pending verifications, status breakdown)
- `/admin/orders` + `/admin/orders/[id]` — list with status/text filters, full detail with timeline, customer/driver links, cancellation
- `/admin/drivers` + `/admin/drivers/[id]` — list with online/active filters, profile + recent jobs, suspend/unsuspend
- `/admin/customers` + `/admin/customers/[id]` — paginated list (50/page) via `auth.admin.listUsers` excluding drivers/admins, profile + lifetime stats, suspend/unsuspend
- `/admin/verifications` — pending ID-verification queue with document preview, approve/reject

**API routes**
- `POST /api/admin/verify-user` — approve/reject pending verification (existing)
- `POST /api/admin/cancel-order` — set status='cancelled', free driver slot, notify both parties
- `POST /api/admin/suspend-user` — Supabase Auth `ban_duration` + `user_metadata.suspended` flag (blocks own account)

**Auth gate**: every admin server component must call `await requireAdmin()` from `lib/admin-auth.ts` (the admin layout already does so). API routes re-check `user_metadata.role === "admin"` before using the service client. Suspension uses `auth.admin.updateUserById({ ban_duration })` — "876000h" to suspend, "none" to lift.

---

## Styling

- `text-primary` = brand purple `#3f0075`; `text-accent` = brand accent (icons)
- `sharp-edge` = no border-radius
- `nav-tab` / `nav-tab-active` = top nav link styles; `active-nav` = sidebar active state
- Uppercase labels pattern: `text-[10px] font-bold uppercase tracking-widest`
- Icons: `<span className="material-symbols-outlined">icon_name</span>` (Google Material Symbols, loaded via CSS in `globals.css`)

---

## Constraints

- Do not create a layout wrapper for the booking wizard — sessionStorage is the state layer
- Do not create a separate `parcels` table — all booking data goes into `delivery_orders`
- Do not extract `calculatePrice` into a separate file — keep it inline in the confirm page
- Do not edit `/Users/roshanichede/ecoquick-platform`

---

## In-Progress Work

**Full E2E delivery platform** — plan: `/Users/roshanichede/.claude/plans/declarative-pondering-hamming.md`

**Status** (2026-04-06): All code implemented. Build passes.

**Prerequisite** (manual): Run the SQL from the plan file in the Supabase SQL Editor to create:
- `driver_profiles` table (online status, location, rating, earnings)
- `driver_locations` table (GPS tracking history)
- `notifications` table (order status updates)
- Additional columns on `delivery_orders` (lat/lng, status timestamps)
- RLS policies for driver access
- Enable Realtime on `delivery_orders`, `driver_locations`, `notifications`

### New API Routes
- `POST /api/driver/accept-job` — atomic job claim (sets driver_id, notifies customer)
- `POST /api/driver/update-status` — status progression (assigned→picked_up→in_transit→delivered)

### New Hook
- `hooks/useNotificationCount.ts` — realtime unread notification count

### Key Data Flows
1. Customer books → pays via Stripe → webhook sets status='confirmed' + sends notification
2. Driver sees job in `/driver/jobs` → accepts → API atomically claims it
3. Driver progresses: assigned → picked_up → in_transit → delivered (GPS tracked throughout)
4. Customer tracks in real-time via Supabase Realtime (order status + driver location on Mapbox map)
5. Notifications sent at each status change, badge count in TopBar

### Driver earnings formula
Driver receives 80% of `total_price` per completed delivery.
