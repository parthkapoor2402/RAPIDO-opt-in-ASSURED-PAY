"use client";

import { formatInr } from "@/features/assured-pay/lib/fare";

interface FareProgressionCardProps {
  estimateF: number;
  buffer: number;
  approvedM: number;
  currentFare: number;
  residualDueIfEndedNow: number;
}

export function FareProgressionCard({
  estimateF,
  buffer,
  approvedM,
  currentFare,
  residualDueIfEndedNow,
}: FareProgressionCardProps) {
  const progressPct = Math.min(100, Math.round((currentFare / approvedM) * 100));

  return (
    <div
      data-testid="fare-progression-card"
      className="rounded-2xl border border-surface-200 bg-white p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-rapido-black">Fare progression</p>
          <p className="text-xs text-rapido-grey">
            Estimate {formatInr(estimateF)} · Buffer {formatInr(buffer)}
          </p>
        </div>
        <p className="text-lg font-bold tabular-nums text-rapido-black">{formatInr(currentFare)}</p>
      </div>

      <div data-testid="approved-max-indicator" className="space-y-1">
        <div className="flex justify-between text-xs text-rapido-grey">
          <span>{formatInr(estimateF)}</span>
          <span className="font-semibold text-rapido-black">Approved max {formatInr(approvedM)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progressPct}%` }}
            aria-valuenow={currentFare}
            aria-valuemin={0}
            aria-valuemax={approvedM}
            role="progressbar"
          />
        </div>
      </div>

      {residualDueIfEndedNow > 0 ? (
        <p className="text-xs font-medium text-warning-800">
          If ride ended now: {formatInr(residualDueIfEndedNow)} above max
        </p>
      ) : (
        <p className="text-xs text-rapido-grey">Still within your approved max if the ride ended now.</p>
      )}
    </div>
  );
}
