# STRATEGY.md — Next.js Route & Rendering Architecture

This document maps the routes that exist in Phase 2A, their rendering strategy, and the client/server boundary used by the browser-storage demo.

---

## 1. Implemented Route Matrix

| Route | Purpose | Rendering strategy | Notes |
| :--- | :--- | :--- | :--- |
| `/` | Landing page | Server page with client widgets | Hero search, category shortcuts, featured cars, map section, and trust features. |
| `/cars` | Public catalogue | Server page shell + client catalogue | Search, category/location/transmission/seats/max-price filters, sorting, real counts, and URL query synchronization. |
| `/cars/[id]` | Car detail | Server wrapper + client detail | Reads the car ID, uses the live `AppContext` collection after hydration, and falls back to seed data for the initial render. |
| `/signin` | Demo sign-in | Server wrapper + client form | Selects one of the seeded demo users, validates the safe `next` path, and updates `sessionStorage`. |
| `/register` | Renter registration | Server wrapper + client form | Creates a renter-only demo user and signs the new account in. |
| `/bookings` | Renter booking history | Protected client page | `RoleGuard` requires the renter role and the page filters bookings by the active renter ID. |
| `/host/dashboard` | Owner dashboard | Protected client page | `app/(host)/host/layout.js` applies `RoleGuard` with `role="owner"`. The dashboard provides basic fleet, listing, and related-booking views. |
| `/admin/console` | Admin console | Protected client page | `app/(admin)/admin/layout.js` applies `RoleGuard` with `role="admin"`. The console provides basic vehicle moderation and demo-data views. |

### Public catalogue rules

- Only cars with `status === "approved"` and no soft-delete marker are shown.
- `/cars` keeps filters in the URL (`q`, `category`, `location`, `transmission`, `seats`, `maxPrice`, `sort`) so refresh and browser history restore the same view.
- The homepage search and category shortcuts link into `/cars` with the same query parameters.
- The data model has no category field, so categories are derived from existing make/model/edition/fuel/price/tag fields in `lib/carCatalog.js`.

---

## 2. Planned but Not Implemented

The following routes appear in the product plan but do not exist in Phase 2A. Navigation does not link to them.

- `/signup`
- `/dashboard` (renter overview)
- `/bookings/[id]` (private booking detail)
- `/checkout`
- Full owner tooling beyond the basic `/host/dashboard`
- Full admin tooling beyond the basic `/admin/console`
- Dispute management and report exports
- Reviews, announcements, notifications, and real payment processing

---

## 3. Server vs Client Boundary

- **Server Components**: Page shells, metadata, Suspense wrappers, and non-interactive structure.
- **Client Components (`"use client"`)**: Components that read or write `localStorage`/`sessionStorage`, interactive forms, URL-synchronized catalogue filters, maps, navigation state, and stateful buttons.
- **Route protection**: Browser-side `RoleGuard` because the demo session lives in `sessionStorage`. Middleware is not used and is not a substitute for the application-level guards.
- **Data**: `AppProvider` hydrates the browser store after mount and exposes reactive state plus guarded mutations.

## 4. Established booking contracts

- Pickup dates are inclusive and return dates are exclusive.
- October 25 through October 28 represents three rental days.
- Same-day and reversed rental ranges are invalid.
- Booking overlap and car unavailability checks use the same half-open
  `[startDate, endDate)` convention.
- Initial booking statuses are `requested`, `confirmed`, `declined`,
  `cancelled`, and `completed`.
- Requested bookings may be confirmed or declined by the car owner or admin,
  and cancelled by the renter or admin.
- Confirmed bookings may be cancelled by the renter or admin before pickup, or
  completed by the owner or admin on or after the return date.
- Declined, cancelled, and completed bookings are terminal. Legacy statuses
  may remain in stored demo records and are readable, but cannot be changed
  through the ordinary new transition workflow.

These are frontend-demo contracts. They are not a substitute for future
Supabase Auth, Row Level Security, database constraints, or trusted database
operations.

## 5. Navigation components

`src/components/Navbar.jsx` is the active navigation imported by
`src/app/layout.js`. `src/components/NavBar.jsx` is a duplicate older
implementation and remains pending a separate cleanup review.
