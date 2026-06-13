import { Card } from "@/components/ui/Card";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { formatInr } from "@/features/settlement/lib/format";
import type { LedgerEventPayload } from "@/features/settlement/types";

interface SettlementLedgerProps {
  events: LedgerEventPayload[];
}

export function SettlementLedger({ events }: SettlementLedgerProps) {
  return (
    <Card className="space-y-1" data-testid="settlement-ledger">
      <p className="text-sm font-bold text-rapido-black">Settlement timeline</p>
      <div className="pt-2">
        {events.map((event, index) => (
          <TimelineItem
            key={`${event.event_type}-${index}`}
            title={event.label}
            subtitle={
              event.amount_inr != null
                ? `${event.actor} · ${formatInr(event.amount_inr)}`
                : event.actor
            }
            active={index === events.length - 1}
          />
        ))}
      </div>
    </Card>
  );
}
