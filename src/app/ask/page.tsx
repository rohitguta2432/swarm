"use client";

import { useState } from "react";
import Link from "next/link";
import Markish from "@/components/Markish";
import Icon from "@/components/Icon";

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

  const inputCls =
    "w-full border-2 border-ink bg-surface p-3 text-[16px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[var(--shadow-hard-sm)]";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Ask the swarm</h1>
        <p className="text-[15px] text-ink-2">
          You&apos;ll get an <span className="font-medium text-accent-ink">instant AI answer</span>{" "}
          first — then real builders refine it. Be specific: paste the error, the config, the log line.
        </p>
      </div>

      <form onSubmit={ask} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="One-line problem — e.g. 'MCP tool not showing in Claude Code'"
          className={inputCls}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Details: what you tried, the exact error / log line, your stack…"
          className={`${inputCls} resize-y`}
        />
        <div className="flex flex-wrap gap-1.5">
          {TAG_SUGGESTIONS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setBody((b) => (b.includes(`#${t}`) ? b : `${b}${b ? " " : ""}#${t}`))}
              className="min-h-[36px] border-2 border-ink bg-surface px-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-accent hover:text-ink"
            >
              #{t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="inline-flex h-11 items-center gap-1.5 border-2 border-ink bg-accent px-4 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)] disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? "Asking the swarm…" : "Get an instant answer"}
          {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      {error && (
        <div className="border-2 border-danger bg-danger-bg p-4 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="border-2 border-ink bg-accent-subtle p-4 text-sm font-medium text-accent-ink">
          Swarm AI is drafting a first answer…
        </div>
      )}

      {answer && (
        <div className="space-y-3">
          <div className="border-2 border-ink border-l-[6px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-hard)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fef3c7] text-accent-ink">
                <Icon name="spark" size={14} />
              </span>
              <span className="border-[1.5px] border-ink bg-[#fef3c7] px-2 py-0.5 font-bold uppercase tracking-wide text-[#78350f]">
                Swarm AI · answered first
              </span>
              <span className="text-ink-3">
                {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
              </span>
            </div>
            <Markish text={answer.text} className="text-[15px] leading-relaxed text-[#27272a]" />
          </div>
          <p className="text-[12px] text-ink-3">
            In the full product this posts to the feed so human builders can refine it. For now this is
            a live preview of the AI-first flow.
          </p>
        </div>
      )}
    </div>
  );
}
