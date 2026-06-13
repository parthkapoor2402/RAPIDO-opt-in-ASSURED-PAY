export type DueStatus = "open" | "paid" | "disputed";

export type RebookingRestriction =
  | "none"
  | "assured_pay_blocked"
  | "repeat_unpaid_blocked";

export interface OpenDuePayload {
  id: string;
  ride_id: string;
  amount_inr: number;
  captured_at_trip_end: number;
  reason_label: string;
  status: DueStatus;
  is_past_grace: boolean;
  days_until_grace_expires: number;
  estimate_f: number | null;
  actual_a: number | null;
}

export interface RebookingStatePayload {
  assured_pay_eligible: boolean;
  standard_ride_allowed: boolean;
  restriction: RebookingRestriction;
  grace_active: boolean;
  unpaid_past_grace_count: number;
  open_due_count: number;
}

export interface RecoveryStatePayload {
  rider_id: string;
  has_pending_due: boolean;
  pending_amount_inr: number;
  show_banner: boolean;
  open_dues: OpenDuePayload[];
  disputed_dues: OpenDuePayload[];
  rebooking: RebookingStatePayload;
}

export interface DisputePayload {
  id: string;
  ride_id: string;
  rider_id: string;
  due_id: string;
  reason: string;
  status: string;
}

export interface ReviewCasePayload {
  id: string;
  ride_id: string;
  rider_id: string;
  captain_id: string;
  approved_m: number;
  actual_a: number;
  excess_inr: number;
  reason_codes: string[];
  state: string;
}

export interface PayDueResult {
  id: string;
  ride_id: string;
  amount_inr: number;
  status: string;
  message: string;
}
