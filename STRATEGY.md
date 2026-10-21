# STRATEGY.md — Next.js Route & Rendering Architecture

This document maps out every implemented route, its rendering strategy, and the client/server boundary mechanics[cite: 9, 10].

---

## 1. Route Strategy Matrix

| Route | Purpose | Rendering Strategy | Justification |
| :--- | :--- | :--- | :--- |
| `/` | Landing page | Client Component / Hybrid | Displays hero search, featured cars from seed data, and platform guide[cite: 5, 10]. |
| `/cars` | Catalogue | Client Component | Filters, sort controls, and search interact directly with browser storage[cite: 5, 8, 10]. |
| `/cars/[id]` | Car detail | Dynamic Client Component | Reads car ID from URL parameters and fetches vehicle details dynamically[cite: 5, 10]. |
| `/signin` & `/signup` | Authentication | Client Component | Manages demo user selector and updates `sessionStorage`[cite: 3, 5, 7, 10]. |
| `/dashboard` | Renter overview | Protected Client Component | Requires renter role; renders upcoming trips and status summaries[cite: 5, 7, 10]. |
| `/bookings` | Booking history | Protected Client Component | Displays filterable list of user bookings and supports CSV export[cite: 5, 10, 12]. |
| `/bookings/[id]` | Booking details | Protected Client Component | Checks ownership before rendering booking summary and receipt[cite: 5, 8, 10]. |
| `/checkout` | Mock payment | Protected Client Component | Processes checkout draft and creates booking records in storage[cite: 3, 5, 10, 12]. |
| `/owner/*` | Owner tools | Protected Client Component | Requires owner role; manages listings, availability, and earnings[cite: 4, 5, 10]. |
| `/admin/*` | Admin panel | Protected Client Component | Requires admin role; handles moderation, user status, and dispute resolution[cite: 4, 5, 10]. |

---

## 2. Server vs Client Boundary (`BOUNDARY.md`)
- **Server Components**: Used for static layouts, wrapper shells, metadata generation, and non-interactive page structure[cite: 2, 10].
- **Client Components (`"use client"`)**: Used for all components reading from or writing to `localStorage`/`sessionStorage`, interactive forms, filters, maps, and stateful buttons[cite: 2, 10].