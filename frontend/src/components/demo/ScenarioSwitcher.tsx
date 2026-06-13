"use client";

import { Card } from "@/components/ui/Card";
import { useDemoScenario } from "@/context/DemoScenarioContext";
import { cn } from "@/lib/utils";

export function ScenarioSwitcher() {
  const { scenario, scenarios, setScenarioId } = useDemoScenario();

  return (
    <Card data-testid="scenario-switcher" className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Demo scenario
        </p>
        <p data-testid="scenario-switcher-active" className="mt-1 text-sm font-medium text-ink-900">
          {scenario.label}
        </p>
      </div>
      <ul className="space-y-2">
        {scenarios.map((item) => {
          const active = item.id === scenario.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setScenarioId(item.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-brand-300 bg-brand-50"
                    : "border-surface-200 bg-white hover:border-brand-200",
                )}
              >
                <span className="block text-sm font-medium text-ink-900">{item.label}</span>
                <span className="mt-0.5 block text-xs text-ink-600">{item.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
