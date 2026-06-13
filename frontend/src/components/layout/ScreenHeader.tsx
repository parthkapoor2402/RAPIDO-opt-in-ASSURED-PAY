import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  icon?: ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  align = "left",
  icon,
  className,
}: ScreenHeaderProps) {
  return (
    <header className={cn("space-y-1", align === "center" && "text-center", className)}>
      {icon ? <div className="mb-2 flex justify-center">{icon}</div> : null}
      <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
      {subtitle ? <p className="text-sm text-ink-600">{subtitle}</p> : null}
    </header>
  );
}
