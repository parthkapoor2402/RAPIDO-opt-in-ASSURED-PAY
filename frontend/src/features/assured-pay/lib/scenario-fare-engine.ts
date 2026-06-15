import type { CompletionScenarioId } from "@/features/settlement/types";

/** Bike demo baseline — scenario semantics scale from these offsets. */
export const BIKE_DEMO_BASE = {
  F: 42,
  buffer: 7,
  M: 49,
} as const;

/** Zero-based index for ride-completed playback (Step 4 in UI). */
export const LIVE_RIDE_COMPLETION_STEP_INDEX = 3;

/** Scale a bike-baseline rupee offset by category buffer width. */
export function scaleBufferOffset(bikeOffset: number, buffer: number): number {
  return Math.max(1, Math.round((bikeOffset * buffer) / BIKE_DEMO_BASE.buffer));
}

export function scaleFareFromBike(bikeFare: number, estimateF: number): number {
  return Math.round((bikeFare * estimateF) / BIKE_DEMO_BASE.F);
}

/** Final actual fare (A) at ride-completed step per scenario. */
export function getLiveRideCompletionFare(
  scenarioId: string,
  estimateF: number,
  buffer: number,
): number {
  const M = estimateF + buffer;
  switch (scenarioId) {
    case "within_max":
      return estimateF;
    case "buffer_zone":
      return M - 1;
    case "exceeds_review":
      return M + scaleBufferOffset(3, buffer);
    default:
      return estimateF;
  }
}

/**
 * Live-ride step fares — steps 0–2 during trip; step 3 = completion actual fare.
 */
export function getLiveRideStepFare(
  scenarioId: string,
  stepIndex: number,
  estimateF: number,
  buffer: number = BIKE_DEMO_BASE.buffer,
): number {
  if (stepIndex >= LIVE_RIDE_COMPLETION_STEP_INDEX) {
    return getLiveRideCompletionFare(scenarioId, estimateF, buffer);
  }

  const M = estimateF + buffer;

  switch (scenarioId) {
    case "within_max":
      return estimateF;
    case "buffer_zone":
      if (stepIndex === 0) return estimateF;
      if (stepIndex === 1) return estimateF + scaleBufferOffset(4, buffer);
      return M - 1;
    case "exceeds_review":
      if (stepIndex === 0) return estimateF;
      if (stepIndex === 1) return M;
      return M + scaleBufferOffset(3, buffer);
    default:
      return estimateF;
  }
}



/** Completion `actual_a` values for any category F/buffer. */

export function getCompletionActualFare(

  scenario: CompletionScenarioId,

  estimateF: number,

  buffer: number,

): number {

  const M = estimateF + buffer;

  switch (scenario) {

    case "within_max":

      return estimateF;

    case "buffer_within_max":

      return M - 1;

    case "valid_overage":

      return M + scaleBufferOffset(3, buffer);

    case "suspicious_overage":

      return scaleFareFromBike(80, estimateF);

    default:

      return estimateF;

  }

}


