"use client";

import { useState } from "react";
import Markish from "@/components/Markish";
import Icon from "@/components/Icon";

// "Ask the knowledge base" — the smallest interactive leaf on /learn, so the
// index page can stay a Server Component. Posts to /api/learn-answer (which
// reuses generateAnswer), then previews the answer in the same accent-subtle AI
// block recipe used on /ask. Preview-only: persists nothing, needs no secrets.
type Answer = { text: string; model: string; tookMs: number };

export default function KnowledgeAsk() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/learn-answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: query, body: "" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnswer((await res.json()) as Answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-[12px] border border-border bg-surface p-3 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/60";

  return (
    <div className="rounded-[18px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] sm:p-5">
      <div className="mb-3 space-y-1">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.01em] text-ink">
          Ask the knowledge base
        </h2>
        <p className="text-[14px] text-ink-2">
          Stuck on evals, guardrails, or reliability? Ask in plain English — you&apos;ll get an{" "}
          <span className="font-medium text-accent-ink">instant AI answer</span> grounded in the same
          agent-building topics above.
        </p>
      </div>

      <form onSubmit={ask} className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'How do I gate a release on an eval without it being subjective?'"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-accent px-5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? "Asking the knowledge base…" : "Get an instant answer"}
          {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-[12px] border border-danger/30 bg-danger-bg p-4 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-3 rounded-[12px] border border-border bg-accent-subtle p-4 text-sm font-medium text-accent-ink">
          Swarm AI is drafting an answer from the knowledge base…
        </div>
      )}

      {answer && (
        <div className="mt-3 rounded-[16px] border border-border border-l-[5px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-xs)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
              <Icon name="spark" size={14} />
            </span>
            <span className="rounded-md bg-accent/15 px-2 py-0.5 font-bold uppercase tracking-wide text-accent-ink">
              Swarm AI · knowledge base
            </span>
            <span className="text-ink-3">
              {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
            </span>
          </div>
          <Markish text={answer.text} className="text-[15px] leading-relaxed text-ink-2" />
        </div>
      )}
    </div>
  );
}
