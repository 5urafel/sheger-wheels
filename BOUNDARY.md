# Component & Architecture Boundary (BOUNDARY.md)

This document explains the architectural boundary between **Server Components (RSC)** and **Client Components (`"use client"`)** in the Sheggar Wheels (Addis Wheels P2P) Next.js 16 application.

---

## 1. The Core Architectural Boundary Rationale

In modern Next.js (App Router), components default to **Server Components**. Server components execute exclusively on the Node.js/Turbopack server environment and send static HTML and streaming payloads to the browser without transmitting client-side JavaScript.

However, **browser storage APIs (`window.localStorage` and `window.sessionStorage`) only exist in the browser runtime**. A Server Component attempting to read `localStorage` or `sessionStorage` will either throw a `ReferenceError: window is not defined` or produce hydration mismatches between server and client markup.

Furthermore, rich interactive features — such as:
1. GSAP animation timelines and DOM mutations (`gsap.to()`, `gsap.timeline()`)
2. Leaflet DOM map rendering (`L.map()`, OpenStreetMap tile rendering)
3. Recharts SVG/Canvas rendering
4. Form inputs, stateful modal dialogs, and instant reactive tabs
5. Same-tab and cross-tab storage synchronizations (`window.addEventListener("sw_storage_update")`)

**strictly mandate execution within the Client Component boundary**.

---

## 2. Server Components vs Client Components Breakdown

### 2.1 Server Components (`RSC`)

Server components are utilized where content is static, global, or designed for search engine discovery:

| File / Component | Role / Boundary | Rationale |
| :--- | :--- | :--- |
| `src/app/layout.jsx` | **Root Server Component** | Loads Google Fonts (`Plus_Jakarta_Sans`, `Playfair_Display`) with zero layout shift, sets global metadata, and defines the root HTML `lang="en"` document shell. |
| `src/app/sitemap.js` | **Server Metadata Route Handler** | Reads initial approved cars from `fleet.js` and outputs clean XML for search engines without executing in the client browser. |
| `src/app/robots.js` | **Server Route Handler** | Serves dynamic crawler rules (`robots.txt`) directing crawlers toward public catalogue pages and away from authenticated dashboards. |
| `src/data/fleet.js` | **Universal Static Module** | Constant seed data structures usable by both server build scripts and client initialization routines. |

---

### 2.2 Client Components (`"use client"`)

The majority of application pages and interactive modules are client components to facilitate direct access to `localStorage`, `sessionStorage`, and DOM animation engines:

| Component / Page | Type | Why Client Boundary is Required |
| :--- | :--- | :--- |
| `src/components/Navbar.jsx` | **Client Component** | Listens to `scroll` events for glassmorphism styling, monitors `sessionStorage` to reflect active persona, opens mobile menus, and manages the Negative Tests modal. |
| `src/components/AnnouncementBanner.jsx` | **Client Component** | Reads active broadcast announcements from `localStorage`, dismisses banner on user click, and reacts to admin updates. |
| `src/components/GsapHeroEffects.jsx` | **Client Component** | Directly accesses DOM elements via `useRef` to drive GSAP rolling number tweens (trips, rating, fleet) and the animated speedometer gauge. |
| `src/components/GsapTripTracker.jsx` | **Client Component** | Drives a dynamic GSAP timeline to move an animated vehicle marker along Addis Ababa transit waypoints with live speed and distance telemetry. |
| `src/components/AddisMap.jsx` | **Client Component** | Dynamically imports `leaflet` in browser runtime, binds OpenStreetMap tiles to a container `div`, and renders popups with offline fallback. |
| `src/components/NegativeTestsModal.jsx` | **Client Component** | Executes automated client guardrail tests, assertions, and DOM state updates for reviewer inspection. |
| `src/app/cars/page.jsx` | **Client Component** | Manages catalogue search query, multi-parameter filter state (neighbourhood, category, transmission, seats, price), and syncs state to URL query parameters with `next/navigation`. |
| `src/app/cars/[id]/page.jsx` | **Client Component** | Calculates real-time rental pricing, blocks dates in `car.unavailableDates[]`, checks booking conflicts, and saves drafts into `sessionStorage`. |
| `src/app/checkout/page.jsx` | **Client Component** | Pulls draft from `sessionStorage`, simulates TeleBirr PIN authorization, and writes confirmed records to `localStorage`. |
| `src/app/dashboard/page.jsx` | **Client Component** | Reads current user from `sessionStorage`, filters personal trips from `localStorage`, and displays upcoming trip spotlights. |
| `src/app/bookings/page.jsx` | **Client Component** | Filters booking history and triggers browser blob creation for RFC 4180 CSV downloads. |
| `src/app/bookings/[id]/page.jsx` | **Client Component** | Validates ownership checks, handles booking state machine transitions, and opens dispute modal. |
| `src/app/owner/page.jsx` | **Client Component** | Renders Recharts monthly revenue chart and executes one-click approval/decline of pending booking requests. |
| `src/app/admin/page.jsx` | **Client Component** | Displays platform-wide metrics, moderates listings, manages user account suspensions, and renders Recharts volume charts. |

---

## 3. Data Flow Across the Boundary

```
[Browser Runtime]
       │
       ├──> sessionStorage: Active Persona Session (`sw_session_v1`)
       │                    Checkout Temporary Draft (`sw_checkout_draft_v1`)
       │
       ├──> localStorage:   Durable Demo State (`sw_users_v1`, `sw_cars_v1`,
       │                    `sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1`)
       │
       └──> Custom Events:  "sw_session_update" & "sw_storage_update"
                            Synchronizes sibling components within the same tab
```

By strictly maintaining this clear boundary, Sheggar Wheels eliminates server prerender hydration mismatches while delivering an instant, app-like client experience.
