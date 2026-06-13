import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FareTrustIndicator } from "@/features/live-ride/components/FareTrustIndicator";
import { FareProgressionCard } from "@/features/live-ride/components/FareProgressionCard";

describe("FareTrustIndicator", () => {
  it("shows within approved max state", () => {
    render(<FareTrustIndicator trustState="within_approved_max" assuredPayActive />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Within approved max");
    expect(screen.getByTestId("assured-pay-active-chip")).toBeInTheDocument();
  });

  it("shows buffer zone warning", () => {
    render(<FareTrustIndicator trustState="entered_buffer_zone" assuredPayActive />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Entered buffer zone");
  });

  it("shows review required danger state", () => {
    render(<FareTrustIndicator trustState="review_required" assuredPayActive={false} />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Review required");
  });
});

describe("FareProgressionCard", () => {
  const base = {
    estimateF: 42,
    buffer: 7,
    approvedM: 49,
    currentFare: 46,
    residualDueIfEndedNow: 0,
  };

  it("renders F, buffer, M and current fare", () => {
    render(<FareProgressionCard {...base} />);
    expect(screen.getByTestId("fare-progression-card")).toHaveTextContent("₹42");
    expect(screen.getByTestId("fare-progression-card")).toHaveTextContent("₹49");
    expect(screen.getByTestId("fare-progression-card")).toHaveTextContent("₹46");
    expect(screen.getByTestId("approved-max-indicator")).toHaveTextContent("Approved max ₹49");
  });
});
