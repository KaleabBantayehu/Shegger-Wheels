# Shegger Wheels

Shegger Wheels is a browser-persisted Next.js demonstration of a peer-to-peer
vehicle rental catalogue. It is not a production backend. User, car, booking,
review, dispute, and announcement data are stored in browser storage, and the
demo session is stored in `sessionStorage`.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo authentication

This capstone uses mock demo-account selection rather than real authentication. Choose a seeded user on `/signin`; no passwords are requested, stored, or verified. The active demo user ID is stored in `sessionStorage` under `sw_session_v1`, while user, car, and booking records are stored in `localStorage`.

Seeded demo accounts:

- Renter: `user-renter-1` (`renter@sheggar.et`)
- Owner and renter: `user-owner-1` (`owner@sheggar.et`)
- Admin: `user-admin-1` (`admin@sheggar.et`)

New registrations start as renters. A signed-in renter can use **Become an owner** to add the owner role to the same account, then switch between renter booking history and the owner dashboard without creating another account. Admin access remains controlled by seeded data.

Browser storage and client-side role guards are not production security. This project has no backend authentication, database, identity provider, password handling, or real payment processing.

## Current application scope

Implemented demo workflows include:

- Homepage search and catalogue browsing at `/` and `/cars`
- URL-backed catalogue filtering and sorting
- Car details and rental-request submission at `/cars/[id]`
- Mock demo sign-in at `/signin`
- Renter-only registration at `/register`
- Renter booking history at `/bookings`
- A basic owner dashboard at `/host/dashboard` for viewing owned vehicles,
  listing a vehicle, and viewing related bookings
- A basic admin console at `/admin/console` for vehicle moderation and demo
  data inspection

The owner dashboard does not yet expose every available store mutation.
Editing, retiring, availability management, and booking decision controls may
not all be available through the UI. Checkout, real payment processing,
notifications, reviews, disputes, and announcements are not implemented.

Payments are simulated. ETB is the only functional currency in the current
application. The visible USD selector does not convert prices. Claims about
insurance, escrow, or roadside services are presentation content only and do
not represent implemented integrations.
