import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LiveRidePlaybackControls } from "@/features/live-ride/components/LiveRidePlaybackControls";
import { DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";

describe("LiveRidePlaybackControls", () => {
  const handlers = {
    onScenarioChange: vi.fn(),
    onPrevStep: vi.fn(),
    onNextStep: vi.fn(),
    onReset: vi.fn(),
  };

  it("lists all demo scenarios in the selector", () => {
    render(
      <LiveRidePlaybackControls
        scenarios={DEMO_SCENARIOS}
        scenarioId="within_max"
        stepIndex={0}
        maxStep={3}
        {...handlers}
      />,
    );

    const select = screen.getByTestId("playback-scenario-select");
    expect(select).toHaveValue("within_max");
    for (const scenario of DEMO_SCENARIOS) {
      expect(screen.getByRole("option", { name: scenario.label })).toBeInTheDocument();
    }
  });

  it("calls onScenarioChange when a new scenario is selected", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();

    render(
      <LiveRidePlaybackControls
        scenarios={DEMO_SCENARIOS}
        scenarioId="within_max"
        stepIndex={0}
        maxStep={3}
        onScenarioChange={onScenarioChange}
        onPrevStep={handlers.onPrevStep}
        onNextStep={handlers.onNextStep}
        onReset={handlers.onReset}
      />,
    );

    await user.selectOptions(screen.getByTestId("playback-scenario-select"), "buffer_zone");
    expect(onScenarioChange).toHaveBeenCalledWith("buffer_zone");
  });

  it("disables prev at first step and next at last step", () => {
    const { rerender } = render(
      <LiveRidePlaybackControls
        scenarios={DEMO_SCENARIOS}
        scenarioId="within_max"
        stepIndex={0}
        maxStep={3}
        {...handlers}
      />,
    );

    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    rerender(
      <LiveRidePlaybackControls
        scenarios={DEMO_SCENARIOS}
        scenarioId="within_max"
        stepIndex={2}
        maxStep={3}
        {...handlers}
      />,
    );

    expect(screen.getByRole("button", { name: "Prev" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
