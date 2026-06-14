import type { FareState, TrustState } from "@/features/live-ride/types";
import type { StatusChipTone } from "@/components/ui/StatusChip";
import { getTrustStateCopy } from "@/features/live-ride/lib/copy";

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
  return getTrustStateCopy(trustState).label;
}

export function getTrustStateTone(trustState: TrustState): StatusChipTone {
  switch (trustState) {
    case "within_approved_max":
      return "success";
    case "entered_buffer_zone":
      return "brand";
    case "review_required":
      return "neutral";
    default:
      return "neutral";
  }
}

