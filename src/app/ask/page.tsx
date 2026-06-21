"use client";

import { useState } from "react";
import Link from "next/link";
import Markish from "@/components/Markish";

type Answer = { text: string; model: string; tookMs: number };

const TAG_SUGGESTIONS = ["mcp", "claude-code", "agents", "evals", "ollama", "local-llm", "reliability"];

export default function AskPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ai-answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnswer((await res.json()) as Answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-amber-400">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Ask the swarm</h1>
        <p className="text-[15px] text-zinc-400">
          You&apos;ll get an <span className="text-amber-400">instant AI answer</span> first — then real
          builders refine it. Be specific: paste the error, the config, the log line.
        </p>
      </div>

      <form onSubmit={ask} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="One-line problem — e.g. 'MCP tool not showing in Claude Code'"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Details: what you tried, the exact error / log line, your stack…"
          className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40"
        />
        <div className="flex flex-wrap gap-1.5">
          {TAG_SUGGESTIONS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setBody((b) => (b.includes(`#${t}`) ? b : `${b}${b ? " " : ""}#${t}`))}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 hover:border-amber-500/30 hover:text-zinc-200"
            >
              #{t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-40"
        >
          {loading ? "Asking the swarm…" : "Get an instant answer →"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.05] p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4 text-sm text-amber-300/80">
          ⚡ Swarm AI is drafting a first answer…
        </div>
      )}

      {answer && (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-400">
                ⚡ Swarm AI · answered first
              </span>
              <span className="text-zinc-500">
                {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
              </span>
            </div>
            <Markish text={answer.text} className="text-[15px] leading-relaxed text-zinc-200" />
          </div>
          <p className="text-xs text-zinc-600">
            In the full product this posts to the feed so human builders can refine it. For now this is a
            live preview of the AI-first flow.
          </p>
        </div>
      )}
    </div>
  );
}
