import { API_PREFIX, apiUrl } from "@/lib/api";

import { buildMockRecovery, MOCK_REVIEW_CASES } from "@/features/recovery/mock/recovery-mock";
import type {
  DisputePayload,
  PayDueResult,
  RecoveryStatePayload,
  ReviewCasePayload,
} from "@/features/recovery/types";

export async function fetchRecoveryState(riderId: string): Promise<RecoveryStatePayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/riders/${riderId}/recovery-state`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Recovery state failed: ${response.status}`);
  }
  return response.json() as Promise<RecoveryStatePayload>;
}

export async function fetchRecoveryStateWithFallback(riderId: string): Promise<RecoveryStatePayload> {
  try {
    return await fetchRecoveryState(riderId);
  } catch {
    return buildMockRecovery(riderId);
  }
}

export async function payResidualDue(dueId: string): Promise<PayDueResult> {
  const response = await fetch(apiUrl(`${API_PREFIX}/residual-due/${dueId}/pay`), {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Pay due failed: ${response.status}`);
  }
  return response.json() as Promise<PayDueResult>;
}

export async function payResidualDueWithFallback(
  dueId: string,
  amountInr: number,
): Promise<PayDueResult> {
  try {
    return await payResidualDue(dueId);
  } catch {
    return {
      id: dueId,
      ride_id: "ride_mock",
      amount_inr: amountInr,
      status: "paid",
      message: "Payment received. Your due is cleared.",
    };
  }
}

export async function createDispute(input: {
  ride_id: string;
  rider_id: string;
  due_id: string;
  reason: string;
}): Promise<DisputePayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/disputes`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Dispute failed: ${response.status}`);
  }
  return response.json() as Promise<DisputePayload>;
}

export async function createDisputeWithFallback(input: {
  ride_id: string;
  rider_id: string;
  due_id: string;
  reason: string;
}): Promise<DisputePayload> {
  try {
    return await createDispute(input);
  } catch {
    return {
      id: "dsp_mock",
      ride_id: input.ride_id,
      rider_id: input.rider_id,
      due_id: input.due_id,
      reason: input.reason,
      status: "open",
    };
  }
}

export async function fetchReviewQueue(): Promise<ReviewCasePayload[]> {
  const response = await fetch(apiUrl(`${API_PREFIX}/support/review-queue`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Review queue failed: ${response.status}`);
  }
  const data = (await response.json()) as { cases: ReviewCasePayload[] };
  return data.cases;
}

export async function fetchReviewQueueWithFallback(): Promise<ReviewCasePayload[]> {
  try {
    return await fetchReviewQueue();
  } catch {
    return MOCK_REVIEW_CASES;
  }
}
