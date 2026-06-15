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

/** Step 4 (index 3) ride-completed playback expectations — bike demo fares. */
export const LIVE_RIDE_COMPLETION_STEP_EXPECTATIONS = [
  {
    id: "within_max",
    stepIndex: 3,
    headline: "Charged at your estimate",
    chargeSummary: "₹42",
    paymentStatus: "Fare unchanged",
    nextStep: /you're done/i,
    timelineTitle: "Ride complete",
  },
  {
    id: "buffer_zone",
    stepIndex: 3,
    headline: "Within what you approved",
    chargeSummary: "₹48",
    paymentStatus: "Fare went up · still in range",
    reasonHint: /waiting/i,
    nextStep: /No follow-up/i,
    timelineTitle: "Ride complete",
  },
  {
    id: "exceeds_review",
    stepIndex: 3,
    variant: "valid_overage" as const,
    headline: "Charged up to your max",
    chargeSummary: "₹49",
    paymentStatus: "₹3 pending",
    statusBadge: "Pending",
    nextStep: /confirm the small extra/i,
    timelineTitle: "Ride complete",
  },
  {
    id: "exceeds_review",
    stepIndex: 3,
    variant: "suspicious_overage" as const,
    headline: "Approved amount secured",
    chargeSummary: "₹49",
    paymentStatus: "₹3 under review",
    statusBadge: "Under review",
    nextStep: /before any extra charge/i,
    timelineTitle: "Ride complete",
  },
];
