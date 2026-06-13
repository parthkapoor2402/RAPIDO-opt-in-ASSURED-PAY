"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { TripReceiptCard } from "@/components/layout/TripReceiptCard";
import { CTAButton } from "@/components/ui/CTAButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import {
  SettlementProvider,
  useSettlement,
} from "@/features/settlement/context/SettlementProvider";
import { formatInr } from "@/features/settlement/lib/format";
import type { SettlementFlowOutcome } from "@/features/settlement/types";

function parseOutcome(value: string | null): SettlementFlowOutcome {
  if (value === "valid_overage" || value === "suspicious_overage") {
    return value;
  }
  return "happy_path";
}

function RideCompletedInner() {
  const { settlement, loading } = useSettlement();

  if (loading || !settlement) {
    return <LoadingState label="Settling ride…" />;
  }

  const isReview = settlement.flow_outcome === "suspicious_overage";
  const hasDue = settlement.residual_due != null;

  return (
    <div className="space-y-5" data-testid="ride-completed-page">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-rapido-black">
          {isReview ? "!" : "✓"}
        </div>
        <h1 className="text-xl font-bold text-rapido-black">
          {isReview ? "Ride completed · under review" : "Ride completed"}
        </h1>
        <p className="mt-1 text-sm text-rapido-grey">
          {isReview
            ? "Payment held while ops reviews the fare"
            : hasDue
              ? "Approved max charged · residual due created"
              : "Payment settled · you're good to go"}
        </p>
      </div>

      <StatusChip label="Assured Pay used" tone="brand" />

      <TripReceiptCard
        estimate={formatInr(settlement.estimate_f)}
        approvedMax={formatInr(settlement.approved_m)}
        finalFare={formatInr(settlement.actual_a)}
        charged={formatInr(settlement.rider_charged)}
        reasonLine={
          settlement.residual_due?.reason_label ??
          (settlement.actual_a > settlement.estimate_f ? "Fare updated in ride" : undefined)
        }
        captainPaidAmount={formatInr(settlement.payout.amount_inr)}
        captainPaidLabel={settlement.payout.status_label}
      />

      <SettlementSummary settlement={settlement} />
      <SettlementLedger events={settlement.ledger} />

      {hasDue ? (
        <Link href="/ride/residual-due?outcome=valid_overage">
          <CTAButton fullWidth>Pay remaining {formatInr(settlement.residual_due!.amount_inr)}</CTAButton>
        </Link>
      ) : (
        <CTAButton variant="secondary" fullWidth>
          View ride history
        </CTAButton>
      )}
    </div>
  );
}

function RideCompletedWithOutcome({ outcome }: { outcome: SettlementFlowOutcome }) {
  return (
    <SettlementProvider initialOutcome={outcome} autoRun>
      <RideCompletedInner />
    </SettlementProvider>
  );
}

function RideCompletedFromQuery() {
  const params = useSearchParams();
  const outcome = parseOutcome(params.get("outcome"));
  return <RideCompletedWithOutcome outcome={outcome} />;
}

export function RideCompletedPageContent() {
  return (
    <Suspense fallback={<LoadingState label="Loading ride summary…" />}>
      <RideCompletedFromQuery />
    </Suspense>
  );
}

export function RideCompletedPageContentForOutcome({
  outcome = "happy_path",
}: {
  outcome?: SettlementFlowOutcome;
}) {
  return <RideCompletedWithOutcome outcome={outcome} />;
}
