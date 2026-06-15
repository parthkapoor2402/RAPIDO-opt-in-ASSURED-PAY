import { describe, expect, it, vi, afterEach } from "vitest";

import {
  fetchRideProgressWithFallback,
  listScenariosWithFallback,
} from "@/features/live-ride/api/ride-progress";
import { COMPLETION_STEP_INDEX } from "@/features/live-ride/lib/completion-playback";
import { DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";

describe("ride-progress demo playback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists four-step demo scenarios with At estimated fare label", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("api down")));

    const scenarios = await listScenariosWithFallback();
    expect(scenarios).toEqual(DEMO_SCENARIOS);
    expect(scenarios.find((s) => s.id === "within_max")?.label).toBe("At estimated fare");
    expect(scenarios.every((s) => s.step_count === 4)).toBe(true);
  });

  it("returns Step 4 completion from mock even when scenario API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("api down")));

    const progress = await fetchRideProgressWithFallback("within_max", COMPLETION_STEP_INDEX, 42, true, 7);
    expect(progress.ride_phase).toBe("completed");
    expect(progress.completion?.headline).toBe("Charged at your estimate");
    expect(progress.timeline_title).toBe("Ride complete");
  });

  it("supports exceeds_review Step 4 subcases from mock", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("api down")));

    const pending = await fetchRideProgressWithFallback(
      "exceeds_review",
      COMPLETION_STEP_INDEX,
      42,
      true,
      7,
      "valid_overage",
    );
    expect(pending.completion?.statusBadge).toBe("Pending");

    const review = await fetchRideProgressWithFallback(
      "exceeds_review",
      COMPLETION_STEP_INDEX,
      42,
      true,
      7,
      "suspicious_overage",
    );
    expect(review.completion?.statusBadge).toBe("Under review");
  });
});
