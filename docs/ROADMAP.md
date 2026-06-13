# Assured Pay — Implementation Roadmap

**Version:** 0.1  
**Purpose:** Phase-wise build plan from docs → code → GitHub → Vercel, including timing for Rapido screenshots and Grok API.

**Builder context:** Solo founder using Cursor + Claude Sonnet. Vertical slices over big-bang.

---

## 1. Roadmap overview

| Phase | Name | Duration (est.) | Outcome |
|-------|------|-----------------|---------|
| **0** | Planning & docs | 1–2 days | ✅ This doc set |
| **1** | Foundation & domain core | 3–4 days | Repo, settlement engine, CI |
| **2** | Backend APIs & mocks | 4–5 days | Full MVP API surface |
| **3** | Frontend rider flows | 5–7 days | Booking → trip end → recovery |
| **4** | Captain, ops, discovery | 3–4 days | Stubs + contextual prompts |
| **5** | Tests & polish | 4–5 days | pytest + vitest + playwright green |
| **6** | Deploy & demo hardening | 2–3 days | GitHub + Vercel + backend host |
| **7** | Visual fidelity (Rapido screenshots) | 2–3 days | Brand-adjacent UI |
| **8** | Optional Grok integration | 1–2 days | Copy/ops assist only |

**Total MVP (Phases 0–6):** ~3–4 weeks part-time or ~2 weeks full-time  
**With polish (0–8):** +1 week

---

## 2. Phase 0 — Planning (current)

**Deliverables:**

- [x] `docs/PRD.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/USER_PERSONAS.md`
- [x] `docs/USER_JOURNEYS.md`
- [x] `docs/KPI_TREE.md`
- [x] `docs/BUSINESS_MODEL.md`
- [x] `docs/DISCOVERY_AND_HABIT.md`
- [x] `docs/TECH_STACK.md`
- [x] `docs/TEST_STRATEGY.md`
- [x] `docs/ROADMAP.md`
- [x] `docs/OPEN_QUESTIONS.md`

**Exit criteria:** Stakeholder alignment on scope, no code yet.

---

## 3. Phase 1 — Foundation & domain core

### Goals

- Monorepo scaffold
- Deterministic settlement engine with full unit tests
- CI skeleton

### Tasks

1. Initialize git repo structure (`frontend/`, `backend/`, `e2e/`, `.github/workflows/ci.yml`)
2. Backend: FastAPI hello + config loader
3. Implement `domain/settlement.py` with policy from `OPEN_QUESTIONS.md` defaults
4. Implement `domain/eligibility.py`
5. pytest parametrized matrix for all A vs M cases
6. Frontend: Next.js + Tailwind scaffold, placeholder `/book` page
7. README with local dev instructions

### Exit criteria

- `pytest tests/domain/` green
- CI runs on push
- Settlement decisions match PRD logic exactly

---

## 4. Phase 2 — Backend APIs & mock services

### Goals

- Persist entities (SQLite)
- Expose MVP API contracts from `ARCHITECTURE.md`
- Mock payment + wallet adapters

### Tasks

1. SQLModel entities: Rider, Ride, AssuredPayAuthorization, Settlement, ResidualDue, ReviewCase, CaptainWalletTransaction, MetricsEvent
2. Alembic initial migration (or create-all for MVP speed)
3. Routers: eligibility, authorize, rides, fare-status, complete, residuals, captain wallet, ops review, metrics
4. `MockPaymentService` with `simulate_payment_failure` flag
5. `MockWalletService` instant credit
6. Seed script for demo personas
7. API integration tests for P0 endpoints
8. OpenAPI export committed or published

### Exit criteria

- Postman/curl can run full settlement flow without frontend
- Integration tests green

---

## 5. Phase 3 — Frontend rider flows

### Goals

- Polished rider journey: book → in-ride → trip end → recovery

### Tasks

1. API client + TanStack Query setup
2. `/book` — fare estimate + AssuredPayBookingCard + opt-in
3. Confirmation state + “How fare changes work” modal
4. `/ride/[id]` — AssuredPayChip + FareUpdateBanner
5. `/ride/[id]/complete` — TripEndSettlement (3 states)
6. `/recovery` — residual banner and pay flow
7. `/history` — post-failure education card trigger
8. Component tests for P0 UI
9. Generic design system tokens (colors, spacing) — **not Rapido-branded yet**

### Exit criteria

