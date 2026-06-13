import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AssuredPayBookingProvider, useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";

function OptInFlowProbe() {
  const { eligibility, optIn, confirmOptIn, setPaymentMethod, setBatteryLowOverride } =
    useAssuredPayBooking();

  return (
    <div>
      <p data-testid="eligible">{String(eligibility.eligible)}</p>
      <p data-testid="M">{eligibility.M}</p>
      <p data-testid="opt-in">{String(optIn.enabled)}</p>
      <p data-testid="prompt-count">{eligibility.prompts.length}</p>
      <button type="button" onClick={() => setPaymentMethod("upi")}>
        Select UPI
      </button>
      <button type="button" onClick={() => setBatteryLowOverride(true)}>
        Simulate low battery
      </button>
      <button type="button" onClick={confirmOptIn}>
        Confirm opt-in
      </button>
    </div>
  );
}

function renderFlow(scenarioId: string) {
  return render(
    <DemoScenarioProvider initialScenarioId={scenarioId}>
      <AssuredPayBookingProvider>
        <OptInFlowProbe />
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

describe("Assured Pay opt-in flow integration", () => {
  it("exposes fare ceiling M for eligible commuter", () => {
    renderFlow("rider_commuter");
    expect(screen.getByTestId("eligible")).toHaveTextContent("true");
    expect(screen.getByTestId("M")).toHaveTextContent("49");
    expect(Number(screen.getByTestId("prompt-count").textContent)).toBeGreaterThan(0);
  });

  it("blocks eligibility for rider with open residual", () => {
    renderFlow("rider_blocked");
    expect(screen.getByTestId("eligible")).toHaveTextContent("false");
    expect(screen.getByTestId("prompt-count")).toHaveTextContent("0");
  });

  it("completes opt-in after explicit confirmation", async () => {
    const user = userEvent.setup();
    renderFlow("rider_commuter");
    expect(screen.getByTestId("opt-in")).toHaveTextContent("false");
    await user.click(screen.getByRole("button", { name: /confirm opt-in/i }));
    expect(screen.getByTestId("opt-in")).toHaveTextContent("true");
  });

  it("adds online payer context when UPI selected", async () => {
    const user = userEvent.setup();
    renderFlow("rider_commuter");
    await user.click(screen.getByRole("button", { name: /select upi/i }));
    expect(screen.getByTestId("prompt-count").textContent).not.toBe("0");
  });

  it("surfaces low battery prompt via dev toggle", async () => {
    const user = userEvent.setup();
    renderFlow("rider_commuter");
    await user.click(screen.getByRole("button", { name: /simulate low battery/i }));
    expect(Number(screen.getByTestId("prompt-count").textContent)).toBeGreaterThan(0);
  });
});
