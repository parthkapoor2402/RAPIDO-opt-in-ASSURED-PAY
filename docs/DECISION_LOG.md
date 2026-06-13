# Assured Pay — Decision Log

**Version:** 0.1  
**Purpose:** Immutable record of accepted product, policy, and technical decisions. Supersedes verbal assumptions.  
**Rule:** When a decision changes, append a new entry — do not silently edit prior entries.

**Related:** `OPEN_QUESTIONS.md` (full option analysis), `IMPLEMENTATION_PLAN.md` (when decisions apply)

---

## Log format

```markdown
### DEC-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by DEC-YYY
**Source:** OQ-N / PRD / ARCHITECTURE / Builder override
**Decision:** ...
**Rationale:** ...
**Applies from phase:** P0N
**Implemented in:** (file/path — fill when coded)
```

---

## P01 — Architecture sign-off

### DEC-001: Execution plan adopted as build contract
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** IMPLEMENTATION_PLAN.md  
**Decision:** Build proceeds in 14 phases (P01–P14) per IMPLEMENTATION_PLAN.md. ROADMAP.md phase numbers are superseded for day-to-day execution.  
**Rationale:** Spec-driven slices reduce solo-builder risk; each phase is independently committable.  
**Applies from phase:** P01  
**Implemented in:** docs/IMPLEMENTATION_PLAN.md

### DEC-002: No AI in core payment outcomes
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** PRD §3.1, ROADMAP R10  
**Decision:** Settlement amounts, settlement_type, and eligibility outcomes are computed only by deterministic rules in `backend/app/domain/`. No LLM/ML imports in domain or TripEndOrchestrator. Grok (P14) limited to copy generation with validation.  
**Rationale:** Regulatory trust, auditability, and product principle.  
**Applies from phase:** P04  
**Implemented in:** (pending)

### DEC-003: Bike-first MVP scope lock
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** PRD §7, ROADMAP R5  
**Decision:** Assured Pay eligibility requires `category=bike`. Auto/cab excluded from MVP prototype.  
**Rationale:** Lower fare variance, faster habit loop, reduced underwriting risk.  
**Applies from phase:** P04  
**Implemented in:** (pending)

---

## Policy & settlement (from OPEN_QUESTIONS)

### DEC-004: Buffer formula — fixed ₹7
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-1 MVP default  
**Decision:** `M = F + 7` (INR). Buffer is a fixed ₹7 for bike MVP, configurable via env `BUFFER_AMOUNT_INR`.  
**Rationale:** Simple rider comprehension; predictable bad-debt ceiling on low bike fares.  
**Applies from phase:** P04  
**Implemented in:** (pending) `rules/settlement_rules.yaml`

### DEC-005: Small excess auto-residual ceiling — ₹10 above M
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-2 MVP default  
**Decision:** If `A > M` and `(A - M) ≤ 10` and at least one valid reason code present → `RESIDUAL_CREATED`. Captain credited full `A`. Rider charged up to `M`; residual = `A - M`.  
**Rationale:** Balances captain trust with bounded platform exposure.  
**Applies from phase:** P04  
**Implemented in:** (pending) `domain/settlement.py`

### DEC-006: Suspicious overage → manual review
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-3 MVP default  
**Decision:** Route to `REVIEW_REQUIRED` when `(A - M) > 25` **OR** no valid reason code when `A > M`. Do not auto-guarantee full excess silently.  
**Rationale:** Prevents fare dispute trust erosion; ops audit for anomalies.  
**Applies from phase:** P04  
**Implemented in:** (pending) `domain/settlement.py`

### DEC-007: Valid reason codes for auto-residual
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-4 MVP default  
**Decision:** Valid codes: `WAITING`, `ROUTE_CHANGE`, `TOLL`, `PICKUP_CORRECTION`. All others do not qualify for auto-residual.  
**Rationale:** Aligns with product doc transparency complaints mitigation.  
**Applies from phase:** P04  
**Implemented in:** (pending) `domain/reason_codes.py`

### DEC-008: Captain credit on review path
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-5 MVP default  
**Decision:** On `REVIEW_REQUIRED`: credit captain `M` immediately via wallet; hold `(A - M)` pending ops resolution.  
**Rationale:** Captain trust gating stakeholder; platform float bounded by review SLA.  
**Applies from phase:** P07  
**Implemented in:** (pending) TripEndOrchestrator

### DEC-009: Capture behavior on residual path
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-10 MVP default  
**Decision:** Attempt payment capture up to `M`; create `ResidualDue` for verified `(A - M)`. Mock payment documents this intent for future gateway adapter.  
**Rationale:** Pre-auth ceiling contract; recovery path explicit.  
**Applies from phase:** P07  
**Implemented in:** (pending) MockPaymentService

---

## Eligibility & gating

