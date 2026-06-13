"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ open, title, children, onClose }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-ink-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className={cn(
          "relative mx-auto w-full max-w-md rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-sheet",
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-200" />
        <h2 id="bottom-sheet-title" className="text-base font-semibold text-ink-900">
          {title}
        </h2>
        <div className="mt-3 text-sm text-ink-600">{children}</div>
      </div>
    </div>
  );
}
