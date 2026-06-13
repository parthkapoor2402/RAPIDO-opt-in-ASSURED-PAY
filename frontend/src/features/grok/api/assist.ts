import { API_PREFIX, apiUrl } from "@/lib/api";

import { buildLocalFallback } from "@/features/grok/mock/assist-fallback";
import type {
  AssistUseCase,
  DisputeExplainPayload,
  DueExplainPayload,
  ExplanationPayload,
  FareExplainPayload,
} from "@/features/grok/types";

async function postExplain<T>(path: string, body: T): Promise<ExplanationPayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/assist/${path}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Explain failed: ${response.status}`);
  }
  return response.json() as Promise<ExplanationPayload>;
}

export async function fetchExplanation(
  useCase: AssistUseCase,
  payload: FareExplainPayload | DueExplainPayload | DisputeExplainPayload,
): Promise<ExplanationPayload> {
  if (useCase === "fare_change") {
    return postExplain("explain/fare", payload);
  }
  if (useCase === "pending_due") {
    return postExplain("explain/due", payload);
  }
  return postExplain("explain/dispute", payload);
}

export async function fetchExplanationWithFallback(
  useCase: AssistUseCase,
  payload: FareExplainPayload | DueExplainPayload | DisputeExplainPayload,
): Promise<ExplanationPayload> {
  try {
    return await fetchExplanation(useCase, payload);
  } catch {
    return buildLocalFallback(useCase, payload);
  }
}
