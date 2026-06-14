export const ASSURED_PAY_TAGLINE = "No-payment-stress ride completion";

export const TRUST_COPY = {
  riderLead:
    "Finish your ride without last-mile checkout stress — even if your phone battery is low or network drops at drop-off.",
  captainFairness:
    "Your captain gets paid instantly up to the approved max. You are never asked to pay cash because digital payment failed.",
  optInConfirm:
    "Captain payout guaranteed. You won't need cash if payment hiccups at drop-off.",
  fareTransparency:
    "Your approved max includes a small buffer for valid fare changes like waiting time or route updates.",
} as const;

export const COVERAGE = {
  covers: [
    "Weak network at drop-off",
    "Phone battery dies before payment",
    "Digital payment fails at trip end",
    "Captain paid instantly up to approved max",
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
