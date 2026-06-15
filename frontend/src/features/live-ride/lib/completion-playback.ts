import { formatInr } from "@/features/assured-pay/lib/fare";
import {
  getLiveRideCompletionFare,
  LIVE_RIDE_COMPLETION_STEP_INDEX,
} from "@/features/assured-pay/lib/scenario-fare-engine";

import type { RideCompletionPlayback } from "@/features/live-ride/types";

export { LIVE_RIDE_COMPLETION_STEP_INDEX as COMPLETION_STEP_INDEX };

export type ExceedsReviewCompletionVariant = "valid_overage" | "suspicious_overage";

export function buildRideCompletionPlayback(
  scenarioId: string,
  estimateF: number,
  buffer: number,
  exceedsVariant: ExceedsReviewCompletionVariant = "valid_overage",
): RideCompletionPlayback {
  const M = estimateF + buffer;
  const actualA = getLiveRideCompletionFare(scenarioId, estimateF, buffer);
  const residual = Math.max(0, actualA - M);
  const charged = formatInr(
    scenarioId === "exceeds_review" ? M : scenarioId === "buffer_zone" ? actualA : estimateF,
  );
  const residualFormatted = formatInr(residual);

  switch (scenarioId) {
    case "within_max":
      return {
        title: "Ride complete",
        headline: "Charged at your estimate",
        chargeSummary: charged,
        paymentStatus: "Fare unchanged",
        nextStep: "Receipt saved — you're done.",
      };
    case "buffer_zone":
      return {
        title: "Ride complete",
        headline: "Within what you approved",
        chargeSummary: charged,
        paymentStatus: "Fare went up · still in range",
        reasonHint: "Waiting · route adjustment",
        nextStep: "No follow-up needed.",
      };
    case "exceeds_review":
      if (exceedsVariant === "suspicious_overage") {
        return {
          title: "Ride complete",
          headline: "Approved amount secured",
          chargeSummary: charged,
          paymentStatus: `${residualFormatted} under review`,
          nextStep: "We'll message you before any extra charge.",
          statusBadge: "Under review",
          variant: "suspicious_overage",
        };
      }
      return {
        title: "Ride complete",
        headline: "Charged up to your max",
        chargeSummary: charged,
        paymentStatus: `${residualFormatted} pending`,
        nextStep: "We'll confirm the small extra after a quick check.",
        statusBadge: "Pending",
        variant: "valid_overage",
      };
    default:
      return {
        title: "Ride complete",
        headline: "Charged at your estimate",
        chargeSummary: formatInr(estimateF),
        paymentStatus: "Fare unchanged",
        nextStep: "Receipt saved — you're done.",
      };
  }
}

export function isCompletionStep(stepIndex: number): boolean {
  return stepIndex === LIVE_RIDE_COMPLETION_STEP_INDEX;
}
