"use client";

import Link from "next/link";

import { StatusChip } from "@/components/ui/StatusChip";
import { useDemoScenario } from "@/context/DemoScenarioContext";
import { useSelectedRideCategory } from "@/features/assured-pay/context/AssuredPayBookingContext";

export function TopBar() {
  const { scenario } = useDemoScenario();
  const category = useSelectedRideCategory();
  const isRider = scenario.view === "rider";

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-20 border-b border-surface-200 bg-white"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <Link href="/home" className="text-xl font-bold lowercase tracking-tight text-rapido-black">
            rapido
          </Link>
          {isRider ? (
            <p className="text-[11px] text-rapido-grey">
              Assured Pay · {category.label.toLowerCase()} rides
            </p>
          ) : (
            <p className="text-[11px] text-rapido-grey">Assured Pay · {scenario.view}</p>
          )}
        </div>
        <StatusChip
          label={scenario.view.charAt(0).toUpperCase() + scenario.view.slice(1)}
          tone="neutral"
        />
      </div>
    </header>
  );
}
