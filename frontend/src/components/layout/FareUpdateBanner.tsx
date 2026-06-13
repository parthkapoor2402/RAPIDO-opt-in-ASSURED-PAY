import { cn } from "@/lib/utils";

interface FareUpdateBannerProps {
  message: string;
  className?: string;
}

export function FareUpdateBanner({ message, className }: FareUpdateBannerProps) {
  return (
    <p
      className={cn(
        "rounded-xl bg-brand-100 px-3 py-2 text-xs font-semibold text-rapido-black",
        className,
      )}
    >
      {message}
    </p>
  );
}
