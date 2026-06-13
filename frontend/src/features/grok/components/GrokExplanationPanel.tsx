"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { CTAButton } from "@/components/ui/CTAButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { fetchExplanationWithFallback } from "@/features/grok/api/assist";
import type {
  AssistUseCase,
  DisputeExplainPayload,
  DueExplainPayload,
  ExplanationPayload,
  FareExplainPayload,
} from "@/features/grok/types";

interface GrokExplanationPanelProps {
  buttonLabel: string;
  useCase: AssistUseCase;
  payload: FareExplainPayload | DueExplainPayload | DisputeExplainPayload;
  variant?: "primary" | "secondary";
}

function sourceLabel(source: ExplanationPayload["source"]): string {
  return source === "grok" ? "Grok assist" : "Policy summary";
}

export function GrokExplanationPanel({
  buttonLabel,
  useCase,
  payload,
  variant = "secondary",
}: GrokExplanationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationPayload | null>(null);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await fetchExplanationWithFallback(useCase, payload);
      setExplanation(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2" data-testid="grok-explanation-panel">
      <CTAButton
        variant={variant}
        fullWidth
        disabled={loading}
        onClick={() => void handleExplain()}
        data-testid="grok-explain-button"
      >
        {loading ? "Preparing explanation…" : buttonLabel}
      </CTAButton>

      {loading ? (
        <p className="text-xs text-rapido-grey" data-testid="grok-explain-loading">
          Fetching a plain-language summary…
        </p>
      ) : null}

      {explanation ? (
        <Card className="space-y-2 bg-rapido-tint">
          <div className="flex flex-wrap items-center gap-2" data-testid="grok-source-badge">
            <StatusChip
              label={sourceLabel(explanation.source)}
              tone={explanation.source === "grok" ? "brand" : "neutral"}
            />
            <span className="text-xs text-rapido-grey">Assistive only — not a payment decision</span>
          </div>
          <p className="text-sm text-rapido-black" data-testid="grok-explanation-text">
            {explanation.text}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
