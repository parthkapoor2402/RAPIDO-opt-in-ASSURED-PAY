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
  DEFAULT_SCENARIO,
  DEMO_SCENARIOS,
  type DemoScenario,
} from "@/lib/demo-scenarios";

const SCENARIO_STORAGE_KEY = "assured-pay-demo-scenario-id";

interface DemoScenarioContextValue {
  scenario: DemoScenario;
  scenarios: DemoScenario[];
  setScenarioId: (id: string) => void;
  view: DemoScenario["view"];
}

const DemoScenarioContext = createContext<DemoScenarioContextValue | null>(null);

interface DemoScenarioProviderProps {
  children: ReactNode;
  initialScenarioId?: string;
  initialView?: DemoScenario["view"];
}

function resolveInitialScenarioId(
  initialScenarioId?: string,
  initialView?: DemoScenario["view"],
): string {
  return (
    initialScenarioId ??
    DEMO_SCENARIOS.find((s) => s.view === initialView)?.id ??
    DEFAULT_SCENARIO.id
  );
}

export function DemoScenarioProvider({
  children,
  initialScenarioId,
  initialView,
}: DemoScenarioProviderProps) {
  const resolvedInitial = resolveInitialScenarioId(initialScenarioId, initialView);

  const [scenarioId, setScenarioIdState] = useState(resolvedInitial);

  useEffect(() => {
    const stored = sessionStorage.getItem(SCENARIO_STORAGE_KEY);
    if (stored && DEMO_SCENARIOS.some((s) => s.id === stored)) {
      setScenarioIdState(stored);
    }
  }, []);

  const scenario = useMemo(
    () => DEMO_SCENARIOS.find((s) => s.id === scenarioId) ?? DEFAULT_SCENARIO,
    [scenarioId],
  );

  const setScenarioId = useCallback((id: string) => {
    if (DEMO_SCENARIOS.some((s) => s.id === id)) {
      setScenarioIdState(id);
      sessionStorage.setItem(SCENARIO_STORAGE_KEY, id);
    }
  }, []);

  const value = useMemo(
    () => ({
      scenario,
      scenarios: DEMO_SCENARIOS,
      setScenarioId,
      view: scenario.view,
    }),
    [scenario, setScenarioId],
  );

  return (
    <DemoScenarioContext.Provider value={value}>{children}</DemoScenarioContext.Provider>
  );
}

export function useDemoScenario() {
  const context = useContext(DemoScenarioContext);
  if (!context) {
    throw new Error("useDemoScenario must be used within DemoScenarioProvider");
  }
  return context;
}
