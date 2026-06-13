"use client";

import { FareUpdateBanner } from "@/components/layout/FareUpdateBanner";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { formatFareDelta } from "@/features/live-ride/mock/live-ride-mock";
import type { FareReasonUpdate } from "@/features/live-ride/types";

interface ReasonCodeUpdateListProps {
  updates: FareReasonUpdate[];
  latestReasonCode: string | null;
}

export function ReasonCodeUpdateList({ updates, latestReasonCode }: ReasonCodeUpdateListProps) {
  if (updates.length === 0 && !latestReasonCode) {
    return (
      <p className="text-xs text-rapido-grey" data-testid="reason-updates-empty">
        No fare changes yet — riding at estimate.
      </p>
    );
  }

  const latest = updates[updates.length - 1];

  return (
    <div className="space-y-3" data-testid="reason-code-updates">
      {latest ? (
        <FareUpdateBanner
          message={`${formatFareDelta(latest.delta_inr)} · ${latest.reason_label}`}
        />
      ) : null}

      <div className="space-y-1">
        {updates.map((update) => (
          <TimelineItem
            key={`${update.time_label}-${update.reason_code}`}
            title={update.reason_label}
            subtitle={`Fare ${formatInr(update.amount_inr)} (${formatFareDelta(update.delta_inr)})`}
            time={update.time_label}
            active={update.reason_code === latestReasonCode}
          />
        ))}
      </div>
    </div>
  );
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
