# Assured Pay

**Opt-in payment guarantee for Rapido-style ride-hailing (Bike, Auto, Cab)**

[![Live Demo](https://img.shields.io/badge/demo-live-00C853?style=for-the-badge)](https://frontend-navy-eight-23.vercel.app/home)
[![Stack](https://img.shields.io/badge/stack-Next.js_14_·_FastAPI-000?style=for-the-badge&logo=next.js)](https://frontend-navy-eight-23.vercel.app)
[![Status](https://img.shields.io/badge/status-MVP_prototype-FFB300?style=for-the-badge)](docs/PRD.md)

> **Live prototype:** [https://frontend-navy-eight-23.vercel.app](https://frontend-navy-eight-23.vercel.app)  
> Riders approve a fare ceiling at booking; settlement at trip end is **deterministic** — AI assists copy only, never payment decisions.

---

## Table of contents

1. [Executive summary](#executive-summary)
2. [The problem](#the-problem)
3. [The solution](#the-solution)
4. [What was built](#what-was-built)
5. [Live demo](#live-demo)
6. [User journeys & personas](#user-journeys--personas)
7. [Data & measurement pipeline](#data--measurement-pipeline)
8. [System architecture](#system-architecture)
9. [Technology stack](#technology-stack)
10. [Quality & test coverage](#quality--test-coverage)
11. [Getting started locally](#getting-started-locally)
12. [Deployment](#deployment)
13. [Documentation](#documentation)
14. [Prototype boundaries](#prototype-boundaries)

---

## Executive summary

**Assured Pay** addresses the fragile **last-mile payment moment** in ride-hailing: the ride completes, but checkout fails—UPI pending, dead battery, poor network, or fare surprise.

This repository is a **demo-ready MVP prototype** that proves:

- Riders can **opt in** to a known fare ceiling (**M = F + buffer**) at booking
- Captains receive **instant payout certainty** when policy allows
- Small valid overages create **residual dues** with a structured recovery path—not checkout arguments
- Suspicious overages route to **human ops review**, not silent auto-approval
- Product health is **measurable** via a PM analytics layer (FACR, opt-in funnel, recovery KPIs)

Built as a Rapido-inspired mobile web experience with a production-shaped policy engine, typed APIs, and automated test coverage.

---

## The problem

### Product problem statement

> How do we give riders **ride-completion certainty** and captains **payout certainty** at drop-off—without opening unbounded credit risk?

### Stakeholder pain

| Stakeholder | Pain at trip end |
|-------------|------------------|
| **Rider** | Payment fails, device dies, network drops, or final fare feels unfair → stress and distrust |
| **Captain** | Earnings delayed; forced into cash negotiation; uncertainty after completing the trip |
| **Platform** | Support tickets, cash fallback, fare disputes, and churn at the highest-friction moment |

### Why now

The transport experience can be excellent while **payment remains the weakest link**. Assured Pay targets that gap with an **opt-in guarantee layer**—not a blanket credit product.

---

## The solution

### Core logic (deterministic)

| Symbol | Meaning |
|--------|---------|
| **F** | Estimated fare at booking |
| **M** | Rider-approved max = F + buffer |
| **A** | Actual fare at trip end |

| Scenario | Settlement behaviour |
|----------|---------------------|
| **A ≤ M** | Charge A. Captain paid A. Ride closed. |
| **Small valid overage** (waiting, route change, toll, pickup correction) | Captain paid full A. Up to M captured; **residual due** created for remainder. |
| **Large / suspicious overage** | No auto-guarantee. **Ops review queue**. Audit trail via reason codes. |

### Product principles

1. **Opt-in only** — never forced at checkout
2. **Policy-first** — rules in domain code, not model inference
3. **Captain fairness** — instant closure within approved policy
4. **Transparent recovery** — grace period, clear dues, dispute path
5. **AI as assist** — Grok explains policy; **never** decides settlement

---

## What was built

| Phase | Deliverable | Outcome |
|-------|-------------|---------|
| **P05 — Discovery & opt-in** | Contextual booking prompts, fare card (F / buffer / M), opt-in sheet | Right rider, right moment |
| **P06 — Live ride trust** | Fare progression, buffer zone, review-required states, reason codes | Trust during the trip |
| **P07 — Settlement & payout** | Happy path, valid overage, suspicious overage, captain payout view | End-to-end money flow |
| **P08 — Recovery & support** | Pending-due banner, pay/dispute, grace period, rebooking rules | Post-ride balance recovery |
| **P09 — PM analytics** | KPI dashboard, cohort filter (healthy / stressed), event funnel | Product measurement |
| **P14 — Grok assist (optional)** | Plain-language fare/due/dispute explanations + policy fallback | Support deflection; off by default |

### Repository layout

```
├── frontend/          Next.js 14 — rider, captain, ops, admin UI
├── backend/           FastAPI — policy engine, settlement, recovery, analytics
├── docs/              PRD, architecture, demo script, KPI tree
├── tests/e2e/         Playwright — 9 demo-flow scenarios
└── vercel.json        Multi-service deploy (frontend + backend)
```

---

## Live demo

**Primary URL:** [https://frontend-navy-eight-23.vercel.app](https://frontend-navy-eight-23.vercel.app)

| Experience | Link |
|------------|------|
| Home | [/home](https://frontend-navy-eight-23.vercel.app/home) |
| Booking & discovery | [/booking](https://frontend-navy-eight-23.vercel.app/booking) |
| Assured Pay opt-in | [/booking/assured-pay](https://frontend-navy-eight-23.vercel.app/booking/assured-pay) |
| Live ride (fare trust) | [/ride/live](https://frontend-navy-eight-23.vercel.app/ride/live) — see [demo scenarios](#live-ride-demo-scenarios) below |
| Ride completed (within max) | [/ride/completed?outcome=within_max](https://frontend-navy-eight-23.vercel.app/ride/completed?outcome=within_max) |
| Buffer zone · within max | [/ride/completed?outcome=buffer_within_max](https://frontend-navy-eight-23.vercel.app/ride/completed?outcome=buffer_within_max) |
| Valid overage (residual due) | [/ride/completed?outcome=valid_overage](https://frontend-navy-eight-23.vercel.app/ride/completed?outcome=valid_overage) |
| Suspicious overage (review) | [/ride/completed?outcome=suspicious_overage](https://frontend-navy-eight-23.vercel.app/ride/completed?outcome=suspicious_overage) |
| Recovery | [/recovery](https://frontend-navy-eight-23.vercel.app/recovery) |
| Ops review queue | [/support/review](https://frontend-navy-eight-23.vercel.app/support/review) |
| Captain payout | [/captain/payout](https://frontend-navy-eight-23.vercel.app/captain/payout) |
| PM analytics | [/admin/analytics](https://frontend-navy-eight-23.vercel.app/admin/analytics) |
| Demo personas | [/demo/scenarios](https://frontend-navy-eight-23.vercel.app/demo/scenarios) |
| API docs | [/api/docs](https://frontend-navy-eight-23.vercel.app/api/docs) |

**Suggested demo flow:** See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) (~12 min walkthrough).

### Supported ride types

Select **Bike**, **Auto**, or **Cab** on [/booking](https://frontend-navy-eight-23.vercel.app/booking). The same Assured Pay flow applies to all three; fare presets scale per category:

| Category | Estimate (F) | Buffer | Approved max (M) |
|----------|--------------|--------|------------------|
| **Bike** | ₹42 | ₹7 | ₹49 |
| **Auto** | ₹85 | ₹10 | ₹95 |
| **Cab** | ₹145 | ₹15 | ₹160 |

Your selection persists for live ride and post-ride completion screens.

### Supported demo scenarios

#### Live ride (during trip)

On **[/ride/live](https://frontend-navy-eight-23.vercel.app/ride/live)**, use playback controls to step through:

| # | Scenario | Trust chip | What it demonstrates |
|---|----------|------------|----------------------|
| **a** | **Within approved max** | On track | Fare stays at estimate; no extra charges |
| **b** | **Entered buffer zone** | Still covered | Valid waiting/route updates within M |
| **c** | **Review required** (suspicious path) | Review first | Fare above max; held for review, not auto-charged |

Use **Prev / Next** to advance steps; switching scenarios resets to step 1. Works for Bike, Auto, and Cab.

#### Post-ride completion (at trip end)

Open directly via `?outcome=` or after live ride playback:

| # | Scenario | URL param | Rider outcome | Captain outcome |
|---|----------|-----------|---------------|-----------------|
| **a** | **Within approved max** | `within_max` | Charged at final fare (A ≤ M) | Paid in full |
| **b** | **Buffer zone · still within max** | `buffer_within_max` | Charged within M after valid buffer updates | Paid in full |
| **c** | **Small valid excess · residual due** | `valid_overage` | M captured at trip end; small verified remainder due | Paid in full by assurance |
| **d** | **Suspicious excess · under review** | `suspicious_overage` | M captured; excess held for ops review | Payout pending review |

Legacy alias: `?outcome=happy_path` maps to **within approved max**.

---

## User journeys & personas

Switch personas at **Profile → Demo scenarios**:

| Persona | View | Demonstrates |
|---------|------|--------------|
| Time-critical commuter | Rider | Discovery, free trial, opt-in |
| Low-confidence payer | Rider | Post-failure education card |
| Open residual due | Rider | Recovery banner, Assured Pay blocked |
| Captain instant closure | Captain | Wallet payout after settlement |
| Ops review queue | Ops | Suspicious overage triage |
| Platform analytics | Admin | FACR and funnel KPIs |

---

## Data & measurement pipeline

Assured Pay is designed to be **observable from day one**. The prototype implements the measurement spine that would connect to a warehouse in production.

```
┌─────────────────────────────────────────────────────────────┐
│  Product surface (booking → ride → settlement → recovery)   │
└────────────────────────────┬────────────────────────────────┘
                             │ typed events
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Event capture — discovery, opt-in, fare state, settlement, │
│  residual due, dispute, ops review                          │
└────────────────────────────┬────────────────────────────────┘
                             │ aggregation
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  KPI layer — FACR, opt-in rate, overage mix, recovery rate  │
└────────────────────────────┬────────────────────────────────┘
                             │ dashboard
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  PM analytics UI (/admin/analytics)                         │
└─────────────────────────────────────────────────────────────┘
```

### North Star metric

**FACR — Frictionless Assured Completion Rate**

Among opted-in rides, the share that end with zero payment failure, no cash fallback, and no dispute within 24h. See [`docs/KPI_TREE.md`](docs/KPI_TREE.md) for the full metric tree.

### Events instrumented (prototype)

| Event family | Examples |
|--------------|----------|
| Discovery | Prompt shown, learn-more opened |
| Opt-in | Authorization confirmed, free trial applied |
| Ride | Trust state change, reason code update |
| Settlement | Happy path, residual due created, review held |
| Recovery | Due paid, dispute submitted, grace expired |

**Prototype note:** Events use seeded in-memory data; schema and aggregation mirror production design in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## System architecture

```
┌──────────────┐     HTTPS      ┌──────────────┐
│   Browser    │ ◄────────────► │   Vercel     │
│  (Next.js)   │   /api/*       │  Services    │
└──────────────┘                │  ┌─────────┐ │
                                │  │ FastAPI │ │
                                │  └─────────┘ │
                                └──────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | Discovery UI, live fare trust, settlement screens, recovery, analytics dashboard |
| **Backend** | Eligibility, fare engine, settlement service, residual due lifecycle, analytics aggregation |
| **Domain** | Pure policy rules (`backend/app/domain/`) — settlement, recovery, rebooking |
| **Assist** | Grok adapter with validator + policy fallback (never on settlement path) |

API base path: **`/api`**. OpenAPI: [live docs](https://frontend-navy-eight-23.vercel.app/api/docs).

---

## Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic v2, Python 3.11+ |
| Testing | pytest (151), Vitest (147), Playwright (9 E2E flows) |
| CI | GitHub Actions — lint, unit tests, build, E2E |
| Deploy | Vercel Services — Next.js at `/`, FastAPI at `/api` |

---

## Quality & test coverage

| Suite | Count | Scope |
|-------|-------|-------|
| Backend pytest | 151 | Domain policy, settlement, recovery, analytics, Grok guardrails |
| Frontend Vitest | 147 | Components, contexts, live-ride + completion scenario integration, ride categories |
| Playwright E2E | 9 | Discovery, opt-in, live ride, overage, recovery, Grok fallback |

```powershell
npm run test          # backend + frontend
npm run test:e2e      # Playwright demo flows
npm run build         # production frontend build
```

---

## Getting started locally

### Prerequisites

Node 20+, Python 3.11+, npm, pip

### Setup

```powershell
git clone https://github.com/parthkapoor2402/RAPIDO-opt-in-ASSURED-PAY.git
cd RAPIDO-opt-in-ASSURED-PAY

npm run install:all

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cd ..

copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local

npm run dev
```

| Surface | Local URL |
|---------|-----------|
| App | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

Detailed guide: [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)

---

## Deployment

### Production (current)

| Item | Value |
|------|-------|
| **Live URL** | https://frontend-navy-eight-23.vercel.app |
| **Vercel project** | [parthkapoor2402s-projects/frontend](https://vercel.com/parthkapoor2402s-projects/frontend) |
| **Config** | Root [`vercel.json`](vercel.json) — Vercel Services (Next.js + FastAPI) |
| **Region** | `bom1` (Mumbai) |

### Environment variables (Vercel)

Set these in **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Scope | Production value |
|----------|-------|------------------|
| `NEXT_PUBLIC_API_URL` | Frontend | `https://frontend-navy-eight-23.vercel.app/api` |
| `NEXT_PUBLIC_DEMO_MODE` | Frontend | `true` |
| `CORS_ORIGINS` | Backend | `https://frontend-navy-eight-23.vercel.app` |

Optional (Grok copy assist — off by default):

| Variable | Value |
|----------|-------|
| `GROK_API_KEY` | Your xAI API key |
| `GROK_COPY_ENABLED` | `true` |

Local dev copies: [`frontend/.env.example`](frontend/.env.example), [`backend/.env.example`](backend/.env.example).

### Vercel deployment steps

**First-time setup**

1. Install Vercel CLI: `npm i -g vercel`
2. Log in: `vercel login`
3. Link the repo root (where `vercel.json` lives): `vercel link`
4. Add environment variables above in the Vercel dashboard (or via CLI — see below).
5. Deploy: `vercel deploy --prod`

**Redeploy after a release commit**

```powershell
# From repository root
git push origin main

# Or trigger deploy directly from CLI
npx vercel deploy --prod --yes
```

**Set env vars via CLI (optional)**

```powershell
vercel env add NEXT_PUBLIC_API_URL production
# paste: https://frontend-navy-eight-23.vercel.app/api

vercel env add NEXT_PUBLIC_DEMO_MODE production
# paste: true

vercel env add CORS_ORIGINS production
# paste: https://frontend-navy-eight-23.vercel.app
```

**Verify after deploy**

- App loads: `https://YOUR-APP.vercel.app/home`
- API docs: `https://YOUR-APP.vercel.app/api/docs`
- Booking shows Bike / Auto / Cab rows
- Live ride playback: `/ride/live`
- Completion scenarios: `/ride/completed?outcome=valid_overage`

Pre-demo checklist: [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements, scope, use cases |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, API contracts, data model |
| [`docs/KPI_TREE.md`](docs/KPI_TREE.md) | North Star, metric hierarchy, guardrails |
| [`docs/USER_JOURNEYS.md`](docs/USER_JOURNEYS.md) | End-to-end journey maps |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | Stakeholder demo walkthrough |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Phase-by-phase build plan |
| [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) | Key product & engineering decisions |

---

## Prototype boundaries

| In scope (this repo) | Out of scope (production follow-on) |
|----------------------|-------------------------------------|
| Deterministic settlement rules | Real payment gateway integration |
| In-memory demo data | Postgres + persistent ledger |
| Demo persona switcher | OAuth / rider identity |
| Seeded analytics events | Warehouse + BI pipeline |
| Optional Grok copy assist | Production AI governance review |
| Bike / Auto / Cab UI + category-scaled demo fares | Backend category param on all API routes |
| Frontend mock fallback for non-bike live ride | Full API parity for Auto/Cab playback |

**Status:** Demo-ready for stakeholder walkthroughs, user research, and technical due diligence. Not for live payment processing without further hardening and compliance review.

---

## License

Private prototype — not for production use without legal, compliance, and security review.
