export type SettlementFlowOutcome = "happy_path" | "valid_overage" | "suspicious_overage";

export type SettlementState = "completed" | "residual_due" | "review_required";

export type PayoutState = "pending" | "credited" | "partial" | "held" | "failed";

export interface CaptainPayoutPayload {
  ride_id: string;
  captain_id: string;
  amount_inr: number;
  state: PayoutState;
  status_label: string;
  credited_at: string | null;
}

export interface ResidualDuePayload {
  id: string;
  ride_id: string;
  rider_id: string;
  amount_inr: number;
  captured_at_trip_end: number;
  reason_codes: string[];
  reason_label: string;
  status: string;
}

export interface LedgerEventPayload {
  event_type: string;
  label: string;
  amount_inr: number | null;
  actor: string;
  timestamp: string;
}

export interface SettlementPayload {
  settlement_id: string;
  ride_id: string;
  rider_id: string;
  captain_id: string;
  estimate_f: number;
  approved_m: number;
  actual_a: number;
  rider_charged: number;
  flow_outcome: SettlementFlowOutcome;
  settlement_state: SettlementState;
  payout: CaptainPayoutPayload;
  residual_due: ResidualDuePayload | null;
  review_case_id: string | null;
  ledger: LedgerEventPayload[];
  policy_version: string;
}

export interface SettlementScenario {
  id: SettlementFlowOutcome;
  label: string;
  description: string;
  ride_id: string;
}

export interface SettlementExecuteInput {
  ride_id: string;
  rider_id: string;
  captain_id: string;
  estimate_f: number;
  approved_m: number;
  actual_a: number;
  reason_codes: string[];
}
