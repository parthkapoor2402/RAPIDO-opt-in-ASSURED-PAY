"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildRideAssignment } from "@/features/active-ride/lib/mock-assignment";
import type { ActiveRideAssignment } from "@/features/active-ride/types";
import type { RideCategoryId } from "@/features/assured-pay/lib/ride-categories";
import type { MockLocation } from "@/features/booking/types";

const STORAGE_KEY = "active-ride-assignment";
const BOOKED_SESSION_KEY = "active-ride-booked";

interface ActiveRideContextValue {
  assignment: ActiveRideAssignment | null;
  isActive: boolean;
  showVehicleOverlay: boolean;
  assignFromBooking: (
    categoryId: RideCategoryId,
    pickup: MockLocation,
    destination: MockLocation,
  ) => void;
  setPrePickupProgress: (progress: number) => void;
  completePickup: () => void;
  clearAssignment: () => void;
}

const ActiveRideContext = createContext<ActiveRideContextValue | null>(null);

function readStoredAssignment(): ActiveRideAssignment | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ActiveRideAssignment;
  } catch {
    return null;
  }
}

function persistAssignment(assignment: ActiveRideAssignment | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!assignment) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
}

interface ActiveRideProviderProps {
  children: ReactNode;
}

function readBookedSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return sessionStorage.getItem(BOOKED_SESSION_KEY) === "true";
}

export function ActiveRideProvider({ children }: ActiveRideProviderProps) {
  const [assignment, setAssignment] = useState<ActiveRideAssignment | null>(null);
  const [bookedSession, setBookedSession] = useState(false);

  useEffect(() => {
    setAssignment(readStoredAssignment());
    setBookedSession(readBookedSession());
  }, []);

  const assignFromBooking = useCallback(
    (categoryId: RideCategoryId, pickup: MockLocation, destination: MockLocation) => {
      const next = buildRideAssignment(categoryId, pickup, destination);
      setAssignment(next);
      persistAssignment(next);
      sessionStorage.setItem(BOOKED_SESSION_KEY, "true");
      setBookedSession(true);
    },
    [],
  );

  const setPrePickupProgress = useCallback((progress: number) => {
    setAssignment((prev) => {
      if (!prev || prev.movementPhase !== "approaching_pickup") {
        return prev;
      }
      const next = { ...prev, prePickupProgress: Math.min(1, Math.max(0, progress)) };
      persistAssignment(next);
      return next;
    });
  }, []);

  const completePickup = useCallback(() => {
    setAssignment((prev) => {
      if (!prev) {
        return prev;
      }
      const next: ActiveRideAssignment = {
        ...prev,
        movementPhase: "on_trip",
        prePickupProgress: 1,
      };
      persistAssignment(next);
      return next;
    });
  }, []);

  const clearAssignment = useCallback(() => {
    setAssignment(null);
    persistAssignment(null);
    sessionStorage.removeItem(BOOKED_SESSION_KEY);
    sessionStorage.removeItem("active-ride-last-reset-id");
    setBookedSession(false);
  }, []);

  const showVehicleOverlay = assignment !== null && bookedSession;

  const value = useMemo(
    () => ({
      assignment,
      isActive: assignment !== null,
      showVehicleOverlay,
      assignFromBooking,
      setPrePickupProgress,
      completePickup,
      clearAssignment,
    }),
    [
      assignment,
      showVehicleOverlay,
      assignFromBooking,
      setPrePickupProgress,
      completePickup,
      clearAssignment,
    ],
  );

  return <ActiveRideContext.Provider value={value}>{children}</ActiveRideContext.Provider>;
}

export function useActiveRide() {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error("useActiveRide must be used within ActiveRideProvider");
  }
  return context;
}
