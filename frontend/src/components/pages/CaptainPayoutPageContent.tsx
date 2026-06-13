"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import {
  SettlementProvider,
  useSettlement,
} from "@/features/settlement/context/SettlementProvider";
import { formatInr } from "@/features/settlement/lib/format";
import type { SettlementFlowOutcome } from "@/features/settlement/types";

function parseOutcome(value: string | null): SettlementFlowOutcome {
  if (value === "suspicious_overage" || value === "happy_path") {
    return value;
  }
  return "valid_overage";
}

function CaptainPayoutInner() {
  const { settlement, loading } = useSettlement();

  if (loading || !settlement) {
    return <LoadingState label="Loading earnings…" />;
  }

  const { payout } = settlement;
  const credited = payout.state === "credited";

  return (
    <div className="space-y-5" data-testid="captain-payout-page">
      <h1 className="text-xl font-bold text-rapido-black">Earnings</h1>

      <Card className="bg-rapido-tint">
        <FareRow
          label={credited ? "Latest credit" : "Payout status"}
          amount={formatInr(payout.amount_inr)}
          emphasis
          hint={payout.status_label}
        />
      </Card>

      <SettlementSummary settlement={settlement} />

      <div className="space-y-3">
        <p className="text-sm font-bold text-rapido-black">Ride credit</p>

        <Card className="space-y-2" data-testid="captain-payout-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-rapido-black">{settlement.ride_id}</p>
              <p className="text-xs text-rapido-grey">
                Approved max {formatInr(settlement.approved_m)} · Final {formatInr(settlement.actual_a)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums">+{formatInr(payout.amount_inr)}</p>
              <StatusChip
                label={credited ? "Credited" : "Held"}
                tone={credited ? "brand" : "danger"}
              />
            </div>
          </div>
          <TimelineItem
            title={payout.status_label}
            subtitle={
              settlement.residual_due
                ? `Rider residual due: ${formatInr(settlement.residual_due.amount_inr)}`
                : settlement.review_case_id
                  ? `Review case ${settlement.review_case_id}`
                  : "No rider balance remaining"
            }
            active
          />
        </Card>
      </div>

      <SettlementLedger events={settlement.ledger} />
    </div>
  );
}

function CaptainPayoutWithOutcome({ outcome }: { outcome: SettlementFlowOutcome }) {
  return (
    <SettlementProvider initialOutcome={outcome} autoRun>
      <CaptainPayoutInner />
    </SettlementProvider>
  );
}

function CaptainPayoutFromQuery() {
  const params = useSearchParams();
  const outcome = parseOutcome(params.get("outcome"));
  return <CaptainPayoutWithOutcome outcome={outcome} />;
}

export function CaptainPayoutPageContent() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <CaptainPayoutFromQuery />
    </Suspense>
  );
}

export function CaptainPayoutPageContentForOutcome({
  outcome = "valid_overage",
}: {
  outcome?: SettlementFlowOutcome;
}) {
  return <CaptainPayoutWithOutcome outcome={outcome} />;
}
