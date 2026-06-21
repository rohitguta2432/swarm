"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import Avatar from "./Avatar";
import { signInWithGoogle, signOutAction } from "@/app/auth-actions";

type User = { name?: string | null; image?: string | null } | null;

// Mobile nav: a 44px hamburger that opens a modal sheet — restores the
// Feed/Live/account links that are hidden at <sm. Scroll-locked, Escape-
// and backdrop-closable, returns focus to the trigger.
export default function MobileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const linkCls =
    "flex min-h-[44px] items-center rounded-lg px-3 text-[15px] font-medium text-ink hover:bg-surface-muted";

  return (
    <div className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-sheet"
        className="-ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted"
      >
        <Icon name="menu" size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" id="mobile-sheet">
          <div
            className="absolute inset-0 bg-ink/20"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-x-0 top-0 border-b-2 border-ink bg-surface p-3 shadow-[var(--shadow-md)]"
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-ink-2">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <Link href="/" autoFocus className={linkCls}>
              Feed
            </Link>
            <Link href="/live" className={linkCls}>
              Live
            </Link>

            <div className="my-2 border-t border-border" />

            {user ? (
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm text-ink-2">
                  <Avatar name={user.name ?? "you"} hue={40} size={28} image={user.image} />
                  {user.name ?? "Signed in"}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="min-h-[44px] border-2 border-ink px-3 text-sm font-bold text-ink hover:bg-surface-muted"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <form action={signInWithGoogle}>
                <button type="submit" className={`${linkCls} w-full`}>
                  Sign in with Google
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
