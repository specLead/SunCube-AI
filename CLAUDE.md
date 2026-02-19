# SunCube AI — Claude Code Project Brief

## What This Project Is
SunCube AI is a solar performance monitoring and service automation platform built by **Cubefore LLC**.
It monitors inverters in real time, auto-detects faults, routes service tickets to technicians, and provides
role-based dashboards for Customers, Technicians, and Admins.

**Stage:** End-to-end Proof of Concept (PoC) for investor pitch. Real clients already exist.

**Real Clients (live solar installations):**
- Gayatri Junior College
- A.K Resorts
- Gayathri Degree College
- Moksha Farms
- Cubefore Office
- Sri R.P Reddy House

---

## Tech Stack

### Web (this repo)
- React 19 + TypeScript
- Vite 6 (dev server: `npm run dev` → port 5173)
- Tailwind CSS — dark glassmorphism theme (bg `#0B0C10`, accent orange `#F97316`, cyan `#22D3EE`)
- GSAP 3 — animations (drawers slide in from right, same pattern as `components/TicketDetailDrawer.tsx`)
- Recharts — all charts and graphs
- Lucide React — all icons
- Google Gemini (`@google/genai`) — AI chatbot (keep as-is)

### Mobile (to build)
- Flutter — single codebase for iOS + Android
- Reuses same Fastify backend API

### Backend (`suncube-backend/`)
- Fastify + Node.js
- PostgreSQL via Knex
- BullMQ (job queues for ticket routing)
- AWS S3 (photo storage)
- Stripe (payments)
- Docker + docker-compose

### Data Pipeline (to build)
- MQTT / CSV → Python normalization script → PostgreSQL
- Business rule: inverter data collected every 60 minutes
- Business rule: >10% deviation from baseline triggers auto ticket creation

---

## Repository
- GitHub: https://github.com/specLead/SunCube-AI
- Branch strategy: `main` = stable, feature branches for each plan step
- Local path: `C:\Users\mohan\Downloads\suncube-ai-customer-dashboard-main-main\suncube-ai-customer-dashboard-main-main`

---

## Project File Structure

```
/                          ← root
├── App.tsx                ← BROKEN — renders Dashboard directly, no auth routing
├── src/App.tsx            ← CORRECT auth routing — use this as the reference
├── components/            ← Customer portal components (built)
│   ├── Dashboard.tsx      ← Main customer dashboard (S2) — fully built
│   ├── AIChatModal.tsx    ← Gemini chatbot (S13) — built, not wired in Dashboard
│   ├── TicketDetailDrawer.tsx ← Customer ticket detail (S4) — built
│   └── PaymentsScreen.tsx ← Payments (in scope for PoC)
├── src/components/        ← Role-specific portals
│   ├── LoginScreen.tsx    ← Login + role selector (S1) — built
│   ├── TechnicianDashboard.tsx ← PLACEHOLDER — needs full implementation
│   └── AdminDashboard.tsx ← PLACEHOLDER — needs full implementation
├── services/
│   ├── mockApi.ts         ← Mock data (only 4 tickets — needs expansion)
│   └── geminiService.ts   ← Gemini AI integration
├── src/services/
│   └── authService.ts     ← Auth logic (login, logout, role storage)
├── src/lib/
│   └── authAdapter.ts     ← isAuthenticated(), getRole() helpers
├── types.ts               ← All TypeScript types
└── suncube-backend/       ← Fastify backend (scaffolded, not yet wired to frontend)
```

---

## Demo Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Customer | demo@sun.cube | DemoPass!23 |
| Technician | tech@sun.cube | TechPass!23 |
| Admin | admin@sun.cube | AdminPass!23 |

---

## Business Rules (from BRD)
- Inverter data collected every 60 minutes
- Faults with >10% deviation auto-create a ticket
- Technicians must acknowledge tickets within 1 hour (SLA)
- Resolved tickets automatically notify the customer
- System uptime target: 99.9%

---

## Current Build Status

| Screen | ID | Status |
|--------|----|--------|
| Login + Role Selector | S1 | Done |
| Customer Dashboard | S2 | Done |
| Customer Ticket List | S3 | Done |
| Customer Ticket Detail | S4 | Done |
| Technician Dashboard | S5 | PLACEHOLDER |
| Technician Ticket List | S6 | PLACEHOLDER |
| Technician Ticket Detail | S7 | PLACEHOLDER |
| Admin Dashboard (Fleet) | S8 | PLACEHOLDER |
| Admin Ticket Management | S9 | PLACEHOLDER |
| Admin Config | S10 | PLACEHOLDER |
| Audit Log | S11 | PLACEHOLDER |
| Notification Center | S12 | NOT BUILT |
| Chatbot Widget | S13 | Built but not wired |
| Reports Page | S14 | NOT BUILT |

Root `App.tsx` still broken — needs to be replaced with `src/App.tsx` routing logic.

---

## Execution Plan (what to build next)

**Step 1:** Create `PROGRESS.md`
**Step 2:** Expand `services/mockApi.ts` — add technicians, admin fleet, audit log, 10 tickets
**Step 3:** Fix root `App.tsx` — replace with auth routing from `src/App.tsx`
**Step 4:** Implement `src/components/TechnicianDashboard.tsx` (S5 + S6 + S7)
**Step 5:** Implement `src/components/AdminDashboard.tsx` (S8 + S9 + S10 + S11)
**Step 6:** Reports tab in `components/Dashboard.tsx` (S14)
**Step 7:** Notification Center (S12)
**Step 8:** Wire Chatbot FAB in `components/Dashboard.tsx` (S13)

Full detail: `C:\Users\mohan\.claude\plans\nifty-popping-hopcroft.md`

---

## Design System Rules
- Background: `#0B0C10` (near black)
- Panel/card: `#15161A` with `border border-white/10`
- Primary accent: orange `#F97316` / `suncube-orange`
- Secondary accent: cyan `#22D3EE`
- Glass panels: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`
- All new components must match the glassmorphism style of `components/Dashboard.tsx`
- GSAP drawers: slide in from right (see `components/TicketDetailDrawer.tsx` for pattern)
- CountUp animation on all KPI numbers (see Dashboard.tsx KPICard pattern)

---

## Commands
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Key Contacts
- Owner: Mohanendra Bathini (mohanendrabathini@gmail.com)
- Company: Cubefore LLC
- GitHub: specLead
