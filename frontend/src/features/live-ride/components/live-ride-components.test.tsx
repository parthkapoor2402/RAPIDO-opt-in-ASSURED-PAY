import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FareTrustIndicator } from "@/features/live-ride/components/FareTrustIndicator";
import { FareProgressionCard } from "@/features/live-ride/components/FareProgressionCard";
import { LiveRideEventTimeline } from "@/features/live-ride/components/LiveRideEventTimeline";
import { ReasonCodeUpdateList } from "@/features/live-ride/components/ReasonCodeUpdateList";
import { buildMockRideProgress } from "@/features/live-ride/mock/live-ride-mock";

describe("FareTrustIndicator", () => {
  it("shows calm within-max copy", () => {
    render(<FareTrustIndicator trustState="within_approved_max" assuredPayActive />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("On track");
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent(
      "At your booking estimate",
    );
    expect(screen.getByTestId("assured-pay-active-chip")).toBeInTheDocument();
  });

  it("shows reassuring buffer copy", () => {
    render(<FareTrustIndicator trustState="entered_buffer_zone" assuredPayActive />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Still covered");
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Valid fare update");
  });

  it("shows fair review-first copy", () => {
    render(<FareTrustIndicator trustState="review_required" assuredPayActive={false} />);
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("Review first");
    expect(screen.getByTestId("fare-trust-indicator")).toHaveTextContent("not billed automatically");
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

  it("renders estimate, now, and max meter columns", () => {
    render(<FareProgressionCard {...base} trustState="entered_buffer_zone" />);
    expect(screen.getByTestId("fare-meter-estimate")).toHaveTextContent("₹42");
    expect(screen.getByTestId("fare-meter-current")).toHaveTextContent("₹46");
    expect(screen.getByTestId("fare-meter-max")).toHaveTextContent("₹49");
    expect(screen.getByTestId("fare-meter-marker")).toBeInTheDocument();
  });

  it("omits footer for within max", () => {
    render(<FareProgressionCard {...base} currentFare={42} trustState="within_approved_max" />);
    expect(screen.queryByTestId("fare-progression-footer")).not.toBeInTheDocument();
  });

  it("shows headroom footer for buffer zone", () => {
    render(<FareProgressionCard {...base} currentFare={48} trustState="entered_buffer_zone" />);
    expect(screen.getByTestId("fare-progression-footer")).toHaveTextContent("headroom before your max");
  });

  it("shows safe review footer", () => {
    render(
      <FareProgressionCard
        {...base}
        currentFare={52}
        residualDueIfEndedNow={3}
        trustState="review_required"
      />,
    );
    expect(screen.getByTestId("fare-progression-footer")).toHaveTextContent(
      "not charged yet",
    );
  });
});

describe("ReasonCodeUpdateList", () => {
  it("shows within-max empty copy when no updates", () => {
    render(
      <ReasonCodeUpdateList updates={[]} latestReasonCode={null} trustState="within_approved_max" />,
    );
    expect(screen.getByTestId("reason-updates-empty")).toHaveTextContent("Riding at estimate");
  });

  it("renders nothing for buffer when timeline carries the story", () => {
    const { container } = render(
      <ReasonCodeUpdateList updates={[]} latestReasonCode={null} trustState="entered_buffer_zone" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a single latest-change pill when updates exist", () => {
    render(
      <ReasonCodeUpdateList
        updates={[
          {
            time_label: "8:24",
            amount_inr: 46,
            delta_inr: 4,
            reason_code: "waiting_after_arrival",
            reason_label: "2 min waiting",
          },
        ]}
        latestReasonCode="waiting_after_arrival"
        trustState="entered_buffer_zone"
      />,
    );
    expect(screen.getByTestId("reason-update-pill")).toHaveTextContent("Latest change:");
    expect(screen.getByTestId("reason-update-pill")).toHaveTextContent("2 min waiting");
  });
});

describe("LiveRideEventTimeline", () => {
  it("renders scenario-specific timeline event", () => {
    render(
      <LiveRideEventTimeline
        scenarioId="buffer_zone"
        title="2 min waiting added"
        subtitle="Signal hold · +₹4 valid waiting charge"
      />,
    );
    const section = screen.getByTestId("live-ride-event-timeline");
    expect(section).toHaveAttribute("data-scenario", "buffer_zone");
    expect(section).toHaveTextContent("What's happening now");
    expect(section).toHaveTextContent("2 min waiting added");
  });
});

describe("live ride mock scenarios", () => {
  it("within_max final step stays calm with no reason codes", () => {
    const progress = buildMockRideProgress("within_max", 2);
    expect(progress.trust_state).toBe("within_approved_max");
    expect(progress.reason_updates).toHaveLength(0);
    expect(progress.timeline_subtitle).toMatch(/within your approved max/i);
  });

  it("buffer_zone step shows waiting then route timeline copy", () => {
    const waiting = buildMockRideProgress("buffer_zone", 1);
    expect(waiting.trust_state).toBe("entered_buffer_zone");
    expect(waiting.timeline_title).toBe("2 min waiting added");

    const route = buildMockRideProgress("buffer_zone", 2);
    expect(route.timeline_title).toBe("Route adjustment applied");
  });

  it("exceeds_review final step triggers review state and fair timeline", () => {
    const progress = buildMockRideProgress("exceeds_review", 2);
    expect(progress.trust_state).toBe("review_required");
    expect(progress.timeline_subtitle).toMatch(/review before any extra charge/i);
  });
});
