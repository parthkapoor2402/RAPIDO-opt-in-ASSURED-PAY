import type { FareState, TrustState } from "@/features/live-ride/types";
import type { StatusChipTone } from "@/components/ui/StatusChip";

export function mapFareStateToTrustState(
  fareState: FareState,
  requiresReviewIfEnded: boolean,
): TrustState {
  if (requiresReviewIfEnded || fareState === "exceeds_max") {
    return "review_required";
  }
  if (fareState === "in_buffer") {
    return "entered_buffer_zone";
  }
  return "within_approved_max";
}

export function getTrustStateLabel(trustState: TrustState): string {
  switch (trustState) {
    case "within_approved_max":
      return "Within approved max";
    case "entered_buffer_zone":
      return "Entered buffer zone";
    case "review_required":
      return "Review required";
    default:
      return trustState;
  }
}

export function getTrustStateTone(trustState: TrustState): StatusChipTone {
  switch (trustState) {
    case "within_approved_max":
      return "success";
    case "entered_buffer_zone":
      return "warning";
    case "review_required":
      return "danger";
    default:
      return "neutral";
  }
}

export function getTrustStateHelper(trustState: TrustState): string {
  switch (trustState) {
    case "within_approved_max":
      return "Your fare is still within what you approved at booking.";
    case "entered_buffer_zone":
      return "A valid change moved the fare into your buffer — still covered under max.";
    case "review_required":
      return "Fare is above your approved max or needs verification if the ride ended now.";
    default:
      return "";
  }
}
