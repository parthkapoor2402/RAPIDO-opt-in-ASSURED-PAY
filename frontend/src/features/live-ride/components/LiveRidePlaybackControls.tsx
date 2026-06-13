"use client";

import { CTAButton } from "@/components/ui/CTAButton";
import type { RideScenarioSummary } from "@/features/live-ride/types";

interface LiveRidePlaybackControlsProps {
  scenarios: RideScenarioSummary[];
  scenarioId: string;
  stepIndex: number;
  maxStep: number;
  onScenarioChange: (id: string) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
}

export function LiveRidePlaybackControls({
  scenarios,
  scenarioId,
  stepIndex,
  maxStep,
  onScenarioChange,
  onPrevStep,
  onNextStep,
  onReset,
}: LiveRidePlaybackControlsProps) {
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
