import type { CompletionScenarioId } from "@/features/settlement/types";



/** Bike demo baseline — scenario semantics scale from these offsets. */

export const BIKE_DEMO_BASE = {

  F: 42,

  buffer: 7,

  M: 49,

} as const;



/** Scale a bike-baseline rupee offset by category buffer width. */

export function scaleBufferOffset(bikeOffset: number, buffer: number): number {

  return Math.max(1, Math.round((bikeOffset * buffer) / BIKE_DEMO_BASE.buffer));

}



export function scaleFareFromBike(bikeFare: number, estimateF: number): number {

  return Math.round((bikeFare * estimateF) / BIKE_DEMO_BASE.F);

}



/**

 * Live-ride step fares — same story per category:

 * within_max → F throughout; buffer_zone → F, F+offset, M−1; exceeds_review → F, M, M+over.

 */

export function getLiveRideStepFare(

  scenarioId: string,

  stepIndex: number,

  estimateF: number,

  buffer: number = BIKE_DEMO_BASE.buffer,

): number {

  const M = estimateF + buffer;

  const step = Math.min(stepIndex, 2);



  switch (scenarioId) {

    case "within_max":

      return estimateF;

    case "buffer_zone":

      if (step === 0) return estimateF;

      if (step === 1) return estimateF + scaleBufferOffset(4, buffer);

      return M - 1;

    case "exceeds_review":

      if (step === 0) return estimateF;

      if (step === 1) return M;

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


