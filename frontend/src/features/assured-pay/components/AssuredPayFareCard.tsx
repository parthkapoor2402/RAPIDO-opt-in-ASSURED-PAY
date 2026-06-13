"use client";

import { FareSummaryCard } from "@/components/layout/FareSummaryCard";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { buildFareCardLines, formatReasonCodes } from "@/features/assured-pay/lib/fare";
import { TRUST_COPY, VALID_REASON_LABELS } from "@/features/assured-pay/lib/copy";

interface AssuredPayFareCardProps {
  estimateF: number;
  buffer: number;
  approvedMax: number;
  reasonCodes?: string[];
  showTrustLine?: boolean;
}

export function AssuredPayFareCard({
  estimateF,
  buffer,
  approvedMax,
  reasonCodes = [],
  showTrustLine = true,
}: AssuredPayFareCardProps) {
  const lines = buildFareCardLines(estimateF, buffer, approvedMax);

  return (
    <div className="space-y-3" data-testid="assured-pay-fare-card">
      <FareSummaryCard lines={lines} />
      <div>
        <p className="text-xs font-semibold text-rapido-black">Valid fare changes</p>
        <p className="mt-1 text-xs text-rapido-grey">
          {reasonCodes.length > 0
            ? formatReasonCodes(reasonCodes)
            : VALID_REASON_LABELS.join(" · ")}
        </p>
        <p className="mt-2 text-xs text-rapido-grey">{TRUST_COPY.fareTransparency}</p>
      </div>
      {showTrustLine ? (
        <TrustBanner message={TRUST_COPY.captainFairness} />
      ) : null}
    </div>
  );
}