### DEC-010: Saved payment instrument required
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-6 MVP default  
**Decision:** Opt-in blocked without active saved instrument (mock UPI/card token).  
**Rationale:** Recovery and capture require instrument on file.  
**Applies from phase:** P05  
**Implemented in:** (pending) `domain/eligibility.py`

### DEC-011: Residual block policy
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-7 MVP default  
**Decision:** Block Assured Pay after **2 unpaid residuals** past **7-day** grace. Standard rides still allowed (OQ-8).  
**Rationale:** Misuse guardrail without blocking all mobility.  
**Applies from phase:** P08  
**Implemented in:** (pending) eligibility + RiderAssuredProfile

### DEC-012: MVP city config IDs
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-9 MVP default  
**Decision:** Seed cities: `blr` (Bengaluru), `hyd` (Hyderabad). No real geo routing in prototype.  
**Rationale:** Demo narrative consistency.  
**Applies from phase:** P05  
**Implemented in:** (pending) seed script

---

## Payment & recovery UX

### DEC-013: Residual recovery — explicit tap only
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-11 MVP default  
**Decision:** No auto-charge on app open in prototype. Opt-in consent copy may reference future auto-recovery.  
**Rationale:** Consent clarity for prototype; legal review before auto-debit.  
**Applies from phase:** P08  
**Implemented in:** (pending) `/recovery` UI

### DEC-014: Grace period before Assured Pay block
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-12 MVP default  
**Decision:** 7 days grace before Assured Pay blocked; optional booking warning at 14 days (config flag, default off in MVP).  
**Rationale:** Dignified recovery UX early rollout.  
**Applies from phase:** P08  
**Implemented in:** (pending)

---

## Discovery & habit

### DEC-015: Low battery detection approach
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-13 MVP default  
**Decision:** Primary: `/demo` battery toggle. Secondary: `navigator.getBattery()` when available. No native app APIs in web MVP.  
**Rationale:** Browser API coverage incomplete; demo must be reliable.  
**Applies from phase:** P05, P09  
**Implemented in:** (pending)

### DEC-016: Always-on prompt after 3 successful rides
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-14, DISCOVERY_AND_HABIT §6  
**Decision:** Prompt “Always use Assured Pay for bike rides?” when `assured_ride_success_count >= 3`. Requires explicit consent.  
**Rationale:** Habit loop step 3; avoids dark-pattern default-on.  
**Applies from phase:** P09  
**Implemented in:** (pending)

### DEC-017: Free trial — one per rider lifetime
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-15 MVP default  
**Decision:** `free_trial_available` consumed on first assured ride authorization; no per-ride fee in MVP regardless.  
**Rationale:** Behavioral nudge only; no monetization in prototype.  
**Applies from phase:** P05, P09  
**Implemented in:** (pending)

### DEC-018: Product positioning copy
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** PRD §3.2, DISCOVERY_AND_HABIT §1  
**Decision:** Primary umbrella: **“No-payment-stress ride completion”**. Do not lead with “bank server down” messaging.  
**Rationale:** Trust + convenience framing drives habit; rare failure modes are poor headline.  
**Applies from phase:** P05 onward  
**Implemented in:** (pending) copy keys

---

## Technical & deployment

### DEC-019: Frontend → backend communication
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-17 MVP default  
**Decision:** Direct browser REST to FastAPI with CORS. No Next.js BFF in MVP.  
**Rationale:** Simpler solo build; OpenAPI as contract.  
**Applies from phase:** P05  
**Implemented in:** (pending) frontend API client

### DEC-020: Prototype auth
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-18 MVP default  
**Decision:** Mock auth via `X-Rider-Id` / `X-Captain-Id` headers. Rider selector on `/demo`.  
**Rationale:** Avoid NextAuth complexity in prototype.  
**Applies from phase:** P05  
**Implemented in:** (pending)

### DEC-021: Database strategy
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-19 MVP default  
**Decision:** SQLite for local dev. Postgres on Railway at P11 deploy. No SQLite in cloud production.  
**Rationale:** Zero local infra; production durability at deploy.  
**Applies from phase:** P05 local, P11 prod  
**Implemented in:** (pending)

### DEC-022: Backend host — Railway default
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-16 MVP default  
**Decision:** Deploy FastAPI to Railway (Render/Fly acceptable override — log new DEC if changed).  
**Rationale:** Simple Python + Postgres path documented in TECH_STACK.  
**Applies from phase:** P11  
**Implemented in:** (pending)

### DEC-023: Frontend host — Vercel
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** TECH_STACK §8  
**Decision:** Next.js on Vercel; root directory `frontend`. Preview deploys on all PRs.  
**Rationale:** Native Next.js hosting; stakeholder shareable URLs.  
**Applies from phase:** P11  
**Implemented in:** (pending)

---

## Design & branding

### DEC-024: Neutral app shell until visual reference phase
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-20, ROADMAP §9  
**Decision:** Feature name “Assured Pay”; app shell neutral until **P13**. No public “Rapido” trademark in prototype until explicit legal review.  
**Rationale:** Copyright/trademark caution during internal build.  
**Applies from phase:** P03–P12 neutral; P13 inspired visual  
**Implemented in:** (pending)

