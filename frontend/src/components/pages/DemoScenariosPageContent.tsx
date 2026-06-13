"use client";

import { PageSection } from "@/components/layout/PageSection";
import { ScenarioSwitcher } from "@/components/demo/ScenarioSwitcher";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";

export function DemoScenariosPageContent() {
  const { batteryLowOverride, setBatteryLowOverride, eligibility, primaryPromptId } =
    useAssuredPayBooking();

  return (
    <div className="space-y-4">
      <PageSection
        title="Demo scenarios"
        description="Switch personas and simulate discovery triggers for Assured Pay."
        phase="P05"
        badge="Discovery"
      />
      <ScenarioSwitcher />

      <div className="rounded-2xl border border-surface-200 bg-white p-4 text-sm">
        <p className="font-bold text-rapido-black">Discovery debug</p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={batteryLowOverride}
            onChange={(event) => setBatteryLowOverride(event.target.checked)}
          />
          Simulate low battery prompt
        </label>
        <p className="mt-2 text-xs text-rapido-grey">
          Eligible: {String(eligibility.eligible)} · M: ₹{eligibility.M} · Primary prompt:{" "}
          {primaryPromptId ?? "none"}
        </p>
      </div>
    </div>
  );
}
