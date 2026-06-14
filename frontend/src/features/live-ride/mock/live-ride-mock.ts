import { computeApprovedMax, formatInr } from "@/features/assured-pay/lib/fare";
import { mapFareStateToTrustState } from "@/features/live-ride/lib/trust-state";
import type { RideProgressPayload, RideScenarioSummary } from "@/features/live-ride/types";

const DEFAULT_F = 42;
const DEFAULT_BUFFER = 7;

export const DEMO_SCENARIOS: RideScenarioSummary[] = [
  {
    id: "within_max",
    label: "Within approved max",
    description: "Fare stays at or below estimate.",
    step_count: 3,
  },
  {
    id: "buffer_zone",
    label: "Entered buffer zone",
    description: "Waiting charge enters buffer.",
    step_count: 3,
  },
  {
    id: "exceeds_review",
    label: "Review required",
    description: "Fare exceeds max without verified reason.",
    step_count: 3,
  },
];

interface MockStep {
  current_fare: number;
  reason_codes: string[];
  timeline_title: string;
  timeline_subtitle: string;
}

const MOCK_STEPS: Record<string, MockStep[]> = {
  within_max: [
    {
      current_fare: 42,
      reason_codes: [],
      timeline_title: "En route",
      timeline_subtitle: "No fare change · on track to Indiranagar",
    },
    {
      current_fare: 42,
      reason_codes: [],
      timeline_title: "Mid-trip",
      timeline_subtitle: "Still at estimate · no extra charges",
    },
    {
      current_fare: 42,
      reason_codes: [],
      timeline_title: "Approaching drop",
      timeline_subtitle: "Still at estimate · well within your approved max",
    },
  ],
  buffer_zone: [
    {
      current_fare: 42,
      reason_codes: [],
      timeline_title: "Pickup complete",
      timeline_subtitle: "Trip started · Koramangala 5th Block",
    },
    {
      current_fare: 46,
      reason_codes: ["waiting_after_arrival"],
      timeline_title: "2 min waiting added",
      timeline_subtitle: "Signal hold · +₹4 valid waiting charge",
    },
    {
      current_fare: 48,
      reason_codes: ["waiting_after_arrival", "rider_requested_route_change"],
      timeline_title: "Route adjustment applied",
      timeline_subtitle: "Detour via 100 ft Rd · still covered under ₹49 max",
    },
  ],
  exceeds_review: [
    {
      current_fare: 42,
      reason_codes: [],
      timeline_title: "Pickup complete",
      timeline_subtitle: "Trip started · Koramangala 5th Block",
    },
    {
      current_fare: 49,
      reason_codes: ["waiting_after_arrival"],
      timeline_title: "Reached approved max",
      timeline_subtitle: "Waiting at drop · ₹49 (your approved ceiling)",
    },
    {
      current_fare: 52,
      reason_codes: [],
      timeline_title: "Fare above max",
      timeline_subtitle: "Unusual extension · we review before any extra charge",
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
  estimateF = DEFAULT_F,
  assuredPayActive = true,
): RideProgressPayload & { timeline_title: string; timeline_subtitle: string } {
  const steps = MOCK_STEPS[scenarioId] ?? MOCK_STEPS.within_max;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const buffer = DEFAULT_BUFFER;
  const approvedM = computeApprovedMax(estimateF, buffer);
  const fareState = classifyFareState(step.current_fare, estimateF, approvedM);
  const requiresReview = mockRequiresReview(step.current_fare, approvedM, step.reason_codes);

  return {
    estimate_f: estimateF,
    approved_m: approvedM,
    buffer,
    current_fare: step.current_fare,
    fare_state: fareState,
    trust_state: mapFareStateToTrustState(fareState, requiresReview),
    residual_due_if_ended_now: Math.max(0, step.current_fare - approvedM),
    requires_review_if_ended_now: requiresReview,
    assured_pay_active: assuredPayActive,
    reason_updates: buildReasonUpdates(estimateF, step.current_fare, step.reason_codes),
    latest_reason_code: step.reason_codes.at(-1) ?? null,
    policy_version: "0.1.0-mock",
    timeline_title: step.timeline_title,
    timeline_subtitle: step.timeline_subtitle,
  };
}

export function formatFareDelta(delta: number): string {
  return delta >= 0 ? `+${formatInr(delta)}` : formatInr(delta);
}
