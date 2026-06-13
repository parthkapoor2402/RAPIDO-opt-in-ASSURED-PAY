import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { LiveRideProvider, useLiveRide } from "@/features/live-ride/context/LiveRideProvider";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";

function Probe() {
  const { progress, trustState, stepIndex, playNextStep, scenarioId, setScenarioId } =
    useLiveRide();

  return (
    <div>
      <p data-testid="trust">{trustState}</p>
      <p data-testid="fare">{progress?.current_fare ?? "none"}</p>
      <p data-testid="step">{stepIndex}</p>
      <p data-testid="scenario">{scenarioId}</p>
      <button type="button" onClick={playNextStep}>
        Next
      </button>
      <button type="button" onClick={() => setScenarioId("exceeds_review")}>
        Switch scenario
      </button>
    </div>
  );
}

function renderLiveRide() {
  return render(
    <DemoScenarioProvider initialScenarioId="rider_commuter">
      <AssuredPayBookingProvider>
        <LiveRideProvider>
          <Probe />
        </LiveRideProvider>
      </AssuredPayBookingProvider>
    </DemoScenarioProvider>,
  );
}

describe("live ride playback integration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("backend unavailable")),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads initial progress from local mock fallback", async () => {
    renderLiveRide();
    await waitFor(() => {
      expect(screen.getByTestId("fare").textContent).not.toBe("none");
    });
    expect(screen.getByTestId("trust")).toHaveTextContent("within_approved_max");
  });

  it("advances scenario steps on playback control", async () => {
    const user = userEvent.setup();
    renderLiveRide();
    await waitFor(() => expect(screen.getByTestId("step")).toHaveTextContent("0"));

    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    await waitFor(() => {
      expect(Number(screen.getByTestId("step").textContent)).toBeGreaterThan(0);
    });
  });

  it("transitions trust state when switching to exceeds scenario", async () => {
    const user = userEvent.setup();
    renderLiveRide();
    await waitFor(() => expect(screen.getByTestId("trust")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /switch scenario/i }));
    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    await user.click(screen.getByRole("button", { name: /^Next$/i }));

    await waitFor(() => {
      expect(screen.getByTestId("trust")).toHaveTextContent("review_required");
    });
  });
});
