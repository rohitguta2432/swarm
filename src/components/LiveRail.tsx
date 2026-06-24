import Link from "next/link";
import Avatar from "./Avatar";
import RoomPresenceCount from "@/app/live/[room]/RoomPresenceCount";

type Room = {
  title: string;
  slug: string;
  host: string;
  status: "live" | "soon" | "scheduled";
};

// Deterministic hue per host so each host's avatar is stable across renders
// without storing a color (the seed rooms carry no avatarHue of their own).
function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function StatusBadge({ status }: { status: Room["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-bg px-2 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-ink">
        <span className="flex h-2.5 items-end gap-0.5" aria-hidden>
          <span className="h-2.5 w-0.5 origin-bottom rounded-sm bg-amber-dot motion-safe:animate-[swarm-bars_0.9s_ease-in-out_infinite]" />
          <span className="h-2.5 w-0.5 origin-bottom rounded-sm bg-amber-dot motion-safe:animate-[swarm-bars_0.9s_ease-in-out_0.3s_infinite]" />
          <span className="h-2.5 w-0.5 origin-bottom rounded-sm bg-amber-dot motion-safe:animate-[swarm-bars_0.9s_ease-in-out_0.6s_infinite]" />
        </span>
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">
      {status === "soon" ? "Soon" : "Scheduled"}
    </span>
  );
}

export default function LiveRail({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) return null;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] rounded-full bg-amber-dot shadow-[0_0_0_4px_rgba(245,158,11,0.18)] motion-safe:animate-[swarm-pulse-dot_1.6s_ease-in-out_infinite]" />
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-2">Live &amp; upcoming</span>
        </div>
        <Link href="/live" className="text-[13.5px] font-semibold text-accent-ink transition-colors hover:text-accent">
          All rooms →
        </Link>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-1.5">
        {rooms.map((r) => (
          <Link
            key={r.slug}
            href={`/live/${r.slug}`}
            className="flex shrink-0 basis-[268px] flex-col rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-accent/45 hover:bg-accent/[0.04]"
          >
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={r.status} />
              <span className="text-[12.5px] font-medium text-ink-3">
                <RoomPresenceCount slug={r.slug} />
              </span>
            </div>
            <div className="mb-3 line-clamp-2 text-[15px] font-bold leading-snug text-ink">{r.title}</div>
            <div className="mt-auto flex items-center gap-2">
              <Avatar name={r.host} hue={hueFromString(r.host)} size={22} />
              <span className="text-[12.5px] text-ink-2">hosted by {r.host}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
