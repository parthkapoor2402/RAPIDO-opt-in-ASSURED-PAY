import { BIKE_DEMO_BASE } from "@/features/assured-pay/lib/scenario-fare-engine";
import { API_PREFIX, apiUrl } from "@/lib/api";

import {
  buildRideCompletionPlayback,
  isCompletionStep,
  type ExceedsReviewCompletionVariant,
} from "@/features/live-ride/lib/completion-playback";
import type { RideProgressPayload, RideScenarioSummary } from "@/features/live-ride/types";
import { buildMockRideProgress, DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";

export interface FetchRideProgressParams {
  estimateF: number;
  approvedM: number;
  currentFare: number;
  reasonCodes?: string[];
  assuredPayActive?: boolean;
}

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
  const categoryUsesMock =
    estimateF !== BIKE_DEMO_BASE.F || resolvedBuffer !== BIKE_DEMO_BASE.buffer;

  let payload: RideProgressPayload & { timeline_title?: string; timeline_subtitle?: string };

  if (categoryUsesMock) {
    payload = buildMockRideProgress(
      scenarioId,
      stepIndex,
      estimateF,
      assuredPayActive,
      resolvedBuffer,
      completionVariant,
    );
  } else {
    try {
      payload = await fetchScenarioStep(scenarioId, stepIndex);
    } catch {
      payload = buildMockRideProgress(
        scenarioId,
        stepIndex,
        estimateF,
        assuredPayActive,
        resolvedBuffer,
        completionVariant,
      );
    }
  }

  if (isCompletionStep(stepIndex) && !payload.completion) {
    payload = {
      ...payload,
      ride_phase: "completed",
      completion: buildRideCompletionPlayback(
        scenarioId,
        estimateF,
        resolvedBuffer,
        completionVariant,
      ),
    };
  }

  return payload;
}

export async function listScenariosWithFallback(): Promise<RideScenarioSummary[]> {
  try {
    return await fetchScenarios();
  } catch {
    return DEMO_SCENARIOS;
  }
}
