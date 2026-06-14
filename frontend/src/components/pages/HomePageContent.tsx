"use client";

import Link from "next/link";

import { CTAButton } from "@/components/ui/CTAButton";
import { RapidoPromoStrip } from "@/components/layout/RapidoPromoStrip";
import { RecoveryBanner } from "@/features/recovery/components/RecoveryBanner";
import { useRecovery } from "@/features/recovery/context/RecoveryProvider";

const RECENTS = [
  { title: "Phoenix United Mall", address: "LDA Colony, Kanpur Road" },
  { title: "Ajanta Hospital", address: "Alambagh, Lucknow" },
];

export function HomePageContent() {
  const { recovery, bannerDismissed, dismissBanner, loading } = useRecovery();

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Ride home</h1>

      {!loading && recovery && !bannerDismissed ? (
        <RecoveryBanner recovery={recovery} onDismiss={dismissBanner} />
      ) : null}

      <div className="rounded-2xl border border-surface-200 bg-white px-4 py-3 shadow-card">
        <p className="text-sm text-rapido-grey">🔍 Where are you going?</p>
      </div>

      <div className="rounded-2xl bg-rapido-tint px-3 py-2">
        {RECENTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between border-b border-white/60 py-3 last:border-0"
          >
            <div>
              <p className="text-sm font-semibold text-rapido-black">{item.title}</p>
              <p className="text-xs text-rapido-grey">{item.address}</p>
            </div>
            <span className="text-rapido-grey">♡</span>
          </div>
        ))}
      </div>

      <RapidoPromoStrip message="Try Assured Pay on your next ride" href="/booking/assured-pay" />

      <Link href="/booking">
        <CTAButton fullWidth>Book a ride with Assured Pay</CTAButton>
      </Link>
    </div>
  );
}
