# Assured Pay — System Architecture

**Version:** 0.1  
**Purpose:** Technical architecture for MVP prototype vs future production, including domain model, APIs, and service boundaries.

---

## 1. Architecture goals

| Goal | MVP approach | Production target |
|------|--------------|-------------------|
| Demo-ready UX on Vercel | Next.js frontend + API routes or separate FastAPI | Same split, hardened |
| Deterministic settlement | Rules engine module, versioned | Audited rules + config service |
| Mockable integrations | Mock payment + wallet services | Real gateways + ledger |
| Solo-builder friendly | Monorepo, minimal infra | Managed DB, queues, observability |
| Testability | Pure domain functions + contract tests | + integration + E2E |

---

## 2. High-level system diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client (Browser / PWA)                    │
│  Next.js App Router · Rider flows · Captain stub · Ops stub     │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS / JSON REST
┌────────────────────────────▼─────────────────────────────────────┐
│                     API Layer (FastAPI)                          │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Booking API │ │ Ride/Fare API│ │ Settlement │ │ Discovery  │ │
│  └──────┬──────┘ └──────┬───────┘ └─────┬──────┘ └─────┬──────┘ │
│         └────────────────┼───────────────┼──────────────┘       │
│                          ▼               ▼                        │
│              ┌───────────────────────────────────┐              │
│              │     Assured Pay Domain Core         │              │
│              │  Authorization · Fare · Settlement │              │
│              │  Rules Engine (deterministic)      │              │
│              └───────────────────┬───────────────┘              │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│ Mock Payment    │    │ Mock Captain Wallet │    │ Persistence     │
│ Service         │    │ Service             │    │ SQLite (MVP) →  │
│ (fail/succeed)  │    │ (instant credit)    │    │ Postgres (prod) │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
         │                         │
         └─────────────┬───────────┘
                       ▼
              ┌─────────────────┐
              │ Metrics Events  │
              │ (in-memory/log) │
              └─────────────────┘
```

---

## 3. MVP vs production architecture

| Layer | MVP prototype | Future production |
|-------|---------------|-------------------|
| **Frontend hosting** | Vercel (Next.js) | Vercel or CDN + edge |
| **Backend hosting** | Vercel serverless proxy → FastAPI on Railway/Render/Fly *or* co-located Python in monorepo | K8s / managed containers |
| **Database** | SQLite file or Vercel Postgres (dev) | Postgres primary + read replica |
| **Cache** | In-memory | Redis |
| **Queue** | Sync calls + background task stub | SQS / Celery / Bull for payout retry |
| **Payments** | `MockPaymentService` | Razorpay / PayU / NPCI UPI |
| **Captain wallet** | `MockWalletService` | Internal ledger service |
| **Auth** | Mock rider/captain IDs in session | JWT + OAuth / device binding |
| **Ops review** | Simple queue table + admin page | Case management integration |
| **AI** | None for settlement | Optional: ops triage *suggestions* only |

**Explicit boundary:** MVP must use **interfaces (ports)** for Payment and Wallet so swapping mocks for production is adapter replacement, not rewrite.

---

## 4. Frontend architecture

### 4.1 Stack

- **Next.js 14+** (App Router)
- **React 18+**, **TypeScript**
- **Tailwind CSS**
- **TanStack Query** (server state)
- **Zustand** (optional lightweight UI state: opt-in draft, demo toggles)

### 4.2 Route structure (proposed)

```
/app
  /                          → Landing or redirect to book
  /book                      → Booking + Assured Pay opt-in
  /ride/[rideId]             → In-ride fare indicator
  /ride/[rideId]/complete    → Trip end settlement UX
  /recovery                  → Residual due recovery
  /history                   → Past rides + education cards
  /captain                   → Captain wallet stub (demo)
  /ops/review                → Review queue stub (demo)
  /demo                      → Dev toggles: battery, payment fail, overage
