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
import {
  COMPLETION_SCENARIO_EXPECTATIONS,
  getCompletionExpectation,
} from "@/features/settlement/test/completion-expectations";
import type { CompletionScenarioId } from "@/features/settlement/types";
import type { ReactNode } from "react";

function withProviders(children: ReactNode) {
  return (
    <DemoScenarioProvider>
      <AssuredPayBookingProvider>{children}</AssuredPayBookingProvider>
    </DemoScenarioProvider>
  );
}

async function assertCompletionPage(scenarioId: CompletionScenarioId) {
  const expected = getCompletionExpectation(scenarioId);
  render(withProviders(<RideCompletedPageContentForOutcome outcome={scenarioId} />));
  await waitFor(() => {
    expect(screen.getByTestId("ride-completed-page")).toBeInTheDocument();
  });

  const page = screen.getByTestId("ride-completed-page");
  expect(page).toHaveAttribute("data-completion-scenario", scenarioId);
  expect(page).toHaveTextContent(expected.statusChip);

  const summary = screen.getByTestId("settlement-summary");
  expect(summary).toHaveTextContent(expected.finalFare);
  expect(summary).toHaveTextContent(expected.chargedNow);
  expect(summary).toHaveTextContent(expected.captainPayout);

  if (expected.residualDue) {
    expect(summary).toHaveTextContent(expected.residualDue);
    expect(screen.getByRole("link", { name: expected.payCtaLabel! })).toBeInTheDocument();
  } else {
    expect(screen.queryByRole("link", { name: /pay/i })).not.toBeInTheDocument();
  }

  if (expected.underReview) {
    expect(summary).toHaveTextContent(expected.underReview);
    expect(summary).toHaveTextContent("Not billed yet");
  }

  expect(screen.getByTestId("completion-next-step")).toHaveTextContent("Charged now");
  expect(screen.getByTestId("completion-next-step")).toHaveTextContent(expected.captainPayoutLabel);
  expect(screen.getByTestId("settlement-ledger")).toBeInTheDocument();
}

describe("completion scenario integration", () => {
  it.each(COMPLETION_SCENARIO_EXPECTATIONS.map((s) => [s.id] as const))(
    "ride completed renders %s correctly",
    async (scenarioId) => {
      await assertCompletionPage(scenarioId);
    },
  );

  it("legacy happy_path alias maps to within_max", async () => {
    render(withProviders(<RideCompletedPageContentForOutcome outcome="happy_path" />));
    await waitFor(() => {
      expect(screen.getByTestId("ride-completed-page")).toHaveAttribute(
        "data-completion-scenario",
        "within_max",
      );
    });
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it.each([
    ["within_max", "₹42"],
    ["buffer_within_max", "₹48"],
    ["valid_overage", "₹52"],
    ["suspicious_overage", "₹80"],
  ] as const)("captain payout for %s shows %s credit", async (scenario, amount) => {
    render(withProviders(<CaptainPayoutPageContentForOutcome outcome={scenario} />));
    await waitFor(() => {
      expect(screen.getByTestId("captain-payout-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("captain-payout-card")).toHaveTextContent(amount);
  });

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
