import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useEffect, useRef, type ReactNode } from "react";

import { LiveRideVehicleOverlay } from "@/features/active-ride/components/LiveRideVehicleOverlay";
import { ActiveRideProvider, useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { DEFAULT_PICKUP } from "@/features/booking/lib/mock-locations";
import { MOCK_DESTINATIONS } from "@/features/booking/lib/mock-locations";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";

function renderWithProviders(ui: ReactNode) {
  return render(
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <ActiveRideProvider>
          <LiveRideProvider>{ui}</LiveRideProvider>
        </ActiveRideProvider>
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

function AssignRideHarness({ children }: { children: ReactNode }) {
  const { assignFromBooking } = useActiveRide();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) {
      return;
    }
    seeded.current = true;
    assignFromBooking("bike", DEFAULT_PICKUP, MOCK_DESTINATIONS[0]);
  }, [assignFromBooking]);

  return <>{children}</>;
}

describe("LiveRideVehicleOverlay", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders nothing without an active assignment", () => {
    renderWithProviders(<LiveRideVehicleOverlay />);
    expect(screen.queryByTestId("live-ride-vehicle-overlay")).not.toBeInTheDocument();
  });

  it("renders nothing for stale assignment without booked session", async () => {
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

    renderWithProviders(<LiveRideVehicleOverlay />);
    await waitFor(() => {
      expect(screen.queryByTestId("live-ride-vehicle-overlay")).not.toBeInTheDocument();
    });
  });

  it("shows assigned captain card in approaching_pickup phase", async () => {
    renderWithProviders(
      <AssignRideHarness>
        <LiveRideVehicleOverlay />
      </AssignRideHarness>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("live-ride-vehicle-overlay")).toHaveAttribute(
        "data-movement-phase",
        "approaching_pickup",
      );
    });

    expect(screen.getByTestId("assigned-captain-card")).toHaveTextContent("Ravi K.");
    expect(screen.getByTestId("assigned-captain-card")).toHaveTextContent("Captain arriving");
    expect(screen.getByTestId("assigned-vehicle-marker")).toBeInTheDocument();
  });

  it("shows on-trip movement state when pickup is complete", async () => {
    sessionStorage.setItem("active-ride-booked", "true");
    sessionStorage.setItem(
      "active-ride-assignment",
      JSON.stringify({
        rideId: "ride-test-on-trip",
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

    renderWithProviders(<LiveRideVehicleOverlay />);

    await waitFor(() => {
      expect(screen.getByTestId("live-ride-vehicle-overlay")).toHaveAttribute(
        "data-movement-phase",
        "on_trip",
      );
    });

    expect(screen.getByTestId("assigned-captain-card")).toHaveTextContent("On trip");
    expect(screen.getByTestId("route-progress-line")).toBeInTheDocument();
  });
});
