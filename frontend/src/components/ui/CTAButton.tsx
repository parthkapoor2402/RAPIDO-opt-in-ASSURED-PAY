import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type CTAButtonVariant = "primary" | "secondary" | "ghost" | "disabled";

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CTAButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<CTAButtonVariant, string> = {
  primary: "bg-brand-600 text-rapido-black hover:bg-brand-700",
  secondary: "bg-white text-rapido-black border border-surface-200 hover:bg-surface-50",
  ghost: "bg-transparent text-rapido-black hover:bg-rapido-tint",
  disabled: "bg-rapido-disabled text-white cursor-not-allowed",
};

export function CTAButton({
  variant = "primary",
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: CTAButtonProps) {
  const resolvedVariant = disabled ? "disabled" : variant;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center rounded-2xl px-4 py-3 text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rapido-navy",
        variantClasses[resolvedVariant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
