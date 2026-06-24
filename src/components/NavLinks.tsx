"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Feed" },
  { href: "/live", label: "Live" },
  { href: "/learn", label: "Learn" },
  { href: "/news", label: "News" },
];

// Desktop inline links. Active state uses weight + a soft-green pill fill
// + aria-current — never color alone (keeps it legible without relying on hue).
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-[9px] px-4 py-2 text-[15px] transition-colors ${
              active
                ? "bg-[rgba(34,197,94,0.12)] font-bold text-ink"
                : "font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
