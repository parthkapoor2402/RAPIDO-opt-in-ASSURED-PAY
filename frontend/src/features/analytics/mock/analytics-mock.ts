import type { AnalyticsScenario, AnalyticsSummaryPayload } from "@/features/analytics/types";

const BASE: Omit<AnalyticsSummaryPayload, "scenario" | "story_headline" | "story_subline"> = {
  frictionless_completion_rate: 87.5,
  captain_payout_success_rate: 97.2,
  residual_recovery_rate: 83.3,
  dispute_rate: 7.1,
  bad_debt_estimate_inr: 6,
  repeat_assured_pay_usage_rate: 42.0,
  opt_in_rate: 40.0,
  assured_rides_completed: 48,
  event_counts: {
    assured_pay_impression: 200,
    assured_pay_opt_in: 76,
    fare_entered_buffer: 12,
    ride_auto_paid: 62,
    captain_fully_credited: 68,
    residual_due_created: 18,
    residual_due_recovered: 9,
    residual_due_disputed: 6,
  },
};

export function buildMockAnalyticsSummary(scenario: AnalyticsScenario = "all"): AnalyticsSummaryPayload {
  if (scenario === "healthy") {
    return {
      scenario: "healthy",
      frictionless_completion_rate: 93.8,
      captain_payout_success_rate: 98.5,
      residual_recovery_rate: 83.3,
      dispute_rate: 4.2,
      bad_debt_estimate_inr: 3,
      repeat_assured_pay_usage_rate: 48.0,
      opt_in_rate: 40.0,
      assured_rides_completed: 48,
      event_counts: { ...BASE.event_counts },
      story_headline: "Assured Pay is working — riders finish without payment stress",
      story_subline: "High frictionless completion with captain payouts protected and low dispute volume.",
    };
  }
  if (scenario === "stressed") {
    return {
      scenario: "stressed",
      frictionless_completion_rate: 62.5,
      captain_payout_success_rate: 88.0,
      residual_recovery_rate: 33.3,
      dispute_rate: 28.6,
      bad_debt_estimate_inr: 21,
      repeat_assured_pay_usage_rate: 12.0,
      opt_in_rate: 35.0,
      assured_rides_completed: 32,
      event_counts: {
        assured_pay_impression: 80,
        assured_pay_opt_in: 28,
        fare_entered_buffer: 8,
        ride_auto_paid: 20,
        captain_fully_credited: 32,
        residual_due_created: 12,
        residual_due_recovered: 4,
        residual_due_disputed: 7,
      },
      story_headline: "Recovery attention needed — dispute rate elevated",
      story_subline: "Review fare-change communication and residual recovery UX for stressed cohorts.",
    };
  }
  return {
    scenario: "all",
    ...BASE,
    story_headline: "Assured Pay is working — riders finish without payment stress",
    story_subline: "Most rides complete frictionlessly; captains paid instantly; residuals recoverable.",
  };
}
