# Assured Pay — Product Requirements Document (MVP Prototype)

**Version:** 0.1 (MVP prototype)  
**Status:** Planning  
**Source of truth:** RAPIDO FEATURE DOC + cross-functional planning session  
**Audience:** Solo builder, future collaborators, stakeholders reviewing prototype fidelity

---

## 1. Executive summary

**Assured Pay** is an opt-in payment guarantee layer for a ride-hailing app (Rapido-inspired). At booking, the rider approves a fare ceiling **M = F + buffer** (where **F** is the estimated fare). At trip end, the system settles payment and captain payout according to deterministic rules—never AI-decided outcomes.

The MVP prototype demonstrates **trust + convenience** at trip completion: riders finish rides without last-mile payment stress; captains receive payout certainty even when digital rails fail. Scope is deliberately narrow: **bike rides**, **1–2 cities**, **saved payment instruments**, **small buffers**, **ops review for anomalies**.

This document defines *what* we build for the polished prototype. Implementation details live in `ARCHITECTURE.md`, `ROADMAP.md`, and sibling docs.

---

## 2. Core problem

Rapido-style ride-hailing has a fragile **last-mile payment moment**. Even when the transport experience is complete, the ride can end in friction because:

- Payment fails (UPI pending, gateway timeout, bank outage)
- Rider device dies (low battery, phone shutdown)
- Network is poor at destination (basements, transit hubs, dense urban pockets)
- Final fare feels different from what was expected (waiting, route change, tolls)

This creates a **two-sided trust problem**:

| Stakeholder | Pain |
|-------------|------|
| **Rider** | Surprise charges, awkward checkout, fear of being unable to pay digitally at drop-off |
| **Captain** | Delayed or missed earnings unless cash is collected immediately; post-ride negotiation |
| **Platform** | Payment friction → support tickets, cash fallback, fare distrust, retention loss |

**Product problem statement:** Riders need certainty that a valid ride can end smoothly even if digital payment fails at the last moment. Captains need certainty that a completed ride converts to earnings without negotiation. The platform must reduce friction and fare distrust **without open-ended credit risk**.

---

## 3. Solution overview

### 3.1 Core logic (deterministic, not AI)

| Symbol | Meaning |
|--------|---------|
| **F** | Estimated fare at booking |
| **M** | Rider-approved max = F + buffer |
| **A** | Actual fare at trip end |

**Settlement rules:**

1. **If A ≤ M:** Charge **A** automatically. Captain credited **A**. Ride closed.
2. **If A > M and excess is small + valid** (waiting, route change, toll, pickup correction per reason codes): Captain credited **full A** instantly via wallet/ledger. Capture up to **M** from rider instrument if possible; create **residual due = A − M** on rider account for recovery.
3. **If A > M and excess is large or suspicious:** Do **not** auto-guarantee. Route to **manual/ops review**. Protect both sides with reason-code audit trail. No silent finalization.

**Hard constraint:** AI may assist copy, discovery ranking, or ops triage suggestions—but **must not decide core payment outcomes**.

### 3.2 Positioning

**Primary frame:** *No-payment-stress ride completion* — trust + convenience.  
**Secondary frame:** Low battery / network rescue (contextual triggers, not the whole story).

---

## 4. Use cases

### 4.1 In scope (MVP prototype)

| # | Use case | Trigger / context |
|---|----------|-------------------|
| 1 | Low battery or phone shutdown before drop-off payment | Device battery API / user-declared low battery prompt |
| 2 | UPI / gateway / transient payment failure at trip end | Simulated payment failure in prototype |
| 3 | Poor network at destination | Simulated offline-at-dropoff flow |
| 4 | Time-critical commuter wants zero checkout friction | “Save time at drop-off” booking prompt |
| 5 | Small valid fare overage within buffer policy | Waiting time, route change reason codes |
| 6 | Residual due recovery on next app open | Post-ride recovery screen |
| 7 | Suspicious large overage → review queue | Ops dashboard stub in prototype |

### 4.2 Stretch (documented, not MVP-blocking)

- Night-ride safety framing (minimize post-drop cash negotiation)
- Repeat commuter “always use Assured Pay” default
- Corporate commute bundling

