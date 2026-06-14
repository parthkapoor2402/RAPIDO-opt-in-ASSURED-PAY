import type { CompletionScenarioId, SettlementFlowOutcome } from "@/features/settlement/types";

/** Parse ?outcome= query param; keeps legacy aliases. */
export function parseCompletionScenario(value: string | null): CompletionScenarioId {
  if (value === "buffer_within_max") return "buffer_within_max";
  if (value === "valid_overage") return "valid_overage";
  if (value === "suspicious_overage") return "suspicious_overage";
  if (value === "within_max" || value === "happy_path") return "within_max";
  return "within_max";
}

export function completionToFlowOutcome(scenario: CompletionScenarioId): SettlementFlowOutcome {
  if (scenario === "valid_overage") return "valid_overage";
  if (scenario === "suspicious_overage") return "suspicious_overage";
  return "happy_path";
}
