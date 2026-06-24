import Link from "next/link";
import Logo from "./Logo";
import Avatar from "./Avatar";
import Icon from "./Icon";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { signInWithGoogle, signOutAction } from "@/app/auth-actions";

export default async function Nav() {
  const session = await auth();
  const user = session?.user;
  const admin = isAdmin(session);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <MobileMenu user={user ? { name: user.name, image: user.image } : null} />

          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <Logo size={30} />
            <span className="text-[22px] font-extrabold tracking-[-0.03em]">
              Swarm<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        <NavLinks />

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/ask"
            className="hidden items-center gap-2 rounded-[10px] bg-accent px-[18px] py-[11px] text-[14.5px] font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Ask the swarm <Icon name="arrow-right" size={15} />
          </Link>

          <div className="hidden h-[22px] w-px bg-black/10 sm:block" />

          {admin ? (
            <Link
              href="/admin"
              className="hidden text-[14px] font-medium text-ink-2 transition-colors hover:text-accent-ink sm:inline-flex"
            >
              Admin
            </Link>
          ) : null}

          {user ? (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name={user.name ?? "you"} hue={145} size={32} image={user.image} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle} className="hidden sm:block">
              <button
                type="submit"
                className="rounded-[10px] border border-border bg-surface px-4 py-2 text-[14px] font-bold text-ink transition-colors hover:border-accent/50 hover:bg-surface-muted"
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
