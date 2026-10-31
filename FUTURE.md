# Future Backend Architecture & Scope Roadmap (FUTURE.md)

This document provides a truthful account of simulated mechanisms in this frontend capstone, explains what must migrate to a secure backend, and outlines a prioritized implementation roadmap for production.

---

## 1. Truthful Summary of Simulated Features

In accordance with the Capstone Project Brief, this portfolio project is a pure frontend implementation utilizing browser storage:

| Feature Area | Current Capstone Implementation | Production Requirement |
| :--- | :--- | :--- |
| **Authentication & Session** | Demo persona switcher stored in `sessionStorage`. Role checks and ownership checks run in client code. | Secure HTTP-only cookies, JWT verification, Argon2/Bcrypt password hashing, OAuth/Google sign-in, MFA. |
| **Data Persistence** | JavaScript objects serialized to `localStorage` (`sw_*_v1`). | Relational database (PostgreSQL + Prisma / Drizzle) with ACID transactions and foreign key constraints. |
| **Payment Gateway** | Simulated TeleBirr gateway with fake transaction references (`TB-DEMO-XXXXX`) and instant status toggle. | Real Ethio Telecom TeleBirr API integration, webhook verification, escrow deposit holds, and PCI-DSS compliance. |
| **GPS Vehicle Tracking** | GSAP animated vehicle marker traversing predefined sample coordinates in Addis Ababa. | Hardware OBD-II / IoT GPS telematics, WebSockets / SSE for real-time location streaming, driver consent safeguards. |
| **Concurrency & Overlaps** | Client-side date check against `localStorage` bookings. | Database-level row locking and date range exclusion constraints (`EXCLUDE USING gist`) to prevent race conditions. |
| **Notifications** | Local custom window events (`sw_storage_update`) within the browser tab. | Server-Sent Events (SSE) or WebSockets, SMS gateway (e.g. Twilio / local Ethiopian SMS API), and push notifications. |

---

## 2. Transition Plan to Production Backend

### Phase 1: Database Migration & Conflict-Safe Booking
1. **Schema Design**: Migrate `DATA.md` schemas to PostgreSQL with Prisma ORM.
2. **Transaction Isolation**: Implement booking creation inside an ACID database transaction:
   ```sql
   -- Prevent double booking race conditions
   BEGIN;
   SELECT * FROM cars WHERE id = $1 FOR UPDATE;
   INSERT INTO bookings (...) VALUES (...);
   COMMIT;
   ```
3. **Audit Trail**: Implement immutable audit log tables for booking state transitions and dispute mediation records.

---

### Phase 2: Production Authentication & Authorization
1. **Session Security**: Implement Auth.js / NextAuth or Supabase Auth with server-validated session cookies.
2. **Role-Based Access Control (RBAC)**: Enforce route guards via Next.js Middleware and database Row-Level Security (RLS) policies:
   - Renters can only read their own bookings (`auth.uid() = renter_id`).
   - Hosts can only modify cars where `auth.uid() = owner_id`.
   - Admin routes require verified `role = 'admin'` claim in server context.

---

### Phase 3: TeleBirr Payment & Escrow Settlement
1. **TeleBirr Integration**: Integrate official Ethio Telecom Payment Gateway API with cryptographic request signing.
2. **Escrow Mechanics**:
   - Customer payment is held in escrow upon booking confirmation.
   - Payout to car host is released 24 hours after successful vehicle return.
   - In case of dispute, admin can release full or partial refunds through the dispute workbench.

---

### Phase 4: Identity Verification & Vehicle Inspection
1. **Host Verification**: Upload and verify Ethiopian National ID (Kebele / Fayda ID) and vehicle ownership blue book (*Libre*).
2. **Driver Verification**: Validate renter driver's license before allowing booking checkout.
3. **Pre-Trip Condition Check**: Digital photo upload inspect checklist at vehicle pickup and return to automatically safeguard against damage claims.
