import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ScenarioSwitcher } from "@/components/demo/ScenarioSwitcher";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";

describe("scenario switcher rendering", () => {
  it("renders seeded demo scenarios", () => {
    render(
      <DemoScenarioProvider>
        <ScenarioSwitcher />
      </DemoScenarioProvider>,
    );

    expect(screen.getByTestId("scenario-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("scenario-switcher-active")).toHaveTextContent(
      /time-critical commuter/i,
    );

    for (const scenario of DEMO_SCENARIOS) {
      expect(
        screen.getByRole("button", { name: new RegExp(scenario.label, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("updates active scenario when a scenario is selected", async () => {
    const user = userEvent.setup();
    render(
      <DemoScenarioProvider>
        <ScenarioSwitcher />
      </DemoScenarioProvider>,
    );

    await user.click(screen.getByRole("button", { name: /captain instant closure/i }));
    expect(screen.getByTestId("scenario-switcher-active")).toHaveTextContent(
      /captain instant closure/i,
    );
  });
});
