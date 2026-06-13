# Assured Pay — Open Questions

**Version:** 0.1  
**Purpose:** Track unresolved decisions before and during implementation. Each item includes owner, impact, MVP default, and deadline suggestion.

**Rule:** If blocked in Phase 1+, use **MVP default** below and log the decision in this file.

---

## 1. Policy & settlement thresholds

### OQ-1: Buffer amount formula

| Field | Value |
|-------|-------|
| **Question** | Fixed ₹ buffer vs % of F vs hybrid? |
| **Impact** | M calculation, bad debt exposure, rider comprehension |
| **Options** | (A) Fixed ₹7 (B) 10% of F min ₹5 max ₹15 (C) City-configurable |
| **MVP default** | **Fixed ₹7** for bike MVP |
| **Owner** | Product + Finance |
| **Resolve by** | Before Phase 2 API implementation |

### OQ-2: Small excess maximum (auto-residual ceiling)

| Field | Value |
|-------|-------|
| **Question** | How much above M can be auto-guaranteed with valid reason codes? |
| **Impact** | REVIEW_REQUIRED vs RESIDUAL_CREATED boundary |
| **Options** | (A) ₹10 (B) ₹15 (C) min(₹15, 20% of M) |
| **MVP default** | **₹10 above M** with valid reason code |
| **Owner** | Product + Finance |
| **Resolve by** | Before Phase 1 domain tests finalized |

### OQ-3: Suspicious overage definition

| Field | Value |
|-------|-------|
| **Question** | When is excess “suspicious” vs merely “large”? |
| **Impact** | Review queue volume, rider trust |
| **Options** | (A) Absolute &gt; ₹25 above M (B) &gt; 30% of M (C) missing/invalid reason codes only |
| **MVP default** | **&gt; ₹25 above M OR no valid reason code** → REVIEW_REQUIRED |
| **Owner** | Product + Ops |
| **Resolve by** | Before Phase 2 |

### OQ-4: Valid reason codes for auto-residual

| Field | Value |
|-------|-------|
| **Question** | Which reason codes qualify for small excess auto-guarantee? |
| **Impact** | Captain payout automation |
| **MVP default** | `WAITING`, `ROUTE_CHANGE`, `TOLL`, `PICKUP_CORRECTION` |
| **Owner** | Product |
| **Resolve by** | Phase 1 (document in `reason_codes.py`) |

### OQ-5: Captain credit on REVIEW_REQUIRED

| Field | Value |
|-------|-------|
| **Question** | Partial credit, full hold, or policy-based partial until review? |
| **Impact** | Captain trust vs platform float |
| **Options** | (A) Credit M immediately, rest on approval (B) Hold全部 until review (C) Credit A if reason code present else hold |
| **MVP default** | **Credit M immediately; hold (A − M) pending review** |
| **Owner** | Product + Captain ops |
| **Resolve by** | Before Phase 2 trip-end orchestrator |

---

## 2. Eligibility & gating

### OQ-6: Saved instrument requirement

| Field | Value |
|-------|-------|
| **Question** | Is saved UPI/card mandatory for opt-in? |
| **Impact** | Adoption vs recovery |
| **MVP default** | **Yes — required** |
| **Owner** | Product |
| **Resolve by** | Phase 2 eligibility API |

### OQ-7: Residual block policy

| Field | Value |
|-------|-------|
| **Question** | After how many unpaid residuals is Assured Pay blocked? |
| **Impact** | Misuse guardrail |
| **MVP default** | **Block after 2 unpaid residuals past 7d grace** |
| **Owner** | Product + Finance |
| **Resolve by** | Phase 4 |

### OQ-8: Booking block for open dues

| Field | Value |
|-------|-------|
| **Question** | Can rider book any ride with open residual, or only blocked from Assured Pay? |
| **Impact** | Recovery pressure vs UX |
| **MVP default** | **Block Assured Pay only; standard rides allowed** |
| **Owner** | Product |
| **Resolve by** | Phase 4 (pilot may tighten) |

