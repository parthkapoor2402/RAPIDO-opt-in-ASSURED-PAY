"use client";

import Link from "next/link";
import { Suspense } from "react";

import { ConfirmAddressCard } from "@/components/layout/ConfirmAddressCard";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { CTAButton } from "@/components/ui/CTAButton";
import { FareRow } from "@/components/ui/FareRow";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { Card } from "@/components/ui/Card";
import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import {
  SettlementProvider,
  useSettlement,
} from "@/features/settlement/context/SettlementProvider";
import { formatInr } from "@/features/settlement/lib/format";

function ResidualDueInner() {
  const { settlement, loading } = useSettlement();

  if (loading || !settlement) {
    return <LoadingState label="Loading due details…" />;
  }

  const due = settlement.residual_due;
  if (!due) {
    return (
      <div className="space-y-4" data-testid="residual-due-page">
        <h1 className="text-xl font-bold text-rapido-black">No residual due</h1>
        <p className="text-sm text-rapido-grey">This ride has no remaining balance.</p>
        <Link href="/ride/completed?outcome=happy_path">
          <CTAButton variant="secondary" fullWidth>
            Back to receipt
          </CTAButton>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="residual-due-page">
        <h1 className="text-xl font-bold text-rapido-black">Pay remaining amount</h1>
        <p className="text-sm text-rapido-grey">
          Verified charge above your approved max of {formatInr(settlement.approved_m)}.
        </p>

        <StatusChip label={due.reason_label} tone="warning" />

        <ConfirmAddressCard
          primary={`${formatInr(due.amount_inr)} remaining`}
          secondary="549/244, Alambagh, Lucknow"
          icon={<span className="text-lg">📍</span>}
        />

        <Card>
          <FareRow label="Approved max (M)" amount={formatInr(settlement.approved_m)} />
          <FareRow label="Captured at trip end" amount={formatInr(due.captured_at_trip_end)} />
          <FareRow label="Captain credited" amount={formatInr(settlement.payout.amount_inr)} />
          <FareRow label="Remaining due" amount={formatInr(due.amount_inr)} emphasis />
          <FareRow label="Reason" amount={due.reason_label} hint="Valid reason code" />
        </Card>

        <SettlementSummary settlement={settlement} />
        <SettlementLedger events={settlement.ledger} />

        <TrustBanner message="Clear this to keep Assured Pay on your next ride." />
      </div>

      <StickyActionBar>
        <CTAButton fullWidth data-testid="pay-residual-cta">
          Pay {formatInr(due.amount_inr)} now
        </CTAButton>
      </StickyActionBar>
    </>
  );
}

function ResidualDueFromQuery() {
  return (
    <SettlementProvider initialOutcome="valid_overage" autoRun>
      <ResidualDueInner />
    </SettlementProvider>
  );
}

export function ResidualDuePageContent() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <ResidualDueFromQuery />
    </Suspense>
  );
}

export function ResidualDuePageContentForTest() {
  return (
    <SettlementProvider initialOutcome="valid_overage" autoRun>
      <ResidualDueInner />
    </SettlementProvider>
  );
}
