"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { executeSettlementWithFallback } from "@/features/settlement/api/settlement";
import { completionToFlowOutcome } from "@/features/settlement/lib/completion-scenario";
import {
  COMPLETION_SCENARIOS,
  scenarioExecuteInput,
} from "@/features/settlement/mock/settlement-mock";
import type { CompletionScenarioId, SettlementPayload } from "@/features/settlement/types";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";

interface SettlementContextValue {
  settlement: SettlementPayload | null;
  scenario: CompletionScenarioId;
  loading: boolean;
  scenarios: typeof COMPLETION_SCENARIOS;
  setScenario: (scenario: CompletionScenarioId) => void;
  runSettlement: (scenario?: CompletionScenarioId) => Promise<void>;
}

const SettlementContext = createContext<SettlementContextValue | null>(null);

interface SettlementProviderProps {
  children: ReactNode;
  initialScenario?: CompletionScenarioId;
  /** @deprecated Use initialScenario */
  initialOutcome?: CompletionScenarioId | "happy_path";
  autoRun?: boolean;
}

function resolveInitialScenario(
  initialScenario?: CompletionScenarioId,
  initialOutcome?: CompletionScenarioId | "happy_path",
): CompletionScenarioId {
  if (initialScenario) return initialScenario;
  if (initialOutcome === "happy_path") return "within_max";
  if (initialOutcome) return initialOutcome;
  return "within_max";
}

export function SettlementProvider({
  children,
  initialScenario,
  initialOutcome,
  autoRun = true,
}: SettlementProviderProps) {
  const { eligibility } = useAssuredPayBooking();
  const resolvedInitial = resolveInitialScenario(initialScenario, initialOutcome);
  const [scenario, setScenario] = useState<CompletionScenarioId>(resolvedInitial);
  const [settlement, setSettlement] = useState<SettlementPayload | null>(null);
  const [loading, setLoading] = useState(autoRun);

  const runSettlement = useCallback(
    async (nextScenario?: CompletionScenarioId) => {
      const activeScenario = nextScenario ?? scenario;
      setLoading(true);
      try {
        const input = scenarioExecuteInput(activeScenario, eligibility.F, eligibility.buffer);
        const result = await executeSettlementWithFallback(activeScenario, input);
        setSettlement(result);
        setScenario(activeScenario);
      } finally {
        setLoading(false);
      }
    },
    [scenario, eligibility.F, eligibility.buffer],
  );

  useEffect(() => {
    if (!autoRun) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const input = scenarioExecuteInput(resolvedInitial, eligibility.F, eligibility.buffer);
        const result = await executeSettlementWithFallback(resolvedInitial, input);
        if (!cancelled) {
          setSettlement(result);
          setScenario(resolvedInitial);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoRun, resolvedInitial, eligibility.F, eligibility.buffer]);

  const value = useMemo(
    () => ({
      settlement,
      scenario,
      loading,
      scenarios: COMPLETION_SCENARIOS,
      setScenario,
      runSettlement,
    }),
    [settlement, scenario, loading, runSettlement],
  );

  return <SettlementContext.Provider value={value}>{children}</SettlementContext.Provider>;
}

export function useSettlement() {
  const ctx = useContext(SettlementContext);
  if (!ctx) {
    throw new Error("useSettlement must be used within SettlementProvider");
  }
  return ctx;
}

/** Flow outcome derived from active completion scenario (for legacy checks). */
export function useSettlementFlowOutcome() {
  const { scenario } = useSettlement();
  return completionToFlowOutcome(scenario);
}
