import type { TrustState } from "@/features/live-ride/types";
import { formatInr } from "@/features/assured-pay/lib/fare";

export const LIVE_RIDE_PAGE = {
  title: "On trip",
  subtitle: "Live fare vs your approved max",
  timelineHeading: "What's happening now",
} as const;

interface TrustStateCopy {
  label: string;
  helper: string;
  surfaceClass: string;
}

export function getTrustStateCopy(trustState: TrustState): TrustStateCopy {
  switch (trustState) {
    case "within_approved_max":
      return {
        label: "On track",
        helper: "At your booking estimate — nothing extra so far.",
        surfaceClass: "border-success-700/15 bg-success-50/40",
      };
    case "entered_buffer_zone":
      return {
        label: "Still covered",
        helper: "Valid fare update — still within the max you approved.",
        surfaceClass: "border-brand-600/20 bg-brand-50/60",
      };
    case "review_required":
      return {
        label: "Review first",
        helper: "Above your max. We verify before any extra charge — not billed automatically.",
        surfaceClass: "border-rapido-navy/15 bg-rapido-tint",
      };
    default:
      return { label: trustState, helper: "", surfaceClass: "border-surface-200 bg-white" };
  }
}

/** Only shown when there is no fare-change update on screen (within-max calm state). */
export function getReasonUpdatesEmptyCopy(trustState: TrustState): string | null {
  if (trustState === "within_approved_max") {
    return "Riding at estimate — no fare updates yet.";
  }
  return null;
}

/** Meter footer — only when it adds information the chip does not already say. */
export function getFareProgressionFooter(
  trustState: TrustState,
  currentFare: number,
  approvedM: number,
  residualDueIfEndedNow: number,
): string | null {
  switch (trustState) {
    case "within_approved_max":
      return null;
    case "entered_buffer_zone": {
      const headroom = approvedM - currentFare;
      return headroom > 0 ? `${formatInr(headroom)} headroom before your max` : null;
    }
    case "review_required":
      return residualDueIfEndedNow > 0
        ? `${formatInr(residualDueIfEndedNow)} over max · held for review, not charged yet`
        : "Held for review before any extra charge";
    default:
      return null;
  }
}

export function getLatestReasonSummary(
  deltaInr: number,
  reasonLabel: string,
): string {
  const sign = deltaInr >= 0 ? "+" : "";
  return `${sign}${formatInr(Math.abs(deltaInr))} · ${reasonLabel}`;
}
