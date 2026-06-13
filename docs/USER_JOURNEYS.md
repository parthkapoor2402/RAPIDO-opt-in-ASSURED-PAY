# Assured Pay — User Journeys

**Version:** 0.1  
**Purpose:** End-to-end flows for rider, captain, and ops across happy path, residual, review, and recovery.

---

## Journey map overview

```
Discovery → Booking opt-in → In-ride monitoring → Trip-end settlement → Post-ride recovery → Habit loop
```

---

## Journey 1: First-time opt-in — frictionless completion (happy path)

**Persona:** Priya (time-critical commuter)  
**Preconditions:** Eligible bike ride, saved payment instrument, Assured Pay discovery shown

### Steps

| Step | Actor | Action | System behavior |
|------|-------|--------|-----------------|
| 1 | Rider | Opens app, enters destination | Fare estimate **F** computed |
| 2 | Rider | Sees Assured Pay card on booking | Shows F, M = F + buffer, covered scenarios, valid change reasons |
| 3 | Rider | Taps “Turn on Assured Pay” + confirms payment method | Creates `AssuredPayAuthorization` with M, consent timestamp |
| 4 | System | — | Confirmation: “Captain payout guaranteed…” + link “How fare changes work” |
| 5 | Rider | Ride proceeds | In-ride chip: “Assured Pay active” |
| 6 | System | Fare stable | Indicator: “Within estimate ₹F” |
| 7 | Captain | Completes drop-off | Actual fare **A** calculated |
| 8 | System | A ≤ M | Charge A; credit captain wallet A; close ride |
| 9 | Rider | Sees trip end | “Ride complete. ₹A paid automatically.” |
| 10 | System | — | Emit metrics: frictionless completion, opt-in, payout success |

### Emotional arc

Curious → informed → confident → relieved at drop-off

### Prototype demo notes

- Default demo path for stakeholders
- Payment succeeds normally; Assured Pay is safety net (still show value via copy + indicator)

---

## Journey 2: Low battery discovery → payment failure rescue

**Persona:** Arjun (low-confidence digital payer)  
**Preconditions:** Battery &lt; threshold (or prototype toggle), online payment selected

### Steps

| Step | Actor | Action | System behavior |
|------|-------|--------|-----------------|
| 1 | Rider | Starts booking with low battery | Contextual prompt: “Low battery? Turn on Assured Pay…” |
| 2 | Rider | Opts in | M stored; free trial consumed if applicable |
| 3 | Rider | Ride in progress | Phone may simulate shutdown / offline |
| 4 | Captain | Ends ride | A computed |
| 5 | System | Payment instrument fails (simulated) | Assured Pay layer triggers: captain credited A via wallet |
| 6 | System | — | Attempt capture up to min(A, M); record outcome |
| 7 | Rider | Reopens app later | Trip shows completed; payment status explained |
| 8 | System | — | Metric: payment failure rescue rate |

### Key UX requirement

Rider must never feel they “got away without paying”—copy frames delayed capture as pre-approved assured completion.

---

## Journey 3: Small valid overage → residual due

**Persona:** Arjun  
**Preconditions:** Assured Pay active; waiting time adds ₹6; A = 46, M = 49 (F=42, buffer=7)

### Steps

| Step | Actor | Action | System behavior |
|------|-------|--------|-----------------|
| 1 | System | Waiting detected | In-ride: “Fare updated to ₹46 due to 3 min waiting” |
| 2 | System | Still A ≤ M | Chip: “Still covered under your approved max ₹49” |
| 3 | Captain | Completes ride | A = 46 |
| 4 | System | Charge A | Success: rider charged 46, captain credited 46 |

**Variant — A &gt; M but small valid excess:**

| Step | System behavior |
|------|-----------------|
| A = 52, M = 49, excess = 3 (valid waiting + route) | Rules: small valid → captain credited 52; capture 49 if possible; residual due = 3 |
| Trip end UX | “₹49 captured. ₹3 due — verified waiting charge.” + breakdown |
| Next open | Recovery prompt: “Clear ₹3 now” |

### Rules engine outputs (deterministic)

- `settlement_type`: `full_capture` | `residual_created` | `review_required`
- `reason_codes[]`: e.g. `WAITING`, `ROUTE_CHANGE`, `TOLL`

---

## Journey 4: Large / suspicious overage → review path

**Persona:** Priya + Ops reviewer  
**Preconditions:** Assured Pay active; A significantly exceeds M without clear reason codes

### Steps

