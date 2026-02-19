# SunCube AI — Claude Code Project Brief

## What This Project Is
SunCube AI is a solar performance monitoring and service automation platform built by **Cubefore LLC**.
It monitors inverters in real time, auto-detects faults, routes service tickets to technicians, and provides
role-based dashboards for Customers, Technicians, and Admins.

**Stage:** End-to-end Proof of Concept (PoC) for investor pitch. Real clients already exist with live solar installations.

**Real Clients:**
- Gayatri Junior College
- A.K Resorts
- Gayathri Degree College
- Moksha Farms
- Cubefore Office
- Sri R.P Reddy House

---

## Session Handoff — Pick Up From Here

**Last session completed (Feb 18 2026):**
- Git initialized, initial commit made, pushed to https://github.com/specLead/SunCube-AI
- CLAUDE.md created and pushed to main
- MCP servers installed: github, notion, filesystem (all user-scoped in `C:\Users\mohan\.claude.json`)
- Read BRD, Frontend PRD, and the full execution plan
- Notion access granted by user — pages shared with Claude integration

**First thing to do in new session:**
1. Run `/mcp` — verify github, notion, filesystem are all connected (green)
2. If notion shows failed: the API key in `.claude.json` needs to be updated with a new key from `notion.so/my-integrations`
3. Ask user for the Notion PRD page name/URL to pull it and begin redesign
4. Then start web prototype build — Step 1 of the execution plan below

**Pending (waiting on user):**
- Inverter data format — user is checking and will share tomorrow. Could be CSV, MQTT stream, vendor API, or DB dump. Once known, design the Python normalization pipeline.
- Notion PRD page name — user granted access but page name not confirmed yet

---

## MCP Servers (all user-scoped)

| Server | Status | Notes |
|--------|--------|-------|
| github | Installed | Token may need refresh — revoke old exposed token at github.com/settings/tokens |
| notion | Installed | Key may need refresh — revoke old exposed key at notion.so/my-integrations |
| filesystem | Installed | No key needed — points to project root |

**IMPORTANT:** Both the GitHub PAT and Notion API key were accidentally exposed in chat during setup.
They should be revoked and regenerated. New values go in `C:\Users\mohan\.claude.json` under `mcpServers`.

**How to add MCP servers (always use bash, NOT PowerShell — PowerShell breaks the `--` argument):**
```bash
claude mcp add -s user <name> -e KEY=value -- npx <package>
```
Name MUST come before `-e` flag (the `-e` flag is greedy and will consume the name if placed after it).

---

## Tech Stack

### Web (this repo)
- React 19 + TypeScript
- Vite 6 (dev server: `npm run dev` → port 5173)
- Tailwind CSS — dark glassmorphism theme (bg `#0B0C10`, accent orange `#F97316`, cyan `#22D3EE`)
- GSAP 3 — animations (drawers slide in from right, see `components/TicketDetailDrawer.tsx`)
- Recharts — all charts and graphs
- Lucide React — all icons
- Google Gemini (`@google/genai`) — AI chatbot (keep as-is for PoC)

### Mobile (to build)
- **Flutter** — single codebase for iOS + Android (chosen over native Swift/Kotlin for PoC speed)
- Reuses same Fastify backend API
- NOTE: BRD says Flutter, Frontend PRD says Swift/Kotlin — Flutter is the right call for investor pitch timeline

### Backend (`suncube-backend/`)
- Fastify + Node.js
- PostgreSQL via Knex
- BullMQ (job queues for ticket routing)
- AWS S3 (photo storage)
- Stripe (payments)
- Docker + docker-compose
- Status: scaffolded but NOT yet wired to frontend (frontend uses mockApi.ts)

### Data Pipeline (to build — waiting on data format)
- Source: Real inverter data from 6 client sites (format TBD tomorrow)
- Flow: Inverter data → Python normalization script → PostgreSQL → Fastify API → Web + Flutter
- Business rule: data collected every 60 minutes
- Business rule: >10% deviation from baseline auto-creates a ticket

---

## Repository
- GitHub: https://github.com/specLead/SunCube-AI
- Branch: `main` (stable)
- Local: `C:\Users\mohan\Downloads\suncube-ai-customer-dashboard-main-main\suncube-ai-customer-dashboard-main-main`
- Use feature branches for each plan step, PR into main

