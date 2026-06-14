import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { BookingPageContent } from "@/components/pages/BookingPageContent";
import { RideLivePageContent } from "@/components/pages/RideLivePageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import {
  AssuredPayBookingProvider,
  useAssuredPayBooking,
} from "@/features/assured-pay/context/AssuredPayBookingContext";
import { getCategoryFare } from "@/features/assured-pay/lib/ride-categories";
import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";

function CategoryProbe() {
  const { selectedCategory, eligibility } = useAssuredPayBooking();
  return (
    <p data-testid="category-fare">
      {selectedCategory}:{eligibility.F}:{eligibility.M}
    </p>
  );
}

function renderBooking() {
  return render(
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <CategoryProbe />
        <BookingPageContent />
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

function renderLiveRide(category: RideCategoryId) {
  sessionStorage.setItem("assured-pay-category", category);
  return render(
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <LiveRideProvider>
          <RideLivePageContent />
        </LiveRideProvider>
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

describe("ride category demo flows", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("backend unavailable")));
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("renders all three category rows on booking", () => {
    renderBooking();
    expect(screen.getByTestId("ride-category-list")).toBeInTheDocument();
    expect(screen.getByTestId("ride-option-bike")).toBeInTheDocument();
    expect(screen.getByTestId("ride-option-auto")).toBeInTheDocument();
    expect(screen.getByTestId("ride-option-cab")).toBeInTheDocument();
  });

  it.each([
    ["auto", 85, 95] as const,
    ["cab", 145, 160] as const,
  ])("switching to %s updates fare ceiling", async (category, F, M) => {
    const user = userEvent.setup();
    renderBooking();

    await user.click(screen.getByTestId(`ride-option-${category}`));
    await waitFor(() => {
      expect(screen.getByTestId("category-fare")).toHaveTextContent(`${category}:${F}:${M}`);
    });
    expect(screen.getByTestId(`ride-option-${category}`)).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("book-ride-cta")).toHaveTextContent(
      category === "auto" ? "Book Auto" : "Book Cab",
    );
  });

  it.each([
    ["bike", "🏍️ Bike", 42] as const,
    ["auto", "🛺 Auto", 85] as const,
    ["cab", "🚗 Cab", 145] as const,
  ])("live ride shows %s category chip and scaled estimate", async (category, label, F) => {
    renderLiveRide(category);
    await waitFor(() => {
      expect(screen.getByTestId("live-ride-category-chip")).toHaveTextContent(label);
      expect(screen.getByTestId("fare-meter-estimate")).toHaveTextContent(`₹${F}`);
    });
  });

  it("scenario playback still works for auto after category switch", async () => {
    sessionStorage.setItem("assured-pay-category", "auto");
    const user = userEvent.setup();
    render(
      <DemoScenarioProvider initialScenarioId="rider_commuter">
        <AssuredPayBookingProvider>
          <LiveRideProvider>
            <RideLivePageContent />
          </LiveRideProvider>
        </AssuredPayBookingProvider>
      </DemoScenarioProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("fare-trust-indicator")).toBeInTheDocument();
    });

    const { F, M } = getCategoryFare("auto");
    await waitFor(() => {
      expect(screen.getByTestId("fare-meter-current")).toHaveTextContent(`₹${F}`);
    });

    await user.selectOptions(screen.getByTestId("playback-scenario-select"), "buffer_zone");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Still covered");
      expect(screen.getByTestId("fare-meter-current")).toHaveTextContent(`₹${M - 1}`);
    });
  });
});
