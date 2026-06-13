import { cn } from "@/lib/utils";

export type StatusChipTone = "neutral" | "success" | "warning" | "danger" | "brand";

interface StatusChipProps {
  label: string;
  tone?: StatusChipTone;
  className?: string;
}

const toneClasses: Record<StatusChipTone, string> = {
  neutral: "bg-surface-100 text-ink-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-800",
  danger: "bg-danger-50 text-danger-700",
  brand: "bg-brand-50 text-brand-800",
};

export function StatusChip({ label, tone = "neutral", className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