- Rider can complete E1–E6 journeys manually against local API
- Mobile-first layout acceptable for internal demo

---

## 6. Phase 4 — Captain, ops, discovery, metrics

### Goals

- Dual-sided demo credibility
- Contextual discovery
- KPI event emission

### Tasks

1. `/captain` wallet stub with transaction list
2. `/ops/review` queue list + resolve action
3. Discovery prompts: low battery (toggle), online payer, post-failure, booking card
4. `/demo` page: battery %, payment fail, apply waiting overage
5. Free trial + always-on prompt (after 3 rides seed)
6. Metrics events on key actions; `/metrics/summary` stub
7. Habit reinforcement post-ride toast/message

### Exit criteria

- Demo script covers captain payout + ops review
- Discovery attribution on opt-in events

---

## 7. Phase 5 — Tests & polish

### Goals

- CI fully green; confidence to deploy

### Tasks

1. Complete pytest coverage targets for domain + API
2. Vitest coverage for P0 components
3. Playwright E2E E1–E8
4. Error states: API down, ineligible, network error
5. Loading skeletons on booking and trip end
6. Accessibility pass on primary CTAs
7. Fix flakiness in E2E

### Exit criteria

- All P0 tests green locally and in GitHub Actions
- No P0 bugs open for demo paths

---

## 8. Phase 6 — GitHub & Vercel deployment

### Goals

- Public demo URL; reproducible deploy

### GitHub strategy

1. Push monorepo to `RAPIDO-opt-in-ASSURED-PAY` (or org repo)
2. Branch model:
   - `main` — production deploy
   - `feat/*` — vertical slices
   - PR required for merge; CI must pass
3. Tags: `v0.1.0-mvp` at first public demo
4. README: architecture link, demo URL, env setup (no secrets)

### Vercel strategy (frontend)

1. Connect repo; root directory `frontend`
2. Production branch: `main`
3. Preview deployments: all PRs
4. Env vars:
   - Production: `NEXT_PUBLIC_API_URL=https://api-<backend-host>`
   - Preview: same or staging backend
5. Optional: protect `/demo` route in production via env flag

### Backend deploy strategy

1. Railway/Render/Fly for FastAPI
2. SQLite **not** for production host — migrate to Postgres addon
3. Run migrations on deploy
4. CORS: allow Vercel domains
5. Health check: `GET /health`

### Post-deploy verification

- [ ] Preview PR URL completes E1 journey
- [ ] Production URL completes E3 payment rescue
- [ ] Captain wallet visible on prod
- [ ] No env secrets in client bundle

### Exit criteria

- Shareable Vercel URL for stakeholders
- CI badge green in README

---

## 9. Phase 7 — Rapido screenshots (visual fidelity)

### Explicit recommendation: **When to add Rapido screenshots**

**Add Rapido(-inspired) screenshots and visual reference ONLY after Phase 6 is complete and core flows work on Vercel.**

| Timing | Rationale |
|--------|-----------|
| **NOT in Phases 1–5** | Screenshots drive pixel-chasing before logic is proven; slows solo builder |
| **Start Phase 7** | Functional MVP deployed; screenshots reduce rework risk |
| **Before external stakeholder demo** | High-fidelity Rapido look increases trust for product pitch |
| **Before pilot conversations** | Brand-adjacent UI signals seriousness |

### What to use screenshots for

- Color palette and typography approximation (yellow/black Rapido cues)
- Booking screen layout reference
- In-ride chip placement
- Trip end receipt layout
- **Not** for copying proprietary assets verbatim — use “inspired by” generic branding or placeholder logo “RapidDemo”

### Workflow

1. Collect 5–8 reference screenshots (booking, payment, in-ride, trip end, wallet)
2. Store in `frontend/design-reference/` (gitignored if needed for copyright caution) or link in Figma
3. Update Tailwind theme tokens to match
4. Replace generic components with reference-aligned layouts
5. **Do not change settlement logic** during this phase — UI only
6. Optional: visual diff tests against reference (manual OK)

### Exit criteria

- Side-by-side with references passes PM/design review
- E2E still green after UI refactor

---

## 10. Phase 8 — Grok free API (optional)

### Explicit recommendation: **When to add Grok free API**

**Add Grok API only after Phase 6 deployment, and only if Phase 7+ needs accelerated copy iteration or ops queue summarization. Never before settlement logic is frozen and tested.**

