# Assured Pay — Screen Specs (Rapido-native extension)

**Version:** 0.2  
**Fidelity:** Low–mid wireframes aligned to Rapido references  
**Visual system:** Rapido yellow CTAs, map+sheet layout — see `DESIGN_RULES.md`

---

## Spec notation

- `[ ]` placeholder block  
- `→` navigation  
- **Bold** = primary focus element

---

## 1. Booking (`/booking`)

**Goal:** Choose bike ride, see fare, proceed to payment protection or book.

```
┌──────────────────────────────────────┐
│ ← Back          Assured Pay    [Rider]│  TopBar
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │      [ Map placeholder ]         │ │  MapHero 38vh
│ │      · pickup pin                │ │
│ │      · route line (abstract)     │ │
│ └──────────────────────────────────┘ │
│ ╭──────────────────────────────────╮ │
│ │ Choose your ride                 │ │  BottomSheet
│ │ Koramangala → Indiranagar        │ │  route subtitle
│ │──────────────────────────────────│ │
│ │ [bike icon] Bike · 1    ₹42  ⓘ  │ │  selected row
│ │            ~4 min · drop ~8:24 │ │
│ │──────────────────────────────────│ │
│ │ Fare estimate (F)          ₹42   │ │
│ │ With protection (M)        ₹49   │ │  link → opt-in
│ │──────────────────────────────────│ │
│ │ Trust: Finish without checkout   │ │
│ │ stress at drop-off               │ │
│ ╰──────────────────────────────────╯ │
│ ┌──────────────────────────────────┐ │
│ │ UPI ······▾    Protection ······▾ │ │  StickyActionBar
│ │ [ Continue to book ]             │ │
│ └──────────────────────────────────┘ │
│ Home · Book · Live · Demo            │  BottomNav
└──────────────────────────────────────┘
```

**Interactions (future):** ⓘ → fare info; Protection → `/booking/assured-pay`

---

## 2. Assured Pay opt-in (`/booking/assured-pay`)

**Goal:** Explicit consent with F, M, coverage, captain fairness.

```
┌──────────────────────────────────────┐
│ ← Back                               │
├──────────────────────────────────────┤
│ ╭──────────────────────────────────╮ │
│ │ Finish without payment stress    │ │  H1
│ │                                  │ │
│ │ ✓ Weak network at drop-off        │ │  coverage bullets
│ │ ✓ Phone battery dies              │ │
│ │ ✓ Payment fails at trip end       │ │
│ │ ✓ Captain paid instantly          │ │
│ │──────────────────────────────────│ │
│ │ Fare estimate              ₹42   │ │
│ │ Approved max (F + buffer)    ₹49   │ │  FareSummaryCard
│ │ Buffer included               ₹7   │ │
│ │──────────────────────────────────│ │
│ │ Valid changes: waiting · route   │ │
│ │ · tolls → [Learn more]           │ │
│ ╰──────────────────────────────────╯ │
│ ┌──────────────────────────────────┐ │
│ │ UPI ······▾                      │ │
│ │ [ Enable payment protection ]    │ │  primary CTA
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**States:** CTA disabled until payment method selected (future).

---

## 3. Live ride (`/ride/live`)

**Goal:** Glanceable fare zone + reason-coded updates.

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │      [ Map placeholder ]         │ │  MapHero 45vh
│ │      captain marker · route      │ │
│ └──────────────────────────────────┘ │
│ ╭──────────────────────────────────╮ │
│ │ On your way                      │ │
│ │ [ Protection active ]            │ │  StatusChip brand
│ │ [ Still within approved max ]    │ │  zone chip success/warn
│ │──────────────────────────────────│ │
│ │ Current fare               ₹46   │ │
│ │ Approved max               ₹49   │ │
│ │──────────────────────────────────│ │
│ │ ⚠ Fare +₹4 · 3 min waiting       │ │  FareUpdateBanner
│ ╰──────────────────────────────────╯ │
│ ● Pickup complete        8:12        │  Timeline
│ ● Waiting at destination 8:24       │
└──────────────────────────────────────┘
```

**Zone states:** within estimate | in buffer | exceeds max (chip color changes).

---

## 4. Completion success (`/ride/completed`)

**Goal:** Confirm frictionless end + receipt trust.

```
┌──────────────────────────────────────┐
│         [ ✓ success icon ]           │
│         You're all set               │  H1 centered
│    Ride completed · payment OK       │
├──────────────────────────────────────┤
│ ╭──────────────────────────────────╮ │
│ │ Trip receipt                     │ │
│ │ Estimate (F)               ₹42   │ │
│ │ Final fare (A)             ₹46   │ │
│ │ Charged                    ₹46   │ │
│ │ Waiting charge              ₹4   │ │  reason line
│ │──────────────────────────────────│ │
│ │ Captain paid              Instant│ │  TrustBanner
│ ╰──────────────────────────────────╯ │
│ [ View ride history ]                │  secondary
└──────────────────────────────────────┘
```

---

## 5. Residual due (`/ride/residual-due`)

**Goal:** Clear small verified due + pay action.

```
┌──────────────────────────────────────┐
│ Amount still due                     │  H1
│ Verified waiting charge above max    │
├──────────────────────────────────────┤
│ ╭──────────────────────────────────╮ │
│ │ Captured at trip end       ₹49   │ │
│ │ Remaining due               ₹3   │ │  emphasis
│ │ Reason: waiting time             │ │
│ ╰──────────────────────────────────╯ │
│ Trust: Assured Pay stays available   │
│ after you clear this.                │
├──────────────────────────────────────┤
│ [ Pay ₹3 now ]                       │  StickyActionBar
└──────────────────────────────────────┘
```

---

## 6. Captain payout (`/captain/payout`)

**Goal:** Instant earnings visibility.

```
┌──────────────────────────────────────┐
│ Earnings                    [Captain]│
├──────────────────────────────────────┤
│ ╭──────────────────────────────────╮ │
│ │ Available balance        ₹1,248  │ │  hero amount
│ ╰──────────────────────────────────╯ │
│ Recent credits                       │
│ ● Ride #1042  [Protected]  +₹46     │
│   Koramangala → Indiranagar · 2m ago│
│ ● Ride #1041  [Protected]  +₹38     │
│   · 1 hr ago                         │
└──────────────────────────────────────┘
```

---

## 7. Support / dispute (`/support/review`)

**Goal:** Ops queue for suspicious overages.

```
┌──────────────────────────────────────┐
│ Cases to review             [Ops]    │
├──────────────────────────────────────┤
│ [ 1 pending ]                        │  StatusChip warning
│ ╭──────────────────────────────────╮ │
│ │ Ride #1039 · +₹28 above max      │ │  case row (stub)
│ │ No reason code · Bengaluru       │ │
│ │ [ Open case ]                    │ │
│ ╰──────────────────────────────────╯ │
│ ╭──────────────────────────────────╮ │
│ │ Empty queue state when none      │ │
│ ╰──────────────────────────────────╯ │
└──────────────────────────────────────┘
```

---

## 8. Responsive notes

- Target width: 375px (`max-w-md` centered)
- StickyActionBar sits above BottomNav (pb-24 on main)
- Map hero min-height: 32vh–45vh by screen

---

## 9. Related documents

- `DESIGN_RULES.md`
- `RAPIDO_REFERENCE_NOTES.md`
- `USER_JOURNEYS.md`
