# AUTH.md — Role-Aware Authorization & Guardrails

This document outlines the demo authentication model, role checks, ownership guards, and negative testing scenarios for Sheggar Wheels.

> **Disclaimer**: This application is a frontend-only demonstration[cite: 1, 2, 7]. Storage and authorization checks run entirely within the user's browser and do not provide production-grade security[cite: 2, 7, 10].

---

## 1. Demo Session Model
- Active demo sessions live in `sessionStorage` under the key `sw_session_v1`[cite: 3].
- A session stores only the active user's ID (`userId`) and sign-in timestamp (`signedInAt`)[cite: 3, 7].
- On sign-out, `sw_session_v1` is cleared and the user is redirected to the landing page (`/`)[cite: 7].

---

## 2. Role Capabilities & Access Control

| Role | Access Scope | Capabilities |
| :--- | :--- | :--- |
| **Visitor / Renter** | Public & Renter Routes | Browse catalogue, filter cars, request bookings, mock payment, view own bookings, cancel eligible bookings, leave reviews[cite: 4]. |
| **Owner** | Owner Routes | Manage own car listings, set daily rates and availability, approve/decline booking requests for own cars, view earnings[cite: 4]. |
| **Admin** | Admin Routes | Moderate car listings (approve/reject), manage demo users, inspect platform activity, resolve disputes with notes, export platform reports[cite: 4]. |

---

## 3. Mandatory Guardrail Helpers (`lib/auth.js`)
- `getCurrentSession()`: Reads active session metadata from `sessionStorage`[cite: 3, 7].
- `signInAsDemo(userId)`: Sets active session key and stores metadata[cite: 7].
- `signOut()`: Clears active session and redirects to `/`[cite: 7].
- `hasRole(user, role)`: Verifies if the active user possesses the required role[cite: 7].
- `safeReturnPath(value)`: Validates return URLs (e.g., `?next=/desired-path`), rejecting external absolute URLs to prevent open redirect vulnerabilities[cite: 3, 7, 8].

---

## 4. Required Negative Tests (UI Misuse Prevention)

1. **Signed-out Write Attempt**: Calling a booking mutation function without an active session immediately returns `"Not signed in"` without mutating `localStorage`[cite: 7].
2. **Cross-User Ownership Attempt**: Attempting to cancel or modify a booking/car owned by another user ID returns `"Not yours"` and halts execution.
3. **Unsafe Return URL**: Navigating to `/signin?next=https://example.com` strips external domain parameters upon sign-in and redirects safely to `/`[cite: 8].