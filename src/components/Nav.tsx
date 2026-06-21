import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0b]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          <span className="text-[15px]">
            Swarm<span className="text-amber-500">.</span>
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 text-sm text-zinc-400 sm:flex">
          <Link href="/" className="rounded-md px-2.5 py-1.5 hover:bg-white/5 hover:text-zinc-100">
            Feed
          </Link>
          <Link href="/live" className="rounded-md px-2.5 py-1.5 hover:bg-white/5 hover:text-zinc-100">
            Live
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ask"
            className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-sm font-medium text-black transition hover:bg-amber-400"
          >
            Ask the swarm
          </Link>
        </div>
      </div>
    </header>
  );
}
