"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDemoScenario } from "@/context/DemoScenarioContext";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  match: RegExp;
}

const RIDER_NAV: NavItem[] = [
  { href: "/home", label: "Ride", match: /^\/home/ },
  { href: "/booking", label: "Book", match: /^\/booking/ },
  { href: "/ride/live", label: "Live", match: /^\/ride\/live/ },
  { href: "/demo/scenarios", label: "Profile", match: /^\/demo/ },
];

const CAPTAIN_NAV: NavItem[] = [
  { href: "/captain/payout", label: "Earnings", match: /^\/captain/ },
  { href: "/demo/scenarios", label: "Profile", match: /^\/demo/ },
];

const OPS_NAV: NavItem[] = [
  { href: "/support/review", label: "Review", match: /^\/support/ },
  { href: "/demo/scenarios", label: "Profile", match: /^\/demo/ },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/analytics", label: "Analytics", match: /^\/admin/ },
  { href: "/demo/scenarios", label: "Profile", match: /^\/demo/ },
];

const NAV_BY_VIEW = {
  rider: RIDER_NAV,
  captain: CAPTAIN_NAV,
  ops: OPS_NAV,
  admin: ADMIN_NAV,
} as const;

export function BottomNav() {
  const pathname = usePathname();
  const { view } = useDemoScenario();
  const items = NAV_BY_VIEW[view];

  return (
    <nav
      data-testid="app-bottom-nav"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-surface-200 bg-white"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const active = item.match.test(pathname ?? "");
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-col items-center justify-center rounded-xl px-2 text-xs font-medium transition-colors",
                  active ? "font-bold text-rapido-black" : "text-rapido-grey hover:bg-surface-50",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