### OQ-9: MVP cities

| Field | Value |
|-------|-------|
| **Question** | Which 1–2 cities for prototype narrative and config? |
| **Impact** | Demo storytelling, seed data |
| **MVP default** | **Bengaluru (`blr`) + Hyderabad (`hyd`)** as config IDs |
| **Owner** | Product |
| **Resolve by** | Phase 3 copy (no real geo dependency in prototype) |

---

## 3. Payment & recovery

### OQ-10: Capture behavior when A > M (residual path)

| Field | Value |
|-------|-------|
| **Question** | Always capture M first, or attempt full A then partial? |
| **Impact** | Payment gateway integration design |
| **MVP default** | **Attempt capture up to M; create residual for verified delta** |
| **Owner** | Backend + Payments |
| **Resolve by** | Before production adapter (Phase 2 mock documents intent) |

### OQ-11: Auto-recovery from saved instrument

| Field | Value |
|-------|-------|
| **Question** | Auto-charge residual on next app open without explicit tap? |
| **Impact** | Recovery rate vs consent |
| **Options** | (A) Explicit tap only (B) Auto if pre-approved in opt-in consent (C) Auto after 24h |
| **MVP default** | **Explicit tap only in prototype; consent checkbox copy reserves future auto-recovery** |
| **Owner** | Product + Legal |
| **Resolve by** | Phase 4 recovery UX |

### OQ-12: Grace period before escalation

| Field | Value |
|-------|-------|
| **Question** | How long before residual blocks Assured Pay / booking? |
| **MVP default** | **7 days to block Assured Pay; 14 days optional booking warning** |
| **Owner** | Product |
| **Resolve by** | Phase 4 |

---

## 4. Discovery & habit

### OQ-13: Low battery detection

| Field | Value |
|-------|-------|
| **Question** | Real Battery Status API vs manual/demo toggle only? |
| **Impact** | Browser support, mobile web limits |
| **MVP default** | **Demo toggle + optional `navigator.getBattery()` where supported** |
| **Owner** | Frontend |
| **Resolve by** | Phase 4 |

### OQ-14: “Always Assured Pay” trigger count

| Field | Value |
|-------|-------|
| **Question** | After how many successful assured rides prompt default-on? |
| **MVP default** | **3 rides** (per product doc) |
| **Owner** | Product |
| **Resolve by** | Phase 4 |

### OQ-15: Free trial scope

| Field | Value |
|-------|-------|
| **Question** | One free trial per rider lifetime or per device/account rules? |
| **MVP default** | **One per rider_id lifetime** |
| **Owner** | Product |
| **Resolve by** | Phase 4 |

---

## 5. Technical & deployment

### OQ-16: Backend hosting choice

| Field | Value |
|-------|-------|
| **Question** | Railway vs Render vs Fly for FastAPI? |
| **Impact** | Deploy complexity, cost |
| **MVP default** | **Railway** (simplest Python + Postgres path) |
| **Owner** | Builder |
| **Resolve by** | Phase 6 |

### OQ-17: BFF vs direct FE → BE

| Field | Value |
|-------|-------|
| **Question** | Next.js API routes as proxy vs direct browser calls to FastAPI? |
| **Impact** | CORS, latency |
| **MVP default** | **Direct calls + CORS** (simpler for prototype) |
| **Owner** | Architect |
| **Resolve by** | Phase 3 |

### OQ-18: Auth approach for prototype

| Field | Value |
|-------|-------|
| **Question** | Mock header auth vs NextAuth stub? |
| **MVP default** | **`X-Rider-Id` header with seed rider selector on `/demo`** |
| **Owner** | Backend |
| **Resolve by** | Phase 2 |

### OQ-19: Postgres timing

| Field | Value |
|-------|-------|
| **Question** | When migrate from SQLite to Postgres? |
| **MVP default** | **SQLite local dev; Postgres on Railway at Phase 6 deploy** |
| **Owner** | Builder |
| **Resolve by** | Phase 6 |

