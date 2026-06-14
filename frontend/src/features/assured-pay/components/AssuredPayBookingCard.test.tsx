import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AssuredPayBookingCard } from "@/features/assured-pay/components/AssuredPayBookingCard";
import { AssuredPayExplanationModal } from "@/features/assured-pay/components/AssuredPayExplanationModal";
import { AssuredPayFareCard } from "@/features/assured-pay/components/AssuredPayFareCard";
import { DiscoveryPromptBanner } from "@/features/assured-pay/components/DiscoveryPromptBanner";
import { FreeTrialBadge } from "@/features/assured-pay/components/FreeTrialBadge";
import type { AssuredPayEligibility, DiscoveryPrompt } from "@/features/assured-pay/types";

const eligibleFixture: AssuredPayEligibility = {
  eligible: true,
  blockReasons: [],
  F: 42,
  buffer: 7,
  M: 49,
  freeTrialAvailable: true,
  validReasonCodes: ["waiting", "route_change", "toll", "pickup_correction"],
  hasPaymentInstrument: true,
  prompts: [
    {
      id: "low_battery",
      show: true,
      headline: "Heading out with low battery?",
      subline: "Lock your max now and checkout more easily at drop-off.",
      priority: 1,
    },
  ],
};

describe("AssuredPayFareCard", () => {
  it("renders F, buffer, and M amounts", () => {
    render(<AssuredPayFareCard estimateF={42} buffer={7} approvedMax={49} />);
    expect(screen.getByTestId("assured-pay-fare-card")).toHaveTextContent("₹42");
    expect(screen.getByTestId("assured-pay-fare-card")).toHaveTextContent("₹49");
    expect(screen.getByTestId("assured-pay-fare-card")).toHaveTextContent("Valid fare changes");
  });
});

describe("DiscoveryPromptBanner", () => {
  const prompt: DiscoveryPrompt = eligibleFixture.prompts[0];

  it("renders contextual headline when prompt provided", () => {
    render(<DiscoveryPromptBanner prompt={prompt} />);
    expect(screen.getByTestId("discovery-prompt-low_battery")).toHaveTextContent("low battery");
  });

  it("renders nothing when prompt is null", () => {
    const { container } = render(<DiscoveryPromptBanner prompt={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FreeTrialBadge", () => {
  it("shows badge when free trial available", () => {
    render(<FreeTrialBadge show />);
    expect(screen.getByTestId("free-trial-badge")).toBeInTheDocument();
  });

  it("hides badge when not available", () => {
    const { container } = render(<FreeTrialBadge show={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("AssuredPayExplanationModal", () => {
  it("lists covers and does-not-cover sections when open", () => {
    render(<AssuredPayExplanationModal open onClose={vi.fn()} />);
    expect(screen.getByTestId("assured-pay-explanation-modal")).toHaveTextContent("Covers");
    expect(screen.getByTestId("assured-pay-explanation-modal")).toHaveTextContent("Does not cover");
    expect(screen.getByText(/Approved max set upfront at booking/i)).toBeInTheDocument();
  });
});

describe("AssuredPayBookingCard", () => {
  it("shows blocked message when ineligible", () => {
    render(
      <AssuredPayBookingCard
        eligibility={{ ...eligibleFixture, eligible: false, blockReasons: ["open_residual"], prompts: [] }}
        primaryPromptId={null}
        optInEnabled={false}
        onOpenOptIn={vi.fn()}
      />,
    );
    expect(screen.getByTestId("assured-pay-blocked")).toHaveTextContent(/remaining due/i);
  });

  it("shows CTA and opens learn-more modal", async () => {
    const user = userEvent.setup();
    render(
      <AssuredPayBookingCard
        eligibility={eligibleFixture}
        primaryPromptId="low_battery"
        optInEnabled={false}
        onOpenOptIn={vi.fn()}
      />,
    );

    expect(screen.getByTestId("assured-pay-opt-in-cta")).toBeInTheDocument();
    expect(screen.getByTestId("free-trial-badge")).toBeInTheDocument();

    await user.click(screen.getByTestId("learn-more-assured-pay"));
    expect(screen.getByTestId("assured-pay-explanation-modal")).toBeInTheDocument();
  });

  it("shows enabled banner after opt-in", () => {
    render(
      <AssuredPayBookingCard
        eligibility={eligibleFixture}
        primaryPromptId="low_battery"
        optInEnabled
        onOpenOptIn={vi.fn()}
      />,
    );
    expect(screen.getByTestId("assured-pay-enabled-banner")).toHaveTextContent(/approved max locked/i);
    expect(screen.queryByTestId("assured-pay-opt-in-cta")).not.toBeInTheDocument();
  });
});
