import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-200 bg-white shadow-card",
        padded && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
