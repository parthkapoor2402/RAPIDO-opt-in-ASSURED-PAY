import { describe, expect, it } from "vitest";

import { completionToFlowOutcome } from "@/features/settlement/lib/completion-scenario";
import { buildMockSettlement, scenarioExecuteInput } from "@/features/settlement/mock/settlement-mock";
import {
  COMPLETION_SCENARIO_EXPECTATIONS,
  getCompletionExpectation,
} from "@/features/settlement/test/completion-expectations";

describe("buildMockSettlement", () => {
  it.each(COMPLETION_SCENARIO_EXPECTATIONS.map((s) => [s.id] as const))(
    "scenario %s matches product fare contract",
    (scenarioId) => {
      const expected = getCompletionExpectation(scenarioId);
      const settlement = buildMockSettlement(scenarioId);

      expect(settlement.completion_scenario).toBe(scenarioId);
      expect(settlement.actual_a).toBe(parseInt(expected.finalFare.replace(/[₹,]/g, ""), 10));
      expect(settlement.rider_charged).toBe(parseInt(expected.chargedNow.replace(/[₹,]/g, ""), 10));
      expect(settlement.flow_outcome).toBe(completionToFlowOutcome(scenarioId));

      if (expected.residualDue) {
        expect(settlement.residual_due?.amount_inr).toBe(
          parseInt(expected.residualDue.replace(/[₹,]/g, ""), 10),
        );
      } else {
        expect(settlement.residual_due).toBeNull();
      }

      if (expected.underReview) {
        expect(settlement.amount_under_review).toBe(
          parseInt(expected.underReview.replace(/[₹,]/g, ""), 10),
        );
      }

      expect(settlement.payout.status_label).toMatch(
        new RegExp(expected.captainPayoutLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      );
    },
  );

  it("never charges rider more than M in overage scenarios", () => {
    for (const id of ["valid_overage", "suspicious_overage"] as const) {
      const settlement = buildMockSettlement(id);
      expect(settlement.rider_charged).toBeLessThanOrEqual(settlement.approved_m);
      expect(settlement.rider_charged).toBe(settlement.approved_m);
    }
  });

  it("within_max and buffer_within_max charge actual fare A", () => {
    for (const id of ["within_max", "buffer_within_max"] as const) {
      const input = scenarioExecuteInput(id);
      const settlement = buildMockSettlement(id);
      expect(settlement.rider_charged).toBe(input.actual_a);
      expect(settlement.rider_charged).toBeLessThanOrEqual(settlement.approved_m);
    }
  });
});
