export interface MockLocation {
  id: string;
  title: string;
  address: string;
  area: string;
}

export type BookingFlowPhase = "search" | "ride_options";
