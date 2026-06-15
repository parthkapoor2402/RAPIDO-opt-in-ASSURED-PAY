import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { ReactNode } from "react";

import { usePrePickupMovement } from "@/features/active-ride/hooks/usePrePickupMovement";
import { ActiveRideProvider, useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { DEFAULT_PICKUP, MOCK_DESTINATIONS } from "@/features/booking/lib/mock-locations";

function wrapper({ children }: { children: ReactNode }) {
  return <ActiveRideProvider>{children}</ActiveRideProvider>;
}

describe("usePrePickupMovement", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances pre-pickup progress and completes pickup", () => {
    function useMovementHarness() {
      const ride = useActiveRide();
      usePrePickupMovement(true);
      return ride;
    }

    const { result } = renderHook(() => useMovementHarness(), { wrapper });

    act(() => {
      result.current.assignFromBooking("bike", DEFAULT_PICKUP, MOCK_DESTINATIONS[0]);
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current.assignment?.prePickupProgress).toBe(1);
    expect(result.current.assignment?.movementPhase).toBe("on_trip");
  });
});
