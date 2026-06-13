"use client";

import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageSectionProps {
  title: string;
  description: string;
  phase: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  phase,
  badge,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip label={phase} tone="neutral" />
          {badge ? <StatusChip label={badge} tone="brand" /> : null}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        <p className="text-sm leading-relaxed text-ink-600">{description}</p>
      </div>
      {children ? <Card>{children}</Card> : null}
    </section>
  );
}
