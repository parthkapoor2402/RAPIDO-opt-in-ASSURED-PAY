"use client";

import { useEffect } from "react";

import { useActiveRide } from "@/features/active-ride/context/ActiveRideProvider";
import { useLiveRide } from "@/features/live-ride/context/LiveRideProvider";

const LAST_RESET_RIDE_KEY = "active-ride-last-reset-id";

/** Keeps fare scenario playback aligned when the user books a fresh ride. */
export function useResetPlaybackOnNewRide() {
  const { assignment, showVehicleOverlay } = useActiveRide();
  const { resetPlayback } = useLiveRide();

  useEffect(() => {
    if (!showVehicleOverlay || !assignment) {
      return;
    }
    const lastResetRideId = sessionStorage.getItem(LAST_RESET_RIDE_KEY);
    if (lastResetRideId === assignment.rideId) {
      return;
    }
    sessionStorage.setItem(LAST_RESET_RIDE_KEY, assignment.rideId);
    resetPlayback();
  }, [assignment, showVehicleOverlay, resetPlayback]);
}
