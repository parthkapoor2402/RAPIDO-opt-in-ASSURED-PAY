export type FareState = "within_estimate" | "in_buffer" | "exceeds_max";

export type TrustState =
  | "within_approved_max"
  | "entered_buffer_zone"
  | "review_required";

export interface FareReasonUpdate {
  time_label: string;
  amount_inr: number;
  delta_inr: number;
  reason_code: string;
  reason_label: string;
}

export interface RideProgressPayload {
  estimate_f: number;
  approved_m: number;
  buffer: number;
  current_fare: number;
  fare_state: FareState;
  trust_state: TrustState;
  residual_due_if_ended_now: number;
  requires_review_if_ended_now: boolean;
  assured_pay_active: boolean;
  reason_updates: FareReasonUpdate[];
  latest_reason_code: string | null;
  policy_version: string;
}

export interface RideScenarioSummary {
  id: string;
  label: string;
  description: string;
  step_count: number;
}

export interface RidePlaybackStepMeta {
  timeline_title: string;
  timeline_subtitle: string;
}
