import { describe, expect, it } from "vitest";

import {
  evaluateFreeTrialPromo,
  FREE_TRIAL_PROMO_CONFIG,
  isPromoCategory,
} from "@/features/assured-pay/lib/promo-eligibility";

describe("free trial promo eligibility", () => {
  it("exposes bike-first config with fare cap", () => {
    expect(FREE_TRIAL_PROMO_CONFIG.eligibleCategoryIds).toEqual(["bike"]);
    expect(FREE_TRIAL_PROMO_CONFIG.maxEstimateFareInr).toBe(50);
  });

  it("allows promo for eligible bike ride under fare cap", () => {
    const result = evaluateFreeTrialPromo({
      categoryId: "bike",
      estimateF: 42,
      riderTrialUnused: true,
      assuredPayEligible: true,
    });
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("blocks promo for auto and cab", () => {
    for (const categoryId of ["auto", "cab"] as const) {
      const result = evaluateFreeTrialPromo({
        categoryId,
        estimateF: 85,
        riderTrialUnused: true,
        assuredPayEligible: true,
      });
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain("category_not_eligible");
    }
  });

  it("blocks promo when bike fare exceeds cap", () => {
    const result = evaluateFreeTrialPromo({
      categoryId: "bike",
      estimateF: 55,
      riderTrialUnused: true,
      assuredPayEligible: true,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("fare_above_cap");
  });

  it("blocks promo when trial already used", () => {
    const result = evaluateFreeTrialPromo({
      categoryId: "bike",
      estimateF: 42,
      riderTrialUnused: false,
      assuredPayEligible: true,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("trial_already_used");
  });

  it("blocks promo when assured pay is ineligible", () => {
    const result = evaluateFreeTrialPromo({
      categoryId: "bike",
      estimateF: 42,
      riderTrialUnused: true,
      assuredPayEligible: false,
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("assured_pay_blocked");
  });

  it("identifies promo categories", () => {
    expect(isPromoCategory("bike")).toBe(true);
    expect(isPromoCategory("auto")).toBe(false);
    expect(isPromoCategory("cab")).toBe(false);
  });
});
