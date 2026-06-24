import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getActivityStats, getRecentActivity, type ActivityAction } from "@/lib/activity";
import Avatar from "@/components/Avatar";

// Admin-only — never index, never advertise it in sitemaps.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Always render fresh — the activity feed must reflect the latest events, not a
// cached snapshot.
export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<ActivityAction, string> = {
  login: "signed in",
  new_thread: "posted a thread",
  reply: "replied",
  new_link: "shared a link",
};

// Deterministic avatar hue from a string (matches the chip color used elsewhere).
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

// /admin — gated dashboard. Returns 404 (not 403) for non-admins so the route's
// existence isn't advertised to anyone probing. Server Component; reads the
// first-party swarm_activity log. Aggregate page-view traffic lives separately in
// the Vercel dashboard (Vercel Web Analytics), not here.
export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) notFound();

  const [stats, events] = await Promise.all([getActivityStats(), getRecentActivity(100)]);

  const cards = [
    { label: "Unique users", value: stats.uniqueUsers, hint: "distinct sign-ins, all-time" },
    { label: "Logins (24h)", value: stats.logins24h, hint: "sign-ins in the last day" },
    { label: "Total logins", value: stats.totalLogins, hint: "all-time" },
    { label: "Posts", value: stats.totalPosts, hint: "threads + replies + links" },
  ];

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Admin</h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          Who&apos;s signing in and what the swarm is doing. Aggregate page traffic lives in your{" "}
          <a
            href="https://vercel.com/dashboard"
            className="font-medium text-accent-ink underline-offset-2 hover:underline"
          >
            Vercel Analytics
          </a>{" "}
          dashboard.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)]">
            <div className="font-display text-[28px] font-bold tabular-nums leading-none text-ink">{c.value}</div>
            <div className="mt-1.5 text-[13px] font-semibold text-ink">{c.label}</div>
            <div className="text-[11px] text-ink-3">{c.hint}</div>
          </div>
        ))}
      </div>

      {/* Recent activity feed */}
      <div className="space-y-3">
        <h2 className="font-display text-[18px] font-bold text-ink">Recent activity</h2>
        {events.length === 0 ? (
          <div className="border-2 border-ink bg-surface p-5 text-[14px] text-ink-2 shadow-[var(--shadow-hard)]">
            No activity yet. Events appear here as users sign in and post.
          </div>
        ) : (
          <ul className="divide-y-2 divide-ink border-2 border-ink bg-surface shadow-[var(--shadow-hard)]">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 p-3 sm:px-4">
                <Avatar name={ev.name ?? ev.email} hue={hueFrom(ev.email)} size={28} image={ev.image} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] text-ink">
                    <span className="font-semibold">{ev.name ?? ev.email}</span>{" "}
                    <span className="text-ink-2">{ACTION_LABEL[ev.action]}</span>
                    {ev.detail && ev.action !== "login" ? (
                      <span className="text-ink-3"> · {ev.detail}</span>
                    ) : null}
                  </div>
                  <div className="truncate text-[12px] text-ink-3">{ev.email}</div>
                </div>
                <span className="shrink-0 whitespace-nowrap text-[12px] text-ink-3">{ev.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
