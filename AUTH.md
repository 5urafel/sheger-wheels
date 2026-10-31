# Authentication & Frontend Guardrails (AUTH.md)

This document describes the role-based demo session system, frontend permission checks, safe redirect handling, and the **three required negative tests** implemented in Sheggar Wheels (Addis Wheels P2P).

---

## 1. Explicit Security Disclaimer

> [!WARNING]
> **Frontend Demonstration Guardrail Notice:**  
> The authentication, role validation, and record ownership mechanisms in this capstone are implemented purely on the client side using browser `sessionStorage` and `localStorage`. In a real-world production platform, client-side checks can be bypassed by an adversary with access to browser developer tools.  
> Real security requires server-side authentication (e.g. HTTP-only session cookies, JWT verification, server-side database access controls, and sanitized API endpoints). These frontend checks demonstrate UI design patterns, user ergonomics, and ordinary misuse prevention only.

---

## 2. Demo Session Model

The application models session identity without requiring passwords:
- **Session Key**: `sw_session_v1` in `window.sessionStorage`.
- **Session Payload**:
  ```json
  {
    "userId": "user-renter-1",
    "userName": "Alemayehu Tadesse",
    "email": "alemayehu@example.com",
    "activeRole": "renter",
    "signedInAt": "2026-10-27T06:00:00.000Z"
  }
  ```
- **Lifecycle**: Stored in `sessionStorage`, meaning the session automatically terminates when the browser tab is closed. Clicking **Sign Out** immediately wipes `sw_session_v1` and `sw_checkout_draft_v1` and navigates the user back to the public homepage.

### Dual Role Coexistence (Section 4.1)
Per capstone specification, a user can simultaneously hold renter and host capabilities (`roles: ['renter', 'owner']`). Users do not need to create a secondary account to host vehicles. The persona switcher allows toggling the active role effortlessly.

---

## 3. Helper Functions (`src/lib/auth.js`)

| Helper Function | Purpose |
| :--- | :--- |
| `getCurrentSession()` | Reads and parses `sw_session_v1` safely from `sessionStorage`. Returns `null` if absent or malformed. |
| `getCurrentUser()` | Resolves the full user object from `localStorage` using the active session user ID, returning active role metadata. |
| `signInAsDemo(userId, role)` | Sets the session in `sessionStorage` and validates that the account is not suspended. |
| `signOut()` | Clears `sw_session_v1` and `sw_checkout_draft_v1`. |
| `hasRole(user, role)` | Checks if a user has permission for a specific role (`renter`, `owner`, `admin`). |
| `safeReturnPath(url, fallback)` | Sanitizes return URLs after sign-in to protect against open-redirect attacks. |
| `assertAuthenticated()` | Verifies that a valid session exists and the user is not suspended before mutating data. |
| `assertBookingOwnership(booking, action)` | Enforces that only the creator can view/cancel their booking, or the vehicle owner can approve/decline it. |
| `assertCarOwnership(car)` | Ensures that only the listing's verified owner can modify vehicle specifications or calendar blockout dates. |

---

## 4. The Three Required Negative Tests (Section 8.1)

Sheggar Wheels includes an interactive **Negative Tests Verifier Modal** in the UI, as well as an automated verification suite in `src/lib/negativeTests.js`.

### Test 1: Signed-Out Write Attempt
- **Scenario:** A visitor without an active session attempts to call a booking mutation function directly or via the UI.
- **Guardrail:** `assertAuthenticated()` executes before writing to `localStorage`.
- **Result:** Safely blocked. Returns error: `"Not signed in. Please sign in to request a booking."` No data is written to storage.

### Test 2: Cross-User Ownership Attempt
- **Scenario:** User A (e.g. Dr. Henok Kebede) is signed in and attempts to cancel or modify a booking (`bk-101`) owned by User B (Alemayehu Tadesse).
- **Guardrail:** `assertBookingOwnership(booking, "cancel")` checks that `booking.renterId === currentUser.id`.
- **Result:** Safely blocked. Returns error: `"Not yours. You cannot modify bookings that belong to another renter."` Stored records remain untouched.

### Test 3: Unsafe Return URL Injection (Open Redirect Defense)
- **Scenario:** A user accesses a URL containing an external redirect: `/signin?next=https://example.com` or `//evil.com`.
- **Guardrail:** `safeReturnPath(rawNext, "/")` checks if the path starts with `//`, `http://`, `https://`, `javascript:`, or contains colons.
- **Result:** Safely neutralized. External URLs are rejected and redirected to internal safe fallback `"/"`.

---

## 5. Protected Route Guarding Table

| Route Pattern | Required Access | Guard Mechanism | Refusal Behavior |
| :--- | :--- | :--- | :--- |
| `/dashboard` | Signed-in Renter | Checked in page `useEffect` | Redirects to `/signin?next=/dashboard` |
| `/bookings` | Signed-in Renter | Checked in page `useEffect` | Redirects to `/signin?next=/bookings` |
| `/bookings/[id]` | Booking Renter or Host | `assertBookingOwnership(b, "view")` | Displays "Not Yours: Access Refused" shield error page |
| `/bookings/[id]/track` | Booking Renter | `assertBookingOwnership(b, "view")` | Displays refusal card if not the booking owner |
| `/bookings/[id]/review` | Completed Booking Renter | `assertBookingOwnership(b, "review")` | Rejects review submission if trip is not completed |
| `/owner/*` | Signed-in Owner (`'owner'`) | Role check `currentUser.roles.includes('owner')` | Prompts user to switch to host persona (Dr. Henok) |
| `/owner/cars/[id]/edit` | Vehicle Owner | `assertCarOwnership(car)` | Displays "Not Yours: Edit Forbidden" guardrail card |
| `/admin/*` | Platform Admin (`'admin'`) | Role check `currentUser.roles.includes('admin')` | Prompts user to switch to admin persona (Selamawit) |
