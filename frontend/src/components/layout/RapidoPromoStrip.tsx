import Link from "next/link";

interface RapidoPromoStripProps {
  message: string;
  href?: string;
}

export function RapidoPromoStrip({ message, href = "/booking/assured-pay" }: RapidoPromoStripProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-brand-100 px-3 py-2 text-xs font-semibold text-rapido-black"
    >
      {message} <span className="text-rapido-navy">&gt;</span>
    </Link>
  );
}
