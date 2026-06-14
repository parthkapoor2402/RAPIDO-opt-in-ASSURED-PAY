import { API_PREFIX, apiUrl } from "@/lib/api";

import { buildMockSettlement } from "@/features/settlement/mock/settlement-mock";
import type { CompletionScenarioId, SettlementExecuteInput, SettlementPayload } from "@/features/settlement/types";

export async function executeSettlement(input: SettlementExecuteInput): Promise<SettlementPayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/settlement/execute`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Settlement execute failed: ${response.status}`);
  }
  return response.json() as Promise<SettlementPayload>;
}

export async function fetchSettlementByRide(rideId: string): Promise<SettlementPayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/settlement/by-ride/${rideId}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Settlement fetch failed: ${response.status}`);
  }
  return response.json() as Promise<SettlementPayload>;
}

export async function executeSettlementWithFallback(
  scenario: CompletionScenarioId,
  input: SettlementExecuteInput,
): Promise<SettlementPayload> {
  try {
    const result = await executeSettlement(input);
    return { ...result, completion_scenario: scenario };
  } catch {
    return buildMockSettlement(scenario);
  }
}
