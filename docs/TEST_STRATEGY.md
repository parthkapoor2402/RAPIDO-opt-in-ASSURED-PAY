# Assured Pay — Test Strategy

**Version:** 0.1  
**Purpose:** Layer-by-layer quality plan ensuring deterministic settlement, demo reliability, and safe iteration for solo-builder workflow.

---

## 1. Testing philosophy

| Principle | Application |
|-----------|-------------|
| **Settlement logic is sacred** | Highest test density on domain rules (A vs M) |
| **Test the contract** | API request/response schemas are CI gates |
| **User journeys over snapshots** | E2E covers happy, residual, review, recovery paths |
| **Mocks at boundaries** | Payment/Wallet ports mocked in integration tests |
| **No AI in test oracle** | Expected outcomes are deterministic fixtures |
| **Prototype honesty** | Demo toggles (payment fail) have explicit test coverage |

---

## 2. Test pyramid

```
                    ┌─────────────┐
                    │  Playwright │  ~8–12 E2E scenarios
                    │    (E2E)    │
                ┌───┴─────────────┴───┐
                │   API integration   │  ~30–50 tests
                │  (httpx + TestClient)│
            ┌───┴─────────────────────┴───┐
            │   Frontend component/RTL     │  ~40–60 tests
            │   + hook tests (Vitest)      │
        ┌───┴─────────────────────────────┴───┐
        │     Domain unit tests (pytest)       │  ~50–80 tests
        │     Pure settlement + eligibility    │
        └───────────────────────────────────────┘
```

**Coverage targets (MVP):**

- Domain `settlement.py` + `eligibility.py`: **≥ 95%** line coverage
- API routers: **≥ 80%**
- Frontend critical paths (booking card, trip end): **≥ 70%**
- E2E: all P0 journeys green before Vercel prod deploy

---

## 3. Backend testing (pytest)

### 3.1 Domain unit tests — **P0**

**File focus:** `domain/settlement.py`, `domain/eligibility.py`, `domain/reason_codes.py`

| Test case | Input | Expected |
|-----------|-------|----------|
| A ≤ M, payment ok | A=46, M=49 | FULL_CAPTURE, charge 46 |
| A = M boundary | A=49, M=49 | FULL_CAPTURE |
| A > M, small valid excess | A=52, M=49, WAITING | RESIDUAL_CREATED, residual=3 |
| A > M, large excess | A=70, M=49 | REVIEW_REQUIRED |
| A > M, small but invalid reason | A=52, M=49, no codes | REVIEW_REQUIRED |
| Zero fare edge | A=0 | No charge / cancelled ride path |
| Policy version audit | any | `policy_version` in decision |

Use parametrized pytest tables for matrix coverage.

### 3.2 Service layer tests — **P0**

**Focus:** `AssuredPayService`, `TripEndOrchestrator`

- Mock `PaymentPort` and `WalletPort`
- Verify orchestration order: decide → wallet credit → capture → residual
- Idempotent `complete` called twice returns same result, no double credit

### 3.3 API integration tests — **P0**

**Tool:** FastAPI `TestClient` or `httpx.AsyncClient`

| Endpoint | Scenarios |
|----------|-----------|
| `GET /assured-pay/eligibility` | eligible, blocked (open residual), no instrument |
| `POST /assured-pay/authorize` | success, duplicate, ride not found |
| `GET /rides/{id}/fare-status` | WITHIN_ESTIMATE, IN_BUFFER, EXCEEDS_M |
| `POST /rides/{id}/complete` | full capture, payment fail rescue, residual, review |
| `POST /residuals/{id}/pay` | success, already paid |
| `GET /ops/review-queue` | lists pending cases |

Validate HTTP status, JSON schema, and DB side effects.

### 3.4 Adapter tests — **P1**

- `MockPaymentService`: failure modes (`failure`, `timeout`)
- `MockWalletService`: balance accumulation

### 3.5 Migration / DB tests — **P2**

- When Alembic introduced: smoke test migrate up/down on empty DB

---

## 4. Frontend testing (Vitest + RTL)

### 4.1 Component tests — **P0**

| Component | Tests |
|-----------|-------|
| `AssuredPayBookingCard` | Renders F, M, buffer; CTA emits opt-in; shows ineligible state |
| `AssuredPayChip` | Zone labels: within estimate / buffer / exceeded |
| `FareUpdateBanner` | Reason code message formatting |
| `TripEndSettlement` | Success vs residual vs review layouts |
| `RecoveryBanner` | Shows amount, pay CTA, dismiss |
| `DiscoveryPrompts` | Correct card for `discovery_source` |

