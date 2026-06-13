# Assured Pay — KPI Tree

**Version:** 0.1  
**Purpose:** PM-grade measurement framework for MVP instrumentation and future production monitoring.

---

## How to read this tree

| Level | Role | Horizon |
|-------|------|---------|
| **North Star** | Single outcome that expresses core user value | Strategic |
| **L0** | Direct expression of North Star | Primary success |
| **L1** | Adoption, reliability, and habit drivers | Product health |
| **L2** | Operational levers and diagnostic metrics | Tuning & debugging |
| **Guardrails** | Metrics that must not degrade while optimizing L0–L2 | Risk containment |

**MVP prototype:** Implement event emission + a minimal metrics dashboard or export (JSON/CSV). Full analytics pipeline is post-MVP.

---

## North Star

### Frictionless Assured Completion Rate (FACR)

**Definition:**  
Among rides where the rider **opted in** to Assured Pay, the percentage that end with:

- Zero payment failure at trip completion **and**
- No cash fallback **and**
- No manual QR / captain-rider payment negotiation **and**
- No rider-initiated payment dispute ticket within 24h

**Formula:**

```
FACR = (Opted-in rides meeting all frictionless criteria) / (Total opted-in completed rides) × 100
```

**Why this North Star:** Assured Pay exists to eliminate the awkward last 60 seconds of the ride. Everything else supports this outcome.

**MVP target (prototype demo):** Simulate flows that prove measurability; no real baseline.  
**Production pilot target (guidance):** ≥ 92% FACR in bike MVP cities.

---

## L0 — Primary outcome layer

| Metric | Definition | Notes |
|--------|------------|-------|
| **L0: Frictionless completion count** | Raw count of opted-in frictionless completions | Volume companion to FACR |
| **L0: Assured ride completion rate** | Opted-in assured rides that reach `COMPLETE` or `RESCUED_COMPLETE` / all opted-in started | Funnel health |
| **L0: Captain unpaid-at-completion rate (assured)** | Assured rides where captain wallet not credited within SLA / assured completions | Must → 0 for valid rides |

L0 rolls up directly to North Star; L1 explains *why* FACR moves.

---

## L1 — Product health drivers

### Adoption

| Metric | Definition |
|--------|------------|
| **Assured Pay opt-in rate** | Opted-in eligible bookings / eligible bookings shown Assured Pay |
| **Eligible booking rate** | Bookings meeting MVP eligibility (bike, city, saved instrument) / all bookings |
| **Free trial conversion rate** | Riders who use free trial and opt in again within 7 days |

### Payout reliability

| Metric | Definition |
|--------|------------|
| **Captain payout success rate (assured)** | Assured rides with captain wallet credited within **X min** (config: 2 min MVP demo, 5 min pilot) / assured completions |
| **Payout latency P50 / P95** | Time from trip end to captain credit |

### Rescue effectiveness

| Metric | Definition |
|--------|------------|
| **Payment failure rescue rate** | Assured rides where payment would have failed but Assured layer completed settlement / assured rides with simulated or actual payment failure |
| **Cash fallback avoidance rate** | Assured rides that would have gone cash without Assured / counterfactual or tagged sim events |

### Habit & retention

| Metric | Definition |
|--------|------------|
| **Repeat assured-ride usage rate** | Riders with ≥2 assured rides in 14d / riders with ≥1 assured ride in 14d |
| **Assured ride share** | Assured completed rides / all completed eligible bike rides |
| **Default-on retention** | Riders who enabled “always Assured Pay” still active after 30d |

---

## L2 — Operational diagnostics

### Discovery & triggers

| Metric | Definition |
|--------|------------|
| **Trigger impression rate** | Discovery card shown / eligible sessions |
| **Low-battery prompt CTR** | Opt-in from low-battery trigger / low-battery prompt impressions |
| **Save-time-at-dropoff CTR** | Opt-in from convenience trigger / impressions |
| **Post-failure education CTR** | Opt-in after prior payment failure / education card impressions |
| **Discovery source mix** | Opt-ins by `discovery_source` dimension |

