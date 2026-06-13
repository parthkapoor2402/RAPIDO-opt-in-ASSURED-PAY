import { API_PREFIX, apiUrl } from "@/lib/api";

import { buildMockAnalyticsSummary } from "@/features/analytics/mock/analytics-mock";
import type { AnalyticsScenario, AnalyticsSummaryPayload } from "@/features/analytics/types";

export async function fetchAnalyticsSummary(scenario: AnalyticsScenario = "all"): Promise<AnalyticsSummaryPayload> {
  const response = await fetch(apiUrl(`${API_PREFIX}/analytics/summary?scenario=${scenario}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Analytics summary failed: ${response.status}`);
  }
  return response.json() as Promise<AnalyticsSummaryPayload>;
}

export async function fetchAnalyticsSummaryWithFallback(
  scenario: AnalyticsScenario = "all",
): Promise<AnalyticsSummaryPayload> {
  try {
    return await fetchAnalyticsSummary(scenario);
  } catch {
    return buildMockAnalyticsSummary(scenario);
  }
}
