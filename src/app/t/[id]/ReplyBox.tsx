"use client";

import { useState } from "react";

// MVP reply box — optimistic, client-only (no persistence yet). Demonstrates the
// "humans refine the AI answer" loop. Wiring auth + a durable store is post-MVP.
export default function ReplyBox() {
  const [value, setValue] = useState("");
  const [posted, setPosted] = useState<string[]>([]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;
    setPosted((p) => [...p, body]);
    setValue("");
  }

  return (
    <section className="space-y-3">
      {posted.map((b, i) => (
        <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
          <div className="mb-1 text-xs text-zinc-500">you · just now (local preview)</div>
          <p className="text-[15px] leading-relaxed text-zinc-200">{b}</p>
        </div>
      ))}

      <form onSubmit={submit} className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          placeholder="Add to the answer, share a fix, or ask a follow-up…"
          className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-600">Preview only — sign-in &amp; persistence coming next.</span>
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-40"
            disabled={!value.trim()}
          >
            Reply
          </button>
        </div>
      </form>
    </section>
  );
}
