"use client";

import Link from "next/link";

import { CTAButton } from "@/components/ui/CTAButton";
import { AssuredPayFareCard } from "@/features/assured-pay/components/AssuredPayFareCard";
import { AssuredPayExplanationModal } from "@/features/assured-pay/components/AssuredPayExplanationModal";
import { FreeTrialBadge } from "@/features/assured-pay/components/FreeTrialBadge";
import {
  BLOCK_REASON_MESSAGES,
  BOOKING_MODULE,
  FREE_TRIAL_PROMO,
  getAssuredPayCtaLabel,
  getAssuredPayCtaSubline,
  TRUST_COPY,
} from "@/features/assured-pay/lib/copy";
import { formatInr } from "@/features/assured-pay/lib/fare";
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
  optInEnabled,
  onOpenOptIn,
  onLearnMore,
}: AssuredPayBookingCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
            Standard {eligibility.categoryLabel.toLowerCase()} booking is still available. Clear open balances to restore Assured Pay.
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

  const ctaLabel = getAssuredPayCtaLabel();
  const ctaSubline = getAssuredPayCtaSubline(eligibility.freeTrialPromoEligible);

  return (
    <div
      className="space-y-3 rounded-2xl border border-brand-600/25 bg-brand-50/40 px-4 py-4"
      data-testid="assured-pay-booking-card"
    >
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-800">
          {BOOKING_MODULE.label}
        </p>
        <p className="text-sm font-bold text-rapido-black" data-testid="assured-pay-module-headline">
          {BOOKING_MODULE.headline}
        </p>
        <p className="text-xs text-rapido-grey" data-testid="assured-pay-module-helper">
          {BOOKING_MODULE.helper}
        </p>
      </div>

      <div
        className="flex items-baseline justify-between rounded-xl bg-white px-3 py-2"
        data-testid="assured-pay-selected-fare"
      >
        <span className="text-xs text-rapido-grey">{eligibility.categoryLabel} fare</span>
        <span className="text-lg font-bold tabular-nums text-rapido-black">{formatInr(eligibility.F)}</span>
      </div>

      {optInEnabled ? (
        <p
          data-testid="assured-pay-enabled-banner"
          className="rounded-xl bg-success-50 px-3 py-2 text-xs font-semibold text-success-700"
        >
          {TRUST_COPY.optInConfirm}
        </p>
      ) : (
        <div className="space-y-2">
          {eligibility.freeTrialPromoEligible ? (
            <div
              className="flex items-start gap-2 rounded-xl border border-brand-600/15 bg-white px-3 py-2"
              data-testid="assured-pay-promo-strip"
            >
              <FreeTrialBadge show />
              <p className="text-xs text-rapido-grey" data-testid="assured-pay-incentive">
                {FREE_TRIAL_PROMO.supportLine}
              </p>
            </div>
          ) : null}
          <Link href="/booking/assured-pay" onClick={() => onOpenOptIn("booking_card")}>
            <CTAButton fullWidth variant="primary" data-testid="assured-pay-opt-in-cta">
              {ctaLabel}
            </CTAButton>
          </Link>
          <p className="text-center text-[11px] text-rapido-grey" data-testid="assured-pay-cta-subline">
            {ctaSubline}
          </p>
        </div>
      )}

      <AssuredPayFareCard
        estimateF={eligibility.F}
        buffer={eligibility.buffer}
        approvedMax={eligibility.M}
        reasonCodes={eligibility.validReasonCodes}
        showTrustLine={false}
        variant="booking"
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
        How Assured Pay works
      </button>

      <AssuredPayExplanationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
