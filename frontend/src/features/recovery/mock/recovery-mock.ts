import type { RecoveryStatePayload, ReviewCasePayload } from "@/features/recovery/types";

export const MOCK_RECOVERY_WITH_DUE: RecoveryStatePayload = {
  rider_id: "rider_commuter",
  has_pending_due: true,
  pending_amount_inr: 3,
  show_banner: true,
  open_dues: [
    {
      id: "due_mock_open",
      ride_id: "ride_overage",
      amount_inr: 3,
      captured_at_trip_end: 49,
      reason_label: "Waiting after arrival",
      status: "open",
      is_past_grace: false,
      days_until_grace_expires: 5,
      estimate_f: 42,
      actual_a: 52,
    },
  ],
  disputed_dues: [],
  rebooking: {
    assured_pay_eligible: false,
    standard_ride_allowed: true,
    restriction: "assured_pay_blocked",
    grace_active: true,
    unpaid_past_grace_count: 0,
    open_due_count: 1,
  },
};

export const MOCK_RECOVERY_CLEARED: RecoveryStatePayload = {
  rider_id: "rider_commuter",
  has_pending_due: false,
  pending_amount_inr: 0,
  show_banner: false,
  open_dues: [],
  disputed_dues: [],
  rebooking: {
    assured_pay_eligible: true,
    standard_ride_allowed: true,
    restriction: "none",
    grace_active: false,
    unpaid_past_grace_count: 0,
    open_due_count: 0,
  },
};

export const MOCK_REPEAT_UNPAID: RecoveryStatePayload = {
  ...MOCK_RECOVERY_WITH_DUE,
  rider_id: "rider_repeat",
  pending_amount_inr: 6,
  open_dues: [
    { ...MOCK_RECOVERY_WITH_DUE.open_dues[0], id: "due_a", is_past_grace: true, days_until_grace_expires: 0 },
    {
      ...MOCK_RECOVERY_WITH_DUE.open_dues[0],
      id: "due_b",
      ride_id: "ride_repeat_b",
      is_past_grace: true,
      days_until_grace_expires: 0,
    },
  ],
  rebooking: {
    assured_pay_eligible: false,
    standard_ride_allowed: true,
    restriction: "repeat_unpaid_blocked",
    grace_active: false,
    unpaid_past_grace_count: 2,
    open_due_count: 2,
  },
};

export const MOCK_REVIEW_CASES: ReviewCasePayload[] = [
  {
    id: "rev_ride_suspicious",
    ride_id: "ride_suspicious",
    rider_id: "rider_commuter",
    captain_id: "captain_ravi",
    approved_m: 49,
    actual_a: 80,
    excess_inr: 31,
    reason_codes: [],
    state: "pending",
  },
];

export function buildMockRecovery(riderId: string): RecoveryStatePayload {
  if (riderId === "rider_repeat") {
    return { ...MOCK_REPEAT_UNPAID, rider_id: riderId };
  }
  if (riderId === "rider_blocked") {
    return { ...MOCK_RECOVERY_WITH_DUE, rider_id: riderId };
  }
  return { ...MOCK_RECOVERY_CLEARED, rider_id: riderId };
}
