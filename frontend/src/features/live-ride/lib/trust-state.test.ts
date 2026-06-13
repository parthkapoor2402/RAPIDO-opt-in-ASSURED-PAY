import { describe, expect, it } from "vitest";

import {
  getTrustStateLabel,
  getTrustStateTone,
  mapFareStateToTrustState,
} from "@/features/live-ride/lib/trust-state";

describe("trust state mapping", () => {
  it("maps within_estimate to within approved max", () => {
    expect(mapFareStateToTrustState("within_estimate", false)).toBe("within_approved_max");
  });

  it("maps in_buffer to entered buffer zone", () => {
    expect(mapFareStateToTrustState("in_buffer", false)).toBe("entered_buffer_zone");
  });

  it("maps exceeds_max to review required", () => {
    expect(mapFareStateToTrustState("exceeds_max", false)).toBe("review_required");
  });

  it("forces review required when backend flag set", () => {
    expect(mapFareStateToTrustState("in_buffer", true)).toBe("review_required");
  });

  it("returns readable labels", () => {
    expect(getTrustStateLabel("within_approved_max")).toBe("Within approved max");
    expect(getTrustStateLabel("entered_buffer_zone")).toBe("Entered buffer zone");
    expect(getTrustStateLabel("review_required")).toBe("Review required");
  });

  it("returns chip tones", () => {
    expect(getTrustStateTone("within_approved_max")).toBe("success");
    expect(getTrustStateTone("entered_buffer_zone")).toBe("warning");
    expect(getTrustStateTone("review_required")).toBe("danger");
  });
});
