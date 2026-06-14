"use client";

import { getLatestReasonSummary, getReasonUpdatesEmptyCopy } from "@/features/live-ride/lib/copy";
import type { FareReasonUpdate, TrustState } from "@/features/live-ride/types";

interface ReasonCodeUpdateListProps {
  updates: FareReasonUpdate[];
  latestReasonCode: string | null;
  trustState: TrustState;
}

export function ReasonCodeUpdateList({
  updates,
  latestReasonCode,
  trustState,
}: ReasonCodeUpdateListProps) {
  if (updates.length === 0 && !latestReasonCode) {
    const emptyCopy = getReasonUpdatesEmptyCopy(trustState);
    if (!emptyCopy) {
      return null;
    }
    return (
      <p className="text-xs text-rapido-grey" data-testid="reason-updates-empty">
        {emptyCopy}
      </p>
    );
  }

  const latest = updates[updates.length - 1];
  if (!latest) {
    return null;
  }

  return (
    <p
      className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-rapido-black"
      data-testid="reason-update-pill"
    >
      Latest change: {getLatestReasonSummary(latest.delta_inr, latest.reason_label)}
    </p>
  );
}
