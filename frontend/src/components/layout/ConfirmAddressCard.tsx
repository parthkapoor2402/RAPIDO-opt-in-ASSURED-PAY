import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ConfirmAddressCardProps {
  primary: string;
  secondary: string;
  className?: string;
  icon?: ReactNode;
}

export function ConfirmAddressCard({
  primary,
  secondary,
  className,
  icon,
}: ConfirmAddressCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-rapido-green bg-white px-4 py-3",
        className,
      )}
    >
      <div className="flex gap-3">
        {icon ? <div className="shrink-0 pt-0.5">{icon}</div> : null}
        <div>
          <p className="font-bold text-rapido-black">{primary}</p>
          <p className="mt-0.5 text-sm text-rapido-grey">{secondary}</p>
        </div>
      </div>
    </div>
  );
}
