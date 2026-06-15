import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";

import { ActiveRideProvider, useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { DEFAULT_PICKUP } from "@/features/booking/lib/mock-locations";
import { MOCK_DESTINATIONS } from "@/features/booking/lib/mock-locations";

function wrapper({ children }: { children: ReactNode }) {
  return <ActiveRideProvider>{children}</ActiveRideProvider>;
}

describe("ActiveRideProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("assigns ride from booking with captain details", () => {
    const { result } = renderHook(() => useActiveRide(), { wrapper });

    act(() => {
      result.current.assignFromBooking("bike", DEFAULT_PICKUP, MOCK_DESTINATIONS[0]);
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.assignment?.captain.name).toBe("Ravi K.");
    expect(result.current.assignment?.movementPhase).toBe("approaching_pickup");
    expect(result.current.showVehicleOverlay).toBe(true);
    expect(sessionStorage.getItem("active-ride-assignment")).toContain("Ravi K.");
    expect(sessionStorage.getItem("active-ride-booked")).toBe("true");
  });

  it("hides vehicle overlay for stale assignment without a booked session", async () => {
    sessionStorage.setItem(
      "active-ride-assignment",
      JSON.stringify({
        rideId: "ride-stale",
        categoryId: "bike",
        captain: {
          id: "captain-bike-01",
          name: "Ravi K.",
          rating: 4.9,
          vehicleLabel: "Bike",
          plate: "KA 01 AB 4521",
        },
        pickup: DEFAULT_PICKUP,
        destination: MOCK_DESTINATIONS[0],
        assignedAt: new Date().toISOString(),
        movementPhase: "on_trip",
        prePickupProgress: 1,
      }),
    );

    const { result } = renderHook(() => useActiveRide(), { wrapper });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
      expect(result.current.showVehicleOverlay).toBe(false);
    });
  });

  it("transitions from pre-pickup to on-trip", () => {
    const { result } = renderHook(() => useActiveRide(), { wrapper });

    act(() => {
      result.current.assignFromBooking("auto", DEFAULT_PICKUP, MOCK_DESTINATIONS[1]);
      result.current.setPrePickupProgress(1);
      result.current.completePickup();
    });

    expect(result.current.assignment?.movementPhase).toBe("on_trip");
    expect(result.current.assignment?.prePickupProgress).toBe(1);
  });

  it("clears assignment", () => {
    const { result } = renderHook(() => useActiveRide(), { wrapper });

    act(() => {
      result.current.assignFromBooking("cab", DEFAULT_PICKUP, MOCK_DESTINATIONS[2]);
      result.current.clearAssignment();
    });

    expect(result.current.isActive).toBe(false);
    expect(sessionStorage.getItem("active-ride-assignment")).toBeNull();
  });
});
