# Assured Pay — Discovery & Habit Formation

**Version:** 0.1  
**Purpose:** Define where riders encounter Assured Pay and how we move from edge-case rescue to trusted default checkout mode.

---

## 1. Discovery principles

1. **Contextual, not buried** — Never launch as a generic toggle deep in payment settings alone.
2. **Moment-of-need** — Show when rider understands value (battery low, payment anxiety, prior failure).
3. **Dual-sided fairness** — Copy explains captain instant payout, not just rider benefit.
4. **Transparent pricing** — Always show F and M before opt-in.
5. **No dark patterns** — Opt-in is explicit; default-on only after repeated successful use + consent.

---

## 2. Discovery entry points (MVP)

### P0 — Must ship in prototype

| Entry point | Trigger | Copy direction | Metric |
|-------------|---------|----------------|--------|
| **Booking screen — Assured Pay card** | Eligible bike booking | “Guaranteed digital completion up to ₹M” + valid change reasons | `assured_discovery_shown` |
| **Low battery prompt** | Device battery &lt; 20% (or dev toggle) | “Low battery? Turn on Assured Pay for a frictionless drop-off.” | `discovery_source=low_battery` CTR |
| **Online payment repeat** | User selects UPI/card ≥ N times in session history | “Finish your ride without payment stress.” | `discovery_source=online_payer` |
| **Post-payment-failure education** | Prior ride ended with payment failure (non-assured) | “Avoid this next time with Assured Pay.” | `discovery_source=post_failure` |

### P1 — Strong for pilot

| Entry point | Trigger | Copy direction |
|-------------|---------|----------------|
| **Commute / frequent rider banner** | ≥ 5 bike rides / 14d | “Finish your ride without payment stress.” |
| **Ride details pre-booking** | Viewing fare estimate | “Captain gets paid instantly, even if your payment completes later.” |
| **Free trial badge** | `free_trial_available` | “Try Assured Pay free on your next bike ride.” |

### P2 — Post-MVP

- Push notification after failed payment (careful frequency cap)
- Corporate commute admin enablement
- Night ride safety variant copy

---

## 3. Discovery UX anatomy

### Booking card (expanded payment section)

```
Fare estimate:        ₹42
Assured max:          ₹49  (includes ₹7 buffer)
Covers:               low battery · weak network · payment failures
Valid fare changes:   waiting · route change · tolls
CTA:                  [ Turn on Assured Pay ]
Secondary:            How fare changes work →
```

### Confirmation state (post opt-in)

- “Captain payout guaranteed. You won’t need cash if payment fails at drop-off.”
- Link: “How fare changes work”

### What we do NOT show

- “Bank server down” as primary headline (rare, abstract)
- Hidden buffer in footnote
- Pre-checked opt-in on first exposure

---

## 4. Messaging matrix

| Audience | Lead message | Support message |
|----------|--------------|-----------------|
| Time-critical commuter | Skip checkout at drop-off | Approved max ₹M shown upfront |
| Low-confidence payer | Payment won’t block your ride | Covers failures & low battery |
| Safety-sensitive | Less negotiation at drop-off | Captain paid instantly |
| Captain (indirect) | — | Visible assured badge + wallet credit |

**Umbrella tagline:** *No-payment-stress ride completion*

---

## 5. Habit formation loop

### Framework: Cue → Action → Reward → Investment

```
┌─────────────────────────────────────────────────────────┐
│  CUE: low battery / online payer / prior failure        │
│         ↓                                               │
│  ACTION: one-tap opt-in at booking (F, M visible)       │
│         ↓                                               │
│  REWARD: frictionless drop-off + captain paid message   │
│         ↓                                               │
│  INVESTMENT: streak, default-on, free trial consumed      │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Three-step habit strategy (from product direction)

### Step 1: Trigger-based trial

| Element | Implementation |
|---------|----------------|
| Offer | One free assured ride (behavioral; no fee in MVP anyway) |
| Framing | “Try Assured Pay free on your next bike ride.” |
| Scope | Bike + MVP city only |
| Goal | First successful rewarded experience |

**Success metric:** Free trial → second opt-in within 7d

### Step 2: Outcome reinforcement

| Touchpoint | Content |
|------------|---------|
| Post-ride success | “You skipped payment friction. Your captain was paid instantly.” |
| Receipt | Estimate vs actual + reason codes if delta |
| Push/in-app (pilot) | Same message within 5 min of completion |

**Success metric:** Repeat assured-ride usage rate @ 14d

### Step 3: Routine formation

| Trigger | Prompt |
|---------|--------|
| 3 successful assured rides | “Always use Assured Pay for bike rides?” |
| Frequent commuter detected | Pair with ride reminders / pass upsell (later) |
| Streak UI | “Zero payment failures: 5 assured rides” |

**Success metric:** Assured ride share among eligible commuters

---

## 7. Anti-habit failure modes

| Failure | Mitigation |
|---------|------------|
| One bad residual experience | Clear breakdown; easy pay; no scare tactics initially |
| Surprise charge &gt; M | In-ride warnings + review path |
| Low discovery CTR | Iterate copy and trigger timing—not increase buffer |
| Treated as emergency-only | Convenience triggers for commuters |
| Captain payout delay | Wallet credit SLA; captain-facing status |

---

## 8. Eligibility & re-discovery

| Rider state | Discovery behavior |
|-------------|-------------------|
| Open residual due | Show recovery banner first; Assured opt-in blocked |
| Blocked for misuse | Hide Assured Pay; show standard payment only |
| Free trial used | Standard discovery without trial badge |
| Always-on enabled | Compact “Assured Pay on” with edit link |

---

## 9. Experiment backlog (pilot)

| Experiment | Variant | Primary metric |
|------------|---------|----------------|
| Low battery threshold | 15% vs 20% vs 25% | CTR, opt-in rate |
| Buffer display | Absolute ₹ vs % | Opt-in rate, dispute rate |
| Captain fairness copy | With vs without captain line | Opt-in rate, captain complaints |
| Post-ride reinforcement | Immediate vs delayed | Repeat usage |
| Default-on timing | After 2 vs 3 vs 5 rides | Retention vs opt-out rate |

---

## 10. Content requirements (prototype)

| Asset | Owner | Deliverable |
|-------|-------|-------------|
| “How fare changes work” modal | Product + Design | Static copy + illustrations |
| Reason code glossary | Product | WAITING, ROUTE_CHANGE, TOLL, PICKUP_CORRECTION |
| Residual recovery copy | Design | Non-shame tone |
| Captain settlement explainer | Product | Wallet stub helper text |

---

## 11. Analytics for discovery & habit

Key dimensions on every opt-in event:

```json
{
  "discovery_source": "low_battery | online_payer | post_failure | booking_card | commute_banner | free_trial",
  "free_trial": true,
  "city_id": "blr",
  "category": "bike",
  "F": 42,
  "M": 49,
  "buffer": 7
}
```

See `KPI_TREE.md` for L2 trigger CTR and repeat usage metrics.

---

## 12. Summary

| Phase | Discovery focus | Habit focus |
|-------|-----------------|-------------|
| **MVP prototype** | 4 entry points + booking card | Post-ride reinforcement copy |
| **Pilot** | Commute banners + experiments | Always-on prompt after 3 rides |
| **Scale** | Personalization by rider segment | Default trusted checkout for bike commuters |
