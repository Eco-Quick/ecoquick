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
- **Booking wizard pages** (`/book/*`): call `useBookingAuth()` (from `hooks/useBookingAuth.ts`) instead — it NEVER redirects; if there's no session it silently mints a **Supabase anonymous session** (`signInAnonymously()`) so a guest can build an order without signing up. Returns `{ id, isAnonymous, name, email }`. See **Guest Booking** below. Requires **Anonymous Sign-Ins enabled** in the Supabase dashboard.
- **Supabase client**: always use `createClient()` from `lib/supabase/client.ts` (wraps `createBrowserClient` from `@supabase/ssr`).
- **Driver pages**: auth handled inline in `app/driver/layout.tsx`.
- **Admin pages**: server components only. Call `await requireAdmin()` from `lib/admin-auth.ts` at the top of any admin server component or API route. It redirects unauthenticated users to `/login`, non-admins to their own area. Admin API routes additionally re-check `app_metadata.role === "admin"` before using the service client. Admin role is set via Supabase `app_metadata.role = "admin"` (**not** `user_metadata`) — there is no hardcoded credential. `app_metadata` is deliberately used instead of `user_metadata` because only the service-role key can write it; a user can edit their own `user_metadata` via the client SDK, so storing the admin flag there would let a compromised account grant itself admin access. Set it via `supabase.auth.admin.updateUserById(id, { app_metadata: { role: "admin" } })` from a trusted context (SQL Editor's `auth.users.raw_app_meta_data`, or a script using the service-role key) — never via the regular client `updateUser()` call, which can only touch `user_metadata`.

### Navigation config
`lib/nav-config.ts` is the single source of truth for all customer + admin nav structures: `CUSTOMER_TOP_NAV`, `CUSTOMER_SIDEBAR_NAV`, `CUSTOMER_MOBILE_NAV`, `ADMIN_SIDEBAR_NAV`. Each item has `href`, `label`, `icon`, and a `match(pathname)` function. Do not hardcode nav items in layout components.

---

## Booking Wizard

Multi-step form (`/book/type` → `/book/route` → `/book/parcel` → `/book/confirm`) uses **sessionStorage** to persist state across steps — no React Context, no layout wrapper.

### Guest Booking (no upfront signup)
The funnel is designed for a fast new-user experience — there is **no signup wall before booking**:
1. Landing CTAs ("Send a Parcel", "Book your first delivery") route straight to `/book/type`, NOT `/signup`.
2. Wizard pages use `useBookingAuth()`, which mints a **Supabase anonymous session** on entry (no form, no email). They also render **`<BookingTopBar isAnonymous={…} />`** (not `CustomerTopBar` directly): guests keep the public **`LandingHeader`** navbar, and only flip to the customer navbar (dashboard / orders / notifications / sign-out) once they have a real account. On `/book/confirm` the flag is `isGuest`, so the navbar switches the moment the guest finishes account creation.
3. **Price is gated behind signup for guests** (decision): on `/book/confirm`, a guest (`isGuest = user.isAnonymous && !accountReady`) sees the full order review but the **Pricing block is locked** ("Create your account to see the price") and the CTA reads "Create account to see price". The review CTA branches on `isGuest`: guests get an inline **"Create your account"** step (name/email/phone/password — **no DOB**) before the price is revealed; returning logged-in users see the price immediately and go straight to payment.
4. That step POSTs to **`/api/auth/convert-guest`**, which upgrades the anonymous user to a permanent account via the Auth Admin API with `email_confirm: true` — so **NO confirmation email/link is ever sent**. The `auth.uid()` is preserved, so the order's `customer_id` and all `auth.uid() = customer_id` RLS keep working. Email-already-registered returns `409 EMAIL_TAKEN` → UI shows "Log in instead". On success the confirm page sets `accountReady = true` and returns to the review, which **now reveals the price**; the user then clicks "Continue to payment".
5. **No identity verification** (decision): the ID-verification gate has been **removed from the entire customer flow** — booking, signup, and login no longer route customers to `/verify`, and the dashboard/account verification banners are gone. The `/verify` page and `/api/verification/*` routes still exist and are used by the **driver** onboarding flow only.
6. **Middleware**: `/book/*` is edge-public so logged-out visitors can enter (the page creates the session; payment/convert API routes enforce real auth server-side). Anonymous users (`user.is_anonymous === true`) are treated like visitors on landing/auth pages and are **blocked from permanent-only routes** (`/dashboard`, `/orders`, `/account`, `/impact`, `/notifications`, `/order`, `/help/customer`) → redirected to `/login`.

`/signup` remains for explicit account creation and the **driver** path (`?profile=driver`); drivers are unaffected by the guest flow.

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

### Address entry (route step)

**Removed** (2026-08-22): the Mapbox/OS-Places autocomplete hybrid (`components/AddressAutocomplete.tsx`, `app/api/places/*`) was dropped — Mapbox wasn't reliably resolving addresses. `app/book/route/page.tsx` now uses a plain manual `<input>` for the address field (customer types the full address themselves), with Postcode and City kept as separate plain inputs as before. No coordinates are captured anymore.

This means `pickup_lat/pickup_lng/delivery_lat/delivery_lng` are always `null` on new orders, and the distance-banded pricing in `app/book/confirm/page.tsx` always falls back to its hardcoded 2-mile default (`calculatePrice(2)` — the "1–3 miles" band) since it has no coordinates to compute real distance. Pricing is effectively flat-rate now, not distance-based, until/unless geocoding is reintroduced.

`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is still used elsewhere (live driver-location tracking maps on `/order/track` and `/driver/track`, and the coverage map on `/about`) — this removal only affects the booking address fields.

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

**Pricing function** (inlined in `app/book/confirm/page.tsx` — not a separate file). Distance-banded; straight-line miles from pickup → dropoff. Beyond 8 miles falls into the top band.

```typescript
const DISTANCE_BANDS = [
  { upTo: 1, price: 3.20, label: "0–1 mile" },
  { upTo: 3, price: 4.90, label: "1–3 miles" },
  { upTo: 6, price: 7.10, label: "3–6 miles" },
  { upTo: 8, price: 9.60, label: "6–8 miles" },
] as const;

function calculatePrice(distanceMiles: number) {
  const band = DISTANCE_BANDS.find(b => distanceMiles <= b.upTo) ?? DISTANCE_BANDS.at(-1)!;
  return { distanceMiles, bandLabel: band.label, total: band.price };
}
```

DB write: `base_price = total`, all other fee columns set to 0 (banded model has no fee breakdown).

---

## Admin Console

Server-rendered admin area under `/admin/*`. All pages are React Server Components that fetch directly via the service-role client — no client-side data layer.

**Pages**
- `/admin` — KPI overview (revenue, orders today, active orders, drivers online, pending verifications, status breakdown)
- `/admin/orders` + `/admin/orders/[id]` — list with status/text filters, full detail with timeline, customer/driver links, cancellation
- `/admin/drivers` + `/admin/drivers/[id]` — list with online/active filters, profile + recent jobs, suspend/unsuspend
- `/admin/customers` + `/admin/customers/[id]` — paginated list (50/page) via `auth.admin.listUsers` excluding drivers/admins, profile + lifetime stats, suspend/unsuspend
- `/admin/verifications` — pending ID-verification queue with document preview, approve/reject
- `/admin/activity` — live feed (latest 100) of login attempts, signups, and orders placed, read from `security_events`

### Activity tracking & WhatsApp alerts

`public.security_events` (`event_type` — `login_attempt` | `signup` | `order_placed`, `success`, `email`, `user_id`, `metadata` jsonb, `created_at`) — RLS enabled with **no policies**; only the service-role client can read/write it (explicit `grant ... to service_role` was required — new tables don't get service_role access automatically in this project).

`POST /api/track/event` — service-role insert into `security_events`, then fires a WhatsApp alert via `sendWhatsAppAlert()` (`lib/notify/whatsapp.ts`, CallMeBot API — free/personal, needs `CALLMEBOT_PHONE` + `CALLMEBOT_API_KEY` env vars; no-ops with a console warning if unset). Called from:
- `app/login/page.tsx` — after every `signInWithPassword()` attempt (success or fail)
- `app/signup/page.tsx` — after a successful `signUp()`
- `app/api/auth/convert-guest/route.ts` — inserts directly (server-side already) after a successful guest→permanent conversion, also counts as a signup
- `app/book/confirm/page.tsx` — after the `delivery_orders` insert succeeds, before payment intent creation

Admin 2FA (`/verify-admin`) attempts are deliberately **not** tracked here — that's the admin's own access to this dashboard, not customer-facing activity.

### Manual coordination orders (van / out-of-radius)

Two conditions route a booking to manual coordination instead of automated Stripe payment — the order is still captured (never turned away), but `status` is set to `pending` (not `pending_payment`), no payment intent is created, and the customer sees a "we'll contact you" screen instead of a payment form. Computed in `app/book/confirm/page.tsx` as `needsCoordination = needsVan || outOfRadius`:

- **`needs_van`** — fleet is bikes/cycles and cars only. Triggered by the customer explicitly answering "Yes" to the parcel step's "Do you need a van?" question, or automatically if `package_size === "large"` or weight > 25kg (safety net).
- **`out_of_radius`** — service area is an 8-mile radius of Kingston upon Thames (`HUB_LAT`/`HUB_LNG` in `app/api/postcode-distance/route.ts`, KT1 1EU). Triggered if pickup **or** dropoff is beyond that from the hub (not the pickup↔dropoff distance — a different check from the pricing distance). Deliberately not blocked at checkout — captured as a demand signal for where to expand next.

Both flags are booleans on `delivery_orders`, both fire a distinct WhatsApp alert (`app/api/track/event/route.ts`), and both show as amber badges on `/admin/orders`, `/admin/orders/[id]`, and `/admin/activity`. An order can have both flags at once (shown combined in the customer-facing copy and the alert).

**API routes**
- `POST /api/admin/verify-user` — approve/reject pending verification (existing)
- `POST /api/admin/cancel-order` — set status='cancelled', free driver slot, notify both parties
- `POST /api/admin/suspend-user` — Supabase Auth `ban_duration` + `user_metadata.suspended` flag (blocks own account)

**Auth gate**: every admin server component must call `await requireAdmin()` from `lib/admin-auth.ts` (the admin layout already does so). API routes re-check `user_metadata.role === "admin"` before using the service client. Suspension uses `auth.admin.updateUserById({ ban_duration })` — "876000h" to suspend, "none" to lift.

**Mandatory email 2FA**: after password sign-in, admins are sent to `/verify-admin` (not `/admin` directly) and must enter a 6-digit code before reaching any `/admin/*` page. `/verify-admin` deliberately lives **outside** `app/admin/` — nesting it under `/admin` puts it inside `app/admin/layout.tsx`, whose `requireAdmin()` enforces this same check and would redirect the verify page to itself (infinite redirect loop; hit this exact bug once already). Enforced twice — at the edge in `middleware.ts` and again in `requireAdmin()` — via an `admin_mfa_verified` httpOnly cookie (8h lifetime, cleared on sign-out by `POST /api/auth/clear-admin-mfa`).
- `POST /api/auth/send-admin-code` — sends the code via Supabase Auth's built-in `signInWithOtp({ shouldCreateUser: false })` (no separate email service; role-checked server-side before sending)
- `POST /api/auth/verify-admin-code` — calls `verifyOtp({ type: "email" })`, then sets the cookie
- `components/admin/AdminCodeVerifyForm.tsx` — the code-entry UI, triggers send-admin-code on mount

**Manual prerequisite (Supabase dashboard)**: by default Supabase's Magic Link email template only shows a clickable link, not a visible code. Go to **Authentication → Email Templates → Magic Link** and make sure the body includes `{{ .Token }}` so the admin actually sees a 6-digit code to type in.

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
- `POST /api/auth/convert-guest` — upgrades an anonymous guest session to a permanent customer account (service-role Admin API, `email_confirm: true`, no email sent). See **Guest Booking**.

### New Hook
- `hooks/useNotificationCount.ts` — realtime unread notification count
- `hooks/useBookingAuth.ts` — booking-only auth; mints a Supabase anonymous session instead of redirecting. See **Guest Booking**.

### Manual prerequisite (Supabase dashboard)
Enable **Authentication → Providers → Anonymous Sign-Ins** — the guest booking flow's `signInAnonymously()` 422s without it.

### Key Data Flows
1. Customer books → pays via Stripe → webhook sets status='confirmed' + sends notification
2. Driver sees job in `/driver/jobs` → accepts → API atomically claims it
3. Driver progresses: assigned → picked_up → in_transit → delivered (GPS tracked throughout)
4. Customer tracks in real-time via Supabase Realtime (order status + driver location on Mapbox map)
5. Notifications sent at each status change, badge count in TopBar

### Driver earnings formula
Driver receives 80% of `total_price` per completed delivery.