### Fare & buffer behavior

| Metric | Definition |
|--------|------------|
| **Rides staying within estimate (A = F)** | Share where final fare equals initial estimate |
| **Buffer entry rate** | Rides where A > F but A ≤ M / assured rides |
| **M exceeded rate** | Rides where A > M / assured rides |
| **Avg buffer utilization** | Mean (A − F) for assured rides where A > F |
| **Reason code distribution** | Count by `WAITING`, `ROUTE_CHANGE`, `TOLL`, etc. |

### Residual & recovery

| Metric | Definition |
|--------|------------|
| **Residual creation rate** | Rides with `settlement_type=residual_created` / assured rides |
| **Avg residual amount** | Mean (A − M) when residual created |
| **Residual recovery rate @ 24h** | Residuals paid within 24h / residuals created |
| **Residual recovery rate @ 7d** | Residuals paid within 7d / residuals created |
| **Unpaid residual rider count** | Distinct riders with open residual &gt; grace period |

### Support & ops

| Metric | Definition |
|--------|------------|
| **Support contact rate per 1,000 assured rides** | Tickets tagged assured / 1k assured rides |
| **Review queue volume** | Rides routed to manual review / assured rides |
| **Review resolution time P50** | Ops queue SLA |
| **Review overturn rate** | Decisions changed on appeal / total review decisions |

---

## Guardrails — Do not harm

| Guardrail | Definition | Action threshold (pilot guidance) |
|-----------|------------|-------------------------------------|
| **Fare dispute rate (assured vs standard)** | Payment/fare disputes / rides; compare cohorts | Assured ≤ standard + 0.5pp |
| **Captain complaint rate (assured)** | Captain tickets re underpayment or delay / assured rides | &lt; 0.3% |
| **Platform bad debt rate** | Unrecovered residual + write-offs / GMV assured | &lt; 0.15% of assured GMV |
| **Misuse / fraud rate** | Riders with repeated unpaid residuals or abuse flags / assured riders | &lt; 1%; block policy active |
| **Assured ride NPS vs standard** | Survey delta | Assured ≥ standard |
| **Incremental support cost per assured ride** | Marginal support ₹ / assured ride | Must decrease vs payment-failure baseline over time |
| **Silent overcharge incidents** | Rider reports charge &gt; M without prior warning / assured rides | **0** tolerance |
| **Review SLA breach rate** | Reviews open &gt; 24h / reviews created | &lt; 5% |

---

## Event taxonomy (MVP instrumentation)

Minimum events for KPI computation:

```
assured_discovery_shown
assured_opt_in
assured_opt_in_declined
assured_ride_started
fare_update_shown
buffer_zone_entered
m_exceeded_warning
trip_end_settlement
  └─ properties: A, F, M, settlement_type, reason_codes[]
payment_failure_simulated
payment_rescued
captain_wallet_credited
residual_created
residual_paid
review_routed
review_resolved
assured_free_trial_consumed
always_assured_enabled
support_ticket_created (stub)
```

---

## Dashboard slices (recommended)

| Slice | Use |
|-------|-----|
| City | MVP city rollout comparison |
| Discovery source | Which triggers work |
| Settlement type | Residual vs review vs clean |
| Cohort: first assured ride | Trial → repeat funnel |
| Captain ID (anonymized in demo) | Payout latency debug |

---

## KPI ownership (cross-functional)

| Area | Owner |
|------|-------|
| North Star / L0 | Product |
| L1 adoption & habit | Product + Growth |
| L1 payout | Backend + Platform |
| L2 ops | Ops + Product |
| Guardrails | Product + Finance + Support |

---

## What we will NOT optimize (early)

- Raw opt-in rate alone (can harm trust if misprompted)
- Minimizing residual amount by shrinking buffer (hurts rescue value)
- Maximizing auto-guarantee above M (increases bad debt)

Optimize **FACR** subject to guardrails.
