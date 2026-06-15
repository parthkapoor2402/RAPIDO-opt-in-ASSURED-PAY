import type { MockLocation } from "@/features/booking/types";

/** Default pickup — matches live-ride demo copy. */
export const DEFAULT_PICKUP: MockLocation = {
  id: "pickup-koramangala",
  title: "Koramangala 5th Block",
  address: "Current location · Bengaluru",
  area: "koramangala",
};

/** Deterministic demo destinations — no external geocoding. */
export const MOCK_DESTINATIONS: MockLocation[] = [
  {
    id: "indiranagar",
    title: "Indiranagar",
    address: "100 Feet Road · Bengaluru",
    area: "indiranagar",
  },
  {
    id: "hsr-layout",
    title: "HSR Layout",
    address: "Sector 2 · Bengaluru",
    area: "hsr",
  },
  {
    id: "mg-road",
    title: "MG Road",
    address: "Trinity Circle · Bengaluru",
    area: "mg-road",
  },
  {
    id: "phoenix-mall",
    title: "Phoenix United Mall",
    address: "LDA Colony, Kanpur Road",
    area: "mall",
  },
  {
    id: "ajanta-hospital",
    title: "Ajanta Hospital",
    address: "Alambagh, Lucknow",
    area: "hospital",
  },
  {
    id: "whitefield",
    title: "Whitefield",
    address: "ITPL Main Road · Bengaluru",
    area: "whitefield",
  },
];

export function searchDestinations(query: string): MockLocation[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return MOCK_DESTINATIONS.slice(0, 5);
  }

  return MOCK_DESTINATIONS.filter(
    (place) =>
      place.title.toLowerCase().includes(normalized) ||
      place.address.toLowerCase().includes(normalized) ||
      place.area.toLowerCase().includes(normalized),
  );
}
