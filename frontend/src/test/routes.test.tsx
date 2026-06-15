import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminAnalyticsPageContent } from "@/components/pages/AdminAnalyticsPageContent";
import { AssuredPayPageContent } from "@/components/pages/AssuredPayPageContent";
import { BookingPageContent } from "@/components/pages/BookingPageContent";
import { CaptainPayoutPageContentForOutcome } from "@/components/pages/CaptainPayoutPageContent";
import { DemoScenariosPageContent } from "@/components/pages/DemoScenariosPageContent";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { RideCompletedPageContentForOutcome } from "@/components/pages/RideCompletedPageContent";
import { RideLivePageContent } from "@/components/pages/RideLivePageContent";
import { ResidualDuePageContentForTest } from "@/components/pages/ResidualDuePageContent";
import { SupportReviewPageContent } from "@/components/pages/SupportReviewPageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { BookingFlowProvider } from "@/features/booking/context/BookingFlowProvider";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";
import { RecoveryProvider } from "@/features/recovery/context/RecoveryProvider";
import type { ComponentType, ReactNode } from "react";

function withDiscoveryProviders(children: ReactNode) {
  return (
    <DemoScenarioProvider>
      <RecoveryProvider>
        <AssuredPayBookingProvider>
          <BookingFlowProvider>
            <LiveRideProvider>{children}</LiveRideProvider>
          </BookingFlowProvider>
        </AssuredPayBookingProvider>
      </RecoveryProvider>
    </DemoScenarioProvider>
  );
}

const ROUTE_CASES: Array<{
  name: string;
  Component: ComponentType;
  assert: (ui: typeof screen) => void;
  withDiscovery?: boolean;
  withProvider?: boolean;
}> = [
  {
    name: "home",
    Component: HomePageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("button", { name: /plan your ride/i })).toBeInTheDocument();
      expect(ui.getByTestId("home-destination-search")).toBeInTheDocument();
    },
  },
  {
    name: "booking",
    Component: BookingPageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByTestId("destination-search-panel")).toBeInTheDocument();
      expect(ui.getByTestId("book-ride-cta")).toBeDisabled();
    },
  },
  {
    name: "assured-pay",
    Component: AssuredPayPageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Add Assured Pay", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "ride-live",
    Component: RideLivePageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "On trip", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "ride-completed",
    Component: () => <RideCompletedPageContentForOutcome outcome="happy_path" />,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Ride completed", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "residual-due",
    Component: ResidualDuePageContentForTest,
    withDiscovery: true,
    assert: (ui) => {
      expect(
        ui.getByRole("heading", { name: "Pay remaining amount", exact: true }),
      ).toBeInTheDocument();
    },
  },
  {
    name: "captain-payout",
    Component: () => <CaptainPayoutPageContentForOutcome outcome="valid_overage" />,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Earnings", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "support-review",
    Component: SupportReviewPageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Support cases", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "admin-analytics",
    Component: AdminAnalyticsPageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Assured Pay analytics", exact: true })).toBeInTheDocument();
    },
  },
  {
    name: "demo-scenarios",
    Component: DemoScenariosPageContent,
    withDiscovery: true,
    assert: (ui) => {
      expect(ui.getByRole("heading", { name: "Demo scenarios", exact: true })).toBeInTheDocument();
    },
  },
];

describe("route rendering", () => {
  it.each(ROUTE_CASES)("renders $name page content", async ({ Component, assert, withDiscovery }) => {
    const ui = <Component />;
    render(withDiscovery ? withDiscoveryProviders(ui) : ui);
    if (withDiscovery) {
      await waitFor(() => {
        assert(screen);
      });
    } else {
      assert(screen);
    }
  });
});
