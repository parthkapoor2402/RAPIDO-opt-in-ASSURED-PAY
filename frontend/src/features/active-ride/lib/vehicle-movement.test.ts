import { describe, expect, it } from "vitest";

import {
  getOnTripPosition,
  getPrePickupPosition,
  MAP_DROP,
  MAP_PICKUP,
  resolveVehicleMovement,
} from "@/features/active-ride/lib/vehicle-movement";

describe("vehicle-movement", () => {
  it("interpolates pre-pickup movement toward pickup", () => {
    const start = getPrePickupPosition("bike", 0);
    const mid = getPrePickupPosition("bike", 0.5);
    const end = getPrePickupPosition("bike", 1);

    expect(start.topPct).not.toBe(MAP_PICKUP.topPct);
    expect(end.topPct).toBeCloseTo(MAP_PICKUP.topPct);
    expect(end.leftPct).toBeCloseTo(MAP_PICKUP.leftPct);
    expect(mid.topPct).toBeGreaterThan(start.topPct);
    expect(mid.topPct).toBeLessThan(end.topPct);
  });

  it("progresses on-trip position with step index", () => {
    const step0 = getOnTripPosition(0, 4);
    const step2 = getOnTripPosition(2, 4);
    const step3 = getOnTripPosition(3, 4);

    expect(step0.topPct).toBeGreaterThan(step3.topPct);
    expect(step2.leftPct).toBeGreaterThan(step0.leftPct);
    expect(step3.topPct).toBeCloseTo(MAP_DROP.topPct);
    expect(step3.leftPct).toBeCloseTo(MAP_DROP.leftPct);
  });

  it("resolves approaching_pickup phase before trip start", () => {
    const result = resolveVehicleMovement({
      movementPhase: "approaching_pickup",
      categoryId: "cab",
      prePickupProgress: 0.4,
      stepIndex: 0,
      maxStep: 4,
      ridePhase: "in_trip",
    });

    expect(result.phase).toBe("approaching_pickup");
    expect(result.routeProgress).toBe(0);
  });

  it("resolves on-trip movement after pickup", () => {
    const result = resolveVehicleMovement({
      movementPhase: "on_trip",
      categoryId: "auto",
      prePickupProgress: 1,
      stepIndex: 1,
      maxStep: 4,
      ridePhase: "in_trip",
    });

    expect(result.phase).toBe("on_trip");
    expect(result.routeProgress).toBeCloseTo(0.33, 1);
  });

  it("places vehicle at drop on completed ride", () => {
    const result = resolveVehicleMovement({
      movementPhase: "on_trip",
      categoryId: "bike",
      prePickupProgress: 1,
      stepIndex: 3,
      maxStep: 4,
      ridePhase: "completed",
    });

    expect(result.phase).toBe("arrived");
    expect(result.position.topPct).toBe(MAP_DROP.topPct);
    expect(result.routeProgress).toBe(1);
  });
});
