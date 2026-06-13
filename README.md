# Assured Pay — Opt-In Payment Guarantee (MVP Prototype)

**Rapido-inspired ride-hailing · Bike · Demo-ready prototype**

Assured Pay is an **opt-in payment guarantee** that lets riders approve a fare ceiling at booking and finish trips without last-mile checkout stress—while giving captains **instant payout certainty** when fares stay within policy.

This repository is a **working MVP prototype** built to validate product logic, stakeholder flows, and measurement design before production investment.

---

## The problem we set out to solve

In ride-hailing, the ride often ends well—but **payment does not**.

| Stakeholder | What breaks at drop-off |
|-------------|-------------------------|
| **Rider** | UPI pending, dead battery, poor network, or fare surprise → awkward checkout and distrust |
| **Captain** | Delayed earnings, cash negotiation, uncertainty about getting paid for a completed trip |
| **Platform** | Support load, cash fallback, fare disputes, and retention loss at the worst moment in the journey |

**Core product problem:** How do we give riders **completion certainty** and captains **payout certainty** without opening unbounded credit risk?

---

## The solution (product logic)

Assured Pay is **opt-in at booking**. The rider sees an estimate **F**, a small **buffer**, and an approved ceiling **M = F + buffer**. At trip end, the actual fare **A** is settled with **deterministic rules**—not AI decisions.

| Outcome | What happens |
|---------|----------------|
| **A ≤ M** | Rider charged A. Captain paid A. Ride closed. |
| **Small valid overage** (waiting, route change, toll, etc.) | Captain paid in full. Up to M captured from rider; remainder becomes a **residual due** with a clear recovery path. |
| **Large or suspicious overage** | No auto-guarantee. Case routed to **ops review** with a reason-code audit trail. |

**Product principle:** AI (Grok) may help explain policy in plain language—it **never** decides who gets paid or how much.

---

## What this prototype delivers

End-to-end flows implemented and demoable:

| Phase | Capability | User value |
|-------|------------|------------|
| **Discovery & opt-in** | Contextual prompts at booking (commuter, low battery, post-failure, free trial) | Right rider, right moment—without forcing opt-in |
| **Live ride trust** | Fare vs approved max, buffer zone, review-required states | Transparency during the trip, not just at the end |
| **Settlement & payout** | Happy path, valid overage, suspicious overage | Predictable outcomes for rider, captain, and ops |
| **Recovery & support** | Pending-due banner, pay/dispute, grace period, rebooking rules | Recover small balances without breaking trust |
| **Captain view** | Instant payout visibility after settlement | Closes the captain side of the two-sided promise |
| **PM analytics** | FACR, opt-in funnel, cohort views (healthy vs stressed) | Measure whether the product is working—not just whether it runs |
| **Assistive AI (optional)** | Grok-powered explanations with policy fallback | Reduces support confusion; disabled by default for demo safety |

**Demo personas** (switchable in-app): time-critical commuter, low-confidence payer, open residual due, captain, ops reviewer, analytics admin.

---

## Data & measurement pipeline

The prototype models how Assured Pay would be **observed and governed** in production:

```
Booking / opt-in / ride / settlement / recovery
        │
        ▼
   Event capture (typed product events)
        │
        ▼
   Aggregation layer (KPI rollups)
        │
        ▼
   PM dashboard (FACR, opt-in rate, overage mix, recovery)
```

**Events tracked (conceptual):** discovery shown, opt-in confirmed, ride progress milestones, settlement outcome, residual due created/paid, dispute opened, ops review required.

**KPIs surfaced:** Fare-at-completion reliability (FACR), Assured Pay opt-in rate, valid vs suspicious overage split, residual recovery rate, captain instant-payout rate.

**Prototype note:** Events and aggregates use **seeded in-memory data** for demo. The event schema and aggregation logic mirror the production-shaped design in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)—ready to wire to a warehouse or product analytics tool later.

---

## Prototype vs production

| Dimension | This repo (prototype) | Production path |
|-----------|---------------------|-----------------|
| Persistence | In-memory stores, demo riders | Postgres + ledger |
| Payments | Simulated wallet / capture | Real payment gateway |
| Identity | Demo scenario switcher | Auth + rider profile |
| Analytics | Seeded events + live aggregation API | Event stream → warehouse → BI |
| AI | Optional Grok copy; off by default | Same guardrails if enabled |

Settlement and eligibility rules live in **explicit domain policy code**—the part that would carry forward unchanged in a production build.

---

## Repository structure

```
frontend/     Rider, captain, ops, and admin experiences (Next.js)
backend/      Policy engine, APIs, analytics aggregation (FastAPI)
docs/         PRD, architecture, demo script, release checklist
tests/e2e/    Playwright flows covering the full demo narrative
```

---

## Quick start (developers)

```powershell
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
npm run dev
```

| Surface | URL |
|---------|-----|
| App | http://localhost:3000 |
| API docs | http://localhost:8000/docs |

Full setup: [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)  
Demo walkthrough: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)  
Pre-demo checklist: [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)

**Tests:** `npm run test` · **E2E:** `npx playwright install chromium` then `npm run test:e2e`

---

## Deployment

| Layer | Target | Notes |
|-------|--------|-------|
| Frontend | [Vercel](https://vercel.com) | Set root directory to `frontend`; configure `NEXT_PUBLIC_API_URL` |
| Backend | Railway / Render | Point at `backend/`; set `CORS_ORIGINS` to your Vercel URL |

CI runs backend tests, frontend lint/build, and Playwright demo flows on every push to `main`.

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [`docs/PRD.md`](docs/PRD.md) | Problem, scope, use cases, success metrics |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, API surface, data model |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Phase-by-phase build plan |
| [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) | Key product and engineering decisions |

---

## Status

**Demo-ready MVP** — suitable for stakeholder walkthroughs, user research, and technical due diligence. Not intended for live payment processing or production traffic.

---

## License

Private prototype — not for production use without further hardening and legal/compliance review.
