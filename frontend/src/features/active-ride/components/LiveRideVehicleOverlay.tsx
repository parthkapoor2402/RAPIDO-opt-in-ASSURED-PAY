"use client";

import { getRideCategory } from "@/features/assured-pay/lib/ride-categories";
import { useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { usePrePickupMovement } from "@/features/active-ride/hooks/usePrePickupMovement";
import {
  formatMapPointStyle,
  MAP_DROP,
  MAP_PICKUP,
  resolveVehicleMovement,
} from "@/features/active-ride/lib/vehicle-movement";
import { useLiveRide } from "@/features/live-ride/context/LiveRideProvider";
import { cn } from "@/lib/utils";

export function LiveRideVehicleOverlay() {
  const { assignment, showVehicleOverlay } = useActiveRide();
  const { stepIndex, maxStep, progress } = useLiveRide();

  usePrePickupMovement(showVehicleOverlay);

  if (!showVehicleOverlay || !assignment || !progress) {
    return null;
  }

  const category = getRideCategory(assignment.categoryId);
  const movement = resolveVehicleMovement({
    movementPhase: assignment.movementPhase,
    categoryId: assignment.categoryId,
    prePickupProgress: assignment.prePickupProgress,
    stepIndex,
    maxStep,
    ridePhase: progress.ride_phase ?? "active",
  });
  const positionStyle = formatMapPointStyle(movement.position);

  const statusLabel =
    movement.phase === "approaching_pickup"
      ? "Captain arriving"
      : movement.phase === "arrived"
        ? "Arrived at drop"
        : "On trip";

  return (
    <div
      data-testid="live-ride-vehicle-overlay"
      data-movement-phase={movement.phase}
      data-route-progress={movement.routeProgress.toFixed(2)}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1={MAP_PICKUP.leftPct}
          y1={MAP_PICKUP.topPct}
          x2={MAP_DROP.leftPct}
          y2={MAP_DROP.topPct}
          stroke="#c4c2bd"
          strokeWidth="0.4"
          strokeDasharray="1.2 1"
          vectorEffect="non-scaling-stroke"
        />
        {movement.phase !== "approaching_pickup" ? (
          <line
            data-testid="route-progress-line"
            x1={MAP_PICKUP.leftPct}
            y1={MAP_PICKUP.topPct}
            x2={MAP_DROP.leftPct}
            y2={MAP_DROP.topPct}
            stroke="#f7c600"
            strokeWidth="0.55"
            strokeDasharray={`${Math.max(movement.routeProgress, 0.08) * 100} 100`}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      <div
        data-testid="drop-map-pin"
        className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 ring-4 ring-white"
        style={{ top: `${MAP_DROP.topPct}%`, left: `${MAP_DROP.leftPct}%` }}
      />

      <div
        data-testid="assigned-vehicle-marker"
        className={cn(
          "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-300 ease-out",
          movement.phase === "approaching_pickup" ? "scale-100" : "scale-105",
        )}
        style={positionStyle}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-float ring-2 ring-brand-600">
          {category.icon}
        </div>
        <span className="mt-0.5 rounded-full bg-rapido-black px-2 py-0.5 text-[8px] font-bold text-white shadow-sm">
          {movement.phase === "approaching_pickup" ? category.etaLabel : statusLabel}
        </span>
      </div>

      <div
        data-testid="assigned-captain-card"
        className="absolute left-4 right-4 top-4 rounded-2xl bg-white/95 px-3 py-2.5 shadow-float"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rapido-grey">
              {statusLabel}
            </p>
            <p className="truncate text-sm font-bold text-rapido-black">
              {assignment.captain.name} · {category.icon} {assignment.captain.vehicleLabel}
            </p>
            <p className="truncate text-[11px] text-rapido-grey">
              {assignment.pickup.title} → {assignment.destination.title}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-bold text-rapido-black">★ {assignment.captain.rating}</p>
            <p className="text-[10px] text-rapido-grey">{assignment.captain.plate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
