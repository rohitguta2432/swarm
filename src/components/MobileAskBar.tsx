"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

// One fixed bottom action on mobile (the spec's "exactly one fixed bottom
// element per route"). Hidden on /ask itself (you're already asking) and on
// thread pages, where the in-flow reply composer owns the keyboard zone.
export default function MobileAskBar() {
  const pathname = usePathname();
  const hide = pathname === "/ask" || pathname.startsWith("/t/");
  if (hide) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-canvas/92 backdrop-blur sm:hidden">
      <div className="mx-auto max-w-3xl px-4 pb-[env(safe-area-inset-bottom)]">
        <Link
          href="/ask"
          className="my-2 flex h-12 items-center justify-center gap-1.5 rounded-[12px] bg-accent font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover"
        >
          Ask the swarm <Icon name="arrow-right" size={17} />
        </Link>
      </div>
    </div>
  );
}
