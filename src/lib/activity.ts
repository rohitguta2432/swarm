// Admin activity log — records logins + content events for the /admin dashboard.
// Same shape as src/lib/replies.ts: a server-only service-role Supabase client with
// an in-memory fallback so the app still builds/demos with zero secrets.
//
// Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to persist, and create the
// `swarm_activity` table (SQL in supabase/schema.sql).
//
// logActivity() is fire-and-forget by contract: it NEVER throws, so a logging
// failure can never break a sign-in or a post. Reads are admin-gated upstream.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client is server-only (this module is never imported by client code).
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export type ActivityAction = "login" | "new_thread" | "reply" | "new_link";

export type NewActivity = {
  email: string | null | undefined;
  name?: string | null;
  image?: string | null;
  action: ActivityAction;
  detail?: string | null;
};

export type ActivityEvent = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  action: ActivityAction;
  detail: string | null;
  createdAt: string; // pre-rendered relative label, e.g. "3h ago"
};

export type ActivityStats = {
  uniqueUsers: number; // distinct emails that have ever logged in
  logins24h: number;
  totalLogins: number;
  totalPosts: number; // new_thread + reply + new_link
};

const POST_ACTIONS = ["new_thread", "reply", "new_link"] as const;

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type MemEvent = { id: string; email: string; name: string | null; image: string | null; action: ActivityAction; detail: string | null; createdAt: string };
const memLog: MemEvent[] = [];

type Row = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};

// Record one event. NEVER throws — any failure (no email, Supabase down) is swallowed
// so the caller's sign-in / post flow is unaffected.
export async function logActivity(ev: NewActivity): Promise<void> {
  try {
    const email = ev.email?.trim().toLowerCase();
    if (!email) return; // email is the identity key; nothing useful to log without it
    if (supabase) {
      await supabase.from("swarm_activity").insert({
        email,
        name: ev.name ?? null,
        image: ev.image ?? null,
        action: ev.action,
        detail: ev.detail ?? null,
      });
      return;
    }
    memLog.push({
      id: `mem_${memLog.length}_${Date.now()}`,
      email,
      name: ev.name ?? null,
      image: ev.image ?? null,
      action: ev.action,
      detail: ev.detail ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Intentionally swallowed — logging is best-effort and must not break the flow.
  }
}

export async function getRecentActivity(limit = 100): Promise<ActivityEvent[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("swarm_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error || !data) return [];
      return (data as Row[]).map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        image: r.image,
        action: r.action as ActivityAction,
        detail: r.detail,
        createdAt: relativeTime(r.created_at),
      }));
    } catch (e) {
      // Network-level throw — degrade to an empty feed so /admin still renders.
      console.warn("[activity] getRecentActivity failed", e);
      return [];
    }
  }
  return [...memLog]
    .reverse()
    .slice(0, limit)
    .map((m) => ({ ...m, createdAt: relativeTime(m.createdAt) }));
}

const ZERO_STATS: ActivityStats = { uniqueUsers: 0, logins24h: 0, totalLogins: 0, totalPosts: 0 };

export async function getActivityStats(): Promise<ActivityStats> {
  if (supabase) {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      // Three exact head-counts (no rows transferred) + a server-side distinct count
      // via RPC (exact at any scale; a client-side scan would be row-capped and undercount).
      const [totalLogins, logins24h, totalPosts, uniqueUsers] = await Promise.all([
        supabase.from("swarm_activity").select("*", { count: "exact", head: true }).eq("action", "login"),
        supabase.from("swarm_activity").select("*", { count: "exact", head: true }).eq("action", "login").gte("created_at", since),
        supabase.from("swarm_activity").select("*", { count: "exact", head: true }).in("action", POST_ACTIONS as unknown as string[]),
        supabase.rpc("swarm_unique_login_users"),
      ]);
      // Inspect errors so a missing table / RLS misconfig is observable in logs rather
      // than silently rendering as a healthy-looking row of zeros.
      const errs = [totalLogins.error, logins24h.error, totalPosts.error, uniqueUsers.error].filter(Boolean);
      if (errs.length) console.warn("[activity] getActivityStats query error", errs);
      return {
        uniqueUsers: (uniqueUsers.data as number | null) ?? 0,
        logins24h: logins24h.count ?? 0,
        totalLogins: totalLogins.count ?? 0,
        totalPosts: totalPosts.count ?? 0,
      };
    } catch (e) {
      // Network-level throw (DNS, fetch failure) — degrade to zeros so /admin still
      // renders instead of 500-ing. Never throw out of the read path.
      console.warn("[activity] getActivityStats failed", e);
      return ZERO_STATS;
    }
  }
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const logins = memLog.filter((m) => m.action === "login");
  return {
    uniqueUsers: new Set(logins.map((m) => m.email)).size,
    logins24h: logins.filter((m) => new Date(m.createdAt).getTime() >= since).length,
    totalLogins: logins.length,
    totalPosts: memLog.filter((m) => (POST_ACTIONS as readonly string[]).includes(m.action)).length,
  };
}
