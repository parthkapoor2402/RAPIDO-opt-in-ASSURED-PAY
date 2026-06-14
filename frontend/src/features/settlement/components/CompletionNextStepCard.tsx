import { Card } from "@/components/ui/Card";
import type { CompletionCopy } from "@/features/settlement/lib/completion-copy";

interface CompletionNextStepCardProps {
  copy: CompletionCopy;
}

export function CompletionNextStepCard({ copy }: CompletionNextStepCardProps) {
  return (
    <Card className="space-y-2.5 bg-surface-50/80" data-testid="completion-next-step">
      <p className="text-[10px] font-bold uppercase tracking-wide text-rapido-grey">At a glance</p>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-rapido-grey">Charged now</dt>
          <dd className="font-semibold text-rapido-black text-right">{copy.chargedNow}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-rapido-grey">Still due</dt>
          <dd className="font-semibold text-rapido-black text-right">{copy.balanceStatus}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-rapido-grey">Captain</dt>
          <dd className="font-semibold text-rapido-black text-right">{copy.captainStatus}</dd>
        </div>
      </dl>
      <p className="text-xs leading-relaxed text-rapido-grey border-t border-surface-200 pt-2">
        {copy.nextStep}
      </p>
    </Card>
  );
}
