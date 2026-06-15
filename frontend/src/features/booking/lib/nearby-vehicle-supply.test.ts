import { describe, expect, it } from "vitest";

import {
  getNearbyCountByCategory,
  getNearbySupplyLabel,
  NEARBY_VEHICLE_MARKERS,
} from "@/features/booking/lib/nearby-vehicle-supply";

describe("nearby-vehicle-supply", () => {
  it("defines believable multi-vehicle supply per category", () => {
    const counts = getNearbyCountByCategory();
    expect(counts.bike).toBe(5);
    expect(counts.auto).toBe(3);
    expect(counts.cab).toBe(2);
    expect(NEARBY_VEHICLE_MARKERS).toHaveLength(10);
  });

  it("builds category-aligned supply labels", () => {
    expect(getNearbySupplyLabel("bike")).toBe("5 bikes nearby");
    expect(getNearbySupplyLabel("auto")).toBe("3 autos nearby");
    expect(getNearbySupplyLabel("cab")).toBe("2 cabs nearby");
  });
});
