# Assured Pay — Phase Checklists

**Version:** 0.1  
**Usage:** Check boxes as each phase completes. Do not advance until **Done gate** is satisfied.  
**Plan reference:** `IMPLEMENTATION_PLAN.md`

---

## Progress overview

| Phase | Name | Status |
|-------|------|--------|
| P01 | Architecture Lock-In | ☐ |
| P02 | Repo Scaffold & CI | ☐ |
| P03 | Frontend Design System | ☐ |
| P04 | Fare Engine | ☐ |
| P05 | Rider Discovery | ☐ |
| P06 | Ride Progress | ☐ |
| P07 | Completion & Payout | ☐ |
| P08 | Due Recovery & Dispute | ☐ |
| P09 | Analytics & Admin | ☐ |
| P10 | GitHub Prep | ☐ |
| P11 | Vercel Deployment | ☐ |
| P12 | Final Integration & E2E | ☐ |
| P13 | Rapido Screenshot Reference | ☐ |
| P14 | Grok Integration (Optional) | ☐ |

---

## P01 — Architecture Lock-In

### Spec & decisions
- [ ] Read all `/docs` files; no conflicting assumptions remain
- [ ] OQ-1 buffer: fixed ₹7 accepted → logged in DECISION_LOG
- [ ] OQ-2 small excess: ₹10 above M accepted
- [ ] OQ-3 suspicious: >₹25 above M OR invalid reason → REVIEW
- [ ] OQ-4 reason codes list accepted
- [ ] OQ-5 review captain credit: M immediately, hold (A−M)
- [ ] API endpoint checklist (11 groups) confirmed
- [ ] Route map confirmed (ARCHITECTURE §4.2)
- [ ] Rule documented: no LLM in `domain/`

### Testing prep
- [ ] E2E scenarios E1–E8 mapped to phases
- [ ] Seed fixture IDs defined

### Done gate
- [ ] DECISION_LOG.md P01 entries complete
- [ ] IMPLEMENTATION_PLAN acknowledged as execution contract
- [ ] **Commit:** `docs: lock architecture defaults and execution plan (P01)`

---

## P02 — Repo Scaffold & CI

### Frontend
- [ ] Next.js 14 + TS + Tailwind in `frontend/`
- [ ] ESLint + Prettier configured
- [ ] Placeholder `/` and `/book` routes
- [ ] Vitest + RTL smoke test passes
- [ ] `.env.example` with `NEXT_PUBLIC_API_URL`

### Backend
- [ ] FastAPI app with `GET /health`
- [ ] Module folder structure created (empty)
- [ ] Ruff + Black + pytest configured
- [ ] Health integration test passes
- [ ] `.env.example` with config vars

### Infra
- [ ] `.github/workflows/ci.yml` — backend + frontend jobs
- [ ] Root `README.md` local dev instructions
- [ ] `.gitignore` complete

### Done gate
- [ ] CI green on push
- [ ] No business logic beyond health
- [ ] **Commit:** `chore: scaffold monorepo with FastAPI, Next.js, and CI (P02)`

---

## P03 — Frontend Design System

### Components
- [ ] Button, Card, Chip, Banner, Modal, Skeleton, FareAmount
- [ ] MobileShell, PageHeader, Section
- [ ] `data-testid` convention applied

### Theme
- [ ] Tailwind tokens: color, spacing, radius, typography
- [ ] Fare format: ₹ with 2 decimals
- [ ] Status colors: success / warning / alert / neutral

### Dev tooling
- [ ] `/design-system` gallery route (dev-only)
- [ ] Vitest tests for base components

### Done gate
- [ ] 375px layout manual check
- [ ] Neutral palette only (no Rapido assets)
- [ ] **Commit:** `feat(ui): add mobile-first design system primitives (P03)`

---

## P04 — Fare Engine

### Domain modules
- [ ] `domain/fare.py` — F estimate, M = F + buffer
- [ ] `domain/reason_codes.py` — 4 valid codes
- [ ] `domain/settlement.py` — FULL_CAPTURE, RESIDUAL_CREATED, REVIEW_REQUIRED
- [ ] `domain/eligibility.py` — bike, instrument, block checks
- [ ] `rules/settlement_rules.yaml` with policy_version

### API (minimal)
- [ ] `POST /rides/estimate` returns F

### Tests
- [ ] Parametrized pytest: A≤M, A=M, small excess, large excess, invalid reason
- [ ] Domain coverage ≥ 95%
- [ ] No LLM/third-party imports in domain

### Done gate
- [ ] All TEST_STRATEGY §3.1 cases pass
- [ ] Decisions match PRD §3.1
- [ ] **Commit:** `feat(domain): fare engine and settlement rules with full unit tests (P04)`

---

## P05 — Rider Discovery

### Backend
- [ ] Models: Rider, PaymentInstrument, Ride, AssuredPayAuthorization, RiderAssuredProfile
- [ ] SQLite + seed script (3 riders)
- [ ] `GET /assured-pay/eligibility`
- [ ] `POST /assured-pay/authorize`
- [ ] `POST /rides`, `POST /rides/estimate`
- [ ] DiscoveryService with 2+ prompt types
- [ ] Integration tests: eligible, blocked, authorize

