import type {
  SettlementExecuteInput,
  SettlementFlowOutcome,
  SettlementPayload,
  SettlementScenario,
} from "@/features/settlement/types";

export const SETTLEMENT_SCENARIOS: SettlementScenario[] = [
  {
    id: "happy_path",
    label: "Happy path",
    description: "A ≤ M · auto-charge succeeds",
    ride_id: "ride_happy",
  },
  {
    id: "valid_overage",
    label: "Valid overage",
    description: "Small excess · captain credited · residual due",
    ride_id: "ride_overage",
  },
  {
    id: "suspicious_overage",
    label: "Suspicious overage",
    description: "Large excess · routed to review",
    ride_id: "ride_suspicious",
  },
];

const BASE_INPUT = {
  rider_id: "rider_commuter",
  captain_id: "captain_ravi",
  estimate_f: 42,
  approved_m: 49,
};

export function scenarioExecuteInput(outcome: SettlementFlowOutcome): SettlementExecuteInput {
  const scenario = SETTLEMENT_SCENARIOS.find((s) => s.id === outcome)!;
  if (outcome === "happy_path") {
    return {
      ...BASE_INPUT,
      ride_id: scenario.ride_id,
      actual_a: 46,
      reason_codes: ["waiting_after_arrival"],
    };
  }
  if (outcome === "valid_overage") {
    return {
      ...BASE_INPUT,
      ride_id: scenario.ride_id,
      actual_a: 52,
      reason_codes: ["waiting_after_arrival"],
    };
  }
  return {
    ...BASE_INPUT,
    ride_id: scenario.ride_id,
    actual_a: 80,
    reason_codes: [],
  };
}

function ledgerFor(
  outcome: SettlementFlowOutcome,
  approvedM: number,
  actualA: number,
  riderCharged: number,
  residual: number | null,
): SettlementPayload["ledger"] {
  const ts = new Date().toISOString();
  const base = [
    { event_type: "trip_ended", label: "Trip ended", amount_inr: actualA, actor: "system", timestamp: ts },
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

  if (outcome === "valid_overage" && residual) {
    base.push({
      event_type: "residual_created",
      label: "Residual due created",
      amount_inr: residual,
      actor: "rider",
      timestamp: ts,
    });
    base.push({
      event_type: "captain_credited",
      label: "Captain credited",
      amount_inr: actualA,
      actor: "captain",
      timestamp: ts,
    });
  } else if (outcome === "suspicious_overage") {
    base.push({
      event_type: "review_queued",
      label: "Ops review queued",
      amount_inr: actualA - approvedM,
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
      label: "Captain credited",
      amount_inr: actualA,
      actor: "captain",
      timestamp: ts,
    });
  }
  return base;
}

export function buildMockSettlement(outcome: SettlementFlowOutcome): SettlementPayload {
  const input = scenarioExecuteInput(outcome);
  const residualAmount =
    outcome === "valid_overage" ? input.actual_a - input.approved_m : null;
  const riderCharged =
    outcome === "valid_overage" || outcome === "suspicious_overage"
      ? input.approved_m
      : input.actual_a;

  return {
    settlement_id: `stl_mock_${outcome}`,
    ride_id: input.ride_id,
    rider_id: input.rider_id,
    captain_id: input.captain_id,
    estimate_f: input.estimate_f,
    approved_m: input.approved_m,
    actual_a: input.actual_a,
    rider_charged: riderCharged,
    flow_outcome: outcome,
    settlement_state:
      outcome === "happy_path"
        ? "completed"
        : outcome === "valid_overage"
          ? "residual_due"
          : "review_required",
    payout: {
      ride_id: input.ride_id,
      captain_id: input.captain_id,
      amount_inr: input.actual_a,
      state: outcome === "suspicious_overage" ? "held" : "credited",
      status_label:
        outcome === "suspicious_overage" ? "Held pending review" : "Credited to wallet",
      credited_at: outcome === "suspicious_overage" ? null : new Date().toISOString(),
    },
    residual_due:
      outcome === "valid_overage" && residualAmount
        ? {
            id: "due_mock",
            ride_id: input.ride_id,
            rider_id: input.rider_id,
            amount_inr: residualAmount,
            captured_at_trip_end: input.approved_m,
            reason_codes: input.reason_codes,
            reason_label: "Waiting after arrival",
            status: "open",
          }
        : null,
    review_case_id: outcome === "suspicious_overage" ? `rev_${input.ride_id}` : null,
    ledger: ledgerFor(outcome, input.approved_m, input.actual_a, riderCharged, residualAmount),
    policy_version: "0.1.0",
  };
}