```

### 4.3 Component layers

| Layer | Responsibility |
|-------|----------------|
| **Pages** | Route composition, data fetching |
| **Features** | `assured-pay/`, `booking/`, `settlement/` |
| **Components** | Design system: Card, Chip, FareBreakdown, CTA |
| **API client** | Typed fetch wrappers from OpenAPI or hand-written types |
| **Hooks** | `useAssuredPayEligibility`, `useFareStatus`, `useDiscovery` |

### 4.4 Key UI modules (MVP)

1. **AssuredPayBookingCard** — F, M, buffer, CTA, reason link
2. **AssuredPayChip** — In-ride status indicator
3. **FareUpdateBanner** — Reason-coded mid-ride updates
4. **TripEndSettlement** — Success / residual / review states
5. **RecoveryBanner** — Next-open residual prompt
6. **DiscoveryPrompts** — Low battery, post-failure, commute
7. **CaptainWalletPanel** — Credit timeline stub

### 4.5 Frontend ↔ backend communication

- REST JSON over HTTPS
- MVP: `NEXT_PUBLIC_API_URL` env var
- Optimistic UI only for non-financial actions (opt-in toggle pending server confirm)
- **Never** compute settlement amounts client-side for final charge—display server truth

### 4.6 Deployment (frontend)

- Vercel project linked to GitHub repo
- Preview deployments per PR
- Environment variables for API URL

---

## 5. Backend architecture

### 5.1 Stack

- **Python 3.11+**
- **FastAPI**
- **Pydantic v2** (schemas + validation)
- **SQLAlchemy 2.0** or **SQLModel** (ORM)
- **Alembic** (migrations, when DB stabilizes)

### 5.2 Module structure (proposed)

```
backend/
  app/
    main.py                 # FastAPI app, CORS, routers
    api/
      v1/
        booking.py
        rides.py
        assured_pay.py
        settlement.py
        discovery.py
        captain.py
        ops.py
        metrics.py
    domain/
      fare.py               # F, M, A calculations
      settlement.py         # Core A vs M rules
      eligibility.py        # Who can opt in
      reason_codes.py
    services/
      assured_pay_service.py
      ride_service.py
      discovery_service.py
    ports/
      payment.py            # Abstract PaymentPort
      wallet.py             # Abstract WalletPort
    adapters/
      mock_payment.py
      mock_wallet.py
    models/                 # SQLAlchemy entities
    schemas/                # Pydantic request/response
    rules/
      settlement_rules.yaml # Versioned thresholds (small/large excess)
    config.py
  tests/
```

### 5.3 Domain core: settlement rules engine

**Input:** `{ F, M, A, reason_codes[], policy_version }`  
**Output:** `SettlementDecision`

```python
# Conceptual — not implementation code
SettlementDecision:
  settlement_type: FULL_CAPTURE | RESIDUAL_CREATED | REVIEW_REQUIRED
  rider_charge_amount: Decimal
  captain_credit_amount: Decimal
  residual_due: Decimal | None
  review_required: bool
  audit: { rule_id, policy_version, explanation }
```

**Policy parameters (configurable):**

- `buffer_amount` or `buffer_percent` (bike MVP: fixed ₹ e.g. 7)
- `small_excess_max` (e.g. ₹10 above M)
- `valid_reason_codes` for auto-residual
- `suspicious_delta_threshold` (absolute or % above M)

**AI exclusion:** No ML model in this path. Optional future: ops queue *sorting* only.

### 5.4 Service orchestration (trip end)

```
TripEndOrchestrator:
  1. Load ride + AssuredPayAuthorization
  2. Compute final A from fare engine
  3. Run SettlementRulesEngine.decide()
  4. If REVIEW_REQUIRED → create ReviewCase, partial flow
  5. Else → WalletPort.credit_captain(A)
  6. PaymentPort.capture(min(A, M) or policy amount)
  7. If residual → create ResidualDue record
  8. Emit metrics events
  9. Return TripEndResponse to client
```

---

## 6. Domain model & data entities

### 6.1 Entity relationship (conceptual)

```
Rider ──< Ride ──< FareEvent
  │         │
  │         └──< AssuredPayAuthorization (0..1)
  │         └──< Settlement (1)
  │                   └──< ResidualDue (0..1)
  │         └──< ReviewCase (0..1)
  └──< PaymentInstrument
  └──< RiderAssuredProfile (trial, always_on, block status)

