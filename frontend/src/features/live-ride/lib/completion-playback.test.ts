import { describe, expect, it } from "vitest";

import {
  buildRideCompletionPlayback,
  COMPLETION_STEP_INDEX,
  isCompletionStep,
} from "@/features/live-ride/lib/completion-playback";

describe("buildRideCompletionPlayback", () => {
  it("marks completion step index as step 4 in zero-based playback", () => {
    expect(COMPLETION_STEP_INDEX).toBe(3);
    expect(isCompletionStep(3)).toBe(true);
    expect(isCompletionStep(2)).toBe(false);
  });

  it("renders Scenario 1 — At estimated fare completion copy", () => {
    const completion = buildRideCompletionPlayback("within_max", 42, 7);
    expect(completion).toMatchObject({
      title: "Ride complete",
      headline: "Charged at your estimate",
      chargeSummary: "₹42",
      paymentStatus: "Fare unchanged",
      nextStep: "Receipt saved — you're done.",
    });
    expect(completion.statusBadge).toBeUndefined();
  });

  it("renders Scenario 2 — Entered buffer zone completion copy", () => {
    const completion = buildRideCompletionPlayback("buffer_zone", 42, 7);
    expect(completion).toMatchObject({
      title: "Ride complete",
      headline: "Within what you approved",
      chargeSummary: "₹48",
      paymentStatus: "Fare went up · still in range",
      nextStep: "No follow-up needed.",
    });
    expect(completion.reasonHint).toMatch(/waiting/i);
  });

  it("renders Scenario 3 C1 — small valid excess completion copy", () => {
    const completion = buildRideCompletionPlayback("exceeds_review", 42, 7, "valid_overage");
    expect(completion).toMatchObject({
      title: "Ride complete",
      headline: "Charged up to your max",
      chargeSummary: "₹49",
      paymentStatus: "₹3 pending",
      statusBadge: "Pending",
      variant: "valid_overage",
    });
    expect(completion.nextStep).toMatch(/confirm the small extra/i);
  });

  it("renders Scenario 3 C2 — suspicious excess completion copy", () => {
    const completion = buildRideCompletionPlayback(
      "exceeds_review",
      42,
      7,
      "suspicious_overage",
    );
    expect(completion).toMatchObject({
      title: "Ride complete",
      headline: "Approved amount secured",
      chargeSummary: "₹49",
      paymentStatus: "₹3 under review",
      statusBadge: "Under review",
      variant: "suspicious_overage",
    });
    expect(completion.nextStep).toMatch(/before any extra charge/i);
  });
});
