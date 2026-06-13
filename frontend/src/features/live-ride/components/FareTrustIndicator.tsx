"use client";

import { StatusChip, type StatusChipTone } from "@/components/ui/StatusChip";
import {
  getTrustStateHelper,
  getTrustStateLabel,
  getTrustStateTone,
} from "@/features/live-ride/lib/trust-state";
import type { TrustState } from "@/features/live-ride/types";

interface FareTrustIndicatorProps {
  trustState: TrustState;
  assuredPayActive: boolean;
}

export function FareTrustIndicator({ trustState, assuredPayActive }: FareTrustIndicatorProps) {
  const tone = getTrustStateTone(trustState) as StatusChipTone;

  return (
    <div data-testid="fare-trust-indicator" className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {assuredPayActive ? (
          <span data-testid="assured-pay-active-chip">
            <StatusChip label="Assured Pay active" tone="brand" />
          </span>
        ) : null}
        <StatusChip label={getTrustStateLabel(trustState)} tone={tone} />
      </div>
      <p className="text-xs text-rapido-grey">{getTrustStateHelper(trustState)}</p>
    </div>
  );
}
