import { cn } from "@/lib/utils";

interface TripRouteHeaderProps {
  pickup: string;
  dropoff: string;
  className?: string;
}

export function TripRouteHeader({ pickup, dropoff, className }: TripRouteHeaderProps) {
  return (
    <div className={cn("space-y-1 text-sm", className)}>
      <p className="font-medium text-ink-900">
        {pickup} → {dropoff}
      </p>
      <p className="text-xs text-ink-500">Bike · Bengaluru</p>
    </div>
  );
}
