"use client";

import { Suspense, useState } from "react";

import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { CTAButton } from "@/components/ui/CTAButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { DisputeForm } from "@/features/recovery/components/DisputeForm";
import { FareBreakdownReview } from "@/features/recovery/components/FareBreakdownReview";
import { RecoveryProvider, useRecovery } from "@/features/recovery/context/RecoveryProvider";
import { RECOVERY_COPY, RESTRICTION_MESSAGES } from "@/features/recovery/lib/copy";
import { GrokExplanationPanel } from "@/features/grok/components/GrokExplanationPanel";

function RecoveryInner() {
  const { recovery, loading, payDue, submitDispute } = useRecovery();
  const [paid, setPaid] = useState(false);

  if (loading || !recovery) {
    return <LoadingState label="Loading balance details…" />;
  }

  const primaryDue = recovery.open_dues[0];

  if (!primaryDue) {
    return (
      <div className="space-y-4" data-testid="recovery-page">
        <h1 className="text-xl font-bold text-rapido-black">All clear</h1>
        <p className="text-sm text-rapido-grey">No remaining balance on your account.</p>
      </div>
    );
  }

  const restrictionMessage = RESTRICTION_MESSAGES[recovery.rebooking.restriction];

  return (
    <>
      <div className="space-y-4" data-testid="recovery-page">
        <h1 className="text-xl font-bold text-rapido-black">Review & resolve</h1>
        <p className="text-sm text-rapido-grey">
          See exactly what was approved, charged, and why a balance remains.
        </p>

        <StatusChip label={`₹${primaryDue.amount_inr} remaining`} tone="warning" />

        <FareBreakdownReview due={primaryDue} />

        <GrokExplanationPanel
          buttonLabel="Why do I owe this amount?"
          useCase="pending_due"
          payload={{
            amount_inr: primaryDue.amount_inr,
            approved_m: primaryDue.captured_at_trip_end,
            actual_a: primaryDue.actual_a ?? primaryDue.captured_at_trip_end + primaryDue.amount_inr,
            reason_label: primaryDue.reason_label,
          }}
        />

        {recovery.rebooking.grace_active ? (
          <p className="text-xs text-rapido-grey" data-testid="grace-reminder">
            {RECOVERY_COPY.graceReminder(primaryDue.days_until_grace_expires)}
          </p>
        ) : null}

        {restrictionMessage ? (
          <TrustBanner message={restrictionMessage} />
        ) : (
          <TrustBanner message={RECOVERY_COPY.assuredPayBlocked} />
        )}

        {paid ? (
          <TrustBanner message={RECOVERY_COPY.paySuccess} />
        ) : null}

        <DisputeForm
          disabled={paid}
          onSubmit={async (reason) => {
            await submitDispute({
              ride_id: primaryDue.ride_id,
              due_id: primaryDue.id,
              reason,
            });
          }}
        />
      </div>

      {!paid ? (
        <StickyActionBar>
          <CTAButton
            fullWidth
            data-testid="pay-now-recovery-cta"
            onClick={() =>
              void payDue(primaryDue.id, primaryDue.amount_inr).then(() => setPaid(true))
            }
          >
            {RECOVERY_COPY.payCta(primaryDue.amount_inr)}
          </CTAButton>
        </StickyActionBar>
      ) : null}
    </>
  );
}

export function RecoveryPageContentForTest() {
  return (
    <RecoveryProvider>
      <RecoveryInner />
    </RecoveryProvider>
  );
}

function RecoveryPageShell() {
  return (
    <RecoveryProvider>
      <RecoveryInner />
    </RecoveryProvider>
  );
}

export function RecoveryPageContent() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <RecoveryPageShell />
    </Suspense>
  );
}
