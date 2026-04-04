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
  account/ notifications/ about/ business/ impact/ help/
```

### Auth pattern
- **Customer pages**: call `useCustomerAuth()` (from `hooks/useCustomerAuth.ts`) at component top. Returns `{ id, name, email } | null`; redirects to `/login` if unauthenticated. Never call `supabase.auth.getUser()` directly in customer pages — use the hook.
- **Supabase client**: always use `createClient()` from `lib/supabase/client.ts` (wraps `createBrowserClient` from `@supabase/ssr`).
- **Driver pages**: auth handled inline in `app/driver/layout.tsx`.

### Navigation config
`lib/nav-config.ts` is the single source of truth for all three customer nav structures: `CUSTOMER_TOP_NAV`, `CUSTOMER_SIDEBAR_NAV`, `CUSTOMER_MOBILE_NAV`. Each item has `href`, `label`, `icon`, and a `match(pathname)` function. Do not hardcode nav items in layout components.

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

**Booking flow end-to-end wiring** — full plan: `/Users/roshanichede/.claude/plans/bubbly-crafting-frog.md`

**Status** (2026-03-18): Plan approved, implementation not yet started.

**Prerequisite** (manual): Run `delivery_orders` SQL in the Supabase SQL Editor (full SQL in plan file above).

Remaining tasks:
1. `app/book/type/page.tsx` — write `deliveryType` to sessionStorage on card/Continue click
2. `app/book/route/page.tsx` — 10 controlled inputs initialised from sessionStorage, save on Continue
3. `app/book/parcel/page.tsx` — 5 controlled inputs initialised from sessionStorage, save on Continue
4. `app/book/confirm/page.tsx` — read sessionStorage, real price calc, Supabase INSERT → `/order/confirmed?id=<uuid>`
5. `app/order/confirmed/page.tsx` — add `useSearchParams()`, fetch order by id, replace hardcoded values
6. `app/orders/page.tsx` — remove hardcoded array, fetch `delivery_orders` for current user, add empty state
