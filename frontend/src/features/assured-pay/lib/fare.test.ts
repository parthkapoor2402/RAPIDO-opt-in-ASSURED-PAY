import { describe, expect, it } from "vitest";

import {
  buildFareCardLines,
  computeApprovedMax,
  formatInr,
  formatReasonCodes,
} from "@/features/assured-pay/lib/fare";

describe("fare helpers", () => {
  it("computes approved max M = F + buffer", () => {
    expect(computeApprovedMax(42, 7)).toBe(49);
  });

  it("formats INR with rupee symbol", () => {
    expect(formatInr(42)).toBe("₹42");
    expect(formatInr(1248)).toBe("₹1,248");
  });

  it("builds fare card lines with primary fare and conditional max", () => {
    const lines = buildFareCardLines(42, 7, 49);
    expect(lines).toHaveLength(3);
    expect(lines[0].label).toBe("Your fare");
    expect(lines[0].amount).toBe("₹42");
    expect(lines[0].emphasis).toBe(true);
    expect(lines[2].amount).toBe("₹49");
  });

  it("formats reason codes for display", () => {
    expect(formatReasonCodes(["waiting", "route_change"])).toBe("waiting · route change");
  });
});
