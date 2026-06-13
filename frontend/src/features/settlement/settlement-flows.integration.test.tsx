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
import type { SettlementFlowOutcome } from "@/features/settlement/types";
import type { ReactNode } from "react";

function withProviders(children: ReactNode) {
  return (
    <DemoScenarioProvider>
      <AssuredPayBookingProvider>{children}</AssuredPayBookingProvider>
    </DemoScenarioProvider>
  );
}

const FLOW_CASES: Array<{
  outcome: SettlementFlowOutcome;
  assertCompleted: (ui: typeof screen) => void;
  assertCaptain: (ui: typeof screen) => void;
}> = [
  {
    outcome: "happy_path",
    assertCompleted: (ui) => {
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("₹49");
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("₹46");
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("None");
    },
    assertCaptain: (ui) => {
      expect(ui.getByTestId("captain-payout-card")).toHaveTextContent("₹46");
      expect(ui.getByText("Credited")).toBeInTheDocument();
    },
  },
  {
    outcome: "valid_overage",
    assertCompleted: (ui) => {
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("Residual due created");
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("₹3");
      expect(ui.getByRole("link", { name: /pay remaining/i })).toBeInTheDocument();
    },
    assertCaptain: (ui) => {
      expect(ui.getByTestId("captain-payout-card")).toHaveTextContent("₹52");
      expect(ui.getByText(/Rider residual due: ₹3/)).toBeInTheDocument();
    },
  },
  {
    outcome: "suspicious_overage",
    assertCompleted: (ui) => {
      expect(ui.getByText("Under review")).toBeInTheDocument();
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("Held pending review");
      expect(ui.getByTestId("settlement-summary")).toHaveTextContent("None");
    },
    assertCaptain: (ui) => {
      expect(ui.getByTestId("captain-payout-card")).toHaveTextContent("₹80");
      expect(ui.getByText("Held")).toBeInTheDocument();
    },
  },
];

describe("settlement flow integration", () => {
  it.each(FLOW_CASES)(
    "ride completed shows payout and due visibility for $outcome",
    async ({ outcome, assertCompleted }) => {
      render(
        withProviders(<RideCompletedPageContentForOutcome outcome={outcome} />),
      );
      await waitFor(() => {
        expect(screen.getByTestId("ride-completed-page")).toBeInTheDocument();
      });
      assertCompleted(screen);
      expect(screen.getByTestId("settlement-ledger")).toBeInTheDocument();
    },
  );

  it.each(FLOW_CASES)(
    "captain payout screen reflects $outcome settlement",
    async ({ outcome, assertCaptain }) => {
      render(withProviders(<CaptainPayoutPageContentForOutcome outcome={outcome} />));
      await waitFor(() => {
        expect(screen.getByTestId("captain-payout-page")).toBeInTheDocument();
      });
      assertCaptain(screen);
    },
  );

  it("residual due page shows due amount and captain credit", async () => {
    render(withProviders(<ResidualDuePageContentForTest />));
    await waitFor(() => {
      expect(screen.getByTestId("residual-due-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹3");
    expect(screen.getByTestId("settlement-summary")).toHaveTextContent("₹52");
    expect(screen.getByTestId("pay-residual-cta")).toHaveTextContent("Pay ₹3 now");
  });
});