| Step | Actor | Action | System behavior |
|------|-------|--------|-----------------|
| 1 | System | A &gt; M + threshold | Do **not** auto-guarantee full captain credit beyond policy |
| 2 | Rider | Trip end screen | “₹49 captured. ₹X pending review — ride extension under verification.” |
| 3 | Captain | Wallet view | Partial or pending credit with explanation (policy-defined) |
| 4 | Ops | Reviews queue item | Audit: GPS, waiting logs, reason codes, rider/captain history |
| 5 | Ops | Decision | Approve residual / adjust / deny — logged immutably |
| 6 | Rider | Notified | Final breakdown and any remaining due |

### Product principle

No silent finalization above M when suspicious—protects rider trust and platform risk.

---

## Journey 5: Post-payment-failure education → second ride opt-in

**Persona:** Arjun  
**Preconditions:** Previous ride ended with standard (non-assured) payment failure

### Steps

| Step | Action | System |
|------|--------|--------|
| 1 | Rider opens app for new booking | Education card: “Avoid this next time with Assured Pay” |
| 2 | Rider taps Learn more | Modal with F/M example and captain payout explanation |
| 3 | Rider opts in | Higher opt-in attribution to `discovery_source=post_failure_education` |

---

## Journey 6: Residual recovery and Assured Pay eligibility loss

**Persona:** Arjun (repeat user with unpaid residual)

### Steps

| Step | Condition | System behavior |
|------|-----------|-----------------|
| 1 | Residual due unpaid &gt; 24h | Next-open banner: “Last assured ride had ₹6 pending. Clear now / review breakdown” |
| 2 | Rider pays residual | Clear due; restore full Assured Pay eligibility |
| 3 | Repeated unpaid residuals | Block Assured Pay opt-in; standard payment only |
| 4 | Grace period exceeded | Optional: block booking until cleared (config flag in prototype) |

---

## Journey 7: Captain instant payout visibility

**Persona:** Ravi (captain)  
**Preconditions:** Assured ride completed

### Steps

| Step | Captain sees | System |
|------|--------------|--------|
| 1 | Ride list item with “Assured” badge | Ride metadata |
| 2 | Wallet credit notification | +₹A available balance |
| 3 | Settlement detail | Gross fare, assured subsidy if any, timestamp |
| 4 | If review pending | Status: “Settlement pending verification” |

---

## Journey 8: Free trial assured ride

**Persona:** New eligible rider  
**Preconditions:** `free_trial_available = true`, bike, eligible city

### Steps

1. Discovery card includes “Try Assured Pay free on your next bike ride”
2. Opt-in shows ₹0 Assured Pay fee (no per-ride fee in MVP anyway—trial is behavioral nudge)
3. Post-ride reinforcement: “You skipped payment friction. Your captain was paid instantly.”
4. Trial flag consumed; future rides show standard opt-in

---

## Journey 9: “Always use Assured Pay” habit prompt

**Persona:** Priya after 3 successful assured rides  
**Trigger:** `assured_ride_success_count >= 3`

### Steps

1. Post-ride modal: “Always use Assured Pay for bike rides?”
2. If accepted: default opt-in on future bike bookings (skippable toggle)
3. Track repeat assured-ride usage rate

---

## State machine (rider ride — simplified)

```
BOOKING
  └─ opt_in? → ASSURED_ACTIVE | STANDARD

IN_RIDE
  └─ fare_updates → WITHIN_ESTIMATE | IN_BUFFER | EXCEEDS_M (warning)

TRIP_END
  ├─ A <= M & payment_ok → COMPLETE
  ├─ A <= M & payment_fail & assured → RESCUED_COMPLETE
  ├─ A > M & small_valid → RESIDUAL_CREATED
  └─ A > M & suspicious → REVIEW_PENDING

POST_RIDE
  ├─ residual_unpaid → RECOVERY_PROMPT
  └─ review_resolved → FINALIZED
```

---

## Edge cases checklist (MVP must handle)

| Case | Expected behavior |
|------|-------------------|
| Rider opts out mid-booking | No authorization created |
| Double tap opt-in | Idempotent authorization |
| Ride cancelled before start | Void authorization |
| A = 0 (cancelled mid-ride) | No Assured settlement |
| Instrument expired | Block opt-in at booking |
| Concurrent rides | One active assured auth per rider (MVP) |
| Captain app offline | Payout queued; visible when online |

---

## Cross-journey metrics hooks

Each journey emits events documented in `KPI_TREE.md` (e.g. `assured_opt_in`, `frictionless_completion`, `residual_created`, `review_routed`, `residual_recovered`).
