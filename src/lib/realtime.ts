// Client-safe Supabase Realtime singleton for ephemeral live rooms (presence +
// broadcast). Mirrors src/lib/replies.ts's env-gated discipline, but reads ONLY
// the PUBLIC, browser-safe credentials NEXT_PUBLIC_SUPABASE_URL +
// NEXT_PUBLIC_SUPABASE_ANON_KEY — never the server-only service-role key.
//
// Zero-secrets contract: with neither var set, getRealtimeClient() returns null
// and realtimeMode() returns "offline". Live rooms still render and stay
// demoable (local optimistic messages); no network call is attempted, so the
// app builds and runs with no env. Presence + broadcast are transient Realtime
// features that need only the anon key — no table, no RLS.
//
// NOTE: only NEXT_PUBLIC_-prefixed env reaches the client bundle; unprefixed
// vars are replaced with "" in the browser. This module is the public pair on
// purpose — it is safe to import from client components.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Module-level singleton so repeated room mounts reuse one socket/connection.
let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}

export function realtimeMode(): "live" | "offline" {
  return url && key ? "live" : "offline";
}

// A single chat message exchanged over the room's broadcast channel.
export type LiveMessage = {
  id: string;
  author: string;
  image: string | null;
  hue: number;
  body: string;
  at: number; // epoch ms
};

// Per-tab presence payload tracked on the channel ("who's here now").
export type PresenceMeta = {
  name: string;
  image: string | null;
  hue: number;
  joinedAt: number;
};

// Deterministic avatar hue from a string (matches the hueFrom in the server
// actions so a participant's chip color is stable client-side without importing
// any server-only module).
export function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}
