import { cn } from "@/lib/utils";

interface RideOptionRowProps {
  name: string;
  icon: string;
  capacity: number;
  price: string;
  meta: string;
  assuredPayHint?: string;
  priceCaption?: string;
  selected?: boolean;
  premium?: boolean;
  onSelect?: () => void;
}

export function RideOptionRow({
  name,
  icon,
  capacity,
  price,
  meta,
  assuredPayHint,
  priceCaption,
  selected = false,
  premium = false,
  onSelect,
}: RideOptionRowProps) {
  const Component = onSelect ? "button" : "div";

  return (
    <Component
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      data-testid={`ride-option-${name.toLowerCase()}`}
      data-selected={selected ? "true" : "false"}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left",
        selected ? "border-rapido-navy bg-white ring-1 ring-rapido-navy/20" : "border-surface-200 bg-white",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rapido-tint text-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-rapido-black">
          {name}
          <span className="ml-1 font-normal text-rapido-grey">👤 {capacity}</span>
          {premium ? <span className="ml-1 text-brand-700">★</span> : null}
        </p>
        <p className="text-xs text-rapido-grey">{meta}</p>
        {assuredPayHint ? (
          <p className="mt-0.5 text-[11px] font-medium text-rapido-grey">{assuredPayHint}</p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="text-base font-bold tabular-nums text-rapido-black">{price}</p>
        {priceCaption ? (
          <p className="text-[10px] font-medium uppercase tracking-wide text-rapido-grey">{priceCaption}</p>
        ) : null}
      </div>
    </Component>
  );
}
