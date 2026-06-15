import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import { getRideCategory, RIDE_CATEGORIES } from "@/features/assured-pay/lib/ride-categories";

export interface NearbyVehicleMarker {
  id: string;
  categoryId: RideCategoryId;
  top: string;
  left: string;
}

/** Deterministic nearby supply around pickup — demo-friendly, no live GPS. */
export const NEARBY_VEHICLE_MARKERS: NearbyVehicleMarker[] = [
  { id: "bike-1", categoryId: "bike", top: "34%", left: "18%" },
  { id: "bike-2", categoryId: "bike", top: "42%", left: "32%" },
  { id: "bike-3", categoryId: "bike", top: "48%", left: "24%" },
  { id: "bike-4", categoryId: "bike", top: "56%", left: "38%" },
  { id: "bike-5", categoryId: "bike", top: "40%", left: "52%" },
  { id: "auto-1", categoryId: "auto", top: "30%", left: "58%" },
  { id: "auto-2", categoryId: "auto", top: "50%", left: "62%" },
  { id: "auto-3", categoryId: "auto", top: "62%", left: "54%" },
  { id: "cab-1", categoryId: "cab", top: "36%", left: "72%" },
  { id: "cab-2", categoryId: "cab", top: "58%", left: "76%" },
];

export function getNearbyCountByCategory(): Record<RideCategoryId, number> {
  return NEARBY_VEHICLE_MARKERS.reduce(
    (counts, marker) => {
      counts[marker.categoryId] += 1;
      return counts;
    },
    { bike: 0, auto: 0, cab: 0 } as Record<RideCategoryId, number>,
  );
}

export function getNearbySupplyLabel(categoryId: RideCategoryId): string {
  const count = getNearbyCountByCategory()[categoryId];
  const label = getRideCategory(categoryId).label.toLowerCase();
  return `${count} ${label}${count === 1 ? "" : "s"} nearby`;
}

export function getAllCategorySupplyLabels(): Array<{ categoryId: RideCategoryId; count: number; label: string }> {
  const counts = getNearbyCountByCategory();
  return RIDE_CATEGORIES.map((category) => ({
    categoryId: category.id,
    count: counts[category.id],
    label: category.label,
  }));
}
