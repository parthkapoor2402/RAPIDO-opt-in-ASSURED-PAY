import { Card } from "@/components/ui/Card";
import { FareRow } from "@/components/ui/FareRow";

interface FareLine {
  label: string;
  amount: string;
  hint?: string;
  emphasis?: boolean;
}

interface FareSummaryCardProps {
  lines: FareLine[];
  className?: string;
}

export function FareSummaryCard({ lines, className }: FareSummaryCardProps) {
  return (
    <Card className={className}>
      <div className="divide-y divide-surface-100">
        {lines.map((line) => (
          <FareRow key={line.label} {...line} />
        ))}
      </div>
    </Card>
  );
}
