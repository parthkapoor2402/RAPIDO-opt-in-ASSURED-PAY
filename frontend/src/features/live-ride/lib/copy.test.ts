import { describe, expect, it } from "vitest";

import {
  getFareProgressionFooter,
  getReasonUpdatesEmptyCopy,
  getTrustStateCopy,
} from "@/features/live-ride/lib/copy";

describe("live ride copy", () => {
  it("uses distinct trust helpers per scenario", () => {
    const within = getTrustStateCopy("within_approved_max");
    const buffer = getTrustStateCopy("entered_buffer_zone");
    const review = getTrustStateCopy("review_required");

    expect(within.label).toBe("On track");
    expect(buffer.label).toBe("Still covered");
    expect(review.label).toBe("Review first");
    expect(within.helper).not.toBe(buffer.helper);
    expect(buffer.helper).not.toBe(review.helper);
  });

  it("only shows empty-state copy for within-max", () => {
    expect(getReasonUpdatesEmptyCopy("within_approved_max")).toMatch(/riding at estimate/i);
    expect(getReasonUpdatesEmptyCopy("entered_buffer_zone")).toBeNull();
    expect(getReasonUpdatesEmptyCopy("review_required")).toBeNull();
  });

  it("formats fare progression footers only when additive", () => {
    expect(getFareProgressionFooter("within_approved_max", 42, 49, 0)).toBeNull();
    expect(getFareProgressionFooter("entered_buffer_zone", 48, 49, 0)).toMatch(/headroom/i);
    expect(getFareProgressionFooter("review_required", 52, 49, 3)).toMatch(/not charged yet/i);
  });
});
