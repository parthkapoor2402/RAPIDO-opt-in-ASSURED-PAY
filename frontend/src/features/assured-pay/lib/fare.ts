import type { FareCardLine } from "@/features/assured-pay/types";

import { TRUST_COPY } from "@/features/assured-pay/lib/copy";

export const DEFAULT_BUFFER_INR = 7;
export const DEFAULT_ESTIMATE_F = 42;

export function computeApprovedMax(estimateF: number, bufferInr: number): number {
  if (estimateF < 0 || bufferInr < 0) {
    throw new Error("Fare amounts must be non-negative");
  }
  return estimateF + bufferInr;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Primary fare row — what the rider pays by default. */
export function buildPrimaryFareLine(estimateF: number): FareCardLine {
  return {
    label: "Your fare",
    amount: formatInr(estimateF),
    emphasis: true,
    hint: TRUST_COPY.primaryFareHint,
  };
}

/** Buffer + approved max — conditional, secondary. */
export function buildConditionalFareLines(
  bufferInr: number,
  approvedMax: number,
): FareCardLine[] {
  return [
    {
      label: "Buffer for valid updates",
      amount: formatInr(bufferInr),
      hint: "Waiting, route, or toll changes during the ride",
    },
    {
      label: "Approved max (if fare changes)",
      amount: formatInr(approvedMax),
      hint: TRUST_COPY.approvedMaxHint,
    },
  ];
}

/** @deprecated Prefer buildPrimaryFareLine + buildConditionalFareLines for booking UI. */
export function buildFareCardLines(
  estimateF: number,
  bufferInr: number,
  approvedMax: number,
): FareCardLine[] {
  return [buildPrimaryFareLine(estimateF), ...buildConditionalFareLines(bufferInr, approvedMax)];
}

export function formatReasonCodes(codes: string[]): string {
  return codes
    .map((code) => code.replace(/_/g, " "))
    .join(" · ");
}
