import { getCaptainPayoutLabel } from "@/features/settlement/lib/completion-copy";
import { completionToFlowOutcome } from "@/features/settlement/lib/completion-scenario";
import { BIKE_DEMO_BASE, getCompletionActualFare } from "@/features/assured-pay/lib/scenario-fare-engine";
import type {
  CompletionScenario,
  CompletionScenarioId,
  SettlementExecuteInput,
  SettlementPayload,
} from "@/features/settlement/types";

export const COMPLETION_SCENARIOS: CompletionScenario[] = [
  {
    id: "within_max",
    label: "Within approved max",
    description: "A ≤ M · charged at final fare",
    ride_id: "ride_within_max",
    flow_outcome: "happy_path",
  },
  {
    id: "buffer_within_max",
    label: "Buffer zone · within max",
    description: "Valid updates in buffer · still within M",
    ride_id: "ride_buffer",
    flow_outcome: "happy_path",
  },
  {
    id: "valid_overage",
    label: "Small valid excess",
    description: "M captured · residual due · captain paid full A",
    ride_id: "ride_overage",
    flow_outcome: "valid_overage",
  },
  {
    id: "suspicious_overage",
    label: "Large excess · under review",
    description: "M charged · excess held for ops verification",
    ride_id: "ride_suspicious",
    flow_outcome: "suspicious_overage",
  },
];

/** @deprecated Use COMPLETION_SCENARIOS */
export const SETTLEMENT_SCENARIOS = COMPLETION_SCENARIOS.filter((s) =>
  ["valid_overage", "suspicious_overage"].includes(s.id),
).map((s) => ({
  id: s.flow_outcome,
  label: s.label,
  description: s.description,
  ride_id: s.ride_id,
}));

const BASE_INPUT = {
  rider_id: "rider_commuter",
  captain_id: "captain_ravi",
};

interface ScenarioInputSpec {
  reason_codes: string[];
  reason_label: string | null;
}

const SCENARIO_INPUTS: Record<CompletionScenarioId, ScenarioInputSpec> = {
  within_max: { reason_codes: [], reason_label: null },
  buffer_within_max: {
    reason_codes: ["waiting_after_arrival"],
    reason_label: "2 min waiting",
  },
  valid_overage: {
    reason_codes: ["waiting_after_arrival"],
    reason_label: "Waiting after arrival",
  },
  suspicious_overage: { reason_codes: [], reason_label: null },
};

export function scenarioExecuteInput(
  scenario: CompletionScenarioId,
  estimateF: number = BIKE_DEMO_BASE.F,
  buffer: number = BIKE_DEMO_BASE.buffer,
): SettlementExecuteInput {
  const meta = COMPLETION_SCENARIOS.find((s) => s.id === scenario)!;
  const spec = SCENARIO_INPUTS[scenario];
  const approvedM = estimateF + buffer;
  return {
    ...BASE_INPUT,
    ride_id: meta.ride_id,
    estimate_f: estimateF,
    approved_m: approvedM,
    actual_a: getCompletionActualFare(scenario, estimateF, buffer),
    reason_codes: spec.reason_codes,
  };
}

function ledgerFor(
  scenario: CompletionScenarioId,
  approvedM: number,
  actualA: number,
  riderCharged: number,
  residual: number | null,
  underReview: number | null,
): SettlementPayload["ledger"] {
  const ts = new Date().toISOString();
  const flow = completionToFlowOutcome(scenario);
  const base = [
    {
      event_type: "trip_ended",
      label: "Trip ended",
      amount_inr: actualA,
      actor: "system",
      timestamp: ts,
    },
    {
      event_type: "rider_charged",
      label: "Rider charged at trip end",
      amount_inr: riderCharged,
      actor: "rider",
      timestamp: ts,
    },
    {
      event_type: "approved_max",
      label: "Approved max (M)",
      amount_inr: approvedM,
      actor: "system",
      timestamp: ts,
    },
  ];

  if (flow === "valid_overage" && residual) {
    base.push({
      event_type: "residual_created",
      label: "Residual due created",
      amount_inr: residual,
      actor: "rider",
      timestamp: ts,
    });
    base.push({
      event_type: "captain_credited",
      label: "Captain credited full fare",
      amount_inr: actualA,
      actor: "captain",
      timestamp: ts,
    });
  } else if (flow === "suspicious_overage" && underReview) {
    base.push({
      event_type: "review_queued",
      label: "Excess fare queued for ops review",
      amount_inr: underReview,
      actor: "ops",
      timestamp: ts,
    });
    base.push({
      event_type: "captain_payout_held",
      label: "Captain payout held pending review",
      amount_inr: actualA,
      actor: "captain",
      timestamp: ts,
    });
  } else {
    base.push({
      event_type: "captain_credited",
      label: "Captain credited full fare",
      amount_inr: actualA,
      actor: "captain",
      timestamp: ts,
    });
  }
  return base;
}

export function buildMockSettlement(scenario: CompletionScenarioId): SettlementPayload {
  const input = scenarioExecuteInput(scenario);
  const flow = completionToFlowOutcome(scenario);
  const spec = SCENARIO_INPUTS[scenario];
  const residualAmount = flow === "valid_overage" ? input.actual_a - input.approved_m : null;
  const underReview =
    flow === "suspicious_overage" ? input.actual_a - input.approved_m : null;
  const riderCharged =
    flow === "valid_overage" || flow === "suspicious_overage"
      ? input.approved_m
      : input.actual_a;

  return {
    settlement_id: `stl_mock_${scenario}`,
    ride_id: input.ride_id,
    rider_id: input.rider_id,
    captain_id: input.captain_id,
    estimate_f: input.estimate_f,
    approved_m: input.approved_m,
    actual_a: input.actual_a,
    rider_charged: riderCharged,
    flow_outcome: flow,
    completion_scenario: scenario,
    settlement_state:
      flow === "happy_path"
        ? "completed"
        : flow === "valid_overage"
          ? "residual_due"
          : "review_required",
    payout: {
      ride_id: input.ride_id,
      captain_id: input.captain_id,
      amount_inr: input.actual_a,
      state: flow === "suspicious_overage" ? "held" : "credited",
      status_label: getCaptainPayoutLabel(scenario),
      credited_at: flow === "suspicious_overage" ? null : new Date().toISOString(),
    },
    residual_due:
      flow === "valid_overage" && residualAmount
        ? {
            id: "due_mock",
            ride_id: input.ride_id,
            rider_id: input.rider_id,
            amount_inr: residualAmount,
            captured_at_trip_end: input.approved_m,
            reason_codes: input.reason_codes,
            reason_label: spec.reason_label ?? "Verified fare update",
            status: "open",
          }
        : null,
    review_case_id: flow === "suspicious_overage" ? `rev_${input.ride_id}` : null,
    amount_under_review: underReview,
    ledger: ledgerFor(
      scenario,
      input.approved_m,
      input.actual_a,
      riderCharged,
      residualAmount,
      underReview,
    ),
    policy_version: "0.1.0",
  };
}

/** Resolve completion scenario from legacy flow outcome for captain/residual pages. */
export function flowOutcomeToScenario(outcome: string): CompletionScenarioId {
  if (outcome === "buffer_within_max") return "buffer_within_max";
  if (outcome === "valid_overage") return "valid_overage";
  if (outcome === "suspicious_overage") return "suspicious_overage";
  if (outcome === "happy_path") return "within_max";
  return "within_max";
}
