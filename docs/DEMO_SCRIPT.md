# Demo Script — Assured Pay MVP

**Duration:** ~12 minutes  
**Default persona:** Time-critical commuter (`/demo/scenarios`)  
**Grok:** Leave disabled (`GROK_COPY_ENABLED=false`) unless you want to show live assist.

---

## Setup (before audience)

1. Start app: `npm run dev` (or frontend-only: `npm run dev:frontend`).
2. Open http://localhost:3000/home in mobile-width window (~390px).
3. Confirm persona: **Time-critical commuter** on `/demo/scenarios`.

---

## Act 1 — Discovery & opt-in (3 min)

**Story:** Priya is late for work and wants checkout certainty.

1. Go to **Book** tab → `/booking`.
2. Point out **Assured Pay** card: estimate F, buffer, approved max M.
3. Tap **Turn on Assured Pay** → opt-in sheet.
4. Select **Enable Assured Pay**, tap CTA → back to booking with green confirmation banner.

**Say:** *"She approves a ceiling upfront — M equals estimate plus a small buffer."*

---

## Act 2 — Live ride trust (2 min)

1. Open **Live** tab → `/ride/live`.
2. Show **Within approved max** trust chip and fare progression bar.
3. Use **Demo playback** → switch to **Entered buffer zone** → show warning state.
4. Tap **Explain my fare** → **Policy summary** appears (no Grok required).

**Say:** *"Trust states are deterministic — not AI. Grok only explains in plain language when enabled."*

---

## Act 3 — Happy completion (1 min)

1. Navigate to `/ride/completed` (or `?outcome=happy_path`).
2. Show receipt: rider charged at or below M, captain paid instantly, no residual due.

**Say:** *"Captain gets instant closure — core Rapido captain promise."*

---

## Act 4 — Small valid overage (2 min)

1. Open `/ride/completed?outcome=valid_overage`.
2. Show **Residual due open** chip and **Pay remaining** CTA.
3. Optional: `/ride/residual-due` → mock pay flow.

**Say:** *"Small verified overage within policy creates a residual due — not a checkout argument at drop-off."*

---

## Act 5 — Suspicious overage & ops (2 min)

1. Open `/ride/completed?outcome=suspicious_overage`.
2. Highlight **Under review** — payout held.
3. Switch persona to **Ops review queue** → `/support/review`.
4. Show pending case card; optional **Summarize for ops** (policy fallback).

**Say:** *"Large or unverified excesses go to humans — Assured Pay never auto-approves suspicious fares."*

---

## Act 6 — Recovery & rebooking (2 min)

1. Switch persona to **Open residual due** on `/demo/scenarios`.
2. **Home** → recovery banner with grace reminder.
3. **Book** → Assured Pay blocked with resolve link.
4. `/recovery` → pay now + dispute form.

**Say:** *"Grace period and rebooking rules are policy-driven — 7-day grace, hard block after repeat unpaid."*

---

## Optional encore

| View | Route | Highlight |
|------|-------|-----------|
| Captain payout | `/captain/payout` | Instant wallet credit |
| Analytics | `/admin/analytics` | FACR, opt-in funnel (seed data) |
| Grok on | Set `GROK_COPY_ENABLED=true` + key | Badge switches to **Grok assist** |

---

## Fallback if something breaks

| Issue | Fallback |
|-------|----------|
| Backend down | Continue — UI uses local mocks |
| Grok fails | Already on Policy summary fallback |
| Wrong persona | `/demo/scenarios` → reset to commuter |
| Page stuck loading | Hard refresh; use query-param routes (`?outcome=`) |

---

## Q&A prep

- **Does AI decide payments?** No. Settlement is rule-based in `backend/app/domain/`.
- **Real Rapido integration?** Prototype only — Rapido-inspired UX.
- **Production path?** Postgres, real payments, auth — domain rules carry forward.
