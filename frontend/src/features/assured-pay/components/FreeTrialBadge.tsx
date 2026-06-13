"use client";

interface FreeTrialBadgeProps {
  show: boolean;
}

export function FreeTrialBadge({ show }: FreeTrialBadgeProps) {
  if (!show) return null;

  return (
    <span
      data-testid="free-trial-badge"
      className="inline-flex items-center rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-rapido-black"
    >
      First ride free
    </span>
  );
}
