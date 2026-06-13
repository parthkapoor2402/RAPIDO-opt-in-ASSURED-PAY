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
import { scenarioExecuteInput, SETTLEMENT_SCENARIOS } from "@/features/settlement/mock/settlement-mock";
import type { SettlementFlowOutcome, SettlementPayload } from "@/features/settlement/types";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";

interface SettlementContextValue {
  settlement: SettlementPayload | null;
  outcome: SettlementFlowOutcome;
  loading: boolean;
  scenarios: typeof SETTLEMENT_SCENARIOS;
  setOutcome: (outcome: SettlementFlowOutcome) => void;
  runSettlement: (outcome?: SettlementFlowOutcome) => Promise<void>;
}

const SettlementContext = createContext<SettlementContextValue | null>(null);

interface SettlementProviderProps {
  children: ReactNode;
  initialOutcome?: SettlementFlowOutcome;
  autoRun?: boolean;
}

export function SettlementProvider({
  children,
  initialOutcome = "happy_path",
  autoRun = true,
}: SettlementProviderProps) {
  const { eligibility } = useAssuredPayBooking();
  const [outcome, setOutcome] = useState<SettlementFlowOutcome>(initialOutcome);
  const [settlement, setSettlement] = useState<SettlementPayload | null>(null);
  const [loading, setLoading] = useState(autoRun);

  const runSettlement = useCallback(
    async (nextOutcome?: SettlementFlowOutcome) => {
      const activeOutcome = nextOutcome ?? outcome;
      setLoading(true);
      try {
        const input = scenarioExecuteInput(activeOutcome);
        input.estimate_f = eligibility.F;
        input.approved_m = eligibility.M;
        const result = await executeSettlementWithFallback(activeOutcome, input);
        setSettlement(result);
        setOutcome(activeOutcome);
      } finally {
        setLoading(false);
      }
    },
    [outcome, eligibility.F, eligibility.M],
  );

  useEffect(() => {
    if (!autoRun) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const input = scenarioExecuteInput(initialOutcome);
        input.estimate_f = eligibility.F;
        input.approved_m = eligibility.M;
        const result = await executeSettlementWithFallback(initialOutcome, input);
        if (!cancelled) {
          setSettlement(result);
          setOutcome(initialOutcome);
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
  }, [autoRun, initialOutcome, eligibility.F, eligibility.M]);

  const value = useMemo(
    () => ({
      settlement,
      outcome,
      loading,
      scenarios: SETTLEMENT_SCENARIOS,
      setOutcome,
      runSettlement,
    }),
    [settlement, outcome, loading, runSettlement],
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
