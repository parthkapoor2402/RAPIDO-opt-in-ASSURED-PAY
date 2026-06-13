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

import { DEFAULT_BUFFER_INR, DEFAULT_ESTIMATE_F } from "@/features/assured-pay/lib/fare";
import {
  discoveryContextFromRiderId,
  getPrimaryPrompt,
  isEligible,
  resolveDiscoveryPrompts,
} from "@/features/assured-pay/lib/triggers";
import type {
  AssuredPayEligibility,
  DiscoveryContextInput,
  DiscoverySource,
  OptInState,
  PaymentMethod,
} from "@/features/assured-pay/types";
import { useDemoScenario } from "@/context/DemoScenarioContext";
import { useRecoveryOptional } from "@/features/recovery/context/RecoveryProvider";

interface AssuredPayBookingContextValue {
  eligibility: AssuredPayEligibility;
  primaryPromptId: DiscoverySource | null;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  batteryLowOverride: boolean;
  setBatteryLowOverride: (value: boolean) => void;
  optIn: OptInState;
  openOptIn: (source: DiscoverySource) => void;
  confirmOptIn: () => void;
  resetOptIn: () => void;
}

const AssuredPayBookingContext = createContext<AssuredPayBookingContextValue | null>(null);

const VALID_REASON_CODES = ["waiting", "route_change", "toll", "pickup_correction"];
const OPT_IN_STORAGE_KEY = "assured-pay-opt-in";

const DEFAULT_OPT_IN: OptInState = {
  enabled: false,
  discoverySource: null,
  authorizationId: null,
  freeTrialApplied: false,
};

function readStoredOptIn(riderId: string): OptInState {
  if (typeof window === "undefined") {
    return DEFAULT_OPT_IN;
  }
  try {
    const raw = sessionStorage.getItem(OPT_IN_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_OPT_IN;
    }
    const parsed = JSON.parse(raw) as OptInState & { riderId?: string };
    if (parsed.riderId !== riderId || !parsed.enabled) {
      return DEFAULT_OPT_IN;
    }
    return {
      enabled: parsed.enabled,
      discoverySource: parsed.discoverySource,
      authorizationId: parsed.authorizationId,
      freeTrialApplied: parsed.freeTrialApplied,
    };
  } catch {
    return DEFAULT_OPT_IN;
  }
}

function persistOptIn(riderId: string, state: OptInState): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!state.enabled) {
    sessionStorage.removeItem(OPT_IN_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(OPT_IN_STORAGE_KEY, JSON.stringify({ ...state, riderId }));
}

function buildEligibility(ctx: DiscoveryContextInput): AssuredPayEligibility {
  const { eligible, blockReasons } = isEligible(ctx);
  const F = DEFAULT_ESTIMATE_F;
  const buffer = DEFAULT_BUFFER_INR;
  const M = F + buffer;
  const prompts = resolveDiscoveryPrompts(ctx, eligible);

  return {
    eligible,
    blockReasons,
    F,
    buffer,
    M,
    freeTrialAvailable: Boolean(ctx.freeTrialAvailable && eligible),
    validReasonCodes: VALID_REASON_CODES,
    hasPaymentInstrument: ctx.hasPaymentInstrument !== false,
    prompts,
    rebookingRestriction: ctx.rebookingRestriction ?? "none",
    standardRideAllowed: ctx.rebookingRestriction === "repeat_unpaid_blocked" ? true : true,
  };
}

interface AssuredPayBookingProviderProps {
  children: ReactNode;
}

export function AssuredPayBookingProvider({ children }: AssuredPayBookingProviderProps) {
  const { scenario } = useDemoScenario();
  const recoveryCtx = useRecoveryOptional();
  const recovery = recoveryCtx?.recovery ?? null;
  const riderId = scenario.riderId ?? "rider_commuter";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [batteryLowOverride, setBatteryLowOverride] = useState(false);
  const [optIn, setOptIn] = useState<OptInState>(DEFAULT_OPT_IN);

  useEffect(() => {
    setOptIn(readStoredOptIn(riderId));
  }, [riderId]);

  const discoveryContext = useMemo<DiscoveryContextInput>(
    () => ({
      riderId,
      paymentMethod,
      batteryLowOverride,
      batteryLevel: batteryLowOverride ? 0.1 : 0.85,
      ...discoveryContextFromRiderId(riderId),
      hasOpenResidual:
        recovery?.has_pending_due ??
        discoveryContextFromRiderId(riderId).hasOpenResidual ??
        false,
      rebookingRestriction: recovery?.rebooking.restriction ?? "none",
    }),
    [riderId, paymentMethod, batteryLowOverride, recovery],
  );

  const eligibility = useMemo(
    () => buildEligibility(discoveryContext),
    [discoveryContext],
  );

  const primaryPromptId = useMemo(
    () => getPrimaryPrompt(eligibility.prompts)?.id ?? null,
    [eligibility.prompts],
  );

  const openOptIn = useCallback((source: DiscoverySource) => {
    setOptIn((prev) => ({ ...prev, discoverySource: source }));
  }, []);

  const confirmOptIn = useCallback(() => {
    const next: OptInState = {
      enabled: true,
      discoverySource: optIn.discoverySource ?? primaryPromptId ?? "booking_card",
      authorizationId: `auth_${riderId}_demo`,
      freeTrialApplied: eligibility.freeTrialAvailable,
    };
    setOptIn(next);
    persistOptIn(riderId, next);
  }, [eligibility.freeTrialAvailable, optIn.discoverySource, primaryPromptId, riderId]);

  const resetOptIn = useCallback(() => {
    setOptIn(DEFAULT_OPT_IN);
    sessionStorage.removeItem(OPT_IN_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      eligibility,
      primaryPromptId,
      paymentMethod,
      setPaymentMethod,
      batteryLowOverride,
      setBatteryLowOverride,
      optIn,
      openOptIn,
      confirmOptIn,
      resetOptIn,
    }),
    [
      eligibility,
      primaryPromptId,
      paymentMethod,
      batteryLowOverride,
      optIn,
      openOptIn,
      confirmOptIn,
      resetOptIn,
    ],
  );

  return (
    <AssuredPayBookingContext.Provider value={value}>
      {children}
    </AssuredPayBookingContext.Provider>
  );
}

export function useAssuredPayBooking() {
  const context = useContext(AssuredPayBookingContext);
  if (!context) {
    throw new Error("useAssuredPayBooking must be used within AssuredPayBookingProvider");
  }
  return context;
}
