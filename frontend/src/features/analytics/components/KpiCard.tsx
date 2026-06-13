import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/lib/utils";

export type KpiTone = "brand" | "success" | "warning" | "danger" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
  testId?: string;
}

const toneClasses: Record<KpiTone, string> = {
  brand: "border-brand-200 bg-brand-50",
  success: "border-success-200 bg-success-50",
  warning: "border-warning-200 bg-warning-50",
  danger: "border-danger-200 bg-danger-50",
  neutral: "border-surface-200 bg-white",
};

export function KpiCard({ label, value, hint, tone = "neutral", testId }: KpiCardProps) {
  return (
    <Card className={cn("space-y-1", toneClasses[tone])} data-testid={testId ?? "kpi-card"}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-rapido-grey">{label}</p>
        {tone === "brand" ? <StatusChip label="North Star" tone="brand" /> : null}
      </div>
      <p className="text-2xl font-bold tabular-nums text-rapido-black">{value}</p>
      {hint ? <p className="text-xs text-rapido-grey">{hint}</p> : null}
    </Card>
  );
}
