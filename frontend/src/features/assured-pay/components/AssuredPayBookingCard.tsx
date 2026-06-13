"use client";

import Link from "next/link";

import { CTAButton } from "@/components/ui/CTAButton";
import { AssuredPayFareCard } from "@/features/assured-pay/components/AssuredPayFareCard";
import { AssuredPayExplanationModal } from "@/features/assured-pay/components/AssuredPayExplanationModal";
import { DiscoveryPromptBanner } from "@/features/assured-pay/components/DiscoveryPromptBanner";
import { FreeTrialBadge } from "@/features/assured-pay/components/FreeTrialBadge";
import { BLOCK_REASON_MESSAGES, TRUST_COPY } from "@/features/assured-pay/lib/copy";
import type { AssuredPayEligibility, DiscoverySource } from "@/features/assured-pay/types";
import { useState } from "react";

interface AssuredPayBookingCardProps {
  eligibility: AssuredPayEligibility;
  primaryPromptId: DiscoverySource | null;
  optInEnabled: boolean;
  onOpenOptIn: (source: DiscoverySource) => void;
  onLearnMore?: () => void;
}

export function AssuredPayBookingCard({
  eligibility,
  primaryPromptId,
  optInEnabled,
  onOpenOptIn,
  onLearnMore,
}: AssuredPayBookingCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const primaryPrompt =
    eligibility.prompts.find((p) => p.id === primaryPromptId) ??
    eligibility.prompts[0] ??
    null;

  if (!eligibility.eligible) {
    const message =
      eligibility.blockReasons
        .map((reason) => BLOCK_REASON_MESSAGES[reason] ?? reason)
        .join(" ") || "Assured Pay is unavailable for this ride.";

    return (
      <div
        data-testid="assured-pay-blocked"
        className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-rapido-grey space-y-2"
      >
        <p>{message}</p>
        {eligibility.rebookingRestriction === "repeat_unpaid_blocked" ? (
          <p className="text-xs" data-testid="repeat-unpaid-notice">
            Standard bike booking is still available. Clear open balances to restore Assured Pay.
          </p>
        ) : null}
        {eligibility.blockReasons.includes("open_residual") ? (
          <Link
            href="/recovery"
            className="inline-block text-xs font-semibold text-rapido-navy underline"
            data-testid="resolve-due-link"
          >
            Review fare & resolve
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="assured-pay-booking-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-rapido-black">Assured Pay</p>
          <p className="text-xs text-rapido-grey">{TRUST_COPY.riderLead}</p>
        </div>
        <FreeTrialBadge show={eligibility.freeTrialAvailable} />
      </div>

      <DiscoveryPromptBanner
        prompt={primaryPrompt}
        onAction={() => primaryPrompt && onOpenOptIn(primaryPrompt.id)}
      />

      <AssuredPayFareCard
        estimateF={eligibility.F}
        buffer={eligibility.buffer}
        approvedMax={eligibility.M}
        reasonCodes={eligibility.validReasonCodes}
      />

      <button
        type="button"
        data-testid="learn-more-assured-pay"
        className="text-xs font-semibold text-rapido-navy underline-offset-2 hover:underline"
        onClick={() => {
          setModalOpen(true);
          onLearnMore?.();
        }}
      >
        What it covers / what it does not cover
      </button>

      {optInEnabled ? (
        <p
          data-testid="assured-pay-enabled-banner"
          className="rounded-xl bg-success-50 px-3 py-2 text-xs font-semibold text-success-700"
        >
          {TRUST_COPY.optInConfirm}
        </p>
      ) : (
        <Link href="/booking/assured-pay" onClick={() => onOpenOptIn("booking_card")}>
          <CTAButton fullWidth variant="primary" data-testid="assured-pay-opt-in-cta">
            Turn on Assured Pay
          </CTAButton>
        </Link>
      )}

      <AssuredPayExplanationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
