"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import {
  getRealtimeClient,
  realtimeMode,
  hueFrom,
  type LiveMessage,
  type PresenceMeta,
} from "@/lib/realtime";

type Me = { name: string; image: string | null; hue: number };

function relativeTime(at: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Interactive live room leaf. LIVE when NEXT_PUBLIC_SUPABASE_* are set (per-room
// Supabase Realtime channel with presence + broadcast); OFFLINE otherwise —
// renders the same chrome, shows a banner, and keeps a local-only message demo.
export default function LiveRoom({ room, me: signedInMe }: { room: string; me: Me | null }) {
  const live = realtimeMode() === "live";
  // Signed-in identity comes from the server; guests get a stable random label
  // synthesized once on the client (lazy initializer — never re-randomizes).
  const [me] = useState<Me>(
    () =>
      signedInMe ?? {
        name: `guest-${Math.random().toString(36).slice(2, 6)}`,
        image: null,
        hue: hueFrom(room),
      },
  );
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [hereCount, setHereCount] = useState(1);
  const [draft, setDraft] = useState("");
  // Ref to the send fn so the input row doesn't need to re-bind the channel.
  const sendBroadcast = useRef<((m: LiveMessage) => void) | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getRealtimeClient();
    if (!supabase) {
      // Offline: presence stays at its initial 1 (just you); no channel, no network.
      sendBroadcast.current = null;
      return;
    }

    const channel = supabase.channel(`live-room:${room}`, {
      config: {
        presence: { key: crypto.randomUUID() },
        broadcast: { self: false },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PresenceMeta[]>;
        setHereCount(Object.keys(state).length);
      })
      .on("broadcast", { event: "msg" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as LiveMessage]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({
            name: me.name,
            image: me.image,
            hue: me.hue,
            joinedAt: Date.now(),
          } satisfies PresenceMeta);
        }
      });

    // broadcast:{ self:false } means our own messages don't echo back — append
    // them locally once on send instead.
    sendBroadcast.current = (m: LiveMessage) => {
      void channel.send({ type: "broadcast", event: "msg", payload: m });
    };

    return () => {
      sendBroadcast.current = null;
      void supabase.removeChannel(channel);
    };
    // Re-subscribe only when the room changes; `me` is stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function send() {
    const body = draft.trim().slice(0, 1000);
    if (!body) return;
    const msg: LiveMessage = {
      id: crypto.randomUUID(),
      author: me.name,
      image: me.image,
      hue: me.hue,
      body,
      at: Date.now(),
    };
    // Optimistic local append (also covers offline mode); broadcast when live.
    setMessages((prev) => [...prev, msg]);
    sendBroadcast.current?.(msg);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      {!live && (
        <div className="border-2 border-ink border-l-[6px] border-l-accent bg-accent-subtle p-3 text-[13px] font-medium text-accent-ink shadow-[var(--shadow-hard-sm)]">
          Realtime offline — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to go live
        </div>
      )}

      {/* Presence bar */}
      <div className="flex items-center gap-2 border-2 border-ink bg-surface px-4 py-2.5 text-[13px] shadow-[var(--shadow-hard-sm)]">
        <span className="inline-flex items-center gap-1.5 border-[1.5px] border-ink bg-danger-bg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-danger">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          Live
        </span>
        <span className="font-bold text-ink">{hereCount}</span>
        <span className="text-ink-2">{hereCount === 1 ? "here now (just you)" : "here now"}</span>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        className="max-h-[420px] min-h-[220px] space-y-3 overflow-y-auto border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)]"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-ink-3">
            No messages yet — say hello to kick off the room.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              <Avatar name={m.author} hue={m.hue} size={28} image={m.image} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12px] text-ink-3">
                  <span className="font-bold text-ink">{m.author}</span>
                  <span>· {relativeTime(m.at)}</span>
                </div>
                {/* Plain text only — no HTML/markdown — to keep the live feed injection-safe. */}
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-2">
                  {m.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Message the room…  (Enter to send, Shift+Enter for newline)"
          className="min-h-[44px] w-full resize-none border-2 border-ink bg-surface p-3 text-[16px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[var(--shadow-hard-sm)]"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 border-2 border-ink bg-accent px-4 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)] disabled:opacity-40 disabled:shadow-none"
        >
          <Icon name="arrow-right" size={15} /> Send
        </button>
      </div>
    </div>
  );
}
