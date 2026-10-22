# DATA.md  Data Architecture & Storage Contracts

This document specifies the client-side data architecture, storage key definitions, entity schemas, validation rules, and error recovery behaviors for Sheggar Wheels[cite: 9, 10].

---

## 1. Storage Keys Overview

Because this application operates without a traditional backend database, browser storage acts as the persistent and session data store[cite: 2, 8].

| Storage Engine | Key Name | Data Type | Purpose & Lifetime |
| :--- | :--- | :--- | :--- |
| **localStorage** | `sw_users_v1` | `User[]` | Demo user accounts and roles. Persists until cleared[cite: 3]. |
| **localStorage** | `sw_cars_v1` | `Car[]` | Vehicle listings, moderation state, and availability. Persists until cleared[cite: 3]. |
| **localStorage** | `sw_bookings_v1` | `Booking[]` | Booking lifecycle records and pricing snapshots. Persists until cleared[cite: 3]. |
| **localStorage** | `sw_reviews_v1` | `Review[]` | Renter reviews and owner responses. Persists until cleared[cite: 3]. |
| **localStorage** | `sw_disputes_v1` | `Dispute[]` | Dispute records and resolution logs. Persists until cleared[cite: 3]. |
| **localStorage** | `sw_announcements_v1` | `Announcement[]` | Platform-wide announcements from admins. Persists until cleared[cite: 3]. |
| **sessionStorage** | `sw_session_v1` | `Session` | Currently signed-in demo user ID and auth state. Ends when tab closes[cite: 3]. |
| **sessionStorage** | `sw_checkout_draft_v1` | `CheckoutDraft` | Temporary selected dates and checkout summary prior to payment confirmation[cite: 3]. |

---

## 2. Entity Schemas & Models

### 2.1 User Entity (`sw_users_v1`)
```ts
interface User {
  id: string;               // Standard UUID generated via crypto.randomUUID()[cite: 6]
  name: string;             // User's full name[cite: 6]
  email: string;            // Unique email address used for demo sign-in[cite: 6]
  phone: string;            // Contact telephone number[cite: 6]
  roles: ('renter' | 'owner' | 'admin')[]; // Array supporting coexisting roles (e.g., ['renter', 'owner'])[cite: 3, 6]
  status: 'active' | 'suspended'; // Account status controlled by admin[cite: 6, 7]
  createdAt: string;        // ISO 8601 Date-time string (YYYY-MM-DDTHH:mm:ss.sssZ)[cite: 6]
}
```

### 2.2 Car Entity (sw_cars_v1)
```ts
interface Car {
  id: string;               // Standard UUID[cite: 6]
  ownerId: string;          // Foreign Key linking to User.id[cite: 6]
  make: string;             // Vehicle make (e.g., "Toyota")[cite: 6]
  model: string;            // Vehicle model (e.g., "Yaris")[cite: 6]
  year: number;             // Manufacturing year[cite: 6]
  transmission: 'automatic' | 'manual'; // Transmission type[cite: 6]
  seats: number;            // Total seating capacity[cite: 6]
  city: string;             // City location (default: "Addis Ababa")[cite: 6]
  neighbourhood: string;    // Neighborhood (e.g., "Bole", "Kazanchis", "Old Airport")[cite: 6]
  latitude: number;         // Geographic coordinates for map placement[cite: 6]
  longitude: number;        // Geographic coordinates for map placement[cite: 6]
  pricePerDay: number;      // Daily rental rate in ETB[cite: 6]
  photos: string[];         // Image URLs or local placeholder paths[cite: 6]
  description: string;      // Public listing description[cite: 6]
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'inactive'; // Moderation lifecycle state[cite: 6]
  unavailableDates: string[]; // ISO Date strings (YYYY-MM-DD) blocked by owner[cite: 6]
  createdAt: string;        // ISO 8601 Date-time string[cite: 6]
}
```

### 2.3 Booking Entity (sw_bookings_v1)
```ts
interface Booking {
  id: string;               // Standard UUID[cite: 6]
  carId: string;            // Foreign Key linking to Car.id[cite: 6]
  renterId: string;         // Foreign Key linking to User.id[cite: 6]
  ownerId: string;          // Foreign Key linking to Car.ownerId[cite: 6]
  startDate: string;        // ISO Date string (YYYY-MM-DD)[cite: 6]
  endDate: string;          // ISO Date string (YYYY-MM-DD)[cite: 6]
  days: number;             // Total rental duration in days[cite: 6]
  pricePerDay: number;      // Snapshot of agreed daily rate at booking time[cite: 6]
  subtotal: number;         // Calculated as (days * pricePerDay)[cite: 6]
  fee: number;              // Calculated platform fee snapshot[cite: 6]
  total: number;            // Total price payable (subtotal + fee)[cite: 6]
  paymentStatus: 'unpaid' | 'paid' | 'refunded'; // Mock transaction status[cite: 6, 7]
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'reviewed' | 'declined' | 'cancelled' | 'disputed' | 'resolved'; // Lifecycle state[cite: 6, 7]
  createdAt: string;        // ISO 8601 Date-time string[cite: 6]
  updatedAt: string;        // ISO 8601 Date-time string[cite: 6]
}
```

