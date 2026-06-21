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
    "w-full rounded-xl border border-border bg-surface p-3 text-[16px] text-ink shadow-[var(--shadow-xs)] outline-none placeholder:text-ink-3 focus:border-ink-3";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-ink-3 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-ink">Ask the swarm</h1>
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
              className="min-h-[36px] rounded-md border border-border bg-surface px-2.5 text-[13px] text-ink-2 transition-colors hover:border-accent-ink hover:text-ink"
            >
              #{t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-ink transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {loading ? "Asking the swarm…" : "Get an instant answer"}
          {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-[#f0c9c9] bg-danger-bg p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-[#fbe3b3] bg-accent-subtle p-4 text-sm text-accent-ink">
          Swarm AI is drafting a first answer…
        </div>
      )}

      {answer && (
        <div className="space-y-3">
          <div className="rounded-r-xl border border-[#fbe3b3] border-l-[3px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-xs)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fef3c7] text-accent-ink">
                <Icon name="spark" size={14} />
              </span>
              <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 font-medium text-[#78350f]">
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
