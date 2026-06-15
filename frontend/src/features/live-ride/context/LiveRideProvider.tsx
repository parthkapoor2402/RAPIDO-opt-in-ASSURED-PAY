"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchRideProgressWithFallback,
  listScenariosWithFallback,
} from "@/features/live-ride/api/ride-progress";
import type { ExceedsReviewCompletionVariant } from "@/features/live-ride/lib/completion-playback";
import { DEMO_SCENARIOS } from "@/features/live-ride/mock/live-ride-mock";
import type { RideProgressPayload, RideScenarioSummary, TrustState } from "@/features/live-ride/types";
import { useAssuredPayBooking } from "@/features/assured-pay/context/AssuredPayBookingContext";

interface LiveRideContextValue {
  progress: RideProgressPayload | null;
  trustState: TrustState;
  scenarios: RideScenarioSummary[];
  scenarioId: string;
  stepIndex: number;
  maxStep: number;
  loading: boolean;
  timelineTitle: string;
  timelineSubtitle: string;
  setScenarioId: (id: string) => void;
  completionVariant: ExceedsReviewCompletionVariant;
  setCompletionVariant: (variant: ExceedsReviewCompletionVariant) => void;
  playNextStep: () => void;
  playPrevStep: () => void;
  resetPlayback: () => void;
  refreshProgress: () => Promise<void>;
}

const LiveRideContext = createContext<LiveRideContextValue | null>(null);

interface LiveRideProviderProps {
  children: ReactNode;
}

export function LiveRideProvider({ children }: LiveRideProviderProps) {
  const { eligibility, optIn } = useAssuredPayBooking();
  const [scenarios, setScenarios] = useState<RideScenarioSummary[]>(DEMO_SCENARIOS);
  const [scenarioId, setScenarioIdState] = useState("within_max");
  const [stepIndex, setStepIndex] = useState(0);
  const [completionVariant, setCompletionVariant] =
    useState<ExceedsReviewCompletionVariant>("valid_overage");
  const [progress, setProgress] = useState<RideProgressPayload | null>(null);
  const [timelineTitle, setTimelineTitle] = useState("Pickup complete");
  const [timelineSubtitle, setTimelineSubtitle] = useState("Starting trip");
  const [loading, setLoading] = useState(true);

  const maxStep = useMemo(() => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    return scenario?.step_count ?? 4;
  }, [scenarioId]);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchRideProgressWithFallback(
        scenarioId,
        stepIndex,
        eligibility.F,
        optIn.enabled,
        eligibility.buffer,
        completionVariant,
      );
      setProgress(payload);
      if ("timeline_title" in payload && payload.timeline_title) {
        setTimelineTitle(String(payload.timeline_title));
        setTimelineSubtitle(String(payload.timeline_subtitle ?? ""));
      }
    } finally {
      setLoading(false);
    }
  }, [scenarioId, stepIndex, eligibility.F, eligibility.buffer, optIn.enabled, completionVariant]);

  useEffect(() => {
    void listScenariosWithFallback().then(setScenarios);
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const setScenarioId = useCallback((id: string) => {
    setScenarioIdState(id);
    setStepIndex(0);
    setCompletionVariant("valid_overage");
  }, []);

  const playNextStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, maxStep - 1));
  }, [maxStep]);

  const playPrevStep = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetPlayback = useCallback(() => {
    setStepIndex(0);
  }, []);

  const trustState: TrustState = progress?.trust_state ?? "within_approved_max";

  const value = useMemo(
    () => ({
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
      completionVariant,
      setCompletionVariant,
      playNextStep,
      playPrevStep,
      resetPlayback,
      refreshProgress: loadProgress,
    }),
    [
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
      completionVariant,
      playNextStep,
      playPrevStep,
      resetPlayback,
      loadProgress,
    ],
  );

  return <LiveRideContext.Provider value={value}>{children}</LiveRideContext.Provider>;
}

export function useLiveRide() {
  const context = useContext(LiveRideContext);
  if (!context) {
    throw new Error("useLiveRide must be used within LiveRideProvider");
  }
  return context;
}
