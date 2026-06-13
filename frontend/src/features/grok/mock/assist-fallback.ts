import type {
  AssistUseCase,
  DisputeExplainPayload,
  DueExplainPayload,
  ExplanationPayload,
  FareExplainPayload,
} from "@/features/grok/types";

function fareFallback(p: FareExplainPayload): ExplanationPayload {
  const reason = p.reason_label ? ` Reason: ${p.reason_label}.` : "";
  return {
    text: `Your estimate was ₹${p.estimate_f} and approved max is ₹${p.approved_m} (₹${p.buffer} buffer). Current fare: ₹${p.current_fare}.${reason} Payment outcomes follow fixed policy.`,
    source: "fallback",
    use_case: "fare_change",
    grok_available: false,
  };
}

function dueFallback(p: DueExplainPayload): ExplanationPayload {
  return {
    text: `We charged ₹${p.approved_m} at trip end. Final fare was ₹${p.actual_a} (${p.reason_label}). Captain was paid per policy. Remaining balance: ₹${p.amount_inr}.`,
    source: "fallback",
    use_case: "pending_due",
    grok_available: false,
  };
}

function disputeFallback(p: DisputeExplainPayload): ExplanationPayload {
  return {
    text: `Ride ${p.ride_id}: ₹${p.actual_a} final vs ₹${p.approved_m} approved (+₹${p.excess_inr}). Review only — no auto decision.`,
    source: "fallback",
    use_case: "dispute_summary",
    grok_available: false,
  };
}

export function buildLocalFallback(
  useCase: AssistUseCase,
  payload: FareExplainPayload | DueExplainPayload | DisputeExplainPayload,
): ExplanationPayload {
  if (useCase === "fare_change") {
    return fareFallback(payload as FareExplainPayload);
  }
  if (useCase === "pending_due") {
    return dueFallback(payload as DueExplainPayload);
  }
  return disputeFallback(payload as DisputeExplainPayload);
}
