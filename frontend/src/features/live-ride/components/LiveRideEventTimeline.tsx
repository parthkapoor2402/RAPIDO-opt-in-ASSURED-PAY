"use client";

import { TimelineItem } from "@/components/ui/TimelineItem";
import { LIVE_RIDE_PAGE } from "@/features/live-ride/lib/copy";

interface LiveRideEventTimelineProps {
  title: string;
  subtitle: string;
  scenarioId: string;
}

export function LiveRideEventTimeline({ title, subtitle, scenarioId }: LiveRideEventTimelineProps) {
  return (
    <section
      className="rounded-2xl border border-surface-200 bg-surface-50/80 px-3 py-2.5 space-y-2"
      data-testid="live-ride-event-timeline"
      data-scenario={scenarioId}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-rapido-grey">
        {LIVE_RIDE_PAGE.timelineHeading}
      </p>
      <TimelineItem title={title} subtitle={subtitle} time="Now" active />
    </section>
  );
}
