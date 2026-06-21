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
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-canvas/88 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <MobileMenu user={user ? { name: user.name, image: user.image } : null} />

        <Link href="/" className="flex items-center gap-2 font-display font-bold tracking-tight text-ink">
          <Logo />
          <span className="text-[17px]">
            Swarm<span className="text-accent-ink">.</span>
          </span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ask"
            className="hidden border-2 border-ink bg-ink px-3.5 py-1.5 text-sm font-bold text-surface transition-colors hover:bg-ink/90 sm:inline-flex"
          >
            Ask the swarm
          </Link>

          {user ? (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name={user.name ?? "you"} hue={40} size={28} image={user.image} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-2 py-1.5 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle} className="hidden sm:block">
              <button
                type="submit"
                className="border-2 border-ink px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-surface"
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
