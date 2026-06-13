import { cn } from "@/lib/utils";

interface FareRowProps {
  label: string;
  amount: string;
  emphasis?: boolean;
  hint?: string;
  className?: string;
}

export function FareRow({ label, amount, emphasis = false, hint, className }: FareRowProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-2", className)}>
      <div>
        <p className={cn("text-sm", emphasis ? "font-semibold text-ink-900" : "text-ink-600")}>
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-ink-500">{hint}</p> : null}
      </div>
      <p className={cn("text-sm tabular-nums", emphasis ? "font-bold text-ink-900" : "text-ink-800")}>
        {amount}
      </p>
    </div>
  );
}
