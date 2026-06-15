"use client";

import { CTAButton } from "@/components/ui/CTAButton";
import type { ExceedsReviewCompletionVariant } from "@/features/live-ride/lib/completion-playback";
import type { RideScenarioSummary } from "@/features/live-ride/types";

interface LiveRidePlaybackControlsProps {
  scenarios: RideScenarioSummary[];
  scenarioId: string;
  stepIndex: number;
  maxStep: number;
  completionVariant: ExceedsReviewCompletionVariant;
  onScenarioChange: (id: string) => void;
  onCompletionVariantChange: (variant: ExceedsReviewCompletionVariant) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
}

export function LiveRidePlaybackControls({
  scenarios,
  scenarioId,
  stepIndex,
  maxStep,
  completionVariant,
  onScenarioChange,
  onCompletionVariantChange,
  onPrevStep,
  onNextStep,
  onReset,
}: LiveRidePlaybackControlsProps) {
  const onCompletionStep = stepIndex === maxStep - 1;
  const showCompletionVariantToggle = scenarioId === "exceeds_review" && onCompletionStep;

  return (
    <div
      data-testid="live-ride-playback-controls"
      className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-3 space-y-3"
    >
      <p className="text-xs font-bold text-rapido-black">Demo playback</p>

      <label className="block text-xs text-rapido-grey">
        Scenario
        <select
          className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
          value={scenarioId}
          onChange={(event) => onScenarioChange(event.target.value)}
          data-testid="playback-scenario-select"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
      </label>

      {showCompletionVariantToggle ? (
        <label className="block text-xs text-rapido-grey" data-testid="completion-variant-toggle">
          Step 4 outcome
          <select
            className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
            value={completionVariant}
            onChange={(event) =>
              onCompletionVariantChange(event.target.value as ExceedsReviewCompletionVariant)
            }
            data-testid="completion-variant-select"
          >
            <option value="valid_overage">Residual due</option>
            <option value="suspicious_overage">Under review</option>
          </select>
        </label>
      ) : null}

      <p className="text-xs text-rapido-grey">
        Step {stepIndex + 1} of {maxStep}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <CTAButton variant="secondary" fullWidth onClick={onPrevStep} disabled={stepIndex === 0}>
          Prev
        </CTAButton>
        <CTAButton variant="secondary" fullWidth onClick={onNextStep} disabled={stepIndex >= maxStep - 1}>
          Next
        </CTAButton>
        <CTAButton variant="ghost" fullWidth onClick={onReset}>
          Reset
        </CTAButton>
      </div>
    </div>
  );
}
