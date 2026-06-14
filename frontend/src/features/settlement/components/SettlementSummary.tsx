import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatInr } from "@/features/settlement/lib/format";
import type { SettlementPayload } from "@/features/settlement/types";

interface SettlementSummaryProps {
  settlement: SettlementPayload;
  dueChipLabel?: string | null;
}

export function SettlementSummary({ settlement, dueChipLabel }: SettlementSummaryProps) {
  const { payout, residual_due, estimate_f, approved_m, actual_a, rider_charged, amount_under_review } =
    settlement;

  const effectiveUnderReview =
    amount_under_review ??
    (settlement.flow_outcome === "suspicious_overage" && actual_a > rider_charged
      ? actual_a - rider_charged
      : null);

  return (
    <Card className="space-y-3" data-testid="settlement-summary">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-rapido-black">Fare summary</p>
        {dueChipLabel ? (
          <StatusChip
            label={dueChipLabel}
            tone={settlement.flow_outcome === "suspicious_overage" ? "neutral" : "warning"}
          />
        ) : null}
      </div>

      <div className="divide-y divide-surface-100">
        <FareRow label="Estimate (F)" amount={formatInr(estimate_f)} />
        <FareRow label="Approved max (M)" amount={formatInr(approved_m)} emphasis />
        <FareRow label="Final fare (A)" amount={formatInr(actual_a)} />
        <FareRow label="Charged now" amount={formatInr(rider_charged)} emphasis />
        {residual_due ? (
          <FareRow
            label="Still due"
            amount={formatInr(residual_due.amount_inr)}
            hint={residual_due.reason_label}
            emphasis
          />
        ) : effectiveUnderReview && effectiveUnderReview > 0 ? (
          <FareRow
            label="Above max"
            amount={formatInr(effectiveUnderReview)}
            hint="Not billed yet"
            emphasis
          />
        ) : (
          <FareRow label="Still due" amount="Nothing" />
        )}
        <FareRow
          label="Captain payout"
          amount={formatInr(payout.amount_inr)}
          hint={payout.status_label}
          emphasis
        />
      </div>
    </Card>
  );
}
