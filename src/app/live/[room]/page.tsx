import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { hueFrom } from "@/lib/realtime";
import LiveRoom from "./LiveRoom";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: string }>;
}): Promise<Metadata> {
  const { room } = await params;
  return { title: `#${room} · Live · Swarm` };
}

export default async function LiveRoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const session = await auth();

  // Anon participation is allowed (ephemeral broadcast needs only the anon key).
  // Signed-in users get their real name/avatar; for guests we pass null and let
  // the client synthesize a stable random label (Math.random is impure on the
  // server, so it must not run during this Server Component's render).
  const user = session?.user;
  const me = user
    ? {
        name: user.name ?? user.email ?? "anon",
        image: user.image ?? null,
        hue: hueFrom(user.email ?? user.name ?? "swarm"),
      }
    : null;

  return (
    <div className="space-y-6">
      <Link href="/live" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← All live rooms
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="border-[1.5px] border-ink bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
            Live room
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">
          #{room}
        </h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          Ephemeral real-time chat — presence and messages are live for everyone here now and aren&apos;t
          stored. Say hi, drop a link, work a problem in the open.
        </p>
      </div>

      <LiveRoom room={room} me={me} />
    </div>
  );
}
