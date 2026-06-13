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

import {
  createDisputeWithFallback,
  fetchRecoveryStateWithFallback,
  payResidualDueWithFallback,
} from "@/features/recovery/api/recovery";
import type { RecoveryStatePayload } from "@/features/recovery/types";
import { useDemoScenario } from "@/context/DemoScenarioContext";

interface RecoveryContextValue {
  recovery: RecoveryStatePayload | null;
  loading: boolean;
  bannerDismissed: boolean;
  dismissBanner: () => void;
  refreshRecovery: () => Promise<void>;
  payDue: (dueId: string, amountInr: number) => Promise<void>;
  submitDispute: (input: {
    ride_id: string;
    due_id: string;
    reason: string;
  }) => Promise<void>;
}

const RecoveryContext = createContext<RecoveryContextValue | null>(null);

interface RecoveryProviderProps {
  children: ReactNode;
}

export function RecoveryProvider({ children }: RecoveryProviderProps) {
  const { scenario } = useDemoScenario();
  const riderId = scenario.riderId ?? "rider_commuter";
  const [recovery, setRecovery] = useState<RecoveryStatePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const refreshRecovery = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const state = await fetchRecoveryStateWithFallback(riderId);
      setRecovery(state);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [riderId]);

  useEffect(() => {
    void refreshRecovery();
  }, [refreshRecovery]);

  const payDue = useCallback(
    async (dueId: string, amountInr: number) => {
      await payResidualDueWithFallback(dueId, amountInr);
      await refreshRecovery();
    },
    [refreshRecovery],
  );

  const submitDispute = useCallback(
    async (input: { ride_id: string; due_id: string; reason: string }) => {
      await createDisputeWithFallback({
        ride_id: input.ride_id,
        rider_id: riderId,
        due_id: input.due_id,
        reason: input.reason,
      });
      await refreshRecovery({ silent: true });
    },
    [refreshRecovery, riderId],
  );

  const value = useMemo(
    () => ({
      recovery,
      loading,
      bannerDismissed,
      dismissBanner: () => setBannerDismissed(true),
      refreshRecovery,
      payDue,
      submitDispute,
    }),
    [recovery, loading, bannerDismissed, refreshRecovery, payDue, submitDispute],
  );

  return <RecoveryContext.Provider value={value}>{children}</RecoveryContext.Provider>;
}

export function useRecovery() {
  const ctx = useContext(RecoveryContext);
  if (!ctx) {
    throw new Error("useRecovery must be used within RecoveryProvider");
  }
  return ctx;
}

export function useRecoveryOptional() {
  return useContext(RecoveryContext);
}
