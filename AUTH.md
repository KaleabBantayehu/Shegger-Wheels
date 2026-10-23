# AUTH.md — Role-Aware Authorization & Guardrails

This document outlines the demo authentication model, role checks, route guards, ownership guards, and negative testing scenarios for Sheggar Wheels.

> **Disclaimer**: This application is a frontend-only demonstration. Storage and authorization checks run entirely within the user's browser and do not provide production-grade security.

---

## 1. Demo Session Model

- Active demo sessions live in `sessionStorage` under the key `sw_session_v1`.
- A session stores only the active user's ID (`userId`) and sign-in timestamp (`signedInAt`).
- `/signin` is a clearly labelled mock sign-in that selects one of the seeded demo users. It does not ask for or store a password.
- Demo accounts are selected by role: renter (`user-renter-1`), owner/renter (`user-owner-1`), and admin (`user-admin-1`).
- `/register` creates a new renter-only demo user with no password field. The same account can later use **Become an owner** to add the `owner` role.
- `signOut()` clears `sw_session_v1`. The navbar calls it and returns the visitor to the public homepage.
- `sessionStorage` and `localStorage` are user-editable and are not a security boundary.

---

## 2. Role Capabilities & Access Control

| Role | Implemented access | Current capabilities |
| :--- | :--- | :--- |
| **Visitor / Renter** | Public routes | Browse the catalogue, search/filter cars, view car details, and use the demo sign-in page. |
| **Owner** | Public routes plus `/host/dashboard` | Manage listing data through the existing owner dashboard and guarded store mutations. |
| **Admin** | Public routes plus `/admin/console` | Moderate car listings and inspect current demo data through the existing admin console. |

Booking history, checkout, dispute resolution, and a renter dashboard are not implemented in Phase 2A.

---

## 3. Guardrail Helpers (`lib/auth.js`)

- `getCurrentSession()`: Reads active session metadata from `sessionStorage`.
- `getCurrentUser()`: Resolves the session user ID against `sw_users_v1` and returns `null` for missing or suspended accounts.
- `signInAsDemo(userId)`: Sets the active session key and stores metadata.
- `signInAsDemoUser(userId)`: Validates that the selected user exists and is not suspended, then starts the demo session.
- `addOwnerRole(userId)`: Adds `owner` to the existing user's `roles[]` without changing the user ID, email, renter role, or other records.
- `signOut()`: Clears the active session. It does not redirect.
- `hasRole(user, role)`: Verifies if the active user possesses the required role.
- `safeReturnPath(value)`: Allows only single-slash local application paths. It rejects absolute URLs, protocol-relative URLs (`//`), backslash variants, control characters, malformed percent encoding, repeated encoding tricks, and `/signin` redirect loops. Unsafe values fall back to `/`.

The `/signin` page passes its `next` query parameter through `safeReturnPath()` before navigating.

### 3.1 Route-Level Guards (`components/RoleGuard.jsx`)

- `/host/dashboard` is wrapped by `app/(host)/host/layout.js` with `role="owner"`.
- `/admin/console` is wrapped by `app/(admin)/admin/layout.js` with `role="admin"`.
- The guard waits for `AppProvider` to hydrate the browser session before deciding.
- Signed-out visitors are redirected to `/signin?next=…`, preserving the protected destination.
- Signed-in users without the required role see an access-denied state with options to browse cars or switch demo accounts.
- Protected page content is not rendered until the guard confirms access.
- Middleware is intentionally not used: middleware cannot read the browser-only `sessionStorage` session, so relying on it would create misleading protection.

### 3.2 Mutation-Level Guards (`context/AppContext.jsx`)

The reactive store wraps car and booking mutations with authentication, role, and ownership checks. Helpers return `{ ok: false, error }` and do not write to storage when a check fails.

- **Car mutations**: `createCar`, `updateCar`, `setCarStatus`, `softDeleteCar`, `setCarAvailability`.
  - Car creation requires the `owner` role.
  - Moderation status changes require the `admin` role.
  - Owner edits/deletes require matching `car.ownerId`; admins may also act.
- **Booking mutations**: `createBooking`, `updateBookingStatus`, `cancelBooking`.
  - Booking creation requires the `renter` role and an approved car.
  - Owner self-booking, unavailable dates, past/invalid dates, and overlapping active bookings are rejected.
  - Owners may confirm/decline/complete bookings for their own cars; renters may cancel their own bookings; admins may update any booking.

Route guards protect the UI; mutation guards remain the authoritative application-level checks for store writes.

### 3.3 Remaining Limitations

- There is deliberately no password handling, backend authentication, identity provider, database, or session expiry enforcement.
- `initializeDemoData()` removes legacy `passwordHash` fields from existing stored users without clearing other demo data.
- The navbar and booking workspace expose renter/owner navigation. A dual-role account remains signed in while switching between views.
- The route guards run in the browser and can be bypassed by a user who edits local code or browser storage. This is appropriate only for the demo.
- Owner and admin dashboards still read the shared demo store. Mutation rules enforce ownership where implemented.

---

## 4. Required Negative Tests (UI Misuse Prevention)

1. **Signed-out Write Attempt**: Calling `createCar` or `createBooking` without an active session returns `"Not signed in"` and does not mutate storage.
2. **Cross-User Ownership Attempt**: Attempting to modify another owner's car returns `"Not yours"`. Attempting to cancel another renter's booking returns `"Not yours"`.
3. **Role Attempt**: Calling `setCarStatus` without the `admin` role returns `"Admin access required"`.
4. **Past/Reverse Dates**: Booking with a past start date or an end date before the start date returns an explicit date error.
5. **Double Booking**: Booking dates that overlap a `requested`, `confirmed`, `in_progress`, or `disputed` booking for the same car are rejected.
6. **Unsafe Return URL**: External URLs, protocol-relative URLs, backslash variants, malformed encodings, and encoded redirect tricks must resolve to `/`.
7. **Route Guard**: A signed-out visitor is redirected to demo sign-in. A signed-in renter is denied owner and admin pages. An owner is denied the admin console. An admin is denied the owner dashboard.
8. **Sign-Out**: Signing out from the navigation clears the session and returns to `/`.
