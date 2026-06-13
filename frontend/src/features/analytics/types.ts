export type AnalyticsScenario = "all" | "healthy" | "stressed";

export interface AnalyticsSummaryPayload {
  scenario: AnalyticsScenario;
  frictionless_completion_rate: number;
  captain_payout_success_rate: number;
  residual_recovery_rate: number;
  dispute_rate: number;
  bad_debt_estimate_inr: number;
  repeat_assured_pay_usage_rate: number;
  opt_in_rate: number;
  assured_rides_completed: number;
  event_counts: Record<string, number>;
  story_headline: string;
  story_subline: string;
}

export interface AnalyticsEventPayload {
  event_type: string;
  ride_id: string | null;
  rider_id: string | null;
  amount_inr: number | null;
  scenario: string;
  timestamp: string;
}

export const ANALYTICS_SCENARIOS: Array<{ id: AnalyticsScenario; label: string; description: string }> = [
  { id: "all", label: "All cohorts", description: "Combined healthy + stressed demo data" },
  { id: "healthy", label: "Healthy cohort", description: "Strong opt-in and high FACR" },
  { id: "stressed", label: "Stressed cohort", description: "Higher residuals and disputes" },
];

export const EVENT_LABELS: Record<string, string> = {
  assured_pay_impression: "Assured Pay impressions",
  assured_pay_opt_in: "Opt-ins",
  fare_entered_buffer: "Entered buffer zone",
  ride_auto_paid: "Auto-paid at trip end",
  captain_fully_credited: "Captain fully credited",
  residual_due_created: "Residual due created",
  residual_due_recovered: "Residual recovered",
  residual_due_disputed: "Residual disputed",
};