---

## 6. Design & branding

### OQ-20: Brand naming in prototype

| Field | Value |
|-------|-------|
| **Question** | Use “Rapido” name publicly or neutral “RideDemo” / “Assured Pay Demo”? |
| **Impact** | Legal, demo audience |
| **MVP default** | **“Assured Pay” feature name + neutral app shell until Phase 7** |
| **Owner** | Product |
| **Resolve by** | Phase 7 (before external demo) |

### OQ-21: Rapido screenshot usage rights

| Field | Value |
|-------|-------|
| **Question** | Internal reference only vs commit to repo? |
| **MVP default** | **Local/Figma reference only; gitignore `design-reference/` if screenshots used** |
| **Owner** | Product |
| **Resolve by** | Phase 7 start |

---

## 7. AI & Grok

### OQ-22: Grok API model and endpoint

| Field | Value |
|-------|-------|
| **Question** | Which xAI Grok model on free tier; rate limits acceptable? |
| **Impact** | Copy generation latency |
| **MVP default** | **Defer to Phase 8; feature-flagged** |
| **Owner** | Builder |
| **Resolve by** | After Phase 6 |

### OQ-23: AI-assisted ops triage

| Field | Value |
|-------|-------|
| **Question** | Allow Grok to rank review queue vs human FIFO? |
| **MVP default** | **No — FIFO in MVP; Grok summary text only in Phase 8 optional** |
| **Owner** | Product + Ops |
| **Resolve by** | Phase 8 |

---

## 8. Metrics & analytics

### OQ-24: Analytics pipeline

| Field | Value |
|-------|-------|
| **Question** | Events in DB only vs export to Amplitude/Mixpanel? |
| **MVP default** | **MetricsEvent table + `/metrics/summary` API** |
| **Owner** | Product |
| **Resolve by** | Phase 4 |

### OQ-25: Captain payout SLA (X minutes)

| Field | Value |
|-------|-------|
| **Question** | What is X for L1 metric? |
| **MVP default** | **2 minutes demo; 5 minutes pilot target** |
| **Owner** | Product + Captain ops |
| **Resolve by** | Phase 4 metrics |

### OQ-26: Payment dispute 24h window

| Field | Value |
|-------|-------|
| **Question** | North Star excludes disputes within 24h — sufficient? |
| **MVP default** | **Yes for prototype; 72h for pilot** |
| **Owner** | Product |
| **Resolve by** | Pilot prep |

---

## 9. Legal & compliance (future)

### OQ-27: Rider consent copy for delayed capture

| Field | Value |
|-------|-------|
| **Question** | Exact legal language for Assured Pay authorization? |
| **Impact** | Production launch blocker |
| **MVP default** | **Product draft copy; legal review before pilot** |
| **Owner** | Legal |
| **Resolve by** | Pre-pilot |

### OQ-28: NPCI / RBI pre-auth compliance

| Field | Value |
|-------|-------|
| **Question** | Does M function as pre-auth ceiling under UPI rules? |
| **MVP default** | **Mock only; payments counsel before real integration** |
| **Owner** | Legal + Payments |
| **Resolve by** | Pre-production payments |

---

## 10. Decision log template

When resolving an item, append:

```markdown
### OQ-N: [Title] — RESOLVED YYYY-MM-DD
**Decision:** ...
**Rationale:** ...
**Implemented in:** Phase X / file Y
```

---

## 11. Priority queue for Phase 1 kickoff

Must resolve or accept default before writing settlement code:

1. **OQ-2** — Small excess max  
2. **OQ-3** — Suspicious overage  
3. **OQ-4** — Reason codes  
4. **OQ-1** — Buffer formula  
5. **OQ-5** — Review path captain credit  

All others can use MVP defaults above.

---

## 12. Related documents

- `PRD.md` — product scope
- `ARCHITECTURE.md` — technical implications
- `ROADMAP.md` — when decisions must land
- `KPI_TREE.md` — metrics affected by policy choices
