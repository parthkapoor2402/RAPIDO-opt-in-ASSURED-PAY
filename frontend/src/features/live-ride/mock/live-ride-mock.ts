import { computeApprovedMax, formatInr } from "@/features/assured-pay/lib/fare";
import { BIKE_DEMO_BASE, getLiveRideStepFare } from "@/features/assured-pay/lib/scenario-fare-engine";
import {
  buildRideCompletionPlayback,
  isCompletionStep,
  type ExceedsReviewCompletionVariant,
} from "@/features/live-ride/lib/completion-playback";
import { mapFareStateToTrustState } from "@/features/live-ride/lib/trust-state";
import type { RideProgressPayload, RideScenarioSummary } from "@/features/live-ride/types";

const DEFAULT_F = BIKE_DEMO_BASE.F;
const DEFAULT_BUFFER = BIKE_DEMO_BASE.buffer;

export const DEMO_SCENARIOS: RideScenarioSummary[] = [
  {
    id: "within_max",
    label: "At estimated fare",
    description: "Final charge matched your original estimate.",
    step_count: 4,
  },
  {
    id: "buffer_zone",
    label: "Entered buffer zone",
    description: "Waiting charge enters buffer.",
    step_count: 4,
  },
  {
    id: "exceeds_review",
    label: "Review required",
    description: "Fare exceeds max without verified reason.",
    step_count: 4,
  },
];

interface MockStep {
  reason_codes: string[];
  timeline_title: string;
  timeline_subtitle: string;
}

const MOCK_STEPS: Record<string, MockStep[]> = {
  within_max: [
    {
      reason_codes: [],
      timeline_title: "En route",
      timeline_subtitle: "No fare change · on track to Indiranagar",
    },
    {
      reason_codes: [],
      timeline_title: "Mid-trip",
      timeline_subtitle: "Still at estimate · no extra charges",
    },
    {
      reason_codes: [],
      timeline_title: "Approaching drop",
      timeline_subtitle: "Still at estimate · well within your approved max",
    },
    {
      reason_codes: [],
      timeline_title: "Ride complete",
      timeline_subtitle: "Same as your booking fare",
    },
  ],
  buffer_zone: [
    {
      reason_codes: [],
      timeline_title: "Pickup complete",
      timeline_subtitle: "Trip started · Koramangala 5th Block",
    },
    {
      reason_codes: ["waiting_after_arrival"],
      timeline_title: "2 min waiting added",
      timeline_subtitle: "Signal hold · valid waiting charge applied",
    },
    {
      reason_codes: ["waiting_after_arrival", "rider_requested_route_change"],
      timeline_title: "Route adjustment applied",
      timeline_subtitle: "Detour applied · still covered under your max",
    },
    {
      reason_codes: ["waiting_after_arrival", "rider_requested_route_change"],
      timeline_title: "Ride complete",
      timeline_subtitle: "Fare went up · still within your max",
    },
  ],
  exceeds_review: [
    {
      reason_codes: [],
      timeline_title: "Pickup complete",
      timeline_subtitle: "Trip started · Koramangala 5th Block",
    },
    {
      reason_codes: ["waiting_after_arrival"],
      timeline_title: "Reached approved max",
      timeline_subtitle: "Waiting at drop · at your approved ceiling",
    },
    {
      reason_codes: [],
      timeline_title: "Fare above max",
      timeline_subtitle: "Unusual extension · we review before any extra charge",
    },
    {
      reason_codes: ["waiting_after_arrival"],
      timeline_title: "Ride complete",
      timeline_subtitle: "Settlement after fare check",
    },
  ],
};

const REASON_LABELS: Record<string, string> = {
  waiting_after_arrival: "2 min waiting",
  rider_requested_route_change: "Route adjustment",
  pickup_correction: "Pickup correction",
  toll: "Toll",
};

function classifyFareState(current: number, f: number, m: number) {
  if (current <= f) return "within_estimate" as const;
  if (current <= m) return "in_buffer" as const;
  return "exceeds_max" as const;
}

function mockRequiresReview(current: number, m: number, reasonCodes: string[]): boolean {
  if (current <= m) return false;
  const residual = current - m;
  if (residual > 25) return true;
  if (reasonCodes.length === 0) return true;
  const valid = reasonCodes.some((c) => c in REASON_LABELS);
  if (!valid) return true;
  return residual > 10;
}

function buildReasonUpdates(
  estimateF: number,
  currentFare: number,
  reasonCodes: string[],
) {
  if (!reasonCodes.length || currentFare <= estimateF) return [];
  const delta = currentFare - estimateF;
  const code = reasonCodes[reasonCodes.length - 1];
  return [
    {
      time_label: "8:24",
      amount_inr: currentFare,
      delta_inr: delta,
      reason_code: code,
      reason_label: REASON_LABELS[code] ?? code,
    },
  ];
}

export function buildMockRideProgress(
  scenarioId: string,
  stepIndex: number,
  estimateF: number = DEFAULT_F,
  assuredPayActive = true,
  buffer: number = DEFAULT_BUFFER,
  exceedsCompletionVariant: ExceedsReviewCompletionVariant = "valid_overage",
): RideProgressPayload & { timeline_title: string; timeline_subtitle: string } {
  const steps = MOCK_STEPS[scenarioId] ?? MOCK_STEPS.within_max;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const currentFare = getLiveRideStepFare(scenarioId, stepIndex, estimateF, buffer);
  const approvedM = computeApprovedMax(estimateF, buffer);
  const completed = isCompletionStep(stepIndex);

  const fareState = classifyFareState(currentFare, estimateF, approvedM);
  const requiresReview = completed
    ? exceedsCompletionVariant === "suspicious_overage" && scenarioId === "exceeds_review"
    : mockRequiresReview(currentFare, approvedM, step.reason_codes);

  const completion =
    completed
      ? buildRideCompletionPlayback(
          scenarioId,
          estimateF,
          buffer,
          exceedsCompletionVariant,
        )
      : undefined;

  return {
    estimate_f: estimateF,
    approved_m: approvedM,
    buffer,
    current_fare: currentFare,
    fare_state: fareState,
    trust_state: mapFareStateToTrustState(fareState, requiresReview),
    residual_due_if_ended_now: Math.max(0, currentFare - approvedM),
    requires_review_if_ended_now: requiresReview,
    assured_pay_active: assuredPayActive,
    reason_updates: buildReasonUpdates(estimateF, currentFare, step.reason_codes),
    latest_reason_code: step.reason_codes.at(-1) ?? null,
    policy_version: "0.1.0-mock",
    ride_phase: completed ? "completed" : "active",
    completion,
    timeline_title: step.timeline_title,
    timeline_subtitle: step.timeline_subtitle,
  };
}

export function formatFareDelta(delta: number): string {
  return delta >= 0 ? `+${formatInr(delta)}` : formatInr(delta);
}
