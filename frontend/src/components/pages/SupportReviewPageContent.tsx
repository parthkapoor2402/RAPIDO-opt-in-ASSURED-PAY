"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { CTAButton } from "@/components/ui/CTAButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusChip } from "@/components/ui/StatusChip";
import { GrokExplanationPanel } from "@/features/grok/components/GrokExplanationPanel";
import { fetchReviewQueueWithFallback } from "@/features/recovery/api/recovery";
import type { ReviewCasePayload } from "@/features/recovery/types";

export function SupportReviewPageContent() {
  const [cases, setCases] = useState<ReviewCasePayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchReviewQueueWithFallback().then((items) => {
      setCases(items);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingState label="Loading support cases…" />;
  }

  return (
    <div className="space-y-4" data-testid="support-review-page">
      <h1 className="text-xl font-bold text-rapido-black">Support cases</h1>
      <p className="text-sm text-rapido-grey">Review fare overages that need a manual decision.</p>

      <StatusChip label={`${cases.length} pending`} tone="warning" />

      {cases.length === 0 ? (
        <Card>
          <p className="text-sm text-rapido-grey">No cases waiting for review.</p>
        </Card>
      ) : (
        cases.map((item) => (
          <Card key={item.id} className="space-y-3" data-testid="support-case-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-rapido-black">{item.ride_id}</p>
                <p className="text-xs text-rapido-grey">
                  +₹{item.excess_inr} above max · Approved ₹{item.approved_m} · Final ₹
                  {item.actual_a}
                </p>
              </div>
              <StatusChip label="Needs review" tone="warning" />
            </div>
            <p className="text-xs text-rapido-grey">
              Captain payout held · Approve residual, adjust, or deny.
            </p>
            <GrokExplanationPanel
              buttonLabel="Generate dispute summary"
              useCase="dispute_summary"
              payload={{
                ride_id: item.ride_id,
                approved_m: item.approved_m,
                actual_a: item.actual_a,
                excess_inr: item.excess_inr,
                reason_codes: item.reason_codes,
              }}
            />
            <CTAButton variant="secondary" fullWidth>
              Open case
            </CTAButton>
          </Card>
        ))
      )}
    </div>
  );
}
