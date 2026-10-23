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
| `/host/dashboard` | Owner dashboard | Protected client page | `app/(host)/host/layout.js` applies `RoleGuard` with `role="owner"`. |
| `/admin/console` | Admin console | Protected client page | `app/(admin)/admin/layout.js` applies `RoleGuard` with `role="admin"`. |

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
- `/bookings` and `/bookings/[id]`
- `/checkout`
- Full owner tooling beyond `/host/dashboard`
- Full admin tooling beyond `/admin/console`
- Dispute management and report exports

---

## 3. Server vs Client Boundary

- **Server Components**: Page shells, metadata, Suspense wrappers, and non-interactive structure.
- **Client Components (`"use client"`)**: Components that read or write `localStorage`/`sessionStorage`, interactive forms, URL-synchronized catalogue filters, maps, navigation state, and stateful buttons.
- **Route protection**: Browser-side `RoleGuard` because the demo session lives in `sessionStorage`. Middleware is not used and is not a substitute for the application-level guards.
- **Data**: `AppProvider` hydrates the browser store after mount and exposes reactive state plus guarded mutations.
