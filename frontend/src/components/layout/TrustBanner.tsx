import { cn } from "@/lib/utils";

interface TrustBannerProps {
  message: string;
  className?: string;
}

export function TrustBanner({ message, className }: TrustBannerProps) {
  return (
    <p
      className={cn(
        "rounded-xl bg-rapido-tint px-3 py-2 text-xs leading-relaxed text-rapido-black",
        className,
      )}
    >
      {message}
    </p>
  );
}
