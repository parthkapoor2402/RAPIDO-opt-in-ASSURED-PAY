"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  fullBleed?: boolean;
  withStickyFooter?: boolean;
}

export function AppShell({
  children,
  className,
  fullBleed = false,
  withStickyFooter = false,
}: AppShellProps) {
  return (
    <div data-testid="app-shell" className="min-h-screen bg-surface-50 text-ink-900">
      {!fullBleed ? <TopBar /> : null}
      <main
        className={cn(
          "mx-auto max-w-md",
          fullBleed ? "pb-24" : "px-4 pb-24 pt-4",
          withStickyFooter && "pb-40",
          className,
        )}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
