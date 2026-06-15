export const ASSURED_PAY_TAGLINE = "Upfront clarity · smoother checkout";

export const TRUST_COPY = {
  riderLead:
    "Pay your trip fare with upfront clarity and smoother digital checkout at drop-off.",
  captainFairness:
    "Captain gets paid instantly up to your approved max — a smoother finish for both of you.",
  optInConfirm:
    "Assured Pay is on · smoother checkout at drop-off.",
  fareTransparency:
    "Includes a small buffer for valid waiting, route, or toll updates during the ride.",
  fareClarity:
    "You pay the final fare at trip end — not the max by default.",
  primaryFareHint: "Your fare if nothing changes during the ride",
  conditionalSectionTitle: "Only if fare changes during ride",
  approvedMaxHint:
    "Upper limit you approve upfront — applies only when valid fare updates occur.",
} as const;

/** Ride option row — fare first; no approved max on the card. */
export const BOOKING_RIDE_CARD = {
  assuredPayHint: "Smoother checkout available",
  priceCaption: "fare",
} as const;

export const BOOKING_MODULE = {
  label: "Assured Pay",
  headline: "Smoother checkout at drop-off",
  helper:
    "Pay your trip fare — not the max. Lock in upfront clarity and finish digitally with less friction.",
  incentiveFreeTrial: "First ride free · no extra charge to try",
  ctaFreeTrial: "Try free · add Assured Pay",
  ctaDefault: "Add Assured Pay",
  ctaSubline: "Same fare · easier checkout at drop-off",
  fareDetailsSummary: "View fare limit details",
} as const;

export function getAssuredPayCtaLabel(freeTrialAvailable: boolean): string {
  return freeTrialAvailable ? BOOKING_MODULE.ctaFreeTrial : BOOKING_MODULE.ctaDefault;
}

export const OPT_IN_SHEET = {
  title: "Add Assured Pay",
  subtitle: "Pay your trip fare with upfront clarity · smoother checkout at drop-off.",
  enableTitle: "Use Assured Pay",
  enableSubtitle: "Approve a fare limit upfront · captain paid instantly",
  standardTitle: "Standard checkout",
  standardSubtitle: "Pay at trip end — your usual Rapido ride",
  fareClarity: TRUST_COPY.fareClarity,
} as const;

export const COVERAGE = {
  covers: [
    "Approved max set upfront at booking",
    "Smoother digital checkout at drop-off",
    "Captain paid instantly up to approved max",
    "Clear cap when valid waiting or route updates apply",
  ],
  doesNotCover: [
    "Cash-only rides without a saved payment method",
    "Fare increases above your approved max without a valid reason",
    "Disputes on rides with open residual due",
    "Booking without opting in to an approved max",
  ],
} as const;

export const VALID_REASON_LABELS = [
  "Waiting time",
  "Route change",
  "Toll",
  "Pickup correction",
] as const;

export const BLOCK_REASON_MESSAGES: Record<string, string> = {
  open_residual: "Clear your remaining due to turn Assured Pay back on.",
  payment_instrument_required: "Add UPI or card to use Assured Pay.",
};
