import type { FareCardLine } from "@/features/assured-pay/types";

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

export function buildFareCardLines(
  estimateF: number,
  bufferInr: number,
  approvedMax: number,
): FareCardLine[] {
  return [
    { label: "Fare estimate (F)", amount: formatInr(estimateF) },
    {
      label: "Buffer included",
      amount: formatInr(bufferInr),
      hint: "Covers small valid fare changes during the ride",
    },
    {
      label: "Approved max (M)",
      amount: formatInr(approvedMax),
      emphasis: true,
      hint: "Most you approve before the ride starts",
    },
  ];
}

export function formatReasonCodes(codes: string[]): string {
  return codes
    .map((code) => code.replace(/_/g, " "))
    .join(" · ");
}
