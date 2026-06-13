"use client";

import Link from "next/link";

import { TrustBanner } from "@/components/layout/TrustBanner";
import { CTAButton } from "@/components/ui/CTAButton";
import { RECOVERY_COPY, RESTRICTION_MESSAGES } from "@/features/recovery/lib/copy";
import type { RecoveryStatePayload } from "@/features/recovery/types";

interface RecoveryBannerProps {
  recovery: RecoveryStatePayload;
  onDismiss?: () => void;
}

export function RecoveryBanner({ recovery, onDismiss }: RecoveryBannerProps) {
  if (!recovery.show_banner || recovery.open_dues.length === 0) {
    return null;
  }

  const primaryDue = recovery.open_dues[0];
  const restrictionMessage = RESTRICTION_MESSAGES[recovery.rebooking.restriction];

  return (
    <div
      className="rounded-2xl border border-warning-200 bg-warning-50 p-4 space-y-3"
      data-testid="recovery-banner"
    >
      <div>
        <p className="text-sm font-bold text-rapido-black">{RECOVERY_COPY.bannerTitle}</p>
        <p className="mt-1 text-xs text-rapido-grey">{RECOVERY_COPY.bannerSubline}</p>
      </div>

      <TrustBanner
        message={`₹${recovery.pending_amount_inr} remaining · ${primaryDue.reason_label}`}
      />

      {recovery.rebooking.grace_active ? (
        <p className="text-xs text-rapido-grey" data-testid="grace-reminder">
          {RECOVERY_COPY.graceReminder(primaryDue.days_until_grace_expires)}
        </p>
      ) : null}

      {restrictionMessage ? (
        <p className="text-xs text-rapido-grey" data-testid="restriction-message">
          {restrictionMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/recovery" className="flex-1">
          <CTAButton fullWidth variant="secondary" data-testid="resolve-now-cta">
            {RECOVERY_COPY.resolveCta}
          </CTAButton>
        </Link>
        <Link href={`/recovery?action=pay&due=${primaryDue.id}`} className="flex-1">
          <CTAButton fullWidth data-testid="pay-now-banner-cta">
            {RECOVERY_COPY.payCta(primaryDue.amount_inr)}
          </CTAButton>
        </Link>
      </div>

      {onDismiss ? (
        <button
          type="button"
          className="text-xs font-medium text-rapido-grey underline"
          onClick={onDismiss}
        >
          Remind me later
        </button>
      ) : null}
    </div>
  );
}
