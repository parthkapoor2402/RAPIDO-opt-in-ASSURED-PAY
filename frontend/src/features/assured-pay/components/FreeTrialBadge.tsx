"use client";

import { FREE_TRIAL_PROMO } from "@/features/assured-pay/lib/copy";

interface FreeTrialBadgeProps {
  show: boolean;
}

export function FreeTrialBadge({ show }: FreeTrialBadgeProps) {
  if (!show) return null;

  return (
    <span
      data-testid="free-trial-badge"
      className="inline-flex shrink-0 items-center rounded-full border border-brand-600/40 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800"
    >
      {FREE_TRIAL_PROMO.badge}
    </span>
  );
}
