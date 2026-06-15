import { BIKE_DEMO_BASE } from "@/features/assured-pay/lib/scenario-fare-engine";
import { API_PREFIX, apiUrl } from "@/lib/api";

import type { ExceedsReviewCompletionVariant } from "@/features/live-ride/lib/completion-playback";
import type { RideProgressPayload, RideScenarioSummary } from "@/features/live-ride/types";
import { buildMockRideProgress, DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";

export interface FetchRideProgressParams {
  estimateF: number;
  approvedM: number;
  currentFare: number;
  reasonCodes?: string[];
  assuredPayActive?: boolean;
}

/** Demo playback is frontend-authoritative — avoids stale/crashed API on Vercel. */
const DEMO_PLAYBACK_USES_MOCK = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export async function fetchRideProgress(
  params: FetchRideProgressParams,
): Promise<RideProgressPayload> {
  const search = new URLSearchParams({
    estimate_f: String(params.estimateF),
    approved_m: String(params.approvedM),
    current_fare: String(params.currentFare),
    assured_pay_active: String(params.assuredPayActive ?? true),
  });
  if (params.reasonCodes?.length) {
    search.set("reason_codes", params.reasonCodes.join(","));
  }

  const response = await fetch(apiUrl(`${API_PREFIX}/ride/progress?${search}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Ride progress failed: ${response.status}`);
  }
  return response.json() as Promise<RideProgressPayload>;
}

export async function fetchScenarioStep(
  scenarioId: string,
  stepIndex: number,
): Promise<RideProgressPayload> {
  const response = await fetch(
    apiUrl(`${API_PREFIX}/ride/scenarios/${scenarioId}/step/${stepIndex}`),
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Scenario step failed: ${response.status}`);
  }
  return response.json() as Promise<RideProgressPayload>;
}

export async function fetchScenarios(): Promise<RideScenarioSummary[]> {
  const response = await fetch(apiUrl(`${API_PREFIX}/ride/scenarios`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Scenario list failed: ${response.status}`);
  }
  const data = (await response.json()) as { scenarios: RideScenarioSummary[] };
  return data.scenarios;
}

export async function fetchRideProgressWithFallback(
  scenarioId: string,
  stepIndex: number,
  estimateF: number,
  assuredPayActive: boolean,
  buffer?: number,
  completionVariant: ExceedsReviewCompletionVariant = "valid_overage",
): Promise<RideProgressPayload & { timeline_title?: string; timeline_subtitle?: string }> {
  const resolvedBuffer = buffer ?? BIKE_DEMO_BASE.buffer;

  if (DEMO_PLAYBACK_USES_MOCK) {
    return buildMockRideProgress(
      scenarioId,
      stepIndex,
      estimateF,
      assuredPayActive,
      resolvedBuffer,
      completionVariant,
    );
  }

  const categoryUsesMock =
    estimateF !== BIKE_DEMO_BASE.F || resolvedBuffer !== BIKE_DEMO_BASE.buffer;

  if (categoryUsesMock) {
    return buildMockRideProgress(
      scenarioId,
      stepIndex,
      estimateF,
      assuredPayActive,
      resolvedBuffer,
      completionVariant,
    );
  }

  try {
    const payload = await fetchScenarioStep(scenarioId, stepIndex);
    return {
      ...payload,
      ...buildMockRideProgress(
        scenarioId,
        stepIndex,
        estimateF,
        assuredPayActive,
        resolvedBuffer,
        completionVariant,
      ),
    };
  } catch {
    return buildMockRideProgress(
      scenarioId,
      stepIndex,
      estimateF,
      assuredPayActive,
      resolvedBuffer,
      completionVariant,
    );
  }
}

export async function listScenariosWithFallback(): Promise<RideScenarioSummary[]> {
  if (DEMO_PLAYBACK_USES_MOCK) {
    return DEMO_SCENARIOS;
  }

  try {
    const remote = await fetchScenarios();
    return DEMO_SCENARIOS.map((demo) => {
      const match = remote.find((item) => item.id === demo.id);
      return match ? { ...match, label: demo.label, step_count: demo.step_count } : demo;
    });
  } catch {
    return DEMO_SCENARIOS;
  }
}
