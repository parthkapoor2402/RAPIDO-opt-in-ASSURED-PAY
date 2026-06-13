import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        ◌
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
