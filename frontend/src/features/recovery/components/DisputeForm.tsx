"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { CTAButton } from "@/components/ui/CTAButton";
import { RECOVERY_COPY } from "@/features/recovery/lib/copy";

interface DisputeFormProps {
  onSubmit: (reason: string) => Promise<void>;
  disabled?: boolean;
}

export function DisputeForm({ onSubmit, disabled = false }: DisputeFormProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card data-testid="dispute-success">
        <p className="text-sm text-rapido-black">{RECOVERY_COPY.disputeSuccess}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3" data-testid="dispute-form">
      <div>
        <p className="text-sm font-bold text-rapido-black">{RECOVERY_COPY.disputeCta}</p>
        <p className="mt-1 text-xs text-rapido-grey">{RECOVERY_COPY.disputeHelper}</p>
      </div>
      <textarea
        className="min-h-[96px] w-full rounded-xl border border-surface-200 px-3 py-2 text-sm"
        placeholder="Describe what looks incorrect…"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        data-testid="dispute-reason-input"
      />
      <CTAButton
        variant="secondary"
        fullWidth
        disabled={disabled || submitting || reason.trim().length < 5}
        onClick={() => void handleSubmit()}
        data-testid="submit-dispute-cta"
      >
        Submit for review
      </CTAButton>
    </Card>
  );
}
