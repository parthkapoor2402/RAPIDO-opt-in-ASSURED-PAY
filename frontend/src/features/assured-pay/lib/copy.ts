export const ASSURED_PAY_TAGLINE = "Upfront max · smoother checkout";

export const TRUST_COPY = {
  riderLead:
    "Lock in your approved max at booking and enjoy smoother digital checkout at drop-off.",
  captainFairness:
    "Captain gets paid instantly up to your approved max — a smoother finish for both of you.",
  optInConfirm:
    "Assured Pay is on. Approved max locked · smoother checkout at drop-off.",
  fareTransparency:
    "Your approved max includes a small buffer for valid fare changes like waiting time or route updates.",
} as const;

export const OPT_IN_SHEET = {
  title: "Add Assured Pay",
  subtitle: "Know your max upfront. Smoother digital checkout at drop-off.",
  enableTitle: "Use Assured Pay",
  enableSubtitle: "Approved max upfront · captain paid instantly",
  standardTitle: "Standard checkout",
  standardSubtitle: "Pay at trip end — your usual Rapido ride",
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
