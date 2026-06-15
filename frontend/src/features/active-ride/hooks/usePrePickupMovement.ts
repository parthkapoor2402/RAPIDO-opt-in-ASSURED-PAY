"use client";

import { useEffect } from "react";

import { useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";

const PRE_PICKUP_DURATION_MS = 2400;
const TICK_MS = 80;

export function usePrePickupMovement(enabled: boolean) {
  const { assignment, setPrePickupProgress, completePickup } = useActiveRide();

  useEffect(() => {
    if (!enabled || !assignment || assignment.movementPhase !== "approaching_pickup") {
      return;
    }

    const initialProgress = assignment.prePickupProgress;
    const startedAt = Date.now() - initialProgress * PRE_PICKUP_DURATION_MS;
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / PRE_PICKUP_DURATION_MS);
      setPrePickupProgress(progress);
      if (progress >= 1) {
        window.clearInterval(timer);
        completePickup();
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- resume from initial progress once per ride
  }, [enabled, assignment?.rideId, assignment?.movementPhase, setPrePickupProgress, completePickup]);
}
