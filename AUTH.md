# AUTH.md — Role-Aware Authorization & Guardrails

This document outlines the demo authentication model, role checks, ownership guards, and negative testing scenarios for Sheggar Wheels.

> **Disclaimer**: This application is a frontend-only demonstration[cite: 1, 2, 7]. Storage and authorization checks run entirely within the user's browser and do not provide production-grade security[cite: 2, 7, 10].

---

## 1. Demo Session Model
- Active demo sessions live in `sessionStorage` under the key `sw_session_v1`.
- A session stores only the active user's ID (`userId`) and sign-in timestamp (`signedInAt`).
- `signOut()` clears `sw_session_v1`. Redirecting to `/` is the caller's responsibility; the current helper does not navigate.
- This is a frontend demonstration only. `sessionStorage` and `localStorage` are user-editable and are not a security boundary.

---

## 2. Role Capabilities & Access Control

| Role | Access Scope | Capabilities |
| :--- | :--- | :--- |
| **Visitor / Renter** | Public & Renter Routes | Browse catalogue, filter cars, request bookings, mock payment, view own bookings, cancel eligible bookings, leave reviews[cite: 4]. |
| **Owner** | Owner Routes | Manage own car listings, set daily rates and availability, approve/decline booking requests for own cars, view earnings[cite: 4]. |
| **Admin** | Admin Routes | Moderate car listings (approve/reject), manage demo users, inspect platform activity, resolve disputes with notes, export platform reports[cite: 4]. |

---

## 3. Guardrail Helpers (`lib/auth.js`)
- `getCurrentSession()`: Reads active session metadata from `sessionStorage`.
- `getCurrentUser()`: Resolves the session user ID against `sw_users_v1` and returns `null` for missing or suspended accounts.
- `signInAsDemo(userId)`: Sets the active session key and stores metadata.
- `signOut()`: Clears the active session. It does not redirect.
- `hasRole(user, role)`: Verifies if the active user possesses the required role.
- `safeReturnPath(value)`: Validates return URLs (e.g., `?next=/desired-path`), rejecting external absolute URLs to reduce open-redirect risk. A real sign-in flow must still call it before navigating.

### 3.1 Mutation-Level Guards (`context/AppContext.jsx`)
The reactive store wraps car and booking mutations with authentication, role, and ownership checks. Helpers return `{ ok: false, error }` and do not write to storage when a check fails.

- **Car mutations**: `createCar`, `updateCar`, `setCarStatus`, `softDeleteCar`, `setCarAvailability`.
  - Car creation requires the `owner` role.
  - Moderation status changes require the `admin` role.
  - Owner edits/deletes require matching `car.ownerId`; admins may also act.
- **Booking mutations**: `createBooking`, `updateBookingStatus`, `cancelBooking`.
  - Booking creation requires the `renter` role and an approved car.
  - Owner self-booking, unavailable dates, past/invalid dates, and overlapping active bookings are rejected.
  - Owners may confirm/decline/complete bookings for their own cars; renters may cancel their own bookings; admins may update any booking.

### 3.2 Current Foundation Limitations
- Middleware route protection is **not implemented yet**.
- Sign-in/sign-up pages and protected-layout redirects are **not implemented yet**.
- Therefore owner and admin pages are still directly reachable. Their mutation buttons are denied by the store unless a valid demo session is present in `sessionStorage`.
- `safeReturnPath()` is implemented but not yet used by any page.

---

## 4. Required Negative Tests (UI Misuse Prevention)

1. **Signed-out Write Attempt**: Calling `createCar` or `createBooking` without an active session returns `"Not signed in"` and does not mutate storage.
2. **Cross-User Ownership Attempt**: Attempting to modify another owner's car returns `"Not yours"`. Attempting to cancel another renter's booking returns `"Not yours"`.
3. **Role Attempt**: Calling `setCarStatus` without the `admin` role returns `"Admin access required"`.
4. **Past/Reverse Dates**: Booking with a past start date or an end date before the start date returns an explicit date error.
5. **Double Booking**: Booking dates that overlap a `requested`, `confirmed`, `in_progress`, or `disputed` booking for the same car are rejected.
6. **Unsafe Return URL**: A future sign-in flow must pass `next` through `safeReturnPath()`; external absolute URLs must resolve to `/`.