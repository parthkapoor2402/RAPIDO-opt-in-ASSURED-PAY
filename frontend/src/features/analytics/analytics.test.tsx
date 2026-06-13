import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminAnalyticsPageContent } from "@/components/pages/AdminAnalyticsPageContent";
import { KpiCard } from "@/features/analytics/components/KpiCard";
import { buildMockAnalyticsSummary } from "@/features/analytics/mock/analytics-mock";

vi.mock("@/features/analytics/api/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/analytics/api/analytics")>();
  return {
    ...actual,
    fetchAnalyticsSummaryWithFallback: vi.fn(async (scenario?: string) =>
      buildMockAnalyticsSummary(scenario ?? "all"),
    ),
  };
});

import * as analyticsApi from "@/features/analytics/api/analytics";

describe("KpiCard", () => {
  it("renders label, value, and hint", () => {
    render(
      <KpiCard
        label="Frictionless completion"
        value="94.2%"
        hint="North Star (FACR)"
        tone="brand"
      />,
    );
    expect(screen.getByTestId("kpi-card")).toHaveTextContent("Frictionless completion");
    expect(screen.getByTestId("kpi-card")).toHaveTextContent("94.2%");
    expect(screen.getByTestId("kpi-card")).toHaveTextContent("North Star");
  });
});

describe("AdminAnalyticsPageContent", () => {
  it("renders all six KPI cards with demo values", async () => {
    render(<AdminAnalyticsPageContent />);
    await waitFor(() => {
      expect(screen.getByTestId("admin-analytics-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("kpi-frictionless")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-captain-payout")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-residual-recovery")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-dispute-rate")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-bad-debt")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-repeat-usage")).toBeInTheDocument();
  });

  it("shows product story headline and event funnel", async () => {
    render(<AdminAnalyticsPageContent />);
    await waitFor(() => {
      expect(screen.getByTestId("analytics-story")).toBeInTheDocument();
    });
    expect(screen.getByTestId("analytics-story")).toHaveTextContent("Assured Pay is working");
    expect(screen.getByTestId("event-funnel")).toBeInTheDocument();
  });

  it("scenario toggle refetches summary", async () => {
    const user = userEvent.setup();
    render(<AdminAnalyticsPageContent />);
    await waitFor(() => {
      expect(screen.getByTestId("scenario-filter")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /stressed cohort/i }));
    expect(analyticsApi.fetchAnalyticsSummaryWithFallback).toHaveBeenCalledWith("stressed");
  });
});
