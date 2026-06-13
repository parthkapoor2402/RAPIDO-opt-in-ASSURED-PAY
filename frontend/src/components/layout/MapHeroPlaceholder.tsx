import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MapHeroPlaceholderProps {
  label?: string;
  className?: string;
  height?: "booking" | "pickup";
  children?: ReactNode;
}

const heightClasses = {
  booking: "min-h-[38vh]",
  pickup: "min-h-[62vh]",
};

export function MapHeroPlaceholder({
  label,
  className,
  height = "booking",
  children,
}: MapHeroPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-rapido-map",
        heightClasses[height],
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#c4c2bd 1px, transparent 1px), linear-gradient(90deg, #c4c2bd 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute left-1/2 top-[45%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rapido-navy ring-4 ring-white" />
      {label ? (
        <p className="absolute bottom-3 left-4 text-xs font-medium text-rapido-grey">{label}</p>
      ) : null}
      {children}
    </div>
  );
}
