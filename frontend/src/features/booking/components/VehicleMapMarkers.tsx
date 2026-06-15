"use client";

import { RIDE_CATEGORIES } from "@/features/assured-pay/lib/ride-categories";

const MARKER_POSITIONS = [
  { top: "38%", left: "22%" },
  { top: "52%", left: "68%" },
  { top: "44%", left: "48%" },
] as const;

interface VehicleMapMarkersProps {
  visible: boolean;
}

export function VehicleMapMarkers({ visible }: VehicleMapMarkersProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      data-testid="vehicle-map-markers"
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {RIDE_CATEGORIES.map((category, index) => {
        const position = MARKER_POSITIONS[index] ?? MARKER_POSITIONS[0];
        return (
          <div
            key={category.id}
            data-testid={`vehicle-marker-${category.id}`}
            className="absolute flex flex-col items-center"
            style={{ top: position.top, left: position.left }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-float ring-2 ring-brand-600/30">
              {category.icon}
            </div>
            <span className="mt-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-rapido-black shadow-sm">
              {category.etaLabel}
            </span>
          </div>
        );
      })}
      <div
        data-testid="drop-map-pin"
        className="absolute right-[28%] top-[28%] h-3 w-3 rounded-full bg-rapido-navy ring-4 ring-white"
      />
    </div>
  );
}
