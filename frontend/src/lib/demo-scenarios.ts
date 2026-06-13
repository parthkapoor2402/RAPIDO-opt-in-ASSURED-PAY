export type AppView = "rider" | "captain" | "ops" | "admin";

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  view: AppView;
  riderId?: string;
  captainId?: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "rider_commuter",
    label: "Time-critical commuter",
    description: "Eligible rider with free trial — Priya persona",
    view: "rider",
    riderId: "rider_commuter",
  },
  {
    id: "rider_arjun",
    label: "Low-confidence payer",
    description: "Prior payment failure — education card eligible",
    view: "rider",
    riderId: "rider_arjun",
  },
  {
    id: "rider_blocked",
    label: "Open residual due",
    description: "Assured Pay blocked until due cleared",
    view: "rider",
    riderId: "rider_blocked",
  },
  {
    id: "captain_ravi",
    label: "Captain instant closure",
    description: "Captain wallet payout visibility — Ravi persona",
    view: "captain",
    captainId: "captain_ravi",
  },
  {
    id: "ops_reviewer",
    label: "Ops review queue",
    description: "Support reviewer handling suspicious overage",
    view: "ops",
  },
  {
    id: "admin_analytics",
    label: "Platform analytics",
    description: "FACR and KPI summary admin view",
    view: "admin",
  },
];

export const DEFAULT_SCENARIO = DEMO_SCENARIOS[0];
