"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DemoScenarioProvider } from "@/context/DemoScenarioContext";
import { AssuredPayBookingProvider } from "@/features/assured-pay/context/AssuredPayBookingContext";
import { LiveRideProvider } from "@/features/live-ride/context/LiveRideProvider";
import { RecoveryProvider } from "@/features/recovery/context/RecoveryProvider";
import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DemoScenarioProvider>
      <RecoveryProvider>
        <AssuredPayBookingProvider>
          <LiveRideProvider>{children}</LiveRideProvider>
        </AssuredPayBookingProvider>
      </RecoveryProvider>
    </DemoScenarioProvider>
  );
}

interface RoutedPageProps {
  children: ReactNode;
  fullBleed?: boolean;
  withStickyFooter?: boolean;
}

export function RoutedPage({
  children,
  fullBleed = false,
  withStickyFooter = false,
}: RoutedPageProps) {
  return (
    <AppProviders>
      <AppShell fullBleed={fullBleed} withStickyFooter={withStickyFooter}>
        {children}
      </AppShell>
    </AppProviders>
  );
}
