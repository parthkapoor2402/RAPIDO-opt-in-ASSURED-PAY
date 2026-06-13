import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";
import { TrustBanner } from "@/components/layout/TrustBanner";

interface TripReceiptCardProps {
  estimate: string;
  finalFare: string;
  charged: string;
  approvedMax?: string;
  reasonLine?: string;
  captainPaidLabel?: string;
  captainPaidAmount?: string;
}

export function TripReceiptCard({
  estimate,
  finalFare,
  charged,
  approvedMax,
  reasonLine,
  captainPaidLabel = "Instant",
  captainPaidAmount,
}: TripReceiptCardProps) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-bold text-rapido-black">Trip receipt</p>
      <div className="divide-y divide-surface-100">
        <FareRow label="Estimate (F)" amount={estimate} />
        {approvedMax ? <FareRow label="Approved max (M)" amount={approvedMax} /> : null}
        <FareRow label="Final fare (A)" amount={finalFare} emphasis />
        <FareRow label="Charged" amount={charged} />
        {reasonLine ? (
          <FareRow label="Change reason" amount={reasonLine} hint="Shown in ride timeline" />
        ) : null}
      </div>
      <TrustBanner
        message={
          captainPaidAmount
            ? `Captain paid ${captainPaidAmount} · ${captainPaidLabel}`
            : `Captain paid · ${captainPaidLabel}`
        }
      />
    </Card>
  );
}
