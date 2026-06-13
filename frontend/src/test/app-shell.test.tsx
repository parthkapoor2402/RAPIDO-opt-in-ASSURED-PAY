import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/layout/AppShell";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";

describe("app shell rendering", () => {
  it("renders header, main content, and bottom navigation", () => {
    render(
      <DemoScenarioProvider>
        <AppShell>
          <p>Child content</p>
        </AppShell>
      </DemoScenarioProvider>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByTestId("app-bottom-nav")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("shows assured pay branding in the header", () => {
    render(
      <DemoScenarioProvider>
        <AppShell>
          <span>Page</span>
        </AppShell>
      </DemoScenarioProvider>,
    );

    expect(screen.getByTestId("app-header")).toHaveTextContent("rapido");
  });
});
