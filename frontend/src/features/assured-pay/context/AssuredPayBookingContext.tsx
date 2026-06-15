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
  DEFAULT_RIDE_CATEGORY_ID,
  getCategoryFare,
  getRideCategory,
  isRideCategoryId,
  type RideCategoryId,
  type RideCategoryConfig,
} from "@/features/assured-pay/lib/ride-categories";
import {
  evaluateFreeTrialPromo,
  markRiderTrialUsed,
  readRiderTrialUnused,
} from "@/features/assured-pay/lib/promo-eligibility";
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
  selectedCategory: RideCategoryId;
  setSelectedCategory: (category: RideCategoryId) => void;
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
const CATEGORY_STORAGE_KEY = "assured-pay-category";

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

function readStoredCategory(): RideCategoryId {
  if (typeof window === "undefined") {
    return DEFAULT_RIDE_CATEGORY_ID;
  }
  try {
    const raw = sessionStorage.getItem(CATEGORY_STORAGE_KEY);
    if (raw && isRideCategoryId(raw)) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_RIDE_CATEGORY_ID;
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

function persistCategory(category: RideCategoryId): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(CATEGORY_STORAGE_KEY, category);
}

function buildEligibility(
  ctx: DiscoveryContextInput,
  categoryId: RideCategoryId,
): AssuredPayEligibility {
  const { eligible, blockReasons } = isEligible(ctx);
  const category = getRideCategory(categoryId);
  const { F, buffer, M } = getCategoryFare(categoryId);
  const riderTrialUnused = readRiderTrialUnused(
    ctx.riderId,
    Boolean(ctx.freeTrialAvailable),
  );
  const promo = evaluateFreeTrialPromo({
    categoryId,
    estimateF: F,
    riderTrialUnused,
    assuredPayEligible: eligible,
  });
  const prompts = resolveDiscoveryPrompts(ctx, eligible, promo.eligible);

  return {
    eligible,
    blockReasons,
    F,
    buffer,
    M,
    categoryId,
    categoryLabel: category.label,
    riderTrialUnused,
    freeTrialPromoEligible: promo.eligible,
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
  const [selectedCategory, setSelectedCategoryState] = useState<RideCategoryId>(readStoredCategory);

  useEffect(() => {
    setOptIn(readStoredOptIn(riderId));
    setSelectedCategoryState(readStoredCategory());
  }, [riderId]);

  const setSelectedCategory = useCallback((category: RideCategoryId) => {
    setSelectedCategoryState(category);
    persistCategory(category);
  }, []);

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
    () => buildEligibility(discoveryContext, selectedCategory),
    [discoveryContext, selectedCategory],
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
      freeTrialApplied: eligibility.freeTrialPromoEligible,
    };
    if (eligibility.freeTrialPromoEligible) {
      markRiderTrialUsed(riderId);
    }
    setOptIn(next);
    persistOptIn(riderId, next);
  }, [eligibility.freeTrialPromoEligible, optIn.discoverySource, primaryPromptId, riderId]);

  const resetOptIn = useCallback(() => {
    setOptIn(DEFAULT_OPT_IN);
    sessionStorage.removeItem(OPT_IN_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      eligibility,
      selectedCategory,
      setSelectedCategory,
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
      selectedCategory,
      setSelectedCategory,
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

/** Safe outside provider — defaults to bike for shell chrome. */
export function useSelectedRideCategory(): RideCategoryConfig {
  const context = useContext(AssuredPayBookingContext);
  return getRideCategory(context?.selectedCategory ?? DEFAULT_RIDE_CATEGORY_ID);
}
