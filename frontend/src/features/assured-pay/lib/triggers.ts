import type {
  DiscoveryContextInput,
  DiscoveryPrompt,
  DiscoverySource,
} from "@/features/assured-pay/types";

const ONLINE_PAYMENT_THRESHOLD = 2;

function isBatteryLow(ctx: DiscoveryContextInput): boolean {
  if (ctx.batteryLowOverride) return true;
  if (ctx.batteryLevel != null && ctx.batteryLevel < 0.2) return true;
  return false;
}

export function isEligible(ctx: DiscoveryContextInput): {
  eligible: boolean;
  blockReasons: string[];
} {
  const blockReasons: string[] = [];
  if (ctx.hasOpenResidual) blockReasons.push("open_residual");
  if (ctx.hasPaymentInstrument === false) blockReasons.push("payment_instrument_required");
  return { eligible: blockReasons.length === 0, blockReasons };
}

export function resolveDiscoveryPrompts(
  ctx: DiscoveryContextInput,
  eligible: boolean,
  freeTrialPromoEligible = false,
): DiscoveryPrompt[] {
  const prompts: DiscoveryPrompt[] = [];

  if (eligible) {
    prompts.push({
      id: "booking_card",
      show: true,
      headline: "Smoother checkout at drop-off",
      subline: "Lock in an approved max and finish digitally with less friction.",
      priority: 10,
    });
  }

  if (freeTrialPromoEligible) {
    prompts.push({
      id: "free_trial",
      show: true,
      headline: "Try Assured Pay on this eligible bike ride",
      subline: "Limited trial · upfront clarity and smoother checkout.",
      priority: 5,
    });
  }

  if (eligible && isBatteryLow(ctx)) {
    prompts.push({
      id: "low_battery",
      show: true,
      headline: "Heading out with low battery?",
      subline: "Lock your max now and checkout more easily at drop-off.",
      priority: 1,
    });
  }

  if (eligible && (ctx.paymentMethod === "upi" || ctx.paymentMethod === "card")) {
    prompts.push({
      id: "online_payer",
      show: true,
      headline: "Prefer paying digitally?",
      subline: "Assured Pay gives you an upfront max and smoother UPI checkout at drop-off.",
      priority: 2,
    });
  } else if (
    eligible &&
    (ctx.onlinePaymentRideCount ?? 0) >= ONLINE_PAYMENT_THRESHOLD
  ) {
    prompts.push({
      id: "online_payer",
      show: true,
      headline: "You often pay digitally",
      subline: "Get an upfront approved max and a smoother checkout when you arrive.",
      priority: 3,
    });
  }

  if (eligible && ctx.priorPaymentFailure) {
    prompts.push({
      id: "post_failure",
      show: true,
      headline: "Smoother checkout next time",
      subline: "Last checkout was slow? Assured Pay locks your max upfront for an easier drop-off.",
      priority: 1,
    });
  }

  return [...prompts].sort((a, b) => a.priority - b.priority);
}

export function getPrimaryPrompt(prompts: DiscoveryPrompt[]): DiscoveryPrompt | null {
  const visible = prompts.filter((p) => p.show);
  if (visible.length === 0) return null;
  return visible.reduce((best, current) => (current.priority < best.priority ? current : best));
}

export function discoveryContextFromRiderId(riderId: string): Partial<DiscoveryContextInput> {
  switch (riderId) {
    case "rider_commuter":
      return {
        freeTrialAvailable: true,
        onlinePaymentRideCount: 3,
        priorPaymentFailure: false,
        hasOpenResidual: false,
        hasPaymentInstrument: true,
      };
    case "rider_arjun":
      return {
        freeTrialAvailable: false,
        priorPaymentFailure: true,
        hasOpenResidual: false,
        hasPaymentInstrument: true,
      };
    case "rider_blocked":
      return {
        hasOpenResidual: true,
        hasPaymentInstrument: true,
        freeTrialAvailable: false,
      };
    default:
      return { hasPaymentInstrument: true, freeTrialAvailable: true };
  }
}

export function isValidDiscoverySource(value: string): value is DiscoverySource {
  return [
    "booking_card",
    "low_battery",
    "online_payer",
    "post_failure",
    "free_trial",
    "commute_banner",
  ].includes(value);
}
