"use client";

import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import { getRideCategory } from "@/features/assured-pay/lib/ride-categories";
import {
  getAllCategorySupplyLabels,
  getNearbySupplyLabel,
  NEARBY_VEHICLE_MARKERS,
} from "@/features/booking/lib/nearby-vehicle-supply";
import { cn } from "@/lib/utils";

interface VehicleMapMarkersProps {
  visible: boolean;
  selectedCategory: RideCategoryId;
}

export function VehicleMapMarkers({ visible, selectedCategory }: VehicleMapMarkersProps) {
  if (!visible) {
    return null;
  }

  const supplyLabels = getAllCategorySupplyLabels();

  return (
    <div
      data-testid="vehicle-map-markers"
      data-selected-category={selectedCategory}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {NEARBY_VEHICLE_MARKERS.map((marker) => {
        const category = getRideCategory(marker.categoryId);
        const isSelected = marker.categoryId === selectedCategory;

        return (
          <div
            key={marker.id}
            data-testid={`vehicle-marker-${marker.id}`}
            data-category={marker.categoryId}
            data-highlighted={isSelected ? "true" : "false"}
            className={cn(
              "absolute flex flex-col items-center transition-all duration-200",
              isSelected ? "z-20 scale-100 opacity-100" : "z-10 scale-[0.82] opacity-45",
            )}
            style={{ top: marker.top, left: marker.left }}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-white shadow-float",
                isSelected
                  ? "h-10 w-10 text-xl ring-2 ring-brand-600"
                  : "h-7 w-7 text-sm ring-1 ring-surface-300",
              )}
            >
              {category.icon}
            </div>
            {isSelected ? (
              <span className="mt-0.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[8px] font-bold text-rapido-black shadow-sm">
                {category.etaLabel}
              </span>
            ) : null}
          </div>
        );
      })}

      <div
        data-testid="drop-map-pin"
        className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rapido-navy ring-4 ring-white"
        style={{ top: "28%", left: "72%" }}
      />

      <div
        data-testid="nearby-supply-chip"
        className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-1.5"
      >
        <span
          data-testid="nearby-supply-primary"
          className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-rapido-black shadow-float"
        >
          {getNearbySupplyLabel(selectedCategory)}
        </span>
        <div className="flex gap-1" data-testid="nearby-supply-density">
          {supplyLabels.map((item) => (
            <span
              key={item.categoryId}
              data-testid={`nearby-supply-${item.categoryId}`}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold shadow-sm",
                item.categoryId === selectedCategory
                  ? "bg-brand-600 text-rapido-black"
                  : "bg-white/90 text-rapido-grey",
              )}
            >
              {getRideCategory(item.categoryId).icon} {item.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
