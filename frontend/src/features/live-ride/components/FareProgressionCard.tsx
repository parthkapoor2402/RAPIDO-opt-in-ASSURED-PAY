"use client";

import { formatInr } from "@/features/assured-pay/lib/fare";
import { getFareProgressionFooter } from "@/features/live-ride/lib/copy";
import type { TrustState } from "@/features/live-ride/types";
import { cn } from "@/lib/utils";

interface FareProgressionCardProps {
  estimateF: number;
  buffer: number;
  approvedM: number;
  currentFare: number;
  residualDueIfEndedNow: number;
  trustState: TrustState;
}

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function FareProgressionCard({
  estimateF,
  buffer,
  approvedM,
  currentFare,
  residualDueIfEndedNow,
  trustState,
}: FareProgressionCardProps) {
  const scaleMax = Math.max(approvedM, currentFare, estimateF);
  const pctEstimate = clampPct((estimateF / scaleMax) * 100);
  const pctMax = clampPct((approvedM / scaleMax) * 100);
  const pctCurrent = clampPct((currentFare / scaleMax) * 100);

  const footer = getFareProgressionFooter(
    trustState,
    currentFare,
    approvedM,
    residualDueIfEndedNow,
  );

  const markerTone =
    trustState === "review_required"
      ? "border-rapido-navy bg-rapido-navy"
      : trustState === "entered_buffer_zone"
        ? "border-brand-600 bg-brand-600"
        : "border-rapido-green bg-rapido-green";

  return (
    <div
      data-testid="fare-progression-card"
      className="rounded-2xl border border-surface-200 bg-white p-4 shadow-card space-y-3"
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        <div data-testid="fare-meter-estimate">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rapido-grey">
            Estimate
          </p>
          <p className="text-sm font-bold tabular-nums text-rapido-black">{formatInr(estimateF)}</p>
        </div>
        <div data-testid="fare-meter-current" className="px-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rapido-grey">Now</p>
          <p className="text-xl font-bold tabular-nums text-rapido-black">{formatInr(currentFare)}</p>
        </div>
        <div data-testid="fare-meter-max">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rapido-grey">
            Your max
          </p>
          <p className="text-sm font-bold tabular-nums text-rapido-black">{formatInr(approvedM)}</p>
        </div>
      </div>

      <div data-testid="approved-max-indicator" className="relative space-y-1.5">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-100">
          <div
            className="absolute inset-y-0 left-0 bg-success-50"
            style={{ width: `${pctEstimate}%` }}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 bg-brand-100"
            style={{ left: `${pctEstimate}%`, width: `${pctMax - pctEstimate}%` }}
            aria-hidden
          />
          {pctCurrent > pctMax ? (
            <div
              className="absolute inset-y-0 bg-surface-200"
              style={{ left: `${pctMax}%`, width: `${pctCurrent - pctMax}%` }}
              aria-hidden
            />
          ) : null}
        </div>

        <div className="relative h-4">
          <span
            className="absolute top-0 h-2.5 w-px -translate-x-1/2 bg-rapido-grey/50"
            style={{ left: `${pctEstimate}%` }}
            aria-hidden
          />
          <span
            className="absolute top-0 h-2.5 w-px -translate-x-1/2 bg-rapido-black"
            style={{ left: `${pctMax}%` }}
            aria-hidden
          />
          <span
            data-testid="fare-meter-marker"
            className={cn(
              "absolute -top-0.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-white shadow-sm",
              markerTone,
            )}
            style={{ left: `${pctCurrent}%` }}
            aria-label={`Current fare ${formatInr(currentFare)}`}
          />
        </div>

        <div className="flex justify-between text-[10px] text-rapido-grey">
          <span>Estimate</span>
          <span>Buffer {formatInr(buffer)}</span>
          <span>Max</span>
        </div>
      </div>

      {footer ? (
        <p
          className={cn(
            "text-xs font-medium",
            trustState === "review_required" ? "text-rapido-navy" : "text-rapido-grey",
          )}
          data-testid="fare-progression-footer"
        >
          {footer}
        </p>
      ) : null}
    </div>
  );
}
