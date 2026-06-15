"use client";

import { FareSummaryCard } from "@/components/layout/FareSummaryCard";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { FareRow } from "@/components/ui/FareRow";
import {
  buildConditionalFareLines,
  buildPrimaryFareLine,
  formatReasonCodes,
} from "@/features/assured-pay/lib/fare";
import { BOOKING_MODULE, TRUST_COPY, VALID_REASON_LABELS } from "@/features/assured-pay/lib/copy";

interface AssuredPayFareCardProps {
  estimateF: number;
  buffer: number;
  approvedMax: number;
  reasonCodes?: string[];
  showTrustLine?: boolean;
  /** Booking module: primary fare visible, max in collapsible details. */
  variant?: "full" | "booking";
}

export function AssuredPayFareCard({
  estimateF,
  buffer,
  approvedMax,
  reasonCodes = [],
  showTrustLine = true,
  variant = "full",
}: AssuredPayFareCardProps) {
  const primaryLine = buildPrimaryFareLine(estimateF);
  const conditionalLines = buildConditionalFareLines(buffer, approvedMax);

  if (variant === "booking") {
    return (
      <div className="space-y-2" data-testid="assured-pay-fare-card">
        <div
          className="rounded-2xl border border-surface-200 bg-white px-4 py-3"
          data-testid="assured-pay-primary-fare"
        >
          <FareRow {...primaryLine} />
          <p className="mt-1 text-xs text-rapido-grey" data-testid="assured-pay-fare-clarity">
            {TRUST_COPY.fareClarity}
          </p>
        </div>

        <details className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-2">
          <summary className="cursor-pointer list-none text-xs font-semibold text-rapido-navy [&::-webkit-details-marker]:hidden">
            {BOOKING_MODULE.fareDetailsSummary}
          </summary>
          <div className="mt-2 space-y-2 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rapido-grey">
              {TRUST_COPY.conditionalSectionTitle}
            </p>
            <FareSummaryCard lines={conditionalLines} className="shadow-none" />
            <p className="text-xs text-rapido-grey">{TRUST_COPY.fareTransparency}</p>
            <p className="text-xs text-rapido-grey">
              {reasonCodes.length > 0
                ? formatReasonCodes(reasonCodes)
                : VALID_REASON_LABELS.join(" · ")}
            </p>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="assured-pay-fare-card">
      <FareSummaryCard lines={[primaryLine, ...conditionalLines]} />
      <div>
        <p className="text-xs font-semibold text-rapido-black">Valid fare changes</p>
        <p className="mt-1 text-xs text-rapido-grey">
          {reasonCodes.length > 0
            ? formatReasonCodes(reasonCodes)
            : VALID_REASON_LABELS.join(" · ")}
        </p>
        <p className="mt-2 text-xs text-rapido-grey">{TRUST_COPY.fareTransparency}</p>
      </div>
      {showTrustLine ? <TrustBanner message={TRUST_COPY.captainFairness} /> : null}
    </div>
  );
}
