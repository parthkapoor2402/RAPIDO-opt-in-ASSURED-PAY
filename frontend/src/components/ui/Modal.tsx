"use client";

import { cn } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "w-full max-w-md rounded-2xl bg-white p-5 shadow-xl",
          "animate-in fade-in slide-in-from-bottom-4",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="modal-title" className="text-lg font-semibold text-ink-900">
          {title}
        </h2>
        <div className="mt-3 text-sm text-ink-600">{children}</div>
      </div>
    </div>
  );
}