Captain ──< CaptainWalletTransaction
Ride ──> Captain (assigned)
```

### 6.2 Entity definitions

| Entity | Key fields | Notes |
|--------|------------|-------|
| **Rider** | `id`, `phone`, `city_id`, `assured_blocked` | MVP: seed users |
| **PaymentInstrument** | `id`, `rider_id`, `type`, `last4`, `active` | Required for eligibility |
| **Ride** | `id`, `rider_id`, `captain_id`, `category`, `city_id`, `status`, `estimated_fare_f`, `actual_fare_a` | `category=bike` MVP |
| **AssuredPayAuthorization** | `id`, `ride_id`, `rider_id`, `F`, `M`, `buffer`, `consented_at`, `instrument_id`, `discovery_source`, `free_trial_used` | Created at opt-in |
| **FareEvent** | `id`, `ride_id`, `amount`, `reason_code`, `timestamp` | In-ride updates |
| **Settlement** | `id`, `ride_id`, `settlement_type`, `rider_charge`, `captain_credit`, `residual_amount`, `policy_version`, `decided_at` | Immutable after finalize |
| **ResidualDue** | `id`, `settlement_id`, `rider_id`, `amount`, `status`, `due_at`, `paid_at` | OPEN / PAID / WRITTEN_OFF |
| **ReviewCase** | `id`, `ride_id`, `settlement_id`, `status`, `assigned_ops_id`, `resolution`, `notes` | PENDING / RESOLVED |
| **CaptainWalletTransaction** | `id`, `captain_id`, `ride_id`, `amount`, `type`, `created_at` | CREDIT / ADJUSTMENT |
| **RiderAssuredProfile** | `rider_id`, `free_trial_available`, `always_assured`, `success_streak`, `unpaid_residual_count` | Habit + gating |
| **MetricsEvent** | `id`, `event_name`, `payload_json`, `timestamp` | Append-only |

---

## 7. API contracts (MVP)

Base path: `/api/v1`  
Auth: MVP uses header `X-Rider-Id` / `X-Captain-Id` (mock). Production: Bearer JWT.

### 7.1 Discovery & eligibility

**GET** `/assured-pay/eligibility`

Query: `rider_id`, `city_id`, `category`, `estimated_fare`

Response:
```json
{
  "eligible": true,
  "reasons": [],
  "F": 42.00,
  "buffer": 7.00,
  "M": 49.00,
  "free_trial_available": true,
  "discovery_prompts": [
    { "type": "low_battery", "show": true, "copy_key": "low_battery_v1" }
  ]
}
```

### 7.2 Opt-in authorization

**POST** `/assured-pay/authorize`

Request:
```json
{
  "ride_id": "ride_123",
  "rider_id": "rider_1",
  "payment_instrument_id": "pi_1",
  "discovery_source": "low_battery",
  "consent": true
}
```

Response:
```json
{
  "authorization_id": "auth_456",
  "F": 42.00,
  "M": 49.00,
  "buffer": 7.00,
  "status": "ACTIVE"
}
```

### 7.3 Fare estimate (booking)

**POST** `/rides/estimate`

Request: `{ "pickup", "drop", "category", "city_id" }`  
Response: `{ "F": 42.00, "currency": "INR" }`

### 7.4 Create ride

**POST** `/rides`

Request: `{ "rider_id", "pickup", "drop", "category", "assured_authorization_id?" }`  
Response: `{ "ride_id", "status": "IN_PROGRESS", "F", "assured_active": true }`

### 7.5 In-ride fare status

**GET** `/rides/{ride_id}/fare-status`

Response:
```json
{
  "F": 42.00,
  "M": 49.00,
  "current_fare": 46.00,
  "zone": "IN_BUFFER",
  "reason_codes": [{ "code": "WAITING", "delta": 4.00, "message": "3 min waiting" }]
}
```

### 7.6 Simulate fare event (demo / test)

**POST** `/rides/{ride_id}/fare-events`

Request: `{ "reason_code": "WAITING", "delta": 4.00 }`

### 7.7 Complete ride (trip end)

**POST** `/rides/{ride_id}/complete`

Request:
```json
{
  "simulate_payment_failure": false
}
```

Response (success):
```json
{
  "ride_id": "ride_123",
  "A": 46.00,
  "settlement_type": "FULL_CAPTURE",
  "rider_charged": 46.00,
  "captain_credited": 46.00,
  "residual_due": null,
  "review_required": false,
  "message_key": "trip_complete_auto"
}
```

Response (residual):
```json
{
  "A": 52.00,
  "M": 49.00,
  "settlement_type": "RESIDUAL_CREATED",
  "rider_charged": 49.00,
  "captain_credited": 52.00,
  "residual_due": 3.00,
  "reason_codes": ["WAITING"]
}
```

### 7.8 Residual recovery

**GET** `/riders/{rider_id}/residuals/open`  
**POST** `/residuals/{id}/pay`

### 7.9 Captain wallet

**GET** `/captains/{captain_id}/wallet`  
**GET** `/captains/{captain_id}/rides/{ride_id}/settlement`

### 7.10 Ops review

**GET** `/ops/review-queue`  
**POST** `/ops/review/{case_id}/resolve`

Request: `{ "decision": "APPROVE_RESIDUAL" | "ADJUST" | "DENY", "notes": "..." }`

### 7.11 Metrics (prototype)

**POST** `/metrics/events` (batch)  
**GET** `/metrics/summary` (FACR, opt-in rate — computed from events)

### 7.12 Error model

```json
{
  "error": {
    "code": "NOT_ELIGIBLE",
    "message": "Open residual due must be cleared before Assured Pay.",
    "details": {}
  }
}
```

Standard HTTP status codes: 400 validation, 404 not found, 409 conflict (double complete), 422 business rule violation.

---

## 8. Mock services vs future production services

### 8.1 PaymentPort

| Method | MVP mock | Production |
|--------|----------|------------|
| `authorize(instrument, amount)` | Always succeed | Gateway pre-auth |
| `capture(amount)` | Succeed/fail via flag | UPI collect / card capture |
| `refund(amount)` | Log only | Gateway refund |

**Mock scenarios:** `success`, `failure`, `timeout`, `partial_capture`

### 8.2 WalletPort

| Method | MVP mock | Production |
|--------|----------|------------|
| `credit_captain(captain_id, amount, ride_id)` | In-memory balance | Ledger service |
| `get_balance(captain_id)` | Sum transactions | Ledger API |

### 8.3 FarePort (optional)

MVP: simple distance + time formula + reason code deltas  
Production: pricing service integration

### 8.4 DiscoveryPort

MVP: rule-based prompts from rider context (battery flag, history)  
Production: event stream + experimentation platform

### 8.5 NotificationPort

MVP: none (in-app only)  
Production: push/SMS for residual recovery

---

## 9. Cross-cutting concerns

| Concern | MVP | Production |
|---------|-----|------------|
| **Idempotency** | `Idempotency-Key` header on complete/pay | Required |
| **Audit log** | Settlement records immutable | + tamper-evident store |
| **Config** | YAML/env for buffer thresholds | Feature flag service |
| **CORS** | Vercel domain allowlist | Strict origins |
| **Observability** | Structured logs | OpenTelemetry + dashboards |
| **Secrets** | `.env.local` | Vault / Vercel secrets |

---

## 10. Security notes (MVP-aware)

- No real PCI data in prototype—tokenized instrument IDs only
- Server-side settlement only
- Rate-limit trip complete endpoint in production
- Ops review actions require separate role (stub in MVP)

---

## 11. Monorepo layout (recommended)

```
/
  docs/           ← this planning set
  frontend/       ← Next.js
  backend/        ← FastAPI
  e2e/            ← Playwright
  docker-compose.yml  ← local full stack (optional)
  .github/workflows/  ← CI
```

---

## 12. Related documents

- `TECH_STACK.md` — versions, tooling, CI
- `TEST_STRATEGY.md` — layer-by-layer tests
- `ROADMAP.md` — build order and deploy steps
- `OPEN_QUESTIONS.md` — unresolved policy thresholds
