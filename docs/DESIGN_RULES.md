# Assured Pay — Design Rules (Rapido-native extension)

**Version:** 0.2  
**Status:** Active  
**Informed by:** `RAPIDO_REFERENCE_NOTES.md`

---

## 1. Design intent

Assured Pay must feel like a **native Rapido feature**: same yellow CTAs, map+sheet rhythm, fare row anatomy, and bottom navigation — with new surfaces only where payment protection requires them.

**Positioning (in-app copy):** *Assured Pay — finish your ride without payment stress*

---

## 2. Rapido visual system (reuse)

### Color

| Token | Hex (approx.) | Use |
|-------|---------------|-----|
| `rapido-yellow` | `#FFCD00` | Primary CTA background |
| `rapido-black` | `#000000` | CTA label, active nav, headlines |
| `rapido-navy` | `#1D4ED8` | Selected ride option border |
| `rapido-green` | `#16A34A` | Pickup pin, confirm card border |
| `rapido-tint` | `#EBF5FB` | Recents / subtle section backgrounds |
| `rapido-map` | `#E8E6E1` | Map placeholder base |
| `rapido-grey` | `#6B7280` | Subtitles, meta text |
| `rapido-disabled` | `#CBD5E1` | Disabled CTA |

Tailwind aliases: `brand-*` maps to Rapido yellow for primary actions.

### Typography

- Sans-serif stack (Inter / system UI)
- **CTA:** semibold/black on yellow
- **Fare amounts:** bold, tabular nums, right-aligned
- **Meta:** 12px grey (`text-xs text-rapido-grey`)

### Shape & motion

- Sheet top radius: `rounded-t-3xl`
- Primary CTA: `rounded-2xl` full width, min-height 48px
- Map floating buttons: `rounded-full` white shadow
- Cards: `rounded-2xl`, 1px `#E5E7EB` border

---

## 3. Layout patterns (from Rapido references)

### Pattern A — Booking fare sheet (R4)

```
Map (~40vh) + back / add-stop controls
BottomSheet: ride rows → promo (optional) → Cash | Assured Pay → Book Bike
BottomNav
```

### Pattern B — Modal consent sheet (R2)

```
Dimmed map/context
BottomSheet: grabber → title → option cards → Select/Enable CTA
```

### Pattern C — Pickup / status confirm (R5)

```
Map (~65vh)
Sheet: instruction + green-bordered card + yellow Confirm/Pay CTA
```

### Pattern D — Receipt / wallet list

```
Header + hero amount/card
Stacked white rows with dividers
```

---

## 4. Component rules

| Component | Rapido alignment |
|-----------|------------------|
| `CTAButton` primary | Yellow bg + black text |
| `RideOptionRow` | Navy border when selected; price right |
| `PaymentMethodRow` | 50/50 split like Cash \| Offers |
| `BottomSheetPanel` | White, grabber, overlaps map |
| `MapHeroPlaceholder` | Map-tone background, floating controls |
| `StickyActionBar` | Sits above bottom nav; white bg |
| `RapidoPromoStrip` | Light yellow banner row (Assured Pay entry) |
| `ConfirmAddressCard` | Green border, two-line address/amount |
| `TrustBanner` | Subtle brand-tint strip for captain-paid cues |

---

## 5. Assured Pay-specific hierarchy

1. **F** (estimate) on booking row before opt-in
2. **M** (max) on protection row / opt-in sheet before enable CTA
3. **A** (actual) on completion receipt with delta if A ≠ F
4. Buffer always visible as part of M

---

## 6. Scope boundaries

**Build:** booking, opt-in, live ride, completion, residual, captain payout, support review (+ minimal home entry).

**Do not build:** full service catalog, travel, splash, language onboarding, unrelated promos.

---

## 7. Demo chrome

- Phase badges removed from user screens
- Scenario switcher on `/demo/scenarios` only
- Header shows **rapido** wordmark on rider flows

---

## 8. Related documents

- `RAPIDO_REFERENCE_NOTES.md`
- `SCREEN_SPECS.md`