### 2.4 Review Entity (sw_reviews_v1)
```ts
interface Review {
  id: string;               // Standard UUID[cite: 6]
  bookingId: string;        // Foreign Key linking to Booking.id[cite: 6]
  carId: string;            // Foreign Key linking to Car.id[cite: 6]
  renterId: string;         // Foreign Key linking to User.id[cite: 6]
  ownerId: string;          // Foreign Key linking to Car.ownerId[cite: 6]
  rating: number;           // Integer score between 1 and 5[cite: 6]
  comment: string;          // Renter review feedback[cite: 6]
  ownerReply?: string;      // Optional response from the car owner[cite: 6]
  createdAt: string;        // ISO 8601 Date-time string[cite: 6]
}
```

### 2.5 Dispute Entity (sw_disputes_v1)
```ts
interface Dispute {
  id: string;               // Standard UUID[cite: 6]
  bookingId: string;        // Foreign Key linking to Booking.id[cite: 6]
  openedBy: string;         // Foreign Key linking to User.id[cite: 6]
  reason: string;           // Brief summary of issue[cite: 6]
  description: string;      // Detailed explanation of conflict[cite: 6]
  status: 'open' | 'resolved'; // Dispute status[cite: 6]
  resolutionNotes?: string; // Admin notes upon resolving[cite: 6]
  resolvedBy?: string;      // Foreign Key linking to Admin User.id[cite: 6]
  createdAt: string;        // ISO 8601 Date-time string[cite: 6]
  resolvedAt?: string;      // ISO 8601 Date-time string[cite: 6]
}
```

### 2.6 Session Object (sessionStorage: sw_session_v1)
```ts
interface Session {
  userId: string;           // Currently signed-in user ID[cite: 3, 7]
  signedInAt: string;       // ISO 8601 Date-time string[cite: 3]
}
```

## 3. Storage Utility Helpers & Data Boundaries
To prevent JSON parsing failures and handle missing data safely, all application components interact with browser storage through unified data access functions:

- `readStorage(key, fallback, storageType)`: Safely reads and parses JSON from `localStorage` or `sessionStorage`. Returns the fallback if the key is missing or the stored data is malformed.
- `writeStorage(key, value, storageType)`: Serializes and writes data safely, returning `false` if the browser rejects the write (for example, when the storage quota is full).
- `removeStorage(key, storageType)`: Safely removes one storage key.
- `initializeDemoData()`: Idempotently seeds missing or malformed demo keys. It never overwrites valid existing data, so user changes survive reloads. Reviews, disputes, and announcements currently start as empty arrays because the existing data model has no demo records for them.
- `resetDemoData()`: Removes every documented local and session key, then restores the original seed data. This includes user, car, booking, review, dispute, announcement, session, and checkout-draft keys.

`STORAGE_KEYS` in `src/lib/storage.js` is the single source of truth for these key names.

### 3.1 Reactive Application State
`src/context/AppContext.jsx` provides the single reactive application store:

- The server render and first client render use the seed arrays, avoiding `window`/`localStorage` access during SSR and avoiding hydration mismatches.
- After mount, the provider calls `initializeDemoData()`, hydrates users, cars, bookings, reviews, disputes, and announcements from browser storage, and reads the active demo session from `sessionStorage`.
- Every mutation writes through `writeStorage()` before updating React state, so navigation between pages sees the same data and reloads preserve changes.
- Pages and components read collections through `useApp()` instead of importing `INITIAL_*` data directly. The vehicle detail route uses the seed car only as its server-rendered fallback.

### 3.2 Mutation Contracts
Car and booking mutations are exposed by `AppContext` and return `{ ok: true, ... }` or `{ ok: false, error: "..." }`.

- Car operations: `createCar`, `updateCar`, `setCarStatus`, `softDeleteCar`, `setCarAvailability`.
- Booking operations: `createBooking`, `updateBookingStatus`, `cancelBooking`.
- Authentication/role/ownership checks run inside the helpers, not only in the UI.
- `createBooking` rejects invalid or past dates, unapproved cars, owner self-bookings, dates blocked by `unavailableDates`, and overlapping active bookings (`requested`, `confirmed`, `in_progress`, `disputed`).
- `softDeleteCar` changes status to `inactive` instead of deleting records, preserving booking and review foreign keys.

## 4. Error Recovery & Validation Protocols
1. Missing or Corrupted Storage Keys: If parsing fails, readStorage captures the error, logs a warning, and falls back to safe empty defaults ([] or null) to prevent application crashes. 
2. Double Booking Guard: Prior to writing a new booking, `createBooking` verifies that the requested range does not overlap existing `requested`, `confirmed`, `in_progress`, or `disputed` bookings for the same car. 
3. Data Integrity & Foreign Keys: Deleting or deactivating cars soft-updates the status property rather than severing foreign keys on past bookings or reviews.   