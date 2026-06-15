export type DiscoverySource =
  | "booking_card"
  | "low_battery"
  | "online_payer"
  | "post_failure"
  | "free_trial"
  | "commute_banner";

export type PaymentMethod = "cash" | "upi" | "card";

export interface DiscoveryPrompt {
  id: DiscoverySource;
  show: boolean;
  headline: string;
  subline: string;
  priority: number;
}

import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";

export interface AssuredPayEligibility {
  eligible: boolean;
  blockReasons: string[];
  F: number;
  buffer: number;
  M: number;
  categoryId: RideCategoryId;
  categoryLabel: string;
  /** Rider profile allows trial and it has not been consumed locally. */
  riderTrialUnused: boolean;
  /** Bike + fare cap + trial unused — controls promo UI only. */
  freeTrialPromoEligible: boolean;
  validReasonCodes: string[];
  hasPaymentInstrument: boolean;
  prompts: DiscoveryPrompt[];
  rebookingRestriction?: "none" | "assured_pay_blocked" | "repeat_unpaid_blocked";
  standardRideAllowed?: boolean;
}

export interface DiscoveryContextInput {
  riderId: string;
  paymentMethod: PaymentMethod;
  batteryLevel?: number | null;
  batteryLowOverride?: boolean;
  priorPaymentFailure?: boolean;
  onlinePaymentRideCount?: number;
  hasOpenResidual?: boolean;
  hasPaymentInstrument?: boolean;
  /** Rider profile: trial not yet consumed on account. */
  freeTrialAvailable?: boolean;
  rebookingRestriction?: "none" | "assured_pay_blocked" | "repeat_unpaid_blocked";
}

export interface FareCardLine {
  label: string;
  amount: string;
  emphasis?: boolean;
  hint?: string;
}

export interface OptInState {
  enabled: boolean;
  discoverySource: DiscoverySource | null;
  authorizationId: string | null;
  freeTrialApplied: boolean;
}

export interface AuthorizePayload {
  rideId: string;
  paymentInstrumentId: string;
  discoverySource: DiscoverySource;
  consent: boolean;
}

export interface AuthorizeResult {
  authorized: boolean;
  authorizationId: string;
  M: number;
  freeTrialApplied: boolean;
  message: string;
}
