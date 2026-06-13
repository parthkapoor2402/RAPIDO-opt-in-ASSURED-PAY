import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatInr } from "@/features/settlement/lib/format";
import type { SettlementPayload } from "@/features/settlement/types";

interface SettlementSummaryProps {
  settlement: SettlementPayload;
}

export function SettlementSummary({ settlement }: SettlementSummaryProps) {
  const { payout, residual_due, approved_m, actual_a, rider_charged } = settlement;

  return (
    <Card className="space-y-3" data-testid="settlement-summary">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-rapido-black">Settlement breakdown</p>
        {settlement.flow_outcome === "suspicious_overage" ? (
          <StatusChip label="Under review" tone="danger" />
        ) : null}
        {residual_due ? <StatusChip label="Residual due open" tone="warning" /> : null}
      </div>

      <div className="divide-y divide-surface-100">
        <FareRow label="Approved max (M)" amount={formatInr(approved_m)} emphasis />
        <FareRow label="Final fare (A)" amount={formatInr(actual_a)} />
        <FareRow label="Rider charged" amount={formatInr(rider_charged)} />
        <FareRow
          label="Captain payout"
          amount={formatInr(payout.amount_inr)}
          hint={payout.status_label}
          emphasis
        />
        {residual_due ? (
          <FareRow
            label="Residual due created"
            amount={formatInr(residual_due.amount_inr)}
            hint={residual_due.reason_label}
            emphasis
          />
        ) : (
          <FareRow label="Residual due" amount="None" hint="No balance remaining" />
        )}
      </div>
    </Card>
  );
}