### DEC-025: Rapido screenshot storage
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-21 MVP default  
**Decision:** Reference screenshots stored locally or Figma; `frontend/design-reference/` **gitignored**. Do not commit proprietary assets.  
**Rationale:** Internal reference only; reduce legal exposure.  
**Applies from phase:** P13  
**Implemented in:** (pending) .gitignore

---

## Metrics

### DEC-026: Analytics pipeline — DB events + summary API
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-24, KPI_TREE  
**Decision:** `MetricsEvent` table + `GET /metrics/summary`. No Amplitude/Mixpanel in MVP. North Star = FACR from KPI_TREE.  
**Rationale:** Demo credibility without third-party analytics setup.  
**Applies from phase:** P09  
**Implemented in:** (pending)

### DEC-027: Captain payout SLA for L1 metric
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-25 MVP default  
**Decision:** Demo target: captain wallet credit within **2 minutes** of trip end. Pilot target: 5 minutes.  
**Rationale:** “Instant” captain trust in demo; realistic pilot SLA.  
**Applies from phase:** P07 metrics  
**Implemented in:** (pending)

### DEC-028: Dispute window for North Star
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-26 MVP default  
**Decision:** FACR excludes disputes within **24h** for prototype; revisit **72h** before pilot.  
**Rationale:** Prototype uses simulated disputes; 24h sufficient for demo.  
**Applies from phase:** P09  
**Implemented in:** (pending)

---

## AI & Grok (deferred defaults)

### DEC-029: Grok deferred to P14; default off
**Date:** 2026-06-13  
**Status:** Accepted  
**Source:** OQ-22, OQ-23, ROADMAP §10  
**Decision:** Grok integration optional in P14 only. `GROK_COPY_ENABLED=false` default. Allowed: copy variants, ops case summary. Forbidden: settlement, eligibility, buffer amounts. FIFO review queue; no AI ranking in MVP.  
**Rationale:** Core flows must be stable and deployed before optional AI assist.  
**Applies from phase:** P14  
**Implemented in:** (pending)

---

## Deferred — requires future decision

| ID | Topic | Owner | Target |
|----|-------|-------|--------|
| DEC-D01 | Legal consent copy for delayed capture | Legal | Pre-pilot (OQ-27) |
| DEC-D02 | NPCI/RBI pre-auth compliance for M | Legal + Payments | Pre-production gateway (OQ-28) |
| DEC-D03 | Per-ride Assured Pay fee | Product + Finance | Post-pilot only |
| DEC-D04 | Booking block for open dues (hard block) | Product | Pilot evaluation (OQ-8) |

---

## Override procedure

1. Identify conflicting decision or new requirement.
2. Document options and recommendation.
3. Append new `DEC-XXX` entry; mark old entry `Superseded by DEC-XXX`.
4. Update `OPEN_QUESTIONS.md` status if applicable.
5. Update affected phase checklist items in `PHASE_CHECKLISTS.md`.

---

## Decision index

| DEC | Summary | Phase |
|-----|---------|-------|
| DEC-001 | Execution plan contract | P01 |
| DEC-002 | No AI in settlement | P04 |
| DEC-003 | Bike-only MVP | P04 |
| DEC-004 | Buffer ₹7 | P04 |
| DEC-005 | Small excess ≤₹10 | P04 |
| DEC-006 | Review if >₹25 or bad reason | P04 |
| DEC-007 | Four reason codes | P04 |
| DEC-008 | Review: credit M, hold rest | P07 |
| DEC-009 | Capture up to M | P07 |
| DEC-010 | Instrument required | P05 |
| DEC-011 | Block after 2 unpaid | P08 |
| DEC-012 | Cities blr/hyd | P05 |
| DEC-013 | Explicit residual pay tap | P08 |
| DEC-014 | 7d grace | P08 |
| DEC-015 | Battery demo toggle | P05 |
| DEC-016 | Always-on after 3 rides | P09 |
| DEC-017 | One free trial | P05 |
| DEC-018 | No-payment-stress positioning | P05 |
| DEC-019 | Direct REST + CORS | P05 |
| DEC-020 | Header mock auth | P05 |
| DEC-021 | SQLite local / Postgres prod | P05/P11 |
| DEC-022 | Railway backend | P11 |
| DEC-023 | Vercel frontend | P11 |
| DEC-024 | Neutral shell until P13 | P03 |
| DEC-025 | Gitignore screenshot refs | P13 |
| DEC-026 | DB metrics + summary | P09 |
| DEC-027 | 2min payout SLA demo | P07 |
| DEC-028 | 24h dispute window | P09 |
| DEC-029 | Grok P14 optional off | P14 |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-13 | Initial decision log created at P01 architecture lock-in. All OQ MVP defaults accepted unless marked deferred. |
