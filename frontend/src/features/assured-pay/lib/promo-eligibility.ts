import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";

/** Demo / MVP config — bike-first free trial with fare cap. */
export const FREE_TRIAL_PROMO_CONFIG = {
  eligibleCategoryIds: ["bike"] as const satisfies readonly RideCategoryId[],
  maxEstimateFareInr: 50,
} as const;

export type FreeTrialPromoIneligibleReason =
  | "assured_pay_blocked"
  | "category_not_eligible"
  | "fare_above_cap"
  | "trial_already_used";

export interface FreeTrialPromoInput {
  categoryId: RideCategoryId;
  estimateF: number;
  riderTrialUnused: boolean;
  assuredPayEligible: boolean;
}

export interface FreeTrialPromoResult {
  eligible: boolean;
  reasons: FreeTrialPromoIneligibleReason[];
}

export function isPromoCategory(categoryId: RideCategoryId): boolean {
  return (FREE_TRIAL_PROMO_CONFIG.eligibleCategoryIds as readonly RideCategoryId[]).includes(
    categoryId,
  );
}

export function evaluateFreeTrialPromo(input: FreeTrialPromoInput): FreeTrialPromoResult {
  const reasons: FreeTrialPromoIneligibleReason[] = [];

  if (!input.assuredPayEligible) {
    reasons.push("assured_pay_blocked");
  }
  if (!input.riderTrialUnused) {
    reasons.push("trial_already_used");
  }
  if (!isPromoCategory(input.categoryId)) {
    reasons.push("category_not_eligible");
  }
  if (input.estimateF > FREE_TRIAL_PROMO_CONFIG.maxEstimateFareInr) {
    reasons.push("fare_above_cap");
  }

  return { eligible: reasons.length === 0, reasons };
}

export const TRIAL_USED_STORAGE_KEY = "assured-pay-trial-used";

export function trialUsedStorageKey(riderId: string): string {
  return `${TRIAL_USED_STORAGE_KEY}:${riderId}`;
}

export function readRiderTrialUnused(
  riderId: string,
  profileTrialAvailable: boolean,
): boolean {
  if (!profileTrialAvailable) return false;
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(trialUsedStorageKey(riderId)) !== "1";
  } catch {
    return profileTrialAvailable;
  }
}

export function markRiderTrialUsed(riderId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(trialUsedStorageKey(riderId), "1");
  } catch {
    /* ignore */
  }
}