---

## 5. Non-use-cases (explicit exclusions)

| Non-use-case | Rationale |
|--------------|-----------|
| **Open-ended credit / pay-later without cap** | Unbounded platform risk; violates M = F + buffer contract |
| **AI-decided charge amounts or auto-write-offs** | Regulatory, trust, and audit requirements; rules engine only |
| **Auto/auto-cab categories in MVP** | Higher fare variance and underwriting risk; bike-first per doc |
| **Cash-first or unbanked riders without saved instrument** | Requires different settlement and KYC flows |
| **Cross-border or multi-currency** | Out of MVP scope |
| **Insurance product positioning** | Avoid “pay us because our payments break”; frame as trust + convenience |
| **Captain-initiated fare changes without rider-visible reason codes** | Worsens transparency complaints |
| **Silent charge above M without residual UX** | Violates “never feel trapped” principle |
| **Production-grade fraud ML** | MVP uses rule thresholds + manual review |
| **Real payment gateway integration in v0 prototype** | Mock payment service; contract-ready interfaces |

---

## 6. Product principles

1. **Transparency before capture** — Rider sees F, M, valid fare-change reasons, and live fare status in-ride.
2. **Captain payout certainty** — Completed valid rides must not leave captain unpaid because rider device/payment failed.
3. **Deterministic settlement** — Rules engine + reason codes; no AI payment decisions.
4. **Bounded platform risk** — Small buffer, small residual underwriting, review path for anomalies.
5. **Contextual discovery** — Surface Assured Pay when rider feels the pain or benefit, not buried in settings.
6. **Dignified recovery** — Residual due UX is clear and actionable, not shame-based (early rollout).
7. **Prototype honesty** — Mock services clearly labeled; flows feel production-realistic for demos.

---

## 7. MVP scope boundaries

### In scope

- Booking opt-in with F / M display and consent
- In-ride fare indicator (within estimate / buffer / exceeds)
- Trip-end settlement flows (success, residual, review)
- Captain wallet credit simulation
- Residual due + recovery prompt on next open
- Contextual discovery prompts (battery, online payer, post-failure education)
- One free trial assured ride flag
- Bike + 1–2 cities configuration
- Metrics event hooks for KPI tree (even if dashboard is minimal)

### Out of scope (MVP prototype)

- Real UPI / Razorpay / Paytm integration
- Production ops tooling at scale
- Multi-category rollout
- Paid subscription / per-ride fee
- Full Rapido brand assets (until polish phase—see `ROADMAP.md`)

---

## 8. Success criteria (prototype)

The prototype is “done” when a demo user can:

1. Opt in to Assured Pay at booking with clear F and M
2. Complete a ride with simulated payment failure and see frictionless completion
3. See captain instant credit in captain-facing stub view
4. Experience residual due flow for small valid overage
5. See review-pending state for suspicious overage
6. Encounter at least two contextual discovery entry points
7. Run automated test suite green locally and deploy to Vercel

Detailed metrics: `KPI_TREE.md`.

---

## 9. Stakeholder map

| Role | MVP need |
|------|----------|
| Rider | Trust, clarity, frictionless drop-off |
| Captain | Instant payout visibility |
| Ops / support | Review queue + reason codes |
| Platform / PM | KPI instrumentation, guardrail monitoring |
| Solo builder | Clear contracts, mockable services, phased roadmap |

---

## 10. Related documents

| Document | Contents |
|----------|----------|
| `USER_PERSONAS.md` | Personas and jobs-to-be-done |
| `USER_JOURNEYS.md` | End-to-end flows |
| `KPI_TREE.md` | North Star, L0–L2, guardrails |
| `BUSINESS_MODEL.md` | ROI thesis, monetization later |
| `DISCOVERY_AND_HABIT.md` | Entry points and habit loop |
| `ARCHITECTURE.md` | System design, APIs, entities |
| `TECH_STACK.md` | Stack and tooling |
| `TEST_STRATEGY.md` | Quality plan |
| `ROADMAP.md` | Phases, deploy, screenshots, Grok timing |
| `OPEN_QUESTIONS.md` | Unresolved decisions |
