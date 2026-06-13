import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";
import type { OpenDuePayload } from "@/features/recovery/types";

interface FareBreakdownReviewProps {
  due: OpenDuePayload;
}

export function FareBreakdownReview({ due }: FareBreakdownReviewProps) {
  return (
    <Card className="space-y-1" data-testid="fare-breakdown-review">
      <p className="text-sm font-bold text-rapido-black">Fare breakdown</p>
      <div className="divide-y divide-surface-100">
        {due.estimate_f != null ? (
          <FareRow label="Estimate (F)" amount={`₹${due.estimate_f}`} />
        ) : null}
        <FareRow label="Approved max (M)" amount={`₹${due.captured_at_trip_end}`} emphasis />
        {due.actual_a != null ? (
          <FareRow label="Final fare (A)" amount={`₹${due.actual_a}`} />
        ) : null}
        <FareRow label="Remaining due" amount={`₹${due.amount_inr}`} emphasis />
        <FareRow label="Reason" amount={due.reason_label} hint="Verified in ride timeline" />
      </div>
    </Card>
  );
}
