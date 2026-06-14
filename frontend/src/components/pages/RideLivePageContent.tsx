"use client";

import Link from "next/link";

import { BottomSheetPanel } from "@/components/layout/BottomSheetPanel";
import { MapHeroPlaceholder } from "@/components/layout/MapHeroPlaceholder";
import { LoadingState } from "@/components/ui/LoadingState";
import { FareProgressionCard } from "@/features/live-ride/components/FareProgressionCard";
import { FareTrustIndicator } from "@/features/live-ride/components/FareTrustIndicator";
import { LiveRideEventTimeline } from "@/features/live-ride/components/LiveRideEventTimeline";
import { LiveRidePlaybackControls } from "@/features/live-ride/components/LiveRidePlaybackControls";
import { ReasonCodeUpdateList } from "@/features/live-ride/components/ReasonCodeUpdateList";
import { GrokExplanationPanel } from "@/features/grok/components/GrokExplanationPanel";
import { LIVE_RIDE_PAGE } from "@/features/live-ride/lib/copy";
import { useLiveRide } from "@/features/live-ride/context/LiveRideProvider";

export function RideLivePageContent() {
  const {
    progress,
    trustState,
    scenarios,
    scenarioId,
    stepIndex,
    maxStep,
    loading,
    timelineTitle,
    timelineSubtitle,
    setScenarioId,
    playNextStep,
    playPrevStep,
    resetPlayback,
  } = useLiveRide();

  return (
    <>
      <MapHeroPlaceholder height="pickup">
        <Link
          href="/booking"
          className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-float"
          aria-label="Go back"
        >
          ←
        </Link>
        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-float"
          aria-label="Locate me"
        >
          ⊕
        </button>
      </MapHeroPlaceholder>

      <BottomSheetPanel className="space-y-3">
        <div className="space-y-0.5">
          <h1 className="text-base font-bold text-rapido-black">{LIVE_RIDE_PAGE.title}</h1>
          <p className="text-xs text-rapido-grey">{LIVE_RIDE_PAGE.subtitle}</p>
        </div>

        {loading || !progress ? (
          <LoadingState label="Loading live fare…" />
        ) : (
          <>
            <FareTrustIndicator
              trustState={trustState}
              assuredPayActive={progress.assured_pay_active}
            />

            <FareProgressionCard
              estimateF={progress.estimate_f}
              buffer={progress.buffer}
              approvedM={progress.approved_m}
              currentFare={progress.current_fare}
              residualDueIfEndedNow={progress.residual_due_if_ended_now}
              trustState={trustState}
            />

            <LiveRideEventTimeline
              title={timelineTitle}
              subtitle={timelineSubtitle}
              scenarioId={scenarioId}
            />

            <ReasonCodeUpdateList
              updates={progress.reason_updates}
              latestReasonCode={progress.latest_reason_code}
              trustState={trustState}
            />

            <div className="pt-1">
              <GrokExplanationPanel
                buttonLabel="Explain my fare"
                useCase="fare_change"
                variant="secondary"
                payload={{
                  estimate_f: progress.estimate_f,
                  approved_m: progress.approved_m,
                  buffer: progress.buffer,
                  current_fare: progress.current_fare,
                  reason_label: progress.latest_reason_code
                    ? progress.reason_updates.find(
                        (u) => u.reason_code === progress.latest_reason_code,
                      )?.reason_label
                    : null,
                }}
              />
            </div>

            <LiveRidePlaybackControls
              scenarios={scenarios}
              scenarioId={scenarioId}
              stepIndex={stepIndex}
              maxStep={maxStep}
              onScenarioChange={setScenarioId}
              onPrevStep={playPrevStep}
              onNextStep={playNextStep}
              onReset={resetPlayback}
            />
          </>
        )}
      </BottomSheetPanel>
    </>
  );
}