### Frontend
- [ ] API client + TanStack Query
- [ ] `/book` with AssuredPayBookingCard
- [ ] F, M, buffer visible before opt-in
- [ ] Confirmation state + “How fare changes work” modal
- [ ] DiscoveryPrompts (booking + contextual)
- [ ] Free trial badge when applicable
- [ ] RTL tests for booking card

### Done gate
- [ ] Full opt-in → ride created flow works locally
- [ ] `discovery_source` stored on authorize
- [ ] **Commit:** `feat: rider discovery, eligibility API, and booking opt-in UI (P05)`

---

## P06 — Ride Progress

### Backend
- [ ] FareEvent model
- [ ] `POST /rides/{id}/fare-events`
- [ ] `GET /rides/{id}/fare-status` with zone enum
- [ ] Integration tests: all three zones

### Frontend
- [ ] `/ride/[rideId]` page
- [ ] AssuredPayChip with zone states
- [ ] FareUpdateBanner with reason messages
- [ ] Refetch/poll fare status
- [ ] RTL tests for chip zones

### Done gate
- [ ] WAITING event updates UI correctly
- [ ] EXCEEDS_M warning visible pre trip-end
- [ ] **Commit:** `feat: in-ride fare status, zones, and fare event API (P06)`

---

## P07 — Completion & Payout

### Backend
- [ ] PaymentPort + WalletPort interfaces
- [ ] MockPaymentService + MockWalletService
- [ ] Settlement + CaptainWalletTransaction models
- [ ] TripEndOrchestrator
- [ ] `POST /rides/{id}/complete` + idempotency
- [ ] `GET /captains/{id}/wallet`
- [ ] Service + integration tests (happy, payment fail rescue)

### Frontend
- [ ] `/ride/[rideId]/complete` — TripEndSettlement success state
- [ ] `/captain` — CaptainWalletPanel
- [ ] `/demo` — payment failure toggle
- [ ] Post-ride reinforcement message
- [ ] RTL tests for trip end success

### Done gate
- [ ] Happy path: captain credited ≤ 2s local
- [ ] Payment fail + assured → ride complete (E3 prep)
- [ ] Idempotent complete verified
- [ ] **Commit:** `feat: trip-end settlement, payment/wallet mocks, captain wallet UI (P07)`

---

## P08 — Due Recovery & Dispute

### Backend
- [ ] ResidualDue + ReviewCase models
- [ ] Residual path in orchestrator (small valid excess)
- [ ] Review path (large/suspicious)
- [ ] `GET /riders/{id}/residuals/open`
- [ ] `POST /residuals/{id}/pay`
- [ ] `GET /ops/review-queue`
- [ ] `POST /ops/review/{case_id}/resolve`
- [ ] Block policy: 2 unpaid residuals → assured_blocked
- [ ] Integration tests: residual, review, block

### Frontend
- [ ] TripEndSettlement: residual + review states
- [ ] `/recovery` page + RecoveryBanner
- [ ] `/history` post-failure education card
- [ ] `/ops/review` queue UI
- [ ] Ineligible opt-in when open residual
- [ ] RTL: RecoveryBanner, review pending

### Done gate
- [ ] E4, E5, E6, E7 scenarios work locally
- [ ] Ops resolve writes audit trail
- [ ] **Commit:** `feat: residual recovery, review queue, and dispute flows (P08)`

---

## P09 — Analytics & Admin

### Backend
- [ ] MetricsEvent model + append-only writes
- [ ] Events on: opt_in, complete, residual, review, rescue
- [ ] `POST /metrics/events`, `GET /metrics/summary`
- [ ] FACR calculation in summary
- [ ] RiderAssuredProfile: streak, always_assured, trial flags
- [ ] Habit: always-on after 3 successes

### Frontend
- [ ] `/demo` full controls (rider, battery, fail, overage, reset)
- [ ] Free trial consumption UX
- [ ] “Always use Assured Pay” modal
- [ ] Optional `/metrics` summary page

### Done gate
- [ ] FACR computable from seed data
- [ ] discovery_source in opt-in events
- [ ] Demo page drives all settlement variants
- [ ] **Commit:** `feat: KPI event instrumentation, metrics summary, and demo admin (P09)`

---

## P10 — GitHub Prep

### Repository hygiene
- [ ] No secrets in repo or history
- [ ] Dependencies locked
- [ ] `backend/openapi.json` exported or CI-generated
- [ ] `/design-system` and `/demo` gated for prod

### Documentation
- [ ] README: dev setup, demo script, architecture link
- [ ] Branch model documented (`main`, `feat/*`)
- [ ] CI badge in README

### Quality
- [ ] pytest + vitest green on main
- [ ] `npm run build` passes
- [ ] Playwright config present in `e2e/`

