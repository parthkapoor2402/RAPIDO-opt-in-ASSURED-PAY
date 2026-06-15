import { describe, expect, it } from "vitest";

import { assignCaptainForCategory, buildRideAssignment } from "@/features/active-ride/lib/mock-assignment";
import { DEFAULT_PICKUP } from "@/features/booking/lib/mock-locations";
import { MOCK_DESTINATIONS } from "@/features/booking/lib/mock-locations";

describe("mock-assignment", () => {
  it("assigns a captain matching the selected category", () => {
    const captain = assignCaptainForCategory("auto");
    expect(captain.name).toBe("Suresh M.");
    expect(captain.vehicleLabel).toBe("Auto");
  });

  it("builds an active ride in approaching_pickup phase", () => {
    const assignment = buildRideAssignment("bike", DEFAULT_PICKUP, MOCK_DESTINATIONS[0]);
    expect(assignment.categoryId).toBe("bike");
    expect(assignment.captain.name).toBe("Ravi K.");
    expect(assignment.movementPhase).toBe("approaching_pickup");
    expect(assignment.prePickupProgress).toBe(0);
    expect(assignment.destination.title).toBe("Indiranagar");
  });
});
