"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { TripReceiptCard } from "@/components/layout/TripReceiptCard";
import { CTAButton } from "@/components/ui/CTAButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { CompletionNextStepCard } from "@/features/settlement/components/CompletionNextStepCard";
import { SettlementLedger } from "@/features/settlement/components/SettlementLedger";
import { SettlementSummary } from "@/features/settlement/components/SettlementSummary";
import { useSelectedRideCategory } from "@/features/assured-pay/context/AssuredPayBookingContext";
import {
  SettlementProvider,
  useSettlement,
} from "@/features/settlement/context/SettlementProvider";
import { getCompletionCopy } from "@/features/settlement/lib/completion-copy";
import { parseCompletionScenario } from "@/features/settlement/lib/completion-scenario";
import { formatInr } from "@/features/settlement/lib/format";
import type { CompletionScenarioId } from "@/features/settlement/types";

function RideCompletedInner() {
  const { settlement, scenario, loading } = useSettlement();
  const category = useSelectedRideCategory();

  if (loading || !settlement) {
    return <LoadingState label="Settling ride…" />;
  }

  const copy = getCompletionCopy(scenario, {
    charged: settlement.rider_charged,
    residual: settlement.residual_due?.amount_inr,
    underReview: settlement.amount_under_review,
  });

  const reasonLine =
    settlement.residual_due?.reason_label ??
    (scenario === "buffer_within_max" ? "2 min waiting" : undefined);

  return (
    <div
      className="space-y-5"
      data-testid="ride-completed-page"
      data-completion-scenario={scenario}
    >
      <div className="text-center">
        <div
          className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${
            copy.heroIcon === "!"
              ? "bg-rapido-tint text-rapido-navy"
              : "bg-brand-600 text-rapido-black"
          }`}
        >
          {copy.heroIcon}
        </div>
        <h1 className="text-xl font-bold text-rapido-black">{copy.title}</h1>
        <p className="mt-1 text-sm text-rapido-grey">{copy.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip label="Assured Pay used" tone="brand" />
        <span data-testid="completion-category-chip">
          <StatusChip label={`${category.icon} ${category.label}`} tone="neutral" />
        </span>
        <StatusChip label={copy.statusChip} tone={copy.statusTone} />
      </div>

      <TripReceiptCard
        estimate={formatInr(settlement.estimate_f)}
        approvedMax={formatInr(settlement.approved_m)}
        finalFare={formatInr(settlement.actual_a)}
        charged={formatInr(settlement.rider_charged)}
        reasonLine={reasonLine}
        captainPaidAmount={formatInr(settlement.payout.amount_inr)}
        captainPaidLabel={copy.captainPayoutLabel}
      />

      <SettlementSummary settlement={settlement} dueChipLabel={copy.summaryDueChip} />
      <CompletionNextStepCard copy={copy} />
      <SettlementLedger events={settlement.ledger} />

      {copy.showPayCta && settlement.residual_due && copy.payCtaLabel ? (
        <Link href="/ride/residual-due?outcome=valid_overage">
          <CTAButton fullWidth>{copy.payCtaLabel}</CTAButton>
        </Link>
      ) : (
        <CTAButton variant="secondary" fullWidth>
          {copy.secondaryCtaLabel}
        </CTAButton>
      )}
    </div>
  );
}

function RideCompletedWithScenario({ scenario }: { scenario: CompletionScenarioId }) {
  return (
    <SettlementProvider initialScenario={scenario} autoRun>
      <RideCompletedInner />
    </SettlementProvider>
  );
}

function RideCompletedFromQuery() {
  const params = useSearchParams();
  const scenario = parseCompletionScenario(params.get("outcome"));
  return <RideCompletedWithScenario scenario={scenario} />;
}

export function RideCompletedPageContent() {
  return (
    <Suspense fallback={<LoadingState label="Loading ride summary…" />}>
      <RideCompletedFromQuery />
    </Suspense>
  );
}

export function RideCompletedPageContentForOutcome({
  outcome = "within_max",
}: {
  outcome?: CompletionScenarioId | "happy_path";
}) {
  const scenario = outcome === "happy_path" ? "within_max" : outcome;
  return <RideCompletedWithScenario scenario={scenario} />;
}

/** @deprecated Alias for tests using flow outcome names */
export function RideCompletedPageContentForScenario({
  scenario,
}: {
  scenario: CompletionScenarioId;
}) {
  return <RideCompletedWithScenario scenario={scenario} />;
}
