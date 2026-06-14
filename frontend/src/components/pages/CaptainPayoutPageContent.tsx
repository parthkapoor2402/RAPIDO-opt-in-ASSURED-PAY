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
import { flowOutcomeToScenario } from "@/features/settlement/mock/settlement-mock";
import { parseCompletionScenario } from "@/features/settlement/lib/completion-scenario";
import type { CompletionScenarioId } from "@/features/settlement/types";

function parseCaptainScenario(value: string | null): CompletionScenarioId {
  if (value === "happy_path") return "within_max";
  return parseCompletionScenario(value);
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

function CaptainPayoutWithScenario({ scenario }: { scenario: CompletionScenarioId }) {
  return (
    <SettlementProvider initialScenario={scenario} autoRun>
      <CaptainPayoutInner />
    </SettlementProvider>
  );
}

function CaptainPayoutFromQuery() {
  const params = useSearchParams();
  const scenario = parseCaptainScenario(params.get("outcome"));
  return <CaptainPayoutWithScenario scenario={scenario} />;
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
  outcome?: CompletionScenarioId | "happy_path";
}) {
  const scenario = outcome === "happy_path" ? "within_max" : flowOutcomeToScenario(outcome);
  return <CaptainPayoutWithScenario scenario={scenario} />;
}
