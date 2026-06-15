"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_PICKUP } from "@/features/booking/lib/mock-locations";
import type { BookingFlowPhase, MockLocation } from "@/features/booking/types";

interface BookingFlowContextValue {
  pickup: MockLocation;
  destination: MockLocation | null;
  phase: BookingFlowPhase;
  searchQuery: string;
  isSearchOpen: boolean;
  canBook: boolean;
  setSearchQuery: (query: string) => void;
  openDestinationSearch: () => void;
  selectDestination: (location: MockLocation) => void;
  clearDestination: () => void;
}

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

interface BookingFlowProviderProps {
  children: ReactNode;
}

export function BookingFlowProvider({ children }: BookingFlowProviderProps) {
  const [destination, setDestination] = useState<MockLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(true);

  const phase: BookingFlowPhase = destination ? "ride_options" : "search";
  const canBook = destination !== null;

  const openDestinationSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const selectDestination = useCallback((location: MockLocation) => {
    setDestination(location);
    setSearchQuery(location.title);
    setIsSearchOpen(false);
  }, []);

  const clearDestination = useCallback(() => {
    setDestination(null);
    setSearchQuery("");
    setIsSearchOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      pickup: DEFAULT_PICKUP,
      destination,
      phase,
      searchQuery,
      isSearchOpen,
      canBook,
      setSearchQuery,
      openDestinationSearch,
      selectDestination,
      clearDestination,
    }),
    [
      destination,
      phase,
      searchQuery,
      isSearchOpen,
      canBook,
      openDestinationSearch,
      selectDestination,
      clearDestination,
    ],
  );

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error("useBookingFlow must be used within BookingFlowProvider");
  }
  return context;
}
