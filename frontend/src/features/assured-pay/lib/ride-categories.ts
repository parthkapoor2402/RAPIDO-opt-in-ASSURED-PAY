export type RideCategoryId = "bike" | "auto" | "cab";

export interface RideCategoryConfig {
  id: RideCategoryId;
  label: string;
  icon: string;
  capacity: number;
  estimateF: number;
  buffer: number;
  etaLabel: string;
}

/** Demo fare presets per vehicle category — same Assured Pay flow, different F/M. */
export const RIDE_CATEGORIES: RideCategoryConfig[] = [
  {
    id: "bike",
    label: "Bike",
    icon: "🏍️",
    capacity: 1,
    estimateF: 42,
    buffer: 7,
    etaLabel: "2 mins away",
  },
  {
    id: "auto",
    label: "Auto",
    icon: "🛺",
    capacity: 3,
    estimateF: 85,
    buffer: 10,
    etaLabel: "4 mins away",
  },
  {
    id: "cab",
    label: "Cab",
    icon: "🚗",
    capacity: 4,
    estimateF: 145,
    buffer: 15,
    etaLabel: "6 mins away",
  },
];

export const DEFAULT_RIDE_CATEGORY_ID: RideCategoryId = "bike";

const CATEGORY_MAP = Object.fromEntries(
  RIDE_CATEGORIES.map((category) => [category.id, category]),
) as Record<RideCategoryId, RideCategoryConfig>;

export function getRideCategory(id: RideCategoryId): RideCategoryConfig {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.bike;
}

export function getCategoryFare(id: RideCategoryId): { F: number; buffer: number; M: number } {
  const category = getRideCategory(id);
  return {
    F: category.estimateF,
    buffer: category.buffer,
    M: category.estimateF + category.buffer,
  };
}

export function isRideCategoryId(value: string): value is RideCategoryId {
  return value in CATEGORY_MAP;
}
