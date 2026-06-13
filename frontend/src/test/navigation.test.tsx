import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomNav } from "@/components/layout/BottomNav";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";

function renderNav(scenarioId: string) {
  return render(
    <DemoScenarioProvider initialScenarioId={scenarioId}>
      <BottomNav />
    </DemoScenarioProvider>,
  );
}

describe("navigation visibility", () => {
  it("shows rider navigation links in rider view", () => {
    renderNav("rider_commuter");
    const nav = screen.getByTestId("app-bottom-nav");
    expect(within(nav).getByRole("link", { name: /ride/i })).toBeVisible();
    expect(within(nav).getByRole("link", { name: /book/i })).toBeVisible();
    expect(within(nav).getByRole("link", { name: /live/i })).toBeVisible();
    expect(within(nav).queryByRole("link", { name: /payout/i })).not.toBeInTheDocument();
  });

  it("shows captain earnings link in captain view", () => {
    renderNav("captain_ravi");
    const nav = screen.getByTestId("app-bottom-nav");
    expect(within(nav).getByRole("link", { name: /earnings/i })).toBeVisible();
    expect(within(nav).queryByRole("link", { name: /book/i })).not.toBeInTheDocument();
  });

  it("shows ops review link in ops view", () => {
    renderNav("ops_reviewer");
    const nav = screen.getByTestId("app-bottom-nav");
    expect(within(nav).getByRole("link", { name: /review/i })).toBeVisible();
  });

  it("shows analytics link in admin view", () => {
    renderNav("admin_analytics");
    const nav = screen.getByTestId("app-bottom-nav");
    expect(within(nav).getByRole("link", { name: /analytics/i })).toBeVisible();
  });
});
