export type AssistUseCase = "fare_change" | "pending_due" | "dispute_summary";

export type ExplanationSource = "grok" | "fallback";

export interface ExplanationPayload {
  text: string;
  source: ExplanationSource;
  use_case: AssistUseCase;
  grok_available: boolean;
}

export interface AssistStatusPayload {
  grok_enabled: boolean;
  grok_configured: boolean;
  message: string;
}

export type FareExplainPayload = {
  estimate_f: number;
  approved_m: number;
  buffer: number;
  current_fare: number;
  reason_label?: string | null;
};

export type DueExplainPayload = {
  amount_inr: number;
  approved_m: number;
  actual_a: number;
  reason_label: string;
};

export type DisputeExplainPayload = {
  ride_id: string;
  approved_m: number;
  actual_a: number;
  excess_inr: number;
  reason_codes?: string[];
  rider_note?: string | null;
};

export type ExplainRequestPayload =
  | ({ useCase: "fare_change" } & FareExplainPayload)
  | ({ useCase: "pending_due" } & DueExplainPayload)
  | ({ useCase: "dispute_summary" } & DisputeExplainPayload);
