import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import { getRideCategory } from "@/features/assured-pay/lib/ride-categories";
import type { MockLocation } from "@/features/booking/types";
import type { ActiveRideAssignment, AssignedCaptain } from "@/features/active-ride/types";

const MOCK_CAPTAINS: Record<RideCategoryId, AssignedCaptain> = {
  bike: {
    id: "captain-bike-01",
    name: "Ravi K.",
    rating: 4.9,
    vehicleLabel: "Bike",
    plate: "KA 01 AB 4521",
  },
  auto: {
    id: "captain-auto-01",
    name: "Suresh M.",
    rating: 4.8,
    vehicleLabel: "Auto",
    plate: "KA 03 C 8820",
  },
  cab: {
    id: "captain-cab-01",
    name: "Anil P.",
    rating: 4.9,
    vehicleLabel: "Cab",
    plate: "KA 05 D 1193",
  },
};

export function assignCaptainForCategory(categoryId: RideCategoryId): AssignedCaptain {
  return MOCK_CAPTAINS[categoryId];
}

export function buildRideAssignment(
  categoryId: RideCategoryId,
  pickup: MockLocation,
  destination: MockLocation,
): ActiveRideAssignment {
  const category = getRideCategory(categoryId);
  const captain = assignCaptainForCategory(categoryId);

  return {
    rideId: `ride-${categoryId}-${Date.now()}`,
    categoryId,
    captain: {
      ...captain,
      vehicleLabel: category.label,
    },
    pickup,
    destination,
    assignedAt: new Date().toISOString(),
    movementPhase: "approaching_pickup",
    prePickupProgress: 0,
  };
}