### Done gate
- [ ] Repo ready for `git push` to remote
- [ ] **Commit:** `chore: GitHub prep — README, OpenAPI export, CI hardening (P10)`

---

## P11 — Vercel Deployment

### Vercel (frontend)
- [ ] Project connected; root `frontend`
- [ ] `NEXT_PUBLIC_API_URL` set (prod + preview)
- [ ] Preview deploys on PR
- [ ] Production deploy from `main`

### Railway (backend — default)
- [ ] FastAPI deployed
- [ ] Postgres provisioned; migrations run
- [ ] CORS allows Vercel domains
- [ ] Seed script run on staging/prod
- [ ] `GET /health` returns 200

### Verification
- [ ] Prod `/book` loads
- [ ] Complete happy path on prod URL
- [ ] Payment rescue on prod URL
- [ ] No secrets in client bundle

### Done gate
- [ ] Shareable URLs in README
- [ ] Optional tag `v0.1.0-mvp`
- [ ] **Commit:** `chore: add deployment config for Vercel and Railway (P11)`

---

## P12 — Final Integration & E2E

### Playwright
- [ ] E1 Happy path opt-in → complete
- [ ] E2 Low battery discovery
- [ ] E3 Payment failure rescue
- [ ] E4 Small overage residual
- [ ] E5 Large overage review
- [ ] E6 Residual recovery
- [ ] E7 Blocked eligibility
- [ ] E8 Free trial consumed
- [ ] CI E2E job on merge to main

### Polish
- [ ] Loading skeletons on book + complete
- [ ] Error states: API down, ineligible, network
- [ ] a11y: keyboard CTA, fare contrast
- [ ] Manual QA checklist (TEST_STRATEGY §8) complete

### Done gate
- [ ] E1–E8 green on preview or prod
- [ ] 5-minute demo script rehearsed
- [ ] **Commit:** `test: add Playwright E2E suite E1-E8 and fix integration issues (P12)`

---

## P13 — Rapido Screenshot Reference

### Reference assets
- [ ] 5–8 screenshots collected locally/Figma
- [ ] `frontend/design-reference/` gitignored (OQ-21)

### UI refactor (no logic changes)
- [ ] Tailwind theme updated (yellow/black inspired)
- [ ] Booking layout aligned to reference
- [ ] In-ride chip placement aligned
- [ ] Trip end receipt layout aligned
- [ ] Captain wallet layout aligned
- [ ] F, M, reason codes still prominent

### Verification
- [ ] Vitest green
- [ ] E1–E8 re-run green after UI changes
- [ ] Visual review sign-off in DECISION_LOG

### Done gate
- [ ] No proprietary Rapido assets committed
- [ ] Stakeholder visual review passed
- [ ] **Commit:** `style: apply Rapido-inspired visual reference to rider flows (P13)`

---

## P14 — Grok Integration (Optional)

### Backend
- [ ] `GROK_COPY_ENABLED=false` default
- [ ] Grok adapter isolated from domain/
- [ ] `/copy/generate` with output validator
- [ ] `/ops/summarize` optional
- [ ] Static fallback on failure
- [ ] API key server-side only

### Frontend
- [ ] Display validated copy only
- [ ] Fallback to static copy keys
- [ ] Demo toggle for Grok features

### Tests
- [ ] Mock Grok; test fallback
- [ ] Validator rejects hallucinated amounts
- [ ] Settlement tests unchanged

### Done gate
- [ ] App behavior identical when flag off
- [ ] No settlement test diffs
- [ ] **Commit:** `feat: optional Grok copy assist behind feature flag (P14)`

---

## MVP prototype complete

All required phases through **P12** (and **P13** for external demo polish):

- [ ] P01–P12 done gates passed
- [ ] FACR instrumented
- [ ] 8 E2E scenarios green on deployed URL
- [ ] README demo script validated
- [ ] No real payment credentials in repo
- [ ] OPEN_QUESTIONS either resolved or deferred with logged defaults

**Optional:** P14 Grok only if copy iteration needed.

---

## Quick reference: commit sequence

```
P01  docs: lock architecture defaults and execution plan (P01)
P02  chore: scaffold monorepo with FastAPI, Next.js, and CI (P02)
P03  feat(ui): add mobile-first design system primitives (P03)
P04  feat(domain): fare engine and settlement rules with full unit tests (P04)
P05  feat: rider discovery, eligibility API, and booking opt-in UI (P05)
P06  feat: in-ride fare status, zones, and fare event API (P06)
P07  feat: trip-end settlement, payment/wallet mocks, captain wallet UI (P07)
P08  feat: residual recovery, review queue, and dispute flows (P08)
P09  feat: KPI event instrumentation, metrics summary, and demo admin (P09)
P10  chore: GitHub prep — README, OpenAPI export, CI hardening (P10)
P11  chore: add deployment config for Vercel and Railway (P11)
P12  test: add Playwright E2E suite E1-E8 and fix integration issues (P12)
P13  style: apply Rapido-inspired visual reference to rider flows (P13)
P14  feat: optional Grok copy assist behind feature flag (P14)
```
