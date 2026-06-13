# Assured Pay — Business Model & Rollout Thesis

**Version:** 0.1  
**Purpose:** Explain why Assured Pay exists commercially, how MVP validates the thesis, and when monetization may follow.

---

## 1. Strategic thesis

Assured Pay is **not** primarily a revenue product in MVP. It is a **trust and completion layer** that:

1. Increases digital payment success at trip completion
2. Reduces cash dependency and captain-rider friction
3. Improves rider retention on high-frequency bike commute use cases
4. Lowers support cost from payment-failure incidents

**Positioning:** Trust + convenience (“no-payment-stress ride completion”), not insurance against platform weakness.

---

## 2. Value creation by stakeholder

| Stakeholder | Value created | How we measure (see KPI_TREE) |
|-------------|---------------|-------------------------------|
| **Rider** | Predictable max charge, frictionless drop-off, explained fare deltas | FACR, NPS, repeat usage |
| **Captain** | Instant payout on valid assured rides | Payout success rate, complaint rate |
| **Platform** | Higher completion, lower cash %, fewer tickets | Rescue rate, support cost/ride, bad debt |
| **Ecosystem** | More reliable digital settlement | Cash fallback avoidance |

---

## 3. MVP business case (prototype → pilot)

### Phase A: Prototype (now)

**Goal:** Prove the experience and deterministic settlement logic are demo-ready.

- No revenue
- Mock payments and wallet
- Instrument KPI events for credibility in pitch/demo

**Success:** Stakeholder can watch end-to-end flows on Vercel; tests green; docs complete.

### Phase B: Constrained pilot (post-prototype)

**Goal:** Validate economics on real bike rides in 1–2 cities.

| Hypothesis | Validation method |
|------------|-------------------|
| Opt-in rate ≥ 8–15% among eligible riders when discovery is contextual | A/B on trigger placement |
| FACR ≥ 92% | Production metrics |
| Bad debt &lt; 0.15% assured GMV | Finance reconciliation |
| Support contacts/1k assured rides ↓ vs baseline | Support tagging |
| Repeat assured usage ≥ 35% at 14d | Cohort analysis |

**Still no rider fee** in pilot—optimize adoption and guardrails.

---

## 4. Unit economics (conceptual)

### Cost components (platform)

| Cost | Description |
|------|-------------|
| **Residual underwriting** | Platform fronts (A − M) for small valid overages until recovered |
| **Unrecovered residual (bad debt)** | Failed recovery after grace period |
| **Review ops** | Human cost per suspicious overage |
| **Instant captain payout float** | Working capital between rider capture and settlement (if capture delayed) |
| **Incremental support** | Assured-specific tickets (should net negative vs saved payment-failure tickets) |

### Revenue components (MVP: none)

MVP does not charge per ride. Optional future levers documented in §6.

### Break-even intuition (pilot)

Assured Pay is viable when:

```
(Retention uplift GMV + support savings + cash-reduction benefits)
  >
(Bad debt + residual float + review ops + incremental infra)
```

Bike-first keeps fare sizes and underwriting exposure low—critical for early viability.

---

## 5. Rollout thesis

### Why bike first

| Factor | Bike advantage |
|--------|----------------|
| Fare size | Lower per-ride residual exposure |
| Frequency | Faster habit loop for commuters |
| Digital maturity | Wallet / UPI flows more compatible in public evidence |
| Variance | Shorter trips → fewer large surprise overages |

### Geographic rollout

1. **City 1:** High-density, high digital payment penetration (e.g. Bengaluru or Hyderabad in narrative)
2. **City 2:** Different network/payment quirk profile for learning
3. **Expand** only after guardrails stable 4–8 weeks

### Eligibility gating (rollout)

Progressive eligibility reduces risk:

1. Saved digital payment instrument required
2. No open residual dues
3. Not on Assured Pay blocklist (misuse)
4. Bike category only
5. Optional: minimum rider tenure / successful ride count before “always on”

---

## 6. Long-term monetization paths (not MVP)

| Path | Description | When |
|------|-------------|------|
| **Retention uplift** | More rides from trusted checkout | Primary ROI; measure from pilot |
| **Support cost reduction** | Fewer payment-failure incidents | Pilot → scale |
| **Premium bundling** | Ride pass / subscription: “Assured Pay included” | After habit proven |
| **Corporate commute** | B2B package with assured settlement | After consumer pilot |
| **Per-ride fee** | Explicit Assured Pay surcharge | **Avoid early** — kills adoption |

**Recommendation:** Do not introduce per-ride fees until FACR, bad debt, and repeat usage prove value. Fee too early feels like paying for Rapido’s payment weakness.

---

## 7. Competitive / differentiation narrative

| Alternative | Limitation | Assured Pay difference |
|-------------|------------|------------------------|
| Cash fallback | Captain friction, safety, reconciliation | Digital-first completion |
| Retry payment at trip end | Requires device/network | Pre-authorized ceiling M |
| Post-ride payment links | Async captain pain | Captain instant credit |
| Generic wallet top-up | No fare transparency | F, M, reason codes in-session |

---

## 8. Partnership & compliance considerations (future)

- Payment aggregator terms for pre-auth / capture patterns
- RBI / NPCI rules on UPI mandates and delayed capture
- Captain labor / payout regulations
- Clear rider liability language (aligned with existing T&C patterns: rider remains liable for valid fare)

MVP prototype uses mocks; contracts designed for future compliance review.

---

## 9. Investment framing (solo founder / internal pitch)

**Ask:** 6–8 week MVP prototype + 8 week constrained pilot prep.

**Returns:**

- Measurable reduction in payment-friction incidents
- New habit loop for commute riders
- Captain trust improvement on digital settlement
- Foundation for premium bundles without rework

**Kill criteria (pilot):**

- Bad debt &gt; guardrail with no recovery improvement
- Fare dispute rate worse than control
- Captain complaint rate elevated
- Opt-in &lt; 3% despite strong discovery (positioning failure)

---

## 10. Summary

| Horizon | Business model |
|---------|----------------|
| **MVP prototype** | Learning + demo; zero revenue |
| **Pilot** | Retention + cost savings thesis; zero rider fee |
| **Scale** | Optional bundling; per-ride fee only if unit economics allow |
| **North Star alignment** | Revenue never trades off frictionless completion guardrails |

See `ROADMAP.md` for phase timing and `KPI_TREE.md` for measurement.
