import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CaptainPayoutPageContentForOutcome,
} from "@/components/pages/CaptainPayoutPageContent";
import {
  ResidualDuePageContentForTest,
} from "@/components/pages/ResidualDuePageContent";
import {
  RideCompletedPageContentForOutcome,
} from "@/components/pages/RideCompletedPageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import type { ReactNode } from "react";

function withProviders(children: ReactNode) {
  return (
    <DemoScenarioProvider>
      <AssuredPayBookingProvider>{children}</AssuredPayBookingProvider>
    </DemoScenarioProvider>
  );
}

/** @deprecated Kept for backward-compatible imports; see completion-scenarios.integration.test.tsx */
describe("settlement flow integration", () => {
  it("valid overage completion shows residual and pay CTA", async () => {
    render(withProviders(<RideCompletedPageContentForOutcome outcome="valid_overage" />));
    await waitFor(() => {
      expect(screen.getByTestId("ride-completed-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹3");
    expect(screen.getByRole("link", { name: "Pay ₹3" })).toBeInTheDocument();
  });

  it("suspicious overage shows review state", async () => {
    render(withProviders(<RideCompletedPageContentForOutcome outcome="suspicious_overage" />));
    await waitFor(() => {
      expect(screen.getByTestId("ride-completed-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Under review");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("Payout pending review");
  });

  it("captain payout reflects valid overage settlement", async () => {
    render(withProviders(<CaptainPayoutPageContentForOutcome outcome="valid_overage" />));
    await waitFor(() => {
      expect(screen.getByTestId("captain-payout-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("captain-payout-card")).toHaveTextContent("₹52");
    expect(screen.getByText(/Rider residual due: ₹3/)).toBeInTheDocument();
  });

  it("residual due page shows due amount", async () => {
    render(withProviders(<ResidualDuePageContentForTest />));
    await waitFor(() => {
      expect(screen.getByTestId("residual-due-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("pay-residual-cta")).toHaveTextContent("Pay ₹3 now");
  });
});
