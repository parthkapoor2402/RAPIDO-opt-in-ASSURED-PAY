import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import type { MockLocation } from "@/features/booking/types";

export type RideMovementPhase = "approaching_pickup" | "on_trip" | "arrived";

export interface AssignedCaptain {
  id: string;
  name: string;
  rating: number;
  vehicleLabel: string;
  plate: string;
}

export interface ActiveRideAssignment {
  rideId: string;
  categoryId: RideCategoryId;
  captain: AssignedCaptain;
  pickup: MockLocation;
  destination: MockLocation;
  assignedAt: string;
  movementPhase: RideMovementPhase;
  prePickupProgress: number;
}
