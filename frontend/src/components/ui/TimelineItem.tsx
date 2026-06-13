import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  time?: string;
  active?: boolean;
  className?: string;
}

export function TimelineItem({
  title,
  subtitle,
  time,
  active = false,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 rounded-full",
            active ? "bg-brand-500 ring-4 ring-brand-100" : "bg-surface-300",
          )}
        />
        <span className="mt-1 w-px flex-1 bg-surface-200" />
      </div>
      <div className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink-900">{title}</p>
          {time ? <span className="text-xs text-ink-500">{time}</span> : null}
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-ink-600">{subtitle}</p> : null}
      </div>
    </div>
  );
}
