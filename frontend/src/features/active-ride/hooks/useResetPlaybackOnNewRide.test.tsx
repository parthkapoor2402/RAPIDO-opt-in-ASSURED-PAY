import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { useResetPlaybackOnNewRide } from "@/features/active-ride/hooks/useResetPlaybackOnNewRide";
import { ActiveRideProvider, useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { DEFAULT_PICKUP, MOCK_DESTINATIONS } from "@/features/booking/lib/mock-locations";
import { LiveRideProvider, useLiveRide } from "@/features/live-ride/context/LiveRideProvider";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <ActiveRideProvider>
          <LiveRideProvider>{children}</LiveRideProvider>
        </ActiveRideProvider>
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>
  );
}

function useHarness() {
  const ride = useActiveRide();
  const live = useLiveRide();
  useResetPlaybackOnNewRide();
  return { ride, live };
}

describe("useResetPlaybackOnNewRide", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("resets live playback when a new ride is booked", async () => {
    const { result } = renderHook(() => useHarness(), { wrapper });

    await waitFor(() => {
      expect(result.current.live.progress).not.toBeNull();
    });

    act(() => {
      for (let step = 0; step < 2; step += 1) {
        result.current.live.playNextStep();
      }
    });

    await waitFor(() => {
      expect(result.current.live.stepIndex).toBe(2);
    });

    act(() => {
      result.current.ride.assignFromBooking("bike", DEFAULT_PICKUP, MOCK_DESTINATIONS[0]);
    });

    await waitFor(() => {
      expect(result.current.live.stepIndex).toBe(0);
    });
  });
});
