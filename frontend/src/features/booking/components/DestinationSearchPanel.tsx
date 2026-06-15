"use client";

import { searchDestinations } from "@/features/booking/lib/mock-locations";
import { useBookingFlow } from "@/features/booking/context/BookingFlowProvider";
import type { MockLocation } from "@/features/booking/types";
import { cn } from "@/lib/utils";

export function DestinationSearchPanel() {
  const {
    pickup,
    destination,
    searchQuery,
    isSearchOpen,
    setSearchQuery,
    openDestinationSearch,
    selectDestination,
    clearDestination,
  } = useBookingFlow();

  const suggestions = searchDestinations(searchQuery);

  return (
    <div className="space-y-3" data-testid="destination-search-panel">
      <div className="rounded-2xl border border-surface-200 bg-white p-3 shadow-card space-y-3">
        <div className="flex items-start gap-3" data-testid="pickup-location-row">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rapido-grey">Pickup</p>
            <p className="text-sm font-semibold text-rapido-black">{pickup.title}</p>
            <p className="text-xs text-rapido-grey">{pickup.address}</p>
          </div>
        </div>

        <div className="h-px bg-surface-200" />

        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rapido-navy" aria-hidden />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rapido-grey">Drop</p>
            {destination && !isSearchOpen ? (
              <button
                type="button"
                className="w-full text-left"
                onClick={openDestinationSearch}
                data-testid="destination-selected-summary"
              >
                <p className="text-sm font-semibold text-rapido-black">{destination.title}</p>
                <p className="text-xs text-rapido-grey">{destination.address}</p>
                <p className="mt-1 text-xs font-semibold text-rapido-navy">Change destination</p>
              </button>
            ) : (
              <label className="block">
                <span className="sr-only">Where are you going?</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={openDestinationSearch}
                  placeholder="Where are you going?"
                  data-testid="destination-search-input"
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-rapido-black placeholder:text-rapido-grey focus:border-rapido-navy focus:outline-none"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {destination && !isSearchOpen ? (
        <div
          className="rounded-xl bg-brand-50/80 px-3 py-2 text-xs text-rapido-black/85"
          data-testid="booking-trip-summary"
        >
          <span className="font-semibold">{pickup.title}</span>
          <span className="text-rapido-grey"> → </span>
          <span className="font-semibold">{destination.title}</span>
        </div>
      ) : null}

      {isSearchOpen || !destination ? (
        <div data-testid="destination-suggestions" className="space-y-1">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wide text-rapido-grey">
            Suggestions
          </p>
          <ul className="rounded-2xl border border-surface-200 bg-white divide-y divide-surface-100 overflow-hidden">
            {suggestions.map((place) => (
              <SuggestionRow key={place.id} place={place} onSelect={selectDestination} />
            ))}
          </ul>
          {destination ? (
            <button
              type="button"
              onClick={clearDestination}
              className="text-xs font-semibold text-rapido-grey underline-offset-2 hover:underline"
            >
              Clear destination
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionRow({
  place,
  onSelect,
}: {
  place: MockLocation;
  onSelect: (place: MockLocation) => void;
}) {
  return (
    <li>
      <button
        type="button"
        data-testid={`destination-suggestion-${place.id}`}
        onClick={() => onSelect(place)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-surface-50",
        )}
      >
        <span className="text-base" aria-hidden>
          📍
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-rapido-black">{place.title}</p>
          <p className="text-xs text-rapido-grey">{place.address}</p>
        </div>
      </button>
    </li>
  );
}
