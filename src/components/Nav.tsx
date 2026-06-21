import Link from "next/link";
import Logo from "./Logo";
import Avatar from "./Avatar";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/app/auth-actions";

export default async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <MobileMenu user={user ? { name: user.name, image: user.image } : null} />

        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
          <Logo />
          <span className="text-[15px]">
            Swarm<span className="text-accent">.</span>
          </span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ask"
            className="hidden rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Ask the swarm
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user.name ?? "you"} hue={40} size={28} image={user.image} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-muted"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle} className="hidden sm:block">
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
              >
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
