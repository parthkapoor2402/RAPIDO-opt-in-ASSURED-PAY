"use client";

import { useCallback, useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { fetchAnalyticsSummaryWithFallback } from "@/features/analytics/api/analytics";
import { EventFunnel } from "@/features/analytics/components/EventFunnel";
import { KpiCard } from "@/features/analytics/components/KpiCard";
import { ANALYTICS_SCENARIOS, type AnalyticsScenario, type AnalyticsSummaryPayload } from "@/features/analytics/types";

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function AdminAnalyticsPageContent() {
  const [scenario, setScenario] = useState<AnalyticsScenario>("all");
  const [summary, setSummary] = useState<AnalyticsSummaryPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async (next: AnalyticsScenario) => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsSummaryWithFallback(next);
      setSummary(data);
      setScenario(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary("all");
  }, [loadSummary]);

  if (loading || !summary) {
    return <LoadingState label="Loading analytics…" />;
  }

  return (
    <div className="space-y-5" data-testid="admin-analytics-page">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-rapido-black">Assured Pay analytics</h1>
          <StatusChip label="Demo data" tone="brand" />
        </div>
        <p className="mt-1 text-sm text-rapido-grey">
          North Star and guardrail metrics for stakeholder demos — seeded from instrumented ride events.
        </p>
      </div>

      <Card className="space-y-2 bg-rapido-tint" data-testid="analytics-story">
        <p className="text-sm font-bold text-rapido-black">{summary.story_headline}</p>
        <p className="text-xs text-rapido-grey">{summary.story_subline}</p>
        <p className="text-xs text-rapido-grey">
          {summary.assured_rides_completed} assured rides · {formatPct(summary.opt_in_rate)} opt-in from impressions
        </p>
      </Card>

      <div className="space-y-2" data-testid="scenario-filter">
        <p className="text-xs font-bold uppercase tracking-wide text-rapido-grey">Cohort filter</p>
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void loadSummary(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                scenario === item.id
                  ? "bg-brand-600 text-rapido-black"
                  : "bg-surface-100 text-rapido-grey hover:bg-surface-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          testId="kpi-frictionless"
          label="Frictionless completion (FACR)"
          value={formatPct(summary.frictionless_completion_rate)}
          hint="Rides ending without payment friction"
          tone="brand"
        />
        <KpiCard
          testId="kpi-captain-payout"
          label="Captain payout success"
          value={formatPct(summary.captain_payout_success_rate)}
          hint="Captains credited per policy"
          tone="success"
        />
        <KpiCard
          testId="kpi-residual-recovery"
          label="Residual recovery rate"
          value={formatPct(summary.residual_recovery_rate)}
          hint="Small dues cleared after trip"
          tone={summary.residual_recovery_rate >= 70 ? "success" : "warning"}
        />
        <KpiCard
          testId="kpi-dispute-rate"
          label="Dispute rate"
          value={formatPct(summary.dispute_rate)}
          hint="Residual disputes / dues created"
          tone={summary.dispute_rate <= 8 ? "neutral" : "danger"}
        />
        <KpiCard
          testId="kpi-bad-debt"
          label="Bad debt estimate"
          value={formatInr(summary.bad_debt_estimate_inr)}
          hint="Unrecovered residual (demo)"
          tone={summary.bad_debt_estimate_inr <= 10 ? "success" : "warning"}
        />
        <KpiCard
          testId="kpi-repeat-usage"
          label="Repeat Assured Pay usage"
          value={formatPct(summary.repeat_assured_pay_usage_rate)}
          hint="Riders with 2+ opt-ins in window"
          tone="brand"
        />
      </div>

      <EventFunnel eventCounts={summary.event_counts} />
    </div>
  );
}