---

## Project File Structure

```
/
├── CLAUDE.md              ← this file
├── App.tsx                ← BROKEN — renders Dashboard directly, no auth routing
├── src/App.tsx            ← CORRECT auth routing logic — reference for fixing root App.tsx
├── components/            ← Customer portal (built)
│   ├── Dashboard.tsx      ← Customer dashboard (S2) — fully built, design reference
│   ├── AIChatModal.tsx    ← Gemini chatbot (S13) — built but NOT wired into Dashboard yet
│   ├── TicketDetailDrawer.tsx ← GSAP drawer pattern reference for all new drawers
│   └── PaymentsScreen.tsx ← Payments — in scope for PoC
├── src/components/
│   ├── LoginScreen.tsx    ← Login + role selector (S1) — built
│   ├── TechnicianDashboard.tsx ← PLACEHOLDER — full rewrite needed
│   └── AdminDashboard.tsx ← PLACEHOLDER — full rewrite needed
├── services/
│   ├── mockApi.ts         ← Mock data — only 4 tickets, missing technicians/admin/audit data
│   └── geminiService.ts   ← Gemini AI integration
├── src/services/
│   └── authService.ts     ← login(), logout(), getUser()
├── src/lib/
│   └── authAdapter.ts     ← isAuthenticated(), getRole()
├── types.ts               ← All TypeScript interfaces
└── suncube-backend/       ← Fastify backend (not yet connected to frontend)
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
- Faults with >10% deviation from baseline auto-create a ticket
- Technicians must acknowledge tickets within 1 hour (SLA)
- Resolved tickets automatically notify the customer
- System uptime target: 99.9%
- RBAC: Customer sees only their own data, Technician sees assigned tickets only, Admin sees everything

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
| Admin Fleet Overview | S8 | PLACEHOLDER |
| Admin Ticket Management | S9 | PLACEHOLDER |
| Admin Config | S10 | PLACEHOLDER |
| Audit Log | S11 | PLACEHOLDER |
| Notification Center | S12 | NOT BUILT |
| Chatbot Widget (FAB) | S13 | Built but not wired into Dashboard |
| Reports Page | S14 | NOT BUILT |

Root `App.tsx` is broken — must be fixed before any role routing works.

---

## Execution Plan — Web Prototype

Full spec at: `C:\Users\mohan\.claude\plans\nifty-popping-hopcroft.md`

| Step | Task | File(s) |
|------|------|---------|
| 1 | Create PROGRESS.md | `/PROGRESS.md` |
| 2 | Expand mock data | `services/mockApi.ts` |
| 3 | Fix auth routing | `App.tsx` → replace with `src/App.tsx` pattern |
| 4 | Technician portal | `src/components/TechnicianDashboard.tsx` (S5+S6+S7) |
| 5 | Admin portal | `src/components/AdminDashboard.tsx` (S8+S9+S10+S11) |
| 6 | Reports tab | `components/Dashboard.tsx` (S14) |
| 7 | Notification Center | `components/Dashboard.tsx` (S12) |
| 8 | Wire Chatbot FAB | `components/Dashboard.tsx` (S13) |

---

## Broader PoC Roadmap

1. **Web prototype** (this repo — execute plan above)
2. **Notion PRD redesign** (investor-pitch version via Notion MCP)
3. **Data pipeline** (Python — waiting on inverter data format)
4. **Backend wire-up** (replace mockApi.ts with real Fastify API calls)
5. **Flutter app** (iOS + Android — same screens, same backend)

---

## Design System Rules
- Background: `#0B0C10`
- Card/panel: `bg-[#15161A] border border-white/10 rounded-2xl`
- Glass effect: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`
- Primary accent: orange `#F97316`
- Secondary accent: cyan `#22D3EE`
- All new components must match `components/Dashboard.tsx` glassmorphism style
- GSAP drawers: slide in from right — copy pattern from `components/TicketDetailDrawer.tsx`
- KPI cards: CountUp animation — copy pattern from Dashboard.tsx KPICard

---

## Commands
```bash
npm run dev      # Start dev server → http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Key Contacts
- Owner: Mohanendra Bathini (mohanendrabathini@gmail.com)
- Company: Cubefore LLC
- GitHub: specLead
