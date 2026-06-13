import Link from "next/link";

interface PaymentMethodRowProps {
  paymentLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function PaymentMethodRow({
  paymentLabel = "Cash",
  secondaryLabel = "Assured Pay",
  secondaryHref = "/booking/assured-pay",
}: PaymentMethodRowProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <button
        type="button"
        className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-3 py-2.5 font-medium text-rapido-black"
      >
        <span>{paymentLabel}</span>
        <span className="text-rapido-grey">▾</span>
      </button>
      <Link
        href={secondaryHref}
        className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-3 py-2.5 font-medium text-rapido-black"
      >
        <span>{secondaryLabel}</span>
        <span className="text-rapido-grey">▾</span>
      </Link>
    </div>
  );
}
