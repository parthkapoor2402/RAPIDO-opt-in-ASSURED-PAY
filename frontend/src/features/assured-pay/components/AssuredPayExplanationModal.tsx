"use client";

import { Modal } from "@/components/ui/Modal";
import { COVERAGE, TRUST_COPY } from "@/features/assured-pay/lib/copy";

interface AssuredPayExplanationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AssuredPayExplanationModal({ open, onClose }: AssuredPayExplanationModalProps) {
  return (
    <Modal open={open} title="What Assured Pay covers" onClose={onClose}>
      <div className="space-y-4" data-testid="assured-pay-explanation-modal">
        <p className="text-sm text-rapido-grey">{TRUST_COPY.riderLead}</p>

        <div>
          <p className="text-sm font-bold text-rapido-black">Covers</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rapido-grey">
            {COVERAGE.covers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-rapido-black">Does not cover</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rapido-grey">
            {COVERAGE.doesNotCover.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-rapido-grey">{TRUST_COPY.captainFairness}</p>
      </div>
    </Modal>
  );
}
