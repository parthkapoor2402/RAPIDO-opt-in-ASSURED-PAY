import { describe, expect, it } from "vitest";

import { MOCK_DESTINATIONS, searchDestinations } from "@/features/booking/lib/mock-locations";

describe("searchDestinations", () => {
  it("returns top suggestions when query is empty", () => {
    expect(searchDestinations("")).toHaveLength(5);
  });

  it("filters destinations by title or address", () => {
    const results = searchDestinations("indira");
    expect(results.some((place) => place.id === "indiranagar")).toBe(true);
  });

  it("uses a deterministic local dataset", () => {
    expect(MOCK_DESTINATIONS.length).toBeGreaterThanOrEqual(5);
    expect(searchDestinations("phoenix")[0]?.id).toBe("phoenix-mall");
  });
});
