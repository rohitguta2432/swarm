"use client";

import { useEffect, useState } from "react";
import { getRealtimeClient, type PresenceMeta } from "@/lib/realtime";

// Tiny client island for the rooms LIST. Subscribes read-only to a room's
// presence channel to render an honest "N here now" count without making the
// list page a client component. Renders nothing in offline mode (no env).
export default function RoomPresenceCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) return;

    const channel = supabase.channel(`live-room:${slug}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PresenceMeta[]>;
        setCount(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [slug]);

  if (count === null) return null;
  return <span className="text-ink-2">· {count} here now</span>;
}