| Timing | Verdict |
|--------|---------|
| **Phases 1–5** | **Do not add** — distraction from core build |
| **Phase 6** | **Do not add** — deploy stability first |
| **Phase 7+** | **Optional** for non-critical paths |
| **Production pilot** | Re-evaluate with legal/compliance review |

### Approved Grok use cases (if added)

| Use case | Allowed? |
|----------|----------|
| Generate discovery copy variants (A/B text) | ✅ |
| Summarize review case notes for ops | ✅ (human decides) |
| Explain fare delta in rider-friendly language *from structured reason codes* | ✅ (template-validated) |
| Decide settlement amount | ❌ **Never** |
| Determine suspicious vs valid overage | ❌ **Never** |
| Set buffer M or F | ❌ **Never** |

### Implementation pattern

```
Structured data (reason_codes, amounts)
  → Grok prompt (copy only)
  → Output validation (length, no new amounts)
  → Display to user
```

- API key in backend env only (`GROK_API_KEY`)
- Feature flag: `GROK_COPY_ENABLED=false` by default
- Fallback to static copy if API fails
- Log prompts/responses for review; no PII in prompts

### Exit criteria

- Grok can be disabled without breaking app
- No Grok output displayed without schema validation

---

## 11. Top risks and mitigations

| # | Risk | Impact | Mitigation | Phase |
|---|------|--------|------------|-------|
| R1 | Fare transparency poor → riders feel trapped | High | Always show F, M, in-ride updates, reason codes; 0 silent overcharge tolerance | 3, 5 |
| R2 | Platform bad debt from residuals | High | Small buffer; small_excess policy; block repeat offenders; recovery UX | 2, 4 |
| R3 | Captain distrust if payout delayed | High | Instant mock wallet; SLA metric; captain stub in demo | 2, 4 |
| R4 | Product seen as “battery saver” only | Medium | Convenience discovery + commute copy; habit loop | 4, 7 |
| R5 | Scope creep to auto/cab | Medium | Hard code `category=bike` in eligibility | 1, 2 |
| R6 | Solo builder bottleneck | Medium | Vertical slices; strict phase gates; docs as source of truth | All |
| R7 | Frontend/backend contract drift | Medium | OpenAPI + integration tests + shared fixtures | 2, 5 |
| R8 | Vercel/backend CORS or env misconfig | Medium | Deploy checklist; health endpoint; preview E2E | 6 |
| R9 | Over-engineering production infra too early | Medium | SQLite local; mocks; Postgres only at deploy | 2, 6 |
| R10 | AI accidentally in settlement path | High | Domain pure functions; code review rule; no LLM imports in `domain/` | 1, 5 |
| R11 | Copyright/branding issues from Rapido screenshots | Low–Med | “Inspired by” branding; gitignore raw refs if needed; Phase 7 only | 7 |
| R12 | Grok hallucinated amounts in copy | Med | Validate output; static fallback; no amounts from LLM | 8 |

---

## 12. Definition of done (MVP prototype)

- [ ] All Phase 0–6 exit criteria met
- [ ] FACR events instrumented (even if simulated)
- [ ] 8 E2E scenarios pass on production URL
- [ ] README with demo script (< 5 min stakeholder walkthrough)
- [ ] `OPEN_QUESTIONS.md` resolved or explicitly deferred with defaults
- [ ] No real payment credentials in repo

---

## 13. Post-MVP backlog (pilot prep)

1. Real payment gateway adapter (Razorpay/UPI)
2. Postgres + ledger hardening
3. Feature flags (LaunchDarkly or simple DB)
4. Pilot city config service
5. Ops case management integration
6. Rider push notifications for residual recovery
7. Experimentation on discovery triggers
8. Corporate commute B2B package exploration

---

## 14. Suggested demo script (5 minutes)

1. **Booking** — Show F/M, low battery prompt, opt-in (30s)
2. **In-ride** — Waiting fare update, buffer chip (45s)
3. **Trip end** — Payment failure rescue, success message (60s)
4. **Captain** — Wallet instant credit (30s)
5. **Residual variant** — Small overage + recovery banner (60s)
6. **Review variant** — Ops queue (45s)
7. **Metrics** — FACR summary stub (30s)

---

## 15. Related documents

- `PRD.md` — scope
- `ARCHITECTURE.md` — build blueprint
- `TEST_STRATEGY.md` — quality gates per phase
- `OPEN_QUESTIONS.md` — decisions needed before Phase 1 coding
