"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BottomSheetPanel } from "@/components/layout/BottomSheetPanel";
import { MapHeroPlaceholder } from "@/components/layout/MapHeroPlaceholder";
import { PaymentMethodRow } from "@/components/layout/PaymentMethodRow";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { AssuredPayFareCard } from "@/features/assured-pay/components/AssuredPayFareCard";
import { AssuredPayExplanationModal } from "@/features/assured-pay/components/AssuredPayExplanationModal";
import { DiscoveryPromptBanner } from "@/features/assured-pay/components/DiscoveryPromptBanner";
import { FreeTrialBadge } from "@/features/assured-pay/components/FreeTrialBadge";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { TRUST_COPY } from "@/features/assured-pay/lib/copy";
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils";

const COVERAGE_OPTIONS = [
  {
    id: "standard",
    title: "Enable Assured Pay",
    subtitle: "Pay up to approved max · captain paid instantly",
  },
  {
    id: "skip",
    title: "Continue without protection",
    subtitle: "Standard checkout at trip end",
  },
] as const;

export function AssuredPayPageContent() {
  const router = useRouter();
  const {
    eligibility,
    primaryPromptId,
    optIn,
    confirmOptIn,
    openOptIn,
    paymentMethod,
    setPaymentMethod,
  } = useAssuredPayBooking();
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const primaryPrompt =
    eligibility.prompts.find((p) => p.id === primaryPromptId) ?? eligibility.prompts[0] ?? null;

  const handleEnable = () => {
    confirmOptIn();
    router.push("/booking");
  };

  if (!eligibility.eligible) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-lg font-bold text-rapido-black">Assured Pay unavailable</h1>
        <p className="mt-2 text-sm text-rapido-grey">
          Clear any open due or add a payment method to continue.
        </p>
        <Link href="/ride/residual-due" className="mt-4 inline-block text-sm font-semibold text-rapido-navy">
          View remaining due →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <MapHeroPlaceholder height="booking" className="min-h-[28vh] brightness-75" />
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <Link
          href="/booking"
          className="absolute right-4 top-4 rounded-full bg-white px-4 py-1.5 text-xs font-semibold shadow-float"
        >
          Skip
        </Link>
      </div>

      <BottomSheetPanel overlay className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-rapido-black">Add Assured Pay</h1>
            <p className="text-sm text-rapido-grey">
              Know your max upfront. Finish without checkout stress at drop-off.
            </p>
          </div>
          <FreeTrialBadge show={eligibility.freeTrialAvailable} />
        </div>

        <DiscoveryPromptBanner
          prompt={primaryPrompt}
          onAction={() => primaryPrompt && openOptIn(primaryPrompt.id)}
        />

        <ul className="space-y-2">
          {COVERAGE_OPTIONS.map((option) => {
            const active = selected === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left",
                    active ? "border-rapido-navy" : "border-surface-200",
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-rapido-black">{option.title}</p>
                    <p className="text-xs text-rapido-grey">{option.subtitle}</p>
                  </div>
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full border-2",
                      active ? "border-rapido-navy bg-rapido-navy" : "border-surface-300",
                    )}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <AssuredPayFareCard
          estimateF={eligibility.F}
          buffer={eligibility.buffer}
          approvedMax={eligibility.M}
          reasonCodes={eligibility.validReasonCodes}
        />

        <TrustBanner message={TRUST_COPY.captainFairness} />

        <button
          type="button"
          data-testid="learn-more-assured-pay"
          className="text-xs font-semibold text-rapido-navy underline-offset-2 hover:underline"
          onClick={() => setModalOpen(true)}
        >
          What it covers / what it does not cover
        </button>
      </BottomSheetPanel>

      <StickyActionBar>
        <PaymentMethodRow
          paymentLabel={paymentMethod === "cash" ? "Cash" : "UPI"}
          secondaryLabel="Assured Pay"
          secondaryHref="/booking/assured-pay"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-xl border border-surface-200 py-2 text-xs font-semibold"
            onClick={() => setPaymentMethod(paymentMethod === "cash" ? "upi" : "cash")}
          >
            Pay: {paymentMethod === "cash" ? "Cash" : "UPI"}
          </button>
          <CTAButton
            fullWidth
            disabled={selected !== "standard" || optIn.enabled}
            onClick={handleEnable}
            data-testid="confirm-assured-pay-cta"
          >
            {optIn.enabled ? "Assured Pay enabled" : "Enable Assured Pay"}
          </CTAButton>
        </div>
      </StickyActionBar>

      <AssuredPayExplanationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
