"use client";

import Link from "next/link";

import { BottomSheetPanel } from "@/components/layout/BottomSheetPanel";
import { MapHeroPlaceholder } from "@/components/layout/MapHeroPlaceholder";
import { PaymentMethodRow } from "@/components/layout/PaymentMethodRow";
import { RideOptionRow } from "@/components/layout/RideOptionRow";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { AssuredPayBookingCard } from "@/features/assured-pay/components/AssuredPayBookingCard";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { RIDE_CATEGORIES } from "@/features/assured-pay/lib/ride-categories";
import { BOOKING_RIDE_CARD } from "@/features/assured-pay/lib/copy";
import { formatInr } from "@/features/assured-pay/lib/fare";
import { CTAButton } from "@/components/ui/CTAButton";

export function BookingPageContent() {
  const {
    eligibility,
    selectedCategory,
    setSelectedCategory,
    primaryPromptId,
    optIn,
    openOptIn,
    paymentMethod,
    setPaymentMethod,
  } = useAssuredPayBooking();

  const category = RIDE_CATEGORIES.find((item) => item.id === selectedCategory)!;
  const bookLabel = optIn.enabled
    ? `Book ${category.label} · Assured Pay on`
    : `Book ${category.label}`;

  return (
    <>
      <MapHeroPlaceholder height="booking">
        <Link
          href="/home"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-float"
          aria-label="Go back"
        >
          ←
        </Link>
        <button
          type="button"
          className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-semibold shadow-float"
        >
          + Add stop
        </button>
      </MapHeroPlaceholder>

      <BottomSheetPanel className="space-y-4">
        <h1 className="sr-only">Book a ride</h1>

        <div className="space-y-2" data-testid="ride-category-list">
          {RIDE_CATEGORIES.map((item) => (
            <RideOptionRow
              key={item.id}
              name={item.label}
              icon={item.icon}
              capacity={item.capacity}
              price={formatInr(item.estimateF)}
              meta={item.etaLabel}
              assuredPayHint={BOOKING_RIDE_CARD.assuredPayHint}
              priceCaption={BOOKING_RIDE_CARD.priceCaption}
              selected={selectedCategory === item.id}
              onSelect={() => setSelectedCategory(item.id)}
            />
          ))}
        </div>

        <AssuredPayBookingCard
          eligibility={eligibility}
          primaryPromptId={primaryPromptId}
          optInEnabled={optIn.enabled}
          onOpenOptIn={openOptIn}
        />
      </BottomSheetPanel>

      <StickyActionBar>
        <PaymentMethodRow
          paymentLabel={paymentMethod === "cash" ? "Cash" : "UPI"}
          secondaryLabel={optIn.enabled ? "Assured Pay ✓" : "Assured Pay"}
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
          <Link href={optIn.enabled ? "/ride/live" : "/booking/assured-pay"}>
            <CTAButton fullWidth data-testid="book-ride-cta">
              {bookLabel}
            </CTAButton>
          </Link>
        </div>
      </StickyActionBar>
    </>
  );
}
