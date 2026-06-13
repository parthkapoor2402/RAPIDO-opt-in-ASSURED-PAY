import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BottomSheetPanelProps {
  children: ReactNode;
  className?: string;
  overlay?: boolean;
}

export function BottomSheetPanel({ children, className, overlay = false }: BottomSheetPanelProps) {
  return (
    <section
      className={cn(
        "-mt-5 rounded-t-3xl border-t border-surface-200 bg-white px-4 pb-4 pt-3 shadow-sheet",
        overlay && "relative z-10",
        className,
      )}
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-surface-300" aria-hidden />
      {children}
    </section>
  );
}