### 4.2 Hook / integration tests — **P1**

- `useAssuredPayEligibility`: loading, error, eligible data
- Query cache invalidation after opt-in and trip complete

### 4.3 Visual regression — **P3 (optional MVP)**

- Playwright screenshot compare for booking and trip-end only if flakiness controlled

---

## 5. End-to-end testing (Playwright)

### 5.1 Environment

- Run against `docker-compose` or `webServer` config starting FE + BE
- Seed script creates rider, captain, instrument

### 5.2 P0 E2E scenarios

| ID | Scenario | Assert |
|----|----------|--------|
| E1 | Happy path opt-in → complete | “Ride complete”, captain wallet +₹ |
| E2 | Low battery discovery → opt-in | Discovery card visible, authorization created |
| E3 | Payment failure rescue | Complete with fail flag; ride still complete; captain credited |
| E4 | Small overage residual | Trip end shows residual amount + reason |
| E5 | Large overage review | Review pending UI; ops queue item |
| E6 | Residual recovery | Next-open banner → pay → cleared |
| E7 | Blocked eligibility | Open residual blocks opt-in |
| E8 | Free trial consumed | Badge gone after first assured ride |

### 5.3 P1 E2E scenarios

- Post-failure education card on second booking
- “Always use Assured Pay” prompt after 3 rides (seed profile)
- In-ride fare update banner when waiting applied

### 5.4 E2E conventions

- Use `data-testid` attributes on critical elements
- No arbitrary `sleep` — wait for network/URL/state
- Run E2E on `main` merge; optional on PR for speed

---

## 6. Contract testing

| Method | MVP | Production |
|--------|-----|------------|
| OpenAPI schema diff in CI | Manual review | Automated breaking-change check |
| Pydantic ↔ TypeScript types | Hand-sync with checklist | `openapi-typescript` codegen |
| Example response fixtures | Shared `fixtures/` JSON in repo | Same |

**CI gate:** If API response shape changes, update frontend types + fixture tests in same PR.

---

## 7. Test data & fixtures

### Seed riders

| ID | Profile |
|----|---------|
| `rider_commuter` | Eligible, free trial, no residuals |
| `rider_arjun` | Prior payment failure flag for education card |
| `rider_blocked` | Open residual due |

### Seed rides (for demo)

- `ride_happy` — A ≤ M
- `ride_residual` — waiting pushes small excess
- `ride_review` — large unexplained excess

---

## 8. Manual QA checklist (pre-demo)

| # | Check |
|---|-------|
| 1 | Mobile viewport 375px — no horizontal scroll on booking |
| 2 | F and M visible before opt-in confirm |
| 3 | Captain wallet updates within 2s of trip complete |
| 4 | Demo toggles on `/demo` work without console errors |
| 5 | Vercel preview URL loads API from correct backend env |
| 6 | Copy matches product principles (no “bank server down” headline) |

---

## 9. Non-functional testing

| Type | MVP scope |
|------|-----------|
| **Performance** | Trip complete API &lt; 500ms local; no hard SLA |
| **Security** | No secrets in repo; OWASP spot check on API inputs |
| **Accessibility** | Keyboard nav on opt-in CTA; contrast on fare text (basic) |
| **Load** | Out of scope for prototype |

---

## 10. CI integration

```text
PR opened
  → backend: ruff + pytest
  → frontend: lint + vitest + build
  → (optional) playwright smoke

Merge to main
  → full playwright suite
  → deploy preview/prod per ROADMAP
```

**Fail policy:** No merge on red domain or P0 E2E tests.

---

## 11. What not to test (MVP)

- Real payment gateway integration
- ML / AI outputs
- Pixel-perfect match to Rapido production app (until screenshot phase)
- Multi-city config exhaustively (parameterized unit tests sufficient)

---

## 12. Test ownership by layer

| Layer | Primary tool | Owner role |
|-------|--------------|------------|
| Settlement rules | pytest unit | Backend engineer |
| API contracts | pytest integration | Backend + QA |
| UI components | Vitest + RTL | Frontend engineer |
| User journeys | Playwright | QA lead |
| Manual demo | Checklist | PM + Design |

---

## 13. Related documents

- `ARCHITECTURE.md` — API list and domain model
- `USER_JOURNEYS.md` — E2E scenario source
- `ROADMAP.md` — when tests land per phase
