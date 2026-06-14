import { formatInr } from "@/features/settlement/lib/format";
import type { CompletionScenarioId } from "@/features/settlement/types";

export interface CompletionAmounts {
  charged: number;
  residual?: number | null;
  underReview?: number | null;
}

export interface CompletionCopy {
  title: string;
  subtitle: string;
  statusChip: string;
  statusTone: "success" | "brand" | "warning" | "neutral";
  heroIcon: string;
  /** Structured rider snapshot — avoids repeating hero text. */
  chargedNow: string;
  balanceStatus: string;
  captainStatus: string;
  nextStep: string;
  showPayCta: boolean;
  payCtaLabel: string | null;
  secondaryCtaLabel: string;
  captainPayoutLabel: string;
  summaryDueChip: string | null;
}

export const CAPTAIN_PAYOUT_LABELS = {
  paidInFull: "Paid in full",
  paidByAssurance: "Paid in full by assurance",
  pendingReview: "Payout pending review",
} as const;

export function getCaptainPayoutLabel(scenario: CompletionScenarioId): string {
  switch (scenario) {
    case "valid_overage":
      return CAPTAIN_PAYOUT_LABELS.paidByAssurance;
    case "suspicious_overage":
      return CAPTAIN_PAYOUT_LABELS.pendingReview;
    default:
      return CAPTAIN_PAYOUT_LABELS.paidInFull;
  }
}

export function getCompletionCopy(
  scenario: CompletionScenarioId,
  amounts: CompletionAmounts,
): CompletionCopy {
  const charged = formatInr(amounts.charged);
  const residual =
    amounts.residual != null && amounts.residual > 0 ? formatInr(amounts.residual) : null;
  const underReview =
    amounts.underReview != null && amounts.underReview > 0
      ? formatInr(amounts.underReview)
      : null;

  switch (scenario) {
    case "within_max":
      return {
        title: "Ride completed",
        subtitle: `${charged} charged · you're all set`,
        statusChip: "On track",
        statusTone: "success",
        heroIcon: "✓",
        chargedNow: `${charged} at trip end`,
        balanceStatus: "Nothing due",
        captainStatus: CAPTAIN_PAYOUT_LABELS.paidInFull,
        nextStep: "Receipt saved — book again anytime.",
        showPayCta: false,
        payCtaLabel: null,
        secondaryCtaLabel: "View ride history",
        captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidInFull,
        summaryDueChip: null,
      };
    case "buffer_within_max":
      return {
        title: "Ride completed",
        subtitle: `${charged} charged · within your max`,
        statusChip: "Still covered",
        statusTone: "brand",
        heroIcon: "✓",
        chargedNow: `${charged} at trip end`,
        balanceStatus: "Nothing due",
        captainStatus: CAPTAIN_PAYOUT_LABELS.paidInFull,
        nextStep: "Valid ride update included under the max you approved.",
        showPayCta: false,
        payCtaLabel: null,
        secondaryCtaLabel: "View ride history",
        captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidInFull,
        summaryDueChip: null,
      };
    case "valid_overage":
      return {
        title: "Ride completed",
        subtitle: `${charged} charged · ${residual} balance left`,
        statusChip: residual ? `${residual} due` : "Balance due",
        statusTone: "warning",
        heroIcon: "✓",
        chargedNow: `${charged} (your approved max)`,
        balanceStatus: residual ? `${residual} verified waiting charge` : "Small verified balance",
        captainStatus: CAPTAIN_PAYOUT_LABELS.paidByAssurance,
        nextStep: residual
          ? `Pay ${residual} when ready — standard rides stay open.`
          : "Pay the verified balance when ready.",
        showPayCta: true,
        payCtaLabel: residual ? `Pay ${residual}` : "Pay balance",
        secondaryCtaLabel: "View ride history",
        captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidByAssurance,
        summaryDueChip: residual ? `${residual} due` : "Balance due",
      };
    case "suspicious_overage":
      return {
        title: "Trip complete",
        subtitle: `${charged} charged · excess under review`,
        statusChip: "Under review",
        statusTone: "neutral",
        heroIcon: "!",
        chargedNow: `${charged} (your approved max)`,
        balanceStatus: underReview
          ? `${underReview} not collected — under review`
          : "Excess fare not collected yet",
        captainStatus: CAPTAIN_PAYOUT_LABELS.pendingReview,
        nextStep: "We'll message you before any extra charge.",
        showPayCta: false,
        payCtaLabel: null,
        secondaryCtaLabel: "Got it",
        captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.pendingReview,
        summaryDueChip: "Under review",
      };
    default:
      return getCompletionCopy("within_max", amounts);
  }
}
