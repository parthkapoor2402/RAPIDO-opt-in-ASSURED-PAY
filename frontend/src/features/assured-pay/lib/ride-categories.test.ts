import { describe, expect, it } from "vitest";

import {
  DEFAULT_RIDE_CATEGORY_ID,
  getCategoryFare,
  getRideCategory,
  RIDE_CATEGORIES,
} from "@/features/assured-pay/lib/ride-categories";
import {
  getCompletionActualFare,
  getLiveRideStepFare,
  scaleBufferOffset,
  scaleFareFromBike,
} from "@/features/assured-pay/lib/scenario-fare-engine";

describe("ride categories", () => {
  it("defines bike, auto, and cab with distinct fare presets", () => {
    expect(RIDE_CATEGORIES.map((c) => c.id)).toEqual(["bike", "auto", "cab"]);
    expect(getCategoryFare("bike")).toEqual({ F: 42, buffer: 7, M: 49 });
    expect(getCategoryFare("auto")).toEqual({ F: 85, buffer: 10, M: 95 });
    expect(getCategoryFare("cab")).toEqual({ F: 145, buffer: 15, M: 160 });
  });

  it("defaults to bike", () => {
    expect(DEFAULT_RIDE_CATEGORY_ID).toBe("bike");
    expect(getRideCategory("bike").icon).toBe("🏍️");
  });
});

describe("scenario fare engine", () => {
  it("keeps buffer_zone final step within approved max for auto", () => {
    const { F, buffer, M } = getCategoryFare("auto");
    expect(getLiveRideStepFare("buffer_zone", 1, F, buffer)).toBeLessThanOrEqual(M);
    expect(getLiveRideStepFare("buffer_zone", 2, F, buffer)).toBe(M - 1);
    expect(getLiveRideStepFare("within_max", 2, F, buffer)).toBe(F);
  });

  it("keeps exceeds_review step 1 at ceiling for all categories", () => {
    for (const id of ["bike", "auto", "cab"] as const) {
      const { F, buffer, M } = getCategoryFare(id);
      expect(getLiveRideStepFare("exceeds_review", 1, F, buffer)).toBe(M);
    }
  });

  it("derives distinct completion fares for cab buffer vs valid overage", () => {
    const F = 145;
    const buffer = 15;
    const M = F + buffer;
    expect(getCompletionActualFare("buffer_within_max", F, buffer)).toBe(M - 1);
    expect(getCompletionActualFare("valid_overage", F, buffer)).toBe(M + scaleBufferOffset(3, buffer));
    expect(getCompletionActualFare("buffer_within_max", F, buffer)).not.toBe(
      getCompletionActualFare("valid_overage", F, buffer),
    );
  });

  it("scales suspicious overage proportionally", () => {
    expect(getCompletionActualFare("suspicious_overage", 85, 10)).toBe(scaleFareFromBike(80, 85));
  });
});
