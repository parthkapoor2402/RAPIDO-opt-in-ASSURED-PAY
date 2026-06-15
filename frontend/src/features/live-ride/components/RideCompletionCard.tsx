"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import type { RideCompletionPlayback } from "@/features/live-ride/types";
import { cn } from "@/lib/utils";

interface RideCompletionCardProps {
  completion: RideCompletionPlayback;
  scenarioId: string;
}

export function RideCompletionCard({ completion, scenarioId }: RideCompletionCardProps) {
  const isReviewVariant = completion.variant === "suspicious_overage";
  const badgeTone = isReviewVariant ? "neutral" : "warning";

  return (
    <div
      data-testid="ride-completion-card"
      data-scenario={scenarioId}
      data-completion-variant={completion.variant ?? "none"}
      className={cn(
        "rounded-2xl border px-4 py-4 space-y-3",
        isReviewVariant
          ? "border-rapido-tint bg-rapido-tint/30"
          : "border-brand-600/30 bg-brand-50",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold",
            isReviewVariant ? "bg-white text-rapido-navy" : "bg-brand-600 text-rapido-black",
          )}
          aria-hidden
        >
          ✓
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-rapido-black">{completion.title}</h2>
            {completion.statusBadge ? (
              <span data-testid="ride-completion-badge">
                <StatusChip label={completion.statusBadge} tone={badgeTone} />
              </span>
            ) : null}
          </div>
          <p
            data-testid="ride-completion-headline"
            className="text-sm font-semibold text-rapido-black/90"
          >
            {completion.headline}
          </p>
        </div>
      </div>

      <dl className="space-y-1.5 text-sm border-t border-surface-200/80 pt-3">
        <div className="flex justify-between gap-3">
          <dt className="text-rapido-grey">Charged now</dt>
          <dd
            data-testid="ride-completion-charge"
            className="font-semibold text-rapido-black text-right"
          >
            {completion.chargeSummary}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-rapido-grey">Payment status</dt>
          <dd
            data-testid="ride-completion-payment-status"
            className="font-semibold text-rapido-black text-right"
          >
            {completion.paymentStatus}
          </dd>
        </div>
      </dl>

      {completion.reasonHint ? (
        <p data-testid="ride-completion-reason" className="text-xs text-rapido-grey">
          {completion.reasonHint}
        </p>
      ) : null}

      <p
        data-testid="ride-completion-next-step"
        className="text-xs leading-relaxed text-rapido-grey border-t border-surface-200/80 pt-2"
      >
        <span className="font-semibold text-rapido-black/80">What&apos;s next: </span>
        {completion.nextStep}
      </p>
    </div>
  );
}
