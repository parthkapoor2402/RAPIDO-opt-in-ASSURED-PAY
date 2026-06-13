import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-[4.25rem] left-0 right-0 z-10 border-t border-surface-200 bg-white px-4 py-3",
        className,
      )}
    >
      <div className="mx-auto max-w-md space-y-2">{children}</div>
    </div>
  );
}
