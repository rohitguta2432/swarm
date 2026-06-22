"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Feed" },
  { href: "/live", label: "Live" },
  { href: "/learn", label: "Learn" },
];

// Desktop inline links. Active state uses weight + an amber-INK underline
// (not raw amber, which is 2.15:1) + aria-current — never color alone.
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="ml-1 hidden items-center gap-1 text-sm sm:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative px-2.5 py-1.5 font-semibold transition-colors ${
              active
                ? "text-ink after:absolute after:inset-x-2.5 after:-bottom-px after:h-[3px] after:bg-accent"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
