# Assured Pay — User Personas

**Version:** 0.1  
**Purpose:** Align product, design, and engineering on who we serve in the MVP and how their success differs.

---

## Persona hierarchy

| Tier | Persona | MVP priority |
|------|---------|--------------|
| **Primary** | Time-critical commuter | P0 — core booking and habit loop |
| **Primary** | Low-confidence digital payer | P0 — Assured Pay value prop |
| **Secondary** | Safety-sensitive rider | P1 — messaging and discovery variant |
| **Secondary (gating stakeholder)** | Captain who values instant closure | P0 — payout UX must not fail |
| **Internal** | Ops / support reviewer | P1 — review queue for prototype |

---

## Primary persona 1: Time-critical commuter

**Name:** Priya, 28 — Bengaluru tech park commuter  
**Archetype:** Office-goer, student, or interview traveler on frequent short **bike** rides

### Profile

- Takes 4–6 bike rides per week, mostly predictable routes
- Values **speed at destination** over payment interaction
- Often exits at metro gates, office towers, or campus gates under time pressure
- Uses UPI but hates the last 60 seconds of “payment pending”

### Jobs to be done

- Finish the ride and walk away without checkout friction
- Know upfront what the maximum charge could be (M)
- Trust that small waiting charges are explained, not hidden

### Pain points

- Payment screen at drop-off breaks flow
- Uncertainty if phone will cooperate at destination
- Fare surprises erode trust in the app

### Assured Pay value

- One-tap opt-in at booking: “Finish without payment stress”
- Live in-ride indicator: still within approved max
- Trip end: automatic completion message, instant walk-away

### Discovery triggers

- “Save time at drop-off” banner on booking
- Frequent commuter prompt after 2–3 successful assured rides
- Commute pass / repeat route context (stretch)

### Prototype implications

- Booking screen must show F, M, and valid change reasons in &lt;5 seconds scan
- Trip-end success state is the **hero moment** for this persona

---

## Primary persona 2: Low-confidence digital payer

**Name:** Arjun, 24 — UPI user with bad luck  
**Archetype:** Digital-first but has experienced pending payments, low battery, weak network

### Profile

- Prefers online payment over cash
- Has had at least one embarrassing failed payment at trip end
- Battery often &lt;20% during evening commute
- Moderately price-sensitive; reads fare breakdown carefully

### Jobs to be done

- Avoid cash fallback and captain negotiation
- Get certainty before the ride starts, not after failure
- Understand why final fare differed from estimate

### Pain points

- “Payment failed” after ride already completed
- Low battery warning while still en route
- Distrust when final fare ≠ estimate without explanation

### Assured Pay value

- Low-battery contextual prompt: “Turn on Assured Pay”
- Post-payment-failure education card on next booking
- Receipt with estimate vs actual and reason codes

### Discovery triggers

- Low battery detection (or simulated toggle in prototype)
- Post-incident education card
- Online payment method selected repeatedly

### Prototype implications

- Must demo **payment failure rescue** path clearly
- Residual due UX must explain *why*, not just *how much*

---

## Secondary persona 1: Safety-sensitive rider

**Name:** Meera, 31 — night rider  
**Archetype:** Rides alone, at night, or in unfamiliar areas

### Profile

- Prioritizes minimizing conversation and negotiation at drop-off
- Less sensitive to small buffer fees; highly sensitive to unpredictability
- May not be primary Assured Pay adopter but responds to trust framing

### Jobs to be done

- End ride cleanly without cash haggling or QR fumbling in poorly lit areas
- Feel the platform has her back if payment fails

### Pain points

- Awkward payment moments feel unsafe, not just inconvenient
- Captain impatience when payment stalls

### Assured Pay value

- “Captain gets paid instantly; you settle digitally when you can”
- Reduces post-drop interaction time

### MVP treatment

- Copy variant on discovery cards and confirmation state
- Not a separate flow—messaging and trigger placement only

---

## Secondary persona 2 (gating stakeholder): Captain who values instant closure

**Name:** Ravi, 35 — bike captain  
**Archetype:** Full-time captain; earnings depend on ride volume and instant closure

### Profile

- Completes 15–25 rides/day
- Tracks daily earnings in wallet
- Loses trust quickly if payout is delayed or requires follow-up
- Does **not** opt in to Assured Pay—experiences it passively

### Jobs to be done

- Get paid full legitimate fare immediately when ride completes
- Avoid chasing riders for failed UPI
- See clear ride settlement status

### Pain points

- Rider phone dead → “pay cash” friction
- Platform holds earnings pending payment resolution
- Disputes without reason codes waste time

### Assured Pay value (captain-side)

- Instant wallet credit for valid assured rides (including small overage cases where platform fronts delta)
- Clear ride receipt: assured badge, amount credited, settlement type

### Prototype implications

- **Captain wallet stub view** is required for credible demo—not optional polish
- Payout within X minutes is an L1 metric (see `KPI_TREE.md`)
- Captain complaint rate is a guardrail

---

## Internal persona: Ops / support reviewer

**Name:** Support lead / ops analyst  
**Archetype:** Handles edge cases the rules engine flags

### Jobs to be done

- Review rides where A &gt; M with large or suspicious delta
- Validate reason codes and evidence
- Decide: approve residual, adjust, or escalate

### MVP treatment

- Minimal admin/review queue UI or API-only queue with seed data
- Audit log: timestamps, reason codes, rule version, human decision

---

## Persona × feature matrix (MVP)

| Feature | Priya | Arjun | Meera | Ravi | Ops |
|---------|-------|-------|-------|------|-----|
| Booking opt-in (F, M) | ●●● | ●●● | ●● | ○ | ○ |
| Low-battery discovery | ●● | ●●● | ●● | ○ | ○ |
| Payment failure rescue | ●●● | ●●● | ●●● | ●●● | ○ |
| In-ride fare indicator | ●●● | ●●● | ●● | ○ | ○ |
| Residual due recovery | ●● | ●●● | ●● | ○ | ●● |
| Review queue | ○ | ● | ○ | ●● | ●●● |
| Captain wallet credit | ○ | ○ | ○ | ●●● | ●● |

Legend: ●●● critical · ●● important · ● nice · ○ passive

---

## Anti-personas (not designing for in MVP)

- **Cash-only rider** — no saved instrument; Assured Pay not offered
- **Fare-gaming rider** — repeated unpaid residuals; blocked from Assured Pay after policy threshold
- **Auto/cab long-haul rider** — wrong category for bike-first MVP
