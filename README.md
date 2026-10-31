# Sheggar Wheels (Addis Wheels P2P)

> **IBT–QIYAS Full-Stack Software Development Program**  
> **Frontend Capstone Project Brief: Sheggar Wheels**  
> *Peer-to-peer car rental marketplace for Addis Ababa, Ethiopia.*

[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4.2_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![GSAP 3](https://img.shields.io/badge/GSAP-3.14-88ce02?style=for-the-badge&logo=greensock)](https://greensock.com/)

---

## 1. Project Purpose & Overview

Many privately owned vehicles across Addis Ababa remain parked and underutilized for substantial portions of the day. **Sheggar Wheels** creates a high-trust peer-to-peer automotive marketplace where:
- **Car Owners (Hosts)** list vehicles, set custom daily ETB rates, manage calendar blockout dates, review booking requests, and inspect earnings analytics.
- **Renters (Visitors)** search, filter by neighborhood (Bole, Kazanchis, Piassa, Sarbet, Ayat, CMC, Meskel Square), simulate mock TeleBirr checkout with clear demo identifiers, monitor simulated live trip telemetry with GSAP animation, and submit post-trip ratings.
- **Platform Administrators** moderate pending listings, inspect global platform volume and 5% fee commission, manage demo accounts (with live suspension locks), resolve disputes with written mediation notes, and publish site-wide broadcast announcements.

> **Demonstration Notice:** This application operates client-side with durable data persisted in browser `localStorage` and active session state in `sessionStorage`. All TeleBirr payments, GPS coordinates, and vehicle telemetries are simulations for academic evaluation.

---

## 2. Key Features

### 🎨 GSAP Animation & Rich UI
- **GSAP Hero Telemetry**: Live animated rolling counters for completed trips, fleet size, and average ratings with continuous GSAP tweening.
- **Interactive GSAP Speedometer Gauge**: Real-time needle acceleration rev-up and digital odometer telemetry.
- **Live Trip Route Simulation (`/bookings/[id]/track`)**: Interactive animated vehicle traversing predefined Addis Ababa transit waypoints (Bole Airport ➔ Meskel Square ➔ Kazanchis ➔ Piassa) with real-time speed, distance countdown, and street identification.

### 🚗 Vehicle Catalogue & Booking
- **Multi-parameter Search & Filter**: Real-time search across make/model/description, neighborhood select, category pills, transmission, seats, and daily rate slider with URL query sync (`/cars?neighbourhood=Bole&sort=price-asc`).
- **Car Detail Page (`/cars/[id]`)**: High-res photo gallery, full specs, host superhost card, JSON-LD structured data for Google rich snippets, and interactive Leaflet map with neighborhood fallback.
- **Mock TeleBirr Checkout (`/checkout`)**: Realistic TeleBirr SuperApp gateway styling, auto-generated fake reference `TB-DEMO-XXXXX`, and instant booking creation.
- **Finite Booking Lifecycle Machine**: Strict state validation (`requested` ➔ `confirmed` ➔ `in_progress` ➔ `completed` ➔ `reviewed` / `disputed` ➔ `resolved`).

### 🛡️ Guardrails & Negative Test Verification Suite
- **1-Click Reviewer Test Runner**: Interactive modal available directly from the Navbar or Footer to execute and inspect the 3 required negative test cases:
  1. *Signed-out write attempt:* Calling booking mutation without active session safely refuses with `"Not signed in"`.
  2. *Cross-user ownership attempt:* Attempting to cancel another user's booking safely refuses with `"Not yours"`.
  3. *Unsafe return URL:* Passing `https://example.com` or `//evil.com` to sign-in returns safe fallback `"/"`.

### 📊 Reporting & Analytics
- **Recharts Data Visualization**: Monthly host revenue bar chart and platform volume graphs.
- **RFC 4180 CSV Export**: Compliant export for Renter trip history, Owner earnings summaries, and Admin master platform ledgers.

---

## 3. Seed Demo Personas

Switch between these pre-seeded demo accounts instantly using the persona switcher in the navigation bar or on `/signin`:

| Role | Demo Account Name | Email | Capabilities |
| :--- | :--- | :--- | :--- |
| **Renter** | Alemayehu Tadesse | `alemayehu@example.com` | Browse catalogue, request rentals, TeleBirr checkout, view receipts, live trip tracking, write reviews |
| **Owner** | Dr. Henok Kebede | `henok@example.com` | Multi-car host, toggle active/inactive status, calendar blockout, approve/decline requests, earnings CSV |
| **Admin** | Selamawit Bekele | `admin@sheggarwheels.et` | Listing approval/rejection, user suspension, dispute resolution, broadcast announcements, platform audit |

---

## 4. Tech Stack

- **Framework**: Next.js 16.4.2 (App Router with Turbopack, Partial Pre-rendering, and Cache Components)
- **Library**: React 19.3.0
- **Styling**: Tailwind CSS v4.0 with customized color tokens and fonts
- **Animations**: GSAP (GreenSock) 3.14 + Framer Motion
- **Maps**: Leaflet client-side dynamic rendering with OpenStreetMap tile layer and offline fallback
- **Charts**: Recharts responsive container, bar charts, and tooltips
- **Icons**: Lucide React

---

## 5. Local Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/suraf/addis-wheels.git
cd addis-wheels

# 2. Install dependencies (legacy peer deps recommended for React 19)
npm install --legacy-peer-deps

# 3. Copy environment configuration
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build & Linting

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start

# Run ESLint validation
npm run lint
```

---

## 6. Project Architecture & Documentation Sitemap

This capstone includes the full set of required documentation documents detailing technical decisions:

- [`STRATEGY.md`](./STRATEGY.md) — Comprehensive route table detailing static vs dynamic rendering and data-loading approaches.
- [`BOUNDARY.md`](./BOUNDARY.md) — Server Component vs Client Component architectural boundary rationale.
- [`AUTH.md`](./AUTH.md) — Detailed authentication model, session management, negative test guardrails, and security limitations.
- [`DATA.md`](./DATA.md) — Complete data model entities, storage keys, validation rules, and recovery behaviors.
- [`PERF.md`](./PERF.md) — Performance measurements, Core Web Vitals optimization (LCP, CLS, INP), and Lighthouse findings.
- [`FUTURE.md`](./FUTURE.md) — Honest architectural assessment of simulated features and prioritized production backend roadmap.
