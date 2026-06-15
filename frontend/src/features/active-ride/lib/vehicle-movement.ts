import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import type { RideMovementPhase } from "@/features/active-ride/types";

export interface MapPoint {
  topPct: number;
  leftPct: number;
}

/** Matches MapHeroPlaceholder center pickup pin. */
export const MAP_PICKUP: MapPoint = { topPct: 45, leftPct: 50 };

/** Matches booking drop pin position. */
export const MAP_DROP: MapPoint = { topPct: 28, leftPct: 72 };

/** Spawn points aligned with nearby supply markers per category. */
export const CAPTAIN_SPAWN_BY_CATEGORY: Record<RideCategoryId, MapPoint> = {
  bike: { topPct: 34, leftPct: 18 },
  auto: { topPct: 30, leftPct: 58 },
  cab: { topPct: 36, leftPct: 72 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function interpolateMapPoint(from: MapPoint, to: MapPoint, t: number): MapPoint {
  const progress = clamp(t, 0, 1);
  return {
    topPct: from.topPct + (to.topPct - from.topPct) * progress,
    leftPct: from.leftPct + (to.leftPct - from.leftPct) * progress,
  };
}

export function getPrePickupPosition(categoryId: RideCategoryId, progress: number): MapPoint {
  return interpolateMapPoint(CAPTAIN_SPAWN_BY_CATEGORY[categoryId], MAP_PICKUP, progress);
}

export function getOnTripRouteProgress(stepIndex: number, maxStep: number): number {
  if (maxStep <= 1) {
    return 1;
  }
  return clamp(stepIndex / (maxStep - 1), 0, 1);
}

export function getOnTripPosition(stepIndex: number, maxStep: number): MapPoint {
  return interpolateMapPoint(MAP_PICKUP, MAP_DROP, getOnTripRouteProgress(stepIndex, maxStep));
}

export function resolveVehicleMovement(params: {
  movementPhase: RideMovementPhase;
  categoryId: RideCategoryId;
  prePickupProgress: number;
  stepIndex: number;
  maxStep: number;
  ridePhase: string;
}): { position: MapPoint; phase: RideMovementPhase; routeProgress: number } {
  if (params.ridePhase === "completed") {
    return { position: MAP_DROP, phase: "arrived", routeProgress: 1 };
  }

  if (params.movementPhase === "approaching_pickup" && params.prePickupProgress < 1) {
    return {
      position: getPrePickupPosition(params.categoryId, params.prePickupProgress),
      phase: "approaching_pickup",
      routeProgress: 0,
    };
  }

  const routeProgress = getOnTripRouteProgress(params.stepIndex, params.maxStep);
  return {
    position: getOnTripPosition(params.stepIndex, params.maxStep),
    phase: "on_trip",
    routeProgress,
  };
}

export function formatMapPointStyle(point: MapPoint): { top: string; left: string } {
  return { top: `${point.topPct}%`, left: `${point.leftPct}%` };
}
