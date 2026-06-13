import { Card } from "@/components/ui/Card";
import { EVENT_LABELS } from "@/features/analytics/types";

interface EventFunnelProps {
  eventCounts: Record<string, number>;
}

const FUNNEL_ORDER = [
  "assured_pay_impression",
  "assured_pay_opt_in",
  "fare_entered_buffer",
  "ride_auto_paid",
  "captain_fully_credited",
  "residual_due_created",
  "residual_due_recovered",
  "residual_due_disputed",
];

export function EventFunnel({ eventCounts }: EventFunnelProps) {
  const max = Math.max(...FUNNEL_ORDER.map((k) => eventCounts[k] ?? 0), 1);

  return (
    <Card className="space-y-3" data-testid="event-funnel">
      <p className="text-sm font-bold text-rapido-black">Event funnel (demo seed)</p>
      <div className="space-y-2">
        {FUNNEL_ORDER.map((key) => {
          const count = eventCounts[key] ?? 0;
          const width = Math.max(8, (count / max) * 100);
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rapido-grey">{EVENT_LABELS[key] ?? key}</span>
                <span className="font-medium tabular-nums text-rapido-black">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-100">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
