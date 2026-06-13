export const RECOVERY_COPY = {
  bannerTitle: "You have a remaining balance from your last ride",
  bannerSubline: "Review the fare breakdown and pay when you're ready — no auto-charge on app open.",
  graceReminder: (days: number) =>
    days > 0
      ? `${days} days left in your grace period before Assured Pay stays off longer.`
      : "Grace period ended — clear dues to restore Assured Pay.",
  repeatUnpaid:
    "Multiple unpaid balances remain. Standard bike booking still works; Assured Pay returns after you clear dues.",
  payCta: (amount: number) => `Pay ₹${amount} now`,
  resolveCta: "Review fare breakdown",
  disputeCta: "Something looks wrong?",
  disputeHelper:
    "Tell us what seems off. We'll review within 24 hours — your captain was already paid per policy.",
  disputeSuccess: "Dispute submitted. Our team will review and update you.",
  paySuccess: "Thanks — your balance is cleared. Assured Pay is available again.",
  assuredPayBlocked: "Assured Pay is paused while a balance is open. Standard rides are still available.",
} as const;

export const RESTRICTION_MESSAGES: Record<string, string> = {
  none: "",
  assured_pay_blocked: RECOVERY_COPY.assuredPayBlocked,
  repeat_unpaid_blocked: RECOVERY_COPY.repeatUnpaid,
};
