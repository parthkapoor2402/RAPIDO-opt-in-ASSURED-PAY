import type { CompletionScenarioId } from "@/features/settlement/types";
import { CAPTAIN_PAYOUT_LABELS } from "@/features/settlement/lib/completion-copy";

export interface CompletionScenarioExpectation {
  id: CompletionScenarioId;
  statusChip: string;
  finalFare: string;
  chargedNow: string;
  residualDue: string | null;
  underReview: string | null;
  captainPayout: string;
  captainPayoutLabel: string;
  showPayCta: boolean;
  payCtaLabel: string | null;
}

export const COMPLETION_SCENARIO_EXPECTATIONS: CompletionScenarioExpectation[] = [
  {
    id: "within_max",
    statusChip: "On track",
    finalFare: "₹42",
    chargedNow: "₹42",
    residualDue: null,
    underReview: null,
    captainPayout: "₹42",
    captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidInFull,
    showPayCta: false,
    payCtaLabel: null,
  },
  {
    id: "buffer_within_max",
    statusChip: "Still covered",
    finalFare: "₹48",
    chargedNow: "₹48",
    residualDue: null,
    underReview: null,
    captainPayout: "₹48",
    captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidInFull,
    showPayCta: false,
    payCtaLabel: null,
  },
  {
    id: "valid_overage",
    statusChip: "₹3 due",
    finalFare: "₹52",
    chargedNow: "₹49",
    residualDue: "₹3",
    underReview: null,
    captainPayout: "₹52",
    captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.paidByAssurance,
    showPayCta: true,
    payCtaLabel: "Pay ₹3",
  },
  {
    id: "suspicious_overage",
    statusChip: "Under review",
    finalFare: "₹80",
    chargedNow: "₹49",
    residualDue: null,
    underReview: "₹31",
    captainPayout: "₹80",
    captainPayoutLabel: CAPTAIN_PAYOUT_LABELS.pendingReview,
    showPayCta: false,
    payCtaLabel: null,
  },
];

export function getCompletionExpectation(id: CompletionScenarioId): CompletionScenarioExpectation {
  const found = COMPLETION_SCENARIO_EXPECTATIONS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown completion expectation: ${id}`);
  }
  return found;
}
