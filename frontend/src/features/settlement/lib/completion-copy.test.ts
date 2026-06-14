import { describe, expect, it } from "vitest";

import {
  CAPTAIN_PAYOUT_LABELS,
  getCaptainPayoutLabel,
  getCompletionCopy,
} from "@/features/settlement/lib/completion-copy";
import { parseCompletionScenario } from "@/features/settlement/lib/completion-scenario";

const AMOUNTS = {
  within: { charged: 42 },
  buffer: { charged: 48 },
  overage: { charged: 49, residual: 3 },
  suspicious: { charged: 49, underReview: 31 },
};

describe("completion copy", () => {
  it("within_max explains charge, no due, captain paid", () => {
    const copy = getCompletionCopy("within_max", AMOUNTS.within);
    expect(copy.statusChip).toBe("On track");
    expect(copy.subtitle).toMatch(/₹42 charged/);
    expect(copy.balanceStatus).toBe("Nothing due");
    expect(copy.captainStatus).toBe(CAPTAIN_PAYOUT_LABELS.paidInFull);
    expect(copy.showPayCta).toBe(false);
  });

  it("buffer_within_max uses still-covered tone", () => {
    const copy = getCompletionCopy("buffer_within_max", AMOUNTS.buffer);
    expect(copy.statusChip).toBe("Still covered");
    expect(copy.subtitle).toMatch(/within your max/i);
    expect(copy.captainPayoutLabel).toBe(CAPTAIN_PAYOUT_LABELS.paidInFull);
  });

  it("valid_overage shows residual due without scary tone", () => {
    const copy = getCompletionCopy("valid_overage", AMOUNTS.overage);
    expect(copy.statusChip).toBe("₹3 due");
    expect(copy.chargedNow).toMatch(/your approved max/i);
    expect(copy.captainStatus).toBe(CAPTAIN_PAYOUT_LABELS.paidByAssurance);
    expect(copy.payCtaLabel).toBe("Pay ₹3");
  });

  it("suspicious_overage states excess not collected", () => {
    const copy = getCompletionCopy("suspicious_overage", AMOUNTS.suspicious);
    expect(copy.statusChip).toBe("Under review");
    expect(copy.balanceStatus).toMatch(/not collected/i);
    expect(copy.captainStatus).toBe(CAPTAIN_PAYOUT_LABELS.pendingReview);
    expect(copy.subtitle).not.toMatch(/accus/i);
  });
});

describe("getCaptainPayoutLabel", () => {
  it("returns the three captain labels per scenario group", () => {
    expect(getCaptainPayoutLabel("within_max")).toBe(CAPTAIN_PAYOUT_LABELS.paidInFull);
    expect(getCaptainPayoutLabel("buffer_within_max")).toBe(CAPTAIN_PAYOUT_LABELS.paidInFull);
    expect(getCaptainPayoutLabel("valid_overage")).toBe(CAPTAIN_PAYOUT_LABELS.paidByAssurance);
    expect(getCaptainPayoutLabel("suspicious_overage")).toBe(
      CAPTAIN_PAYOUT_LABELS.pendingReview,
    );
  });
});

describe("parseCompletionScenario", () => {
  it("accepts legacy happy_path alias", () => {
    expect(parseCompletionScenario("happy_path")).toBe("within_max");
  });
});
