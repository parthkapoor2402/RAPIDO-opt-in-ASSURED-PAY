import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { RideLivePageContent } from "@/components/pages/RideLivePageContent";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";
import {
  LIVE_RIDE_SCENARIO_EXPECTATIONS,
  LIVE_RIDE_COMPLETION_STEP_EXPECTATIONS,
  getScenarioExpectation,
} from "@/features/live-ride/test/scenario-expectations";

function renderLiveRidePage() {
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

async function waitForLiveRideReady() {
  await waitFor(() => {
    expect(screen.getByTestId("fare-trust-indicator")).toBeInTheDocument();
  });
}

async function selectScenario(user: ReturnType<typeof userEvent.setup>, scenarioId: string) {
  await user.selectOptions(screen.getByTestId("playback-scenario-select"), scenarioId);
}

async function advanceToStep(user: ReturnType<typeof userEvent.setup>, targetStepIndex: number) {
  for (let step = 0; step < targetStepIndex; step += 1) {
    await user.click(screen.getByRole("button", { name: "Next" }));
  }
}

async function advanceToFinalStep(user: ReturnType<typeof userEvent.setup>, finalStepIndex: number) {
  await advanceToStep(user, finalStepIndex);
}

async function assertScenarioPresentation(expected: ReturnType<typeof getScenarioExpectation>) {
  const trust = screen.getByTestId("fare-trust-indicator");
  expect(within(trust).getByText(expected.trustLabel)).toBeInTheDocument();
  expect(trust).toHaveTextContent(expected.trustHelper);

  expect(screen.getByTestId("fare-meter-current")).toHaveTextContent(expected.currentFare);

  const timeline = screen.getByTestId("live-ride-event-timeline");
  expect(timeline).toHaveAttribute("data-scenario", expected.id);
  expect(timeline).toHaveTextContent(expected.timelineTitle);
  expect(timeline).toHaveTextContent(expected.timelineSubtitle);

  if (expected.showReasonEmpty) {
    expect(screen.getByTestId("reason-updates-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("reason-update-pill")).not.toBeInTheDocument();
  } else {
    expect(screen.queryByTestId("reason-updates-empty")).not.toBeInTheDocument();
  }

  if (expected.showReasonPill) {
    expect(screen.getByTestId("reason-update-pill")).toBeInTheDocument();
  } else {
    expect(screen.queryByTestId("reason-update-pill")).not.toBeInTheDocument();
  }

  const footer = screen.queryByTestId("fare-progression-footer");
  if (expected.footerPattern) {
    expect(footer).toBeInTheDocument();
    expect(footer?.textContent ?? "").toMatch(expected.footerPattern);
  } else {
    expect(footer).not.toBeInTheDocument();
  }
}

describe("live ride scenario integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("backend unavailable")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(LIVE_RIDE_SCENARIO_EXPECTATIONS.map((s) => [s.id] as const))(
    "renders %s scenario correctly at final step",
    async (scenarioId) => {
      const user = userEvent.setup();
      const expected = getScenarioExpectation(scenarioId);

      renderLiveRidePage();
      await waitForLiveRideReady();

      await selectScenario(user, expected.id);
      await advanceToFinalStep(user, expected.finalStepIndex);
      await waitFor(() => assertScenarioPresentation(expected));
    },
  );

  it("resets step index when switching scenarios via selector", async () => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    await advanceToStep(user, 2);
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

    await selectScenario(user, "buffer_zone");
    await waitFor(() => {
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      expect(screen.getByTestId("live-ride-event-timeline")).toHaveAttribute(
        "data-scenario",
        "buffer_zone",
      );
    });
  });

  it("does not leak prior scenario copy after switching to within max", async () => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    await selectScenario(user, "exceeds_review");
    await advanceToFinalStep(user, 2);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Review first");

    await selectScenario(user, "within_max");
    await waitFor(() => {
      expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("On track");
      expect(screen.getByTestId("fare-trust-indicator")).not.toHaveTextContent("Review first");
      expect(screen.getByTestId("live-ride-event-timeline")).toHaveAttribute(
        "data-scenario",
        "within_max",
      );
    });
  });

  it("keeps fare meter and timeline in sync when stepping through buffer zone", async () => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    await selectScenario(user, "buffer_zone");
    await waitFor(() => {
      expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("On track");
      expect(screen.getByTestId("fare-meter-current")).toHaveTextContent("₹42");
    });

    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Still covered");
      expect(screen.getByTestId("fare-meter-current")).toHaveTextContent("₹46");
      expect(screen.getByTestId("live-ride-event-timeline")).toHaveTextContent("2 min waiting added");
      expect(screen.getByTestId("reason-update-pill")).toBeInTheDocument();
    });
  });

  it("shows Scenario 1 renamed as At estimated fare in playback selector", async () => {
    renderLiveRidePage();
    await waitForLiveRideReady();

    const select = screen.getByTestId("playback-scenario-select");
    expect(select).toHaveTextContent("At estimated fare");
    expect(select).not.toHaveTextContent("Within approved max");
  });

  it.each(
    LIVE_RIDE_COMPLETION_STEP_EXPECTATIONS.filter((item) => item.variant !== "suspicious_overage"),
  )("renders Step 4 completion for $id", async (expected) => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    await selectScenario(user, expected.id);
    await advanceToStep(user, expected.stepIndex);

    const card = await screen.findByTestId("ride-completion-card");
    expect(card).toHaveAttribute("data-scenario", expected.id);
    expect(within(card).getByText("Ride complete")).toBeInTheDocument();
    expect(within(card).getByTestId("ride-completion-headline")).toHaveTextContent(
      expected.headline,
    );
    expect(within(card).getByTestId("ride-completion-charge")).toHaveTextContent(
      expected.chargeSummary,
    );
    expect(within(card).getByTestId("ride-completion-payment-status")).toHaveTextContent(
      expected.paymentStatus,
    );
    expect(within(card).getByTestId("ride-completion-next-step")).toHaveTextContent(
      expected.nextStep,
    );
    if ("statusBadge" in expected && expected.statusBadge) {
      expect(within(card).getByTestId("ride-completion-badge")).toHaveTextContent(
        expected.statusBadge,
      );
    }
    if ("reasonHint" in expected && expected.reasonHint) {
      expect(screen.getByTestId("ride-completion-reason")).toHaveTextContent(expected.reasonHint);
    }
    expect(screen.queryByTestId("fare-trust-indicator")).not.toBeInTheDocument();
  });

  it("renders Step 4 suspicious excess subcase for exceeds_review", async () => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    await selectScenario(user, "exceeds_review");
    await advanceToStep(user, 3);

    await user.selectOptions(screen.getByTestId("completion-variant-select"), "suspicious_overage");

    const card = await screen.findByTestId("ride-completion-card");
    expect(card).toHaveAttribute("data-completion-variant", "suspicious_overage");
    expect(within(card).getByTestId("ride-completion-headline")).toHaveTextContent(
      "Approved amount secured",
    );
    expect(within(card).getByTestId("ride-completion-charge")).toHaveTextContent("₹49");
    expect(within(card).getByTestId("ride-completion-payment-status")).toHaveTextContent(
      "₹3 under review",
    );
    expect(within(card).getByTestId("ride-completion-badge")).toHaveTextContent("Under review");
  });

  it("reaches Step 4 of 4 and shows completion card for each scenario", async () => {
    const user = userEvent.setup();
    renderLiveRidePage();
    await waitForLiveRideReady();

    for (const scenarioId of ["within_max", "buffer_zone", "exceeds_review"] as const) {
      await selectScenario(user, scenarioId);
      await advanceToStep(user, 3);

      await waitFor(() => {
        expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
        expect(screen.getByTestId("ride-completion-card")).toHaveAttribute("data-scenario", scenarioId);
        expect(screen.queryByTestId("fare-trust-indicator")).not.toBeInTheDocument();
      });
    }
  });
});
