import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BookingPageContent } from "@/components/pages/BookingPageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { BookingFlowProvider } from "@/features/booking/context/BookingFlowProvider";

function renderBookingPage() {
  return render(
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <BookingFlowProvider>
          <BookingPageContent />
        </BookingFlowProvider>
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

async function selectDestination(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("destination-suggestion-indiranagar"));
}

describe("booking destination flow", () => {
  it("opens destination search input on booking", () => {
    renderBookingPage();
    expect(screen.getByTestId("destination-search-input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Where are you going?")).toBeInTheDocument();
  });

  it("renders suggestion list from mock dataset", () => {
    renderBookingPage();
    expect(screen.getByTestId("destination-suggestions")).toBeInTheDocument();
    expect(screen.getByTestId("destination-suggestion-indiranagar")).toBeInTheDocument();
  });

  it("gates booking CTA until destination is selected", () => {
    renderBookingPage();
    expect(screen.getByTestId("book-ride-cta")).toBeDisabled();
    expect(screen.queryByTestId("ride-category-list")).not.toBeInTheDocument();
  });

  it("shows ride options and enables booking after destination selection", async () => {
    const user = userEvent.setup();
    renderBookingPage();

    await selectDestination(user);

    await waitFor(() => {
      expect(screen.getByTestId("booking-trip-summary")).toHaveTextContent("Indiranagar");
      expect(screen.getByTestId("ride-category-list")).toBeInTheDocument();
      expect(screen.getByTestId("vehicle-map-markers")).toBeInTheDocument();
      expect(screen.getByTestId("book-ride-cta")).toBeEnabled();
      expect(screen.getByRole("button", { name: /Book Bike/i })).toBeInTheDocument();
    });
  });

  it("filters suggestions while typing", async () => {
    const user = userEvent.setup();
    renderBookingPage();

    await user.clear(screen.getByTestId("destination-search-input"));
    await user.type(screen.getByTestId("destination-search-input"), "hsr");

    await waitFor(() => {
      expect(screen.getByTestId("destination-suggestion-hsr-layout")).toBeInTheDocument();
      expect(screen.queryByTestId("destination-suggestion-indiranagar")).not.toBeInTheDocument();
    });
  });
});
