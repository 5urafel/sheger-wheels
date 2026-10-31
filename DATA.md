# Browser Storage Data Layer (DATA.md)

This document details the data schemas, storage keys, validation rules, state transitions, and recovery mechanisms for Sheggar Wheels (Addis Wheels P2P).

---

## 1. Storage Keys Directory

All records are serialized as JSON strings with consistent version prefixes:

| Key Name | Storage Type | Content / Purpose |
| :--- | :--- | :--- |
| `sw_users_v1` | `localStorage` | Seed and custom registered user records, roles, and account statuses. |
| `sw_cars_v1` | `localStorage` | All vehicle listings, specs, coordinates, pricing, and moderation statuses. |
| `sw_bookings_v1` | `localStorage` | Booking reservations, agreed pricing snapshots, and lifecycle state. |
| `sw_reviews_v1` | `localStorage` | Verified renter ratings, comments, and host replies. |
| `sw_disputes_v1` | `localStorage` | Platform dispute cases, claims, and admin resolution logs. |
| `sw_announcements_v1`| `localStorage` | Admin broadcast alerts and emergency road notices. |
| `sw_session_v1` | `sessionStorage` | Current signed-in demo user ID, name, email, and active role. |
| `sw_checkout_draft_v1`| `sessionStorage` | Temporary checkout configuration (dates, carId, fees, total) during payment. |

---

## 2. Entity Schemas & Validation Rules

### 2.1 User (`User`)
- **Schema:**
  ```typescript
  interface User {
    id: string;               // e.g. "user-renter-1" or "user-1718000000"
    name: string;             // Full name
    email: string;            // Must be unique in demo
    phone: string;            // Ethiopian telephone e.g. "+251 911 234 567"
    roles: Array<"renter" | "owner" | "admin">;
    status: "active" | "suspended";
    avatar?: string;
    createdAt: string;        // ISO 8601 date-time string
  }
  ```
- **Validation Rules:**
  - `email` must be unique across all demo users.
  - Public registration (`/signup`) disallows selecting the `admin` role (Section 4.1).
  - Suspended users cannot initiate mutations or create bookings.

---

### 2.2 Vehicle (`Car`)
- **Schema:**
  ```typescript
  interface Car {
    id: string;               // e.g. "car-prado-2024"
    ownerId: string;          // Foreign key linking to User.id
    make: string;             // e.g. "Toyota"
    model: string;            // e.g. "Land Cruiser Prado TXL"
    year: number;             // Model year
    category: string;         // "Luxury SUV", "4x4 Off-Road", "Economy Sedan", etc.
    transmission: "Automatic" | "Manual";
    seats: number;
    city: string;             // "Addis Ababa"
    neighbourhood: string;    // "Bole", "Kazanchis", "Piassa", "Sarbet", etc.
    latitude: number;         // Seeded coordinates (e.g. 8.995)
    longitude: number;        // Seeded coordinates (e.g. 38.789)
    pricePerDay: number;      // In Ethiopian Birr (ETB)
    photos: string[];         // URLs to high-res vehicle imagery
    description: string;
    status: "draft" | "pending" | "approved" | "rejected" | "inactive";
    unavailableDates: string[]; // Blocked ISO dates ["YYYY-MM-DD"]
    rating?: number;
    reviewsCount?: number;
    createdAt: string;
  }
  ```
- **Validation Rules:**
  - Only `status === "approved"` and non-inactive cars appear in the public catalogue.
  - Car owner can toggle between `approved` and `inactive` to pause listings.

---

### 2.3 Booking (`Booking`)
- **Schema:**
  ```typescript
  interface Booking {
    id: string;               // e.g. "bk-101"
    carId: string;            // Foreign key linking to Car.id
    carName: string;
    carPhoto: string;
    renterId: string;         // Foreign key linking to User.id
    renterName: string;
    renterPhone: string;
    ownerId: string;          // Foreign key linking to User.id
    ownerName: string;
    startDate: string;        // ISO Date YYYY-MM-DD
    endDate: string;          // ISO Date YYYY-MM-DD
    days: number;
    pricePerDay: number;      // Snapshot agreed price at booking time
    subtotal: number;
    fee: number;              // 5% mock platform commission
    total: number;            // subtotal + fee
    pickupLocation: string;
    chauffeurIncluded: boolean;
    paymentStatus: "held" | "paid" | "refunded";
    paymentReference: string; // e.g. "TB-DEMO-482910"
    status: BookingStatus;
    resolutionNotes?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```
- **Validation Rules (Section 6 & 16):**
  - **No Overlapping Bookings:** The system prevents two active bookings for the same vehicle from sharing overlapping date windows (`hasBookingConflict()`).
  - **Price Snapshot:** Price per day and platform fees are fixed at creation time and do not change if host updates car rates later.

---

## 3. Finite Booking Lifecycle Transitions (Section 7)

All state changes are validated against the finite state machine defined in `updateBookingStatus()`:

```
[requested]
   ├── Owner approves ──────> [confirmed]
   ├── Owner declines ──────> [declined] (Terminal)
   └── Renter cancels ──────> [cancelled] (Terminal)

[confirmed]
   ├── Rental starts ───────> [in_progress]
   └── Eligible cancel ─────> [cancelled] (Terminal)

[in_progress]
   ├── Return vehicle ──────> [completed]
   └── Raise dispute ───────> [disputed]

[completed]
   ├── Add review ──────────> [reviewed] (Terminal)
   └── Raise dispute ───────> [disputed]

[disputed]
   └── Admin resolves ──────> [resolved] (Terminal)
```

Any attempt to transition outside these valid edges is rejected without modifying storage.

---

## 4. Storage Helpers & Recovery Behavior

### 4.1 Safe JSON Parsing & Quota Handling
- `readStorage(key, fallback)`: Wraps `JSON.parse()` in `try/catch`. If a key is missing, empty, or corrupted, returns the provided fallback without crashing the application.
- `writeStorage(key, value)`: Wraps `JSON.stringify()` and `localStorage.setItem()` in `try/catch`. Catches `QuotaExceededError` gracefully and alerts the console.
- `initializeDemoData()`: Checks each storage key once. **Never overwrites existing user data or previous mutations on subsequent page refreshes.**
- `resetDemoData()`: Explicit development utility to restore initial seed records.

### 4.2 Cross-Component Reactivity
- Whenever a write occurs, the data layer dispatches custom window events: `sw_storage_update` and `sw_session_update`.
- Sibling components across the application subscribe via `window.addEventListener("sw_storage_update", handler)` to re-render in real time without requiring polling.
