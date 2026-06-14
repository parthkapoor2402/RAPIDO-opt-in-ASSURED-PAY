"use client";

import { StatusChip, type StatusChipTone } from "@/components/ui/StatusChip";
import { getTrustStateCopy } from "@/features/live-ride/lib/copy";
import {
  getTrustStateLabel,
  getTrustStateTone,
} from "@/features/live-ride/lib/trust-state";
import type { TrustState } from "@/features/live-ride/types";
import { cn } from "@/lib/utils";

interface FareTrustIndicatorProps {
  trustState: TrustState;
  assuredPayActive: boolean;
}

export function FareTrustIndicator({ trustState, assuredPayActive }: FareTrustIndicatorProps) {
  const tone = getTrustStateTone(trustState) as StatusChipTone;
  const { helper, surfaceClass } = getTrustStateCopy(trustState);

  return (
    <div
      data-testid="fare-trust-indicator"
      className={cn("rounded-2xl border px-3 py-2.5 space-y-1.5", surfaceClass)}
    >
      <div className="flex flex-wrap items-center gap-2">
        {assuredPayActive ? (
          <span data-testid="assured-pay-active-chip">
            <StatusChip label="Assured Pay" tone="brand" />
          </span>
        ) : null}
        <StatusChip label={getTrustStateLabel(trustState)} tone={tone} />
      </div>
      <p className="text-xs leading-relaxed text-rapido-black/80">{helper}</p>
    </div>
  );
}
