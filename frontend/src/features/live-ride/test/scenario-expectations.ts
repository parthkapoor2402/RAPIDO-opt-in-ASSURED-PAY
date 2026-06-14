import type { TrustState } from "@/features/live-ride/types";

export interface LiveRideScenarioExpectation {
  id: string;
  /** Step index used for full-scenario assertions (usually last step). */
  finalStepIndex: number;
  trustState: TrustState;
  trustLabel: string;
  trustHelper: RegExp;
  timelineTitle: string;
  timelineSubtitle: RegExp;
  currentFare: string;
  showReasonEmpty: boolean;
  showReasonPill: boolean;
  footerPattern: RegExp | null;
}

/** Canonical expectations for demo playback scenarios at their storytelling step. */
export const LIVE_RIDE_SCENARIO_EXPECTATIONS: LiveRideScenarioExpectation[] = [
  {
    id: "within_max",
    finalStepIndex: 2,
    trustState: "within_approved_max",
    trustLabel: "On track",
    trustHelper: /booking estimate/i,
    timelineTitle: "Approaching drop",
    timelineSubtitle: /within your approved max/i,
    currentFare: "₹42",
    showReasonEmpty: true,
    showReasonPill: false,
    footerPattern: null,
  },
  {
    id: "buffer_zone",
    finalStepIndex: 2,
    trustState: "entered_buffer_zone",
    trustLabel: "Still covered",
    trustHelper: /valid fare update/i,
    timelineTitle: "Route adjustment applied",
    timelineSubtitle: /still covered under/i,
    currentFare: "₹48",
    showReasonEmpty: false,
    showReasonPill: true,
    footerPattern: /headroom before your max/i,
  },
  {
    id: "exceeds_review",
    finalStepIndex: 2,
    trustState: "review_required",
    trustLabel: "Review first",
    trustHelper: /not billed automatically/i,
    timelineTitle: "Fare above max",
    timelineSubtitle: /review before any extra charge/i,
    currentFare: "₹52",
    showReasonEmpty: false,
    showReasonPill: false,
    footerPattern: /not charged yet/i,
  },
];

export function getScenarioExpectation(id: string): LiveRideScenarioExpectation {
  const found = LIVE_RIDE_SCENARIO_EXPECTATIONS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown scenario expectation: ${id}`);
  }
  return found;
}
