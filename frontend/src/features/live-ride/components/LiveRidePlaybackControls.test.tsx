import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LiveRidePlaybackControls } from "@/features/live-ride/components/LiveRidePlaybackControls";
import { DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";

describe("LiveRidePlaybackControls", () => {
  const handlers = {
    onScenarioChange: vi.fn(),
    onCompletionVariantChange: vi.fn(),
    onPrevStep: vi.fn(),
    onNextStep: vi.fn(),
    onReset: vi.fn(),
  };

  const defaultProps = {
    scenarios: DEMO_SCENARIOS,
    scenarioId: "within_max",
    stepIndex: 0,
    maxStep: 4,
    completionVariant: "valid_overage" as const,
    ...handlers,
  };

  it("lists all demo scenarios in the selector", () => {
    render(<LiveRidePlaybackControls {...defaultProps} />);

    const select = screen.getByTestId("playback-scenario-select");
    expect(select).toHaveValue("within_max");
    for (const scenario of DEMO_SCENARIOS) {
      expect(screen.getByRole("option", { name: scenario.label })).toBeInTheDocument();
    }
    expect(screen.getByRole("option", { name: "At estimated fare" })).toBeInTheDocument();
  });

  it("calls onScenarioChange when a new scenario is selected", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();

    render(
      <LiveRidePlaybackControls
        {...defaultProps}
        onScenarioChange={onScenarioChange}
      />,
    );

    await user.selectOptions(screen.getByTestId("playback-scenario-select"), "buffer_zone");
    expect(onScenarioChange).toHaveBeenCalledWith("buffer_zone");
  });

  it("disables prev at first step and next at last step", () => {
    const { rerender } = render(<LiveRidePlaybackControls {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    rerender(
      <LiveRidePlaybackControls
        {...defaultProps}
        stepIndex={3}
      />,
    );

    expect(screen.getByRole("button", { name: "Prev" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows completion variant toggle on Step 4 for exceeds_review", () => {
    const { rerender } = render(
      <LiveRidePlaybackControls
        {...defaultProps}
        scenarioId="exceeds_review"
        stepIndex={2}
      />,
    );

    expect(screen.queryByTestId("completion-variant-toggle")).not.toBeInTheDocument();

    rerender(
      <LiveRidePlaybackControls
        {...defaultProps}
        scenarioId="exceeds_review"
        stepIndex={3}
      />,
    );

    expect(screen.getByTestId("completion-variant-toggle")).toBeInTheDocument();
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
  });
});
