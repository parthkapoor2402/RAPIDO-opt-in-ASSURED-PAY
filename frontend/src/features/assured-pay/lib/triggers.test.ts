import { describe, expect, it } from "vitest";

import {
  discoveryContextFromRiderId,
  getPrimaryPrompt,
  isEligible,
  resolveDiscoveryPrompts,
} from "@/features/assured-pay/lib/triggers";
import type { DiscoveryContextInput } from "@/features/assured-pay/types";

const baseCtx = (overrides: Partial<DiscoveryContextInput> = {}): DiscoveryContextInput => ({
  riderId: "rider_commuter",
  paymentMethod: "cash",
  ...discoveryContextFromRiderId("rider_commuter"),
  ...overrides,
});

describe("discovery trigger logic", () => {
  it("shows low battery prompt when battery below 20%", () => {
    const ctx = baseCtx({ batteryLevel: 0.12 });
    const { eligible } = isEligible(ctx);
    const prompts = resolveDiscoveryPrompts(ctx, eligible);
    expect(getPrimaryPrompt(prompts)?.id).toBe("low_battery");
  });

  it("shows online payer prompt when UPI selected", () => {
    const ctx = baseCtx({ paymentMethod: "upi", batteryLevel: 0.9 });
    const { eligible } = isEligible(ctx);
    const prompts = resolveDiscoveryPrompts(ctx, eligible);
    expect(prompts.some((p) => p.id === "online_payer")).toBe(true);
  });

  it("shows post-failure prompt for rider_arjun persona", () => {
    const ctx = baseCtx({
      riderId: "rider_arjun",
      ...discoveryContextFromRiderId("rider_arjun"),
    });
    const { eligible } = isEligible(ctx);
    const prompts = resolveDiscoveryPrompts(ctx, eligible);
    expect(prompts.some((p) => p.id === "post_failure")).toBe(true);
  });

  it("shows free trial experiment for eligible commuter when promo eligible", () => {
    const ctx = baseCtx({ freeTrialAvailable: true, batteryLevel: 0.9 });
    const { eligible } = isEligible(ctx);
    const prompts = resolveDiscoveryPrompts(ctx, eligible, true);
    expect(prompts.some((p) => p.id === "free_trial")).toBe(true);
  });

  it("hides free trial prompt when promo not eligible", () => {
    const ctx = baseCtx({ freeTrialAvailable: true, batteryLevel: 0.9 });
    const { eligible } = isEligible(ctx);
    const prompts = resolveDiscoveryPrompts(ctx, eligible, false);
    expect(prompts.some((p) => p.id === "free_trial")).toBe(false);
  });

  it("blocks discovery when rider has open residual", () => {
    const ctx = baseCtx({
      riderId: "rider_blocked",
      ...discoveryContextFromRiderId("rider_blocked"),
    });
    const { eligible, blockReasons } = isEligible(ctx);
    expect(eligible).toBe(false);
    expect(blockReasons).toContain("open_residual");
    expect(resolveDiscoveryPrompts(ctx, eligible)).toHaveLength(0);
  });
});
