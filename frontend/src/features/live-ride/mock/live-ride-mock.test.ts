import { describe, expect, it } from "vitest";

import { getTrustStateCopy, getFareProgressionFooter } from "@/features/live-ride/lib/copy";
import { buildMockRideProgress, DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";
import {
  LIVE_RIDE_SCENARIO_EXPECTATIONS,
  getScenarioExpectation,
} from "@/features/live-ride/test/scenario-expectations";

describe("buildMockRideProgress", () => {
  it("exposes all three demo scenarios with four steps each", () => {
    expect(DEMO_SCENARIOS).toHaveLength(3);
    for (const scenario of DEMO_SCENARIOS) {
      expect(scenario.step_count).toBe(4);
    }
  });

  it("renames Scenario 1 to At estimated fare", () => {
    const withinMax = DEMO_SCENARIOS.find((s) => s.id === "within_max");
    expect(withinMax?.label).toBe("At estimated fare");
  });

  it.each(LIVE_RIDE_SCENARIO_EXPECTATIONS.map((s) => [s.id, s.finalStepIndex] as const))(
    "scenario %s step %i matches trust state and timeline contract",
    (scenarioId, stepIndex) => {
      const expected = getScenarioExpectation(scenarioId);
      const progress = buildMockRideProgress(scenarioId, stepIndex);

      expect(progress.trust_state).toBe(expected.trustState);
      expect(progress.timeline_title).toBe(expected.timelineTitle);
      expect(progress.timeline_subtitle).toMatch(expected.timelineSubtitle);
      expect(progress.current_fare).toBe(parseInt(expected.currentFare.replace(/[₹,]/g, ""), 10));

      const copy = getTrustStateCopy(progress.trust_state);
      expect(copy.label).toBe(expected.trustLabel);
      expect(copy.helper).toMatch(expected.trustHelper);

      const footer = getFareProgressionFooter(
        progress.trust_state,
        progress.current_fare,
        progress.approved_m,
        progress.residual_due_if_ended_now,
      );
      if (expected.footerPattern) {
        expect(footer).toMatch(expected.footerPattern);
      } else {
        expect(footer).toBeNull();
      }
    },
  );

  it("within_max steps stay within_approved_max through live ride (steps 1–3)", () => {
    for (let step = 0; step < 3; step += 1) {
      expect(buildMockRideProgress("within_max", step).trust_state).toBe("within_approved_max");
    }
  });

  it("step 4 marks ride completed with completion payload for each scenario", () => {
    const within = buildMockRideProgress("within_max", 3);
    expect(within.ride_phase).toBe("completed");
    expect(within.completion?.headline).toBe("Charged at your estimate");
    expect(within.completion?.chargeSummary).toBe("₹42");

    const buffer = buildMockRideProgress("buffer_zone", 3);
    expect(buffer.ride_phase).toBe("completed");
    expect(buffer.completion?.headline).toBe("Within what you approved");
    expect(buffer.completion?.chargeSummary).toBe("₹48");

    const validExcess = buildMockRideProgress("exceeds_review", 3, 42, true, 7, "valid_overage");
    expect(validExcess.completion).toMatchObject({
      headline: "Charged up to your max",
      chargeSummary: "₹49",
      paymentStatus: "₹3 pending",
      statusBadge: "Pending",
    });

    const suspicious = buildMockRideProgress(
      "exceeds_review",
      3,
      42,
      true,
      7,
      "suspicious_overage",
    );
    expect(suspicious.completion).toMatchObject({
      headline: "Approved amount secured",
      chargeSummary: "₹49",
      paymentStatus: "₹3 under review",
      statusBadge: "Under review",
    });
  });

  it("buffer_zone enters buffer only after a valid reason charge", () => {
    expect(buildMockRideProgress("buffer_zone", 0).trust_state).toBe("within_approved_max");
    expect(buildMockRideProgress("buffer_zone", 1).trust_state).toBe("entered_buffer_zone");
    expect(buildMockRideProgress("buffer_zone", 2).trust_state).toBe("entered_buffer_zone");
  });

  it("exceeds_review reaches review_required only on final unverified step", () => {
    expect(buildMockRideProgress("exceeds_review", 0).trust_state).toBe("within_approved_max");
    expect(buildMockRideProgress("exceeds_review", 1).trust_state).toBe("entered_buffer_zone");
    expect(buildMockRideProgress("exceeds_review", 2).trust_state).toBe("review_required");
  });

  it.each([
    [85, 10],
    [145, 15],
  ] as const)("buffer and review scenarios stay truthful for F=%i buffer=%i", (F, buffer) => {
    const M = F + buffer;
    const bufferFinal = buildMockRideProgress("buffer_zone", 2, F, true, buffer);
    expect(bufferFinal.trust_state).toBe("entered_buffer_zone");
    expect(bufferFinal.current_fare).toBe(M - 1);

    const reviewMid = buildMockRideProgress("exceeds_review", 1, F, true, buffer);
    expect(reviewMid.trust_state).toBe("entered_buffer_zone");
    expect(reviewMid.current_fare).toBe(M);

    const reviewFinal = buildMockRideProgress("exceeds_review", 2, F, true, buffer);
    expect(reviewFinal.trust_state).toBe("review_required");
    expect(reviewFinal.current_fare).toBeGreaterThan(M);
  });
});
