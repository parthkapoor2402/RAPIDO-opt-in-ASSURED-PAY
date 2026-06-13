import { cn } from "@/lib/utils";

interface RideOptionRowProps {
  name: string;
  capacity: number;
  price: string;
  meta: string;
  selected?: boolean;
  premium?: boolean;
}

export function RideOptionRow({
  name,
  capacity,
  price,
  meta,
  selected = false,
  premium = false,
}: RideOptionRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-3",
        selected ? "border-rapido-navy bg-white" : "border-surface-200 bg-white",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rapido-tint text-xl">
        🏍️
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-rapido-black">
          {name}
          <span className="ml-1 font-normal text-rapido-grey">👤 {capacity}</span>
          {premium ? <span className="ml-1 text-brand-700">★</span> : null}
        </p>
        <p className="text-xs text-rapido-grey">{meta}</p>
      </div>
      <p className="text-base font-bold tabular-nums text-rapido-black">{price}</p>
    </div>
  );
}
