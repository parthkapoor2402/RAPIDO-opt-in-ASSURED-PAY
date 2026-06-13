# Rapido Reference Notes — Native Feature Extension

**Version:** 0.2  
**Source:** Screenshots in `references/rapido/` (local, gitignored)  
**Product stance:** Assured Pay is a **new feature inside the existing Rapido app**, not a separate product skin.

---

## 1. Reference inventory (inspected)

| File | Screen | Reuse for Assured Pay |
|------|--------|------------------------|
| `01-splash.png` | Brand splash (yellow field + wordmark) | **Tone only** — confirms primary yellow + black type; not built in MVP |
| `02-language-sheet.png` | Bottom sheet over dimmed map | **Direct reuse** — opt-in consent sheet structure |
| `03-home.png` | Search, recents, service grid, bottom nav | **Partial reuse** — entry hierarchy + nav chrome for `/home` → booking |
| `04-booking-fare.png` | Map + fare list + payment row + sticky CTA | **Direct reuse** — booking, fare placement, CTA stack |
| `05-pickup-confirm.png` | Map-dominant + address card + confirm CTA | **Direct reuse** — live ride + residual confirmation layering |

*In-ride tracking, trip-end receipt, captain wallet, and support queue are **not** in the reference folder — extend Rapido card/sheet patterns from R4/R5.*

---

## 2. Patterns to reuse directly

These should match Rapido closely so the feature feels native.

| Pattern | Rapido behavior (from references) | Apply to |
|---------|-----------------------------------|----------|
| **Primary CTA** | Full-width yellow pill, black bold label (“Book Bike”) | Booking, opt-in enable, confirm pickup, pay residual |
| **Map + bottom sheet** | Map ~35–45% (booking) or ~65–70% (pickup); white sheet with grabber + `rounded-t-3xl` | Booking, live ride |
| **Ride option row** | Icon · name + capacity · ETA/drop subtitle · **₹ price right** · navy border when selected | Booking (bike row; MVP bike-first) |
| **Sticky footer stack** | Optional promo strip → **Cash ▾ \| Offers ▾** split row → yellow CTA | Booking (Cash \| Assured Pay) |
| **Floating map controls** | Circular white back button; pill “Add stop” on map | Booking map chrome |
| **Bottom sheet modal** | Dimmed map behind; grabber; title; selectable cards; bottom CTA (disabled until choice) | Assured Pay opt-in |
| **Pickup confirm card** | Instruction line + **green-bordered address block** + yellow confirm | Live ride status; residual due summary |
| **Bottom navigation** | 4-tab persistent bar; active tab black/bold | Rider shell (Ride · Live · Profile · Demo) |
| **Typography hierarchy** | Bold black titles; grey xs subtitles; tabular ₹ amounts right-aligned | All fare surfaces |
| **Information density** | One primary action per screen; fare comparison scannable without scroll | Booking, live, completion |
| **Light blue recents tint** | `#EBF5FB`-style block under search | Home recents (entry to booking) |

---

## 3. Where Assured Pay introduces **new** UI

Rapido has no equivalent — design must **inherit Rapido components** but add feature-specific content.

| New surface | Rapido anchor | Assured Pay addition |
|-------------|---------------|----------------------|
| **Protection row** | “Offers ▾” slot in payment footer | **“Assured Pay ▾”** — toggle/link to opt-in sheet |
| **Opt-in sheet** | Language selection sheet (R2) | Coverage bullets, **F / M / buffer** breakdown, reason-code link, “Enable Assured Pay” CTA |
| **Fare zone chip** | No direct equivalent | In-ride chip: *Within estimate · In buffer · Above max* |
| **Fare update banner** | Waiting/time subtitles on fare row | Yellow-tint strip: `+₹4 · 3 min waiting` with reason code |
| **Trip receipt block** | Trip end (inferred) | **F → A → charged** + captain-paid trust line |
| **Residual due screen** | Pickup address card (R5) | Same card pattern; **remaining ₹ due** + reason; “Pay ₹3 now” CTA |
| **Captain payout badge** | Wallet credits (inferred) | **“Assured”** badge on protected ride credits |
| **Support case row** | No reference | Queue card: ride id, delta above max, missing reason code, “Open case” |

**Copy rule:** Use Rapido-calibrated voice (short, transactional, ₹-first). Feature name **“Assured Pay”** is the only new branded term.

---

## 4. Screen-by-screen direction

### Booking (`/booking`)
- **Reuse:** R4 layout end-to-end — map, sheet, ride list, payment row, `Book Bike` CTA.
- **Insert:** Assured Pay row in footer; optional promo strip linking to opt-in; F visible on bike row, M on protection row.
- **Skip:** Full home service grid; extra vehicle categories beyond bike for MVP.

### Assured Pay opt-in (`/booking/assured-pay`)
- **Reuse:** R2 sheet — grabber, title, selectable-style list (coverage as check rows), disabled-then-enabled CTA pattern.
- **Insert:** Fare summary card (F, M, buffer); valid change reasons; captain payout trust line.

### Live ride (`/ride/live`)
- **Reuse:** R5 map dominance + instructional header + bordered status card.
- **Insert:** Zone chip + fare update banner above timeline; protection active chip.

### Completion (`/ride/completed`)
- **Reuse:** Rapido receipt density — compact lines, single hero message, one secondary action.
- **Insert:** Assured Pay receipt lines + “Captain paid · Instant” trust banner.

### Residual due (`/ride/residual-due`)
- **Reuse:** R5 address-card visual (green border) for amount breakdown.
- **Insert:** Verified reason + sticky yellow pay CTA.

### Captain payout (`/captain/payout`)
- **Reuse:** Balance hero + recent transaction list (wallet pattern).
- **Insert:** Assured badge on protected credits.

### Support review (`/support/review`)
- **Reuse:** White card list + status chip (warning).
- **Insert:** Case metadata for fare-over-max disputes.

---

## 5. Explicit non-goals

- Rebuild splash, language onboarding, travel tab, parcel/cab grids, or pass promos unrelated to Assured Pay.
- Introduce a non-Rapido color system (amber/zinc standalone brand).
- Replace Rapido bottom nav with a generic admin-style tab bar on rider flows.

---

## 6. Related documents

- `DESIGN_RULES.md` — Rapido-native tokens and component rules
- `SCREEN_SPECS.md` — wire specs aligned to this direction
- `references/rapido/MANIFEST.md` — local file index
