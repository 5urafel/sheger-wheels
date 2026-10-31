# Rendering & Data Strategy (STRATEGY.md)

This document outlines the rendering, data-loading, and caching strategy applied to every route across the Sheggar Wheels (Addis Wheels P2P) Next.js 16 application.

---

## 1. Architectural Strategy Overview

Because this frontend-only capstone stores durable records in browser `localStorage` and active session state in `sessionStorage`, all server-side rendering strategies must respect the boundary: **server code cannot access browser storage APIs**. 

To maximize user experience, SEO, and initial paint performance:
1. **Public Marketing & Catalogue Pages** are statically rendered or partially pre-rendered (`PPR`) with instant HTML shell streaming and client-side storage hydration.
2. **SEO Structured Pages (`/cars/[id]`)** embed JSON-LD schemas and static semantic markup, while reserving interactive booking calculators and maps for client hydration.
3. **Protected Portals (`/dashboard`, `/owner`, `/admin`)** use client-side session resolution with immediate guardrail checks (`assertAuthenticated()`, `assertBookingOwnership()`, `assertCarOwnership()`) to prevent unauthorized view or mutation.

---

## 2. Route Strategy Matrix

| Route Path | Rendering Mode | Purpose & Data Source | Strategy Rationale |
| :--- | :--- | :--- | :--- |
| `/` | **Static Pre-rendered (`○`)** | Landing page, hero search widget, certified fleet preview, GSAP animations, FAQs, and testimonials. | Highly optimized for initial LCP paint and search crawler discovery. Initial HTML is cached with no runtime dependencies. |
| `/cars` | **Static Pre-rendered (`○`)** | Catalogue with search, category filtering, transmission/seat toggles, price range slider, and pagination. | Statically generates the layout and filter shell. Client hydrates vehicle listings from `getPublicCars()` and syncs URL query parameters (`/cars?neighbourhood=Bole`). |
| `/cars/[id]` | **Partial Pre-rendered (`◐`)** | Detailed vehicle photos, technical specifications, host superhost profile, Leaflet map, and booking calculator. | Shell streams instantly while `<Suspense>` encapsulates dynamic `use(params)` route resolution. Injects Schema.org JSON-LD structured data for search engine rich car cards. |
| `/signin` | **Static Pre-rendered (`○`)** | Pre-seeded persona switcher (Alemayehu, Dr. Henok, Selamawit) and safe return path navigation. | Publicly accessible. Neutralizes open redirect vulnerabilities (`safeReturnPath`) and writes active demo session to `sessionStorage`. |
| `/signup` | **Static Pre-rendered (`○`)** | New demo renter/owner registration form with email duplicate validation and role assignment. | Client-side form validation. Disallows public admin self-assignment per Section 4.1. |
| `/checkout` | **Static Pre-rendered (`○`)** | Mock TeleBirr payment gateway simulation and booking confirmation receipt. | Reads checkout draft from `sessionStorage`, renders simulated TeleBirr credentials interface, and writes confirmed booking to `localStorage`. |
| `/dashboard` | **Static Pre-rendered (`○`)** | Renter overview: upcoming trips, completed trips, cancelled count, next booking highlight, and spend statistics. | Immediate client guardrail check redirects signed-out visitors to `/signin?next=/dashboard`. Calculates live statistics from `getBookings()`. |
| `/bookings` | **Static Pre-rendered (`○`)** | Renter personal booking history, lifecycle status filtering tabs, and RFC 4180 CSV export. | Client component reading only current user's records (ownership isolation). Exports RFC 4180 compliant CSV. |
| `/bookings/[id]` | **Partial Pre-rendered (`◐`)** | Booking summary, financial receipt breakdown, lifecycle actions (cancel, start, complete, dispute), and state machine. | Enforces Negative Test #2: non-owners cannot view or modify another renter's booking. Encapsulated in `<Suspense>`. |
| `/bookings/[id]/track` | **Partial Pre-rendered (`◐`)** | Simulated live trip telemetry and GSAP animated vehicle moving across Addis Ababa coordinates. | Client-only animation using GSAP timeline. Displays explicit "Simulation" badges in compliance with Section 12. |
| `/bookings/[id]/review` | **Partial Pre-rendered (`◐`)** | Post-trip review and star rating form for completed bookings. | Validates that booking is completed and owned by the current renter before accepting submission. Appends to `sw_reviews_v1`. |
| `/owner` | **Static Pre-rendered (`○`)** | Car owner dashboard: approved cars, pending requests queue, confirmed rentals, and Recharts monthly revenue chart. | Guarded for users with `owner` role. Recharts renders responsive monthly earnings analytics. |
| `/owner/cars` | **Static Pre-rendered (`○`)** | List of current owner's cars with Active / Inactive status toggle button. | Filtered strictly to `ownerId === user.id`. Allows instant listing deactivation. |
| `/owner/cars/new` | **Static Pre-rendered (`○`)** | Vehicle creation form with preset high-res photo gallery, category, and pricing inputs. | Auto-assigns listing to current owner and initializes status to `pending` for admin moderation. |
| `/owner/cars/[id]/edit` | **Partial Pre-rendered (`◐`)** | Edit own vehicle listing specifications, pricing, and description. | Validates `assertCarOwnership(car)`; refuses cross-owner edits with "Not yours". |
| `/owner/cars/[id]/availability` | **Partial Pre-rendered (`◐`)** | Blocked calendar dates manager for specific vehicle. | Updates `car.unavailableDates[]` in `localStorage` to prevent booking overlaps. |
| `/owner/cars/[id]/bookings` | **Partial Pre-rendered (`◐`)** | Booking requests and confirmed trips for a specific vehicle. | Provides host approval and decline buttons for `requested` bookings. |
| `/owner/earnings` | **Static Pre-rendered (`○`)** | Detailed financial analytics, per-vehicle revenue, and Recharts visual breakdown. | Generates RFC 4180 CSV export of host earnings. |
| `/owner/reviews` | **Static Pre-rendered (`○`)** | Reviews left for owner's vehicles and public host reply controls. | Updates review records with `ownerReply` text. |
| `/owner/disputes` | **Static Pre-rendered (`○`)** | Disputes filed regarding owner's vehicle rentals and admin mediation notes. | Filtered to owner's vehicles. |
| `/admin` | **Static Pre-rendered (`○`)** | Platform overview: total users, active fleet, bookings, 5% fee earned, and moderation queue. | Restricted to admin role (Selamawit Bekele). Displays platform metrics and Recharts volume charts. |
| `/admin/listings` | **Static Pre-rendered (`○`)** | Pending car approval and rejection moderation queue. | One-click status updates (`approved`, `rejected`) directly mutating `sw_cars_v1`. |
| `/admin/users` | **Static Pre-rendered (`○`)** | Demo user directory with account status and live Suspend/Reinstate controls. | When user is suspended, system guardrail blocks their demo actions across the app. |
| `/admin/users/[id]` | **Partial Pre-rendered (`◐`)** | Detailed demo user audit profile, assigned roles, linked vehicles, and transaction history. | Streams audit trail inside `<Suspense>`. |
| `/admin/bookings` | **Static Pre-rendered (`○`)** | Platform-wide master bookings log with search and status filtering. | Full platform visibility for administrator moderation. |
| `/admin/disputes` | **Static Pre-rendered (`○`)** | Platform dispute center filtering opened and resolved issues. | Lists mediation requests from renters and hosts. |
| `/admin/disputes/[id]` | **Partial Pre-rendered (`◐`)** | Dispute resolution workbench with written notes and mediation decision. | Marks dispute and booking as `resolved` and logs admin notes. |
| `/admin/reports` | **Static Pre-rendered (`○`)** | Financial audit ledger, commission calculations, and master CSV download. | Generates complete platform CSV audit file. |
| `/admin/announcements` | **Static Pre-rendered (`○`)** | Create and toggle active status of site-wide emergency road alerts and notices. | Admin-only CRUD for platform notification banner. |
| `/sitemap.xml` | **Dynamic (`ƒ`)** | Generated XML sitemap of all public routes and approved vehicle URLs. | Ensures search engine indexability for public catalogue. |
| `/robots.txt` | **Static Pre-rendered (`○`)** | Search crawler instructions allowing public pages and disallowing private dashboards. | Standard crawler guidance according to Section 15 Concept #24. |
