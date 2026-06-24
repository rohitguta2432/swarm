"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Markish from "@/components/Markish";
import Icon from "@/components/Icon";
import { createThread } from "./actions";
import { signInWithGoogle } from "@/app/auth-actions";

type Answer = { text: string; model: string; tookMs: number };

const TAG_SUGGESTIONS = ["mcp", "claude-code", "agents", "evals", "ollama", "local-llm", "reliability"];

// Submit button for the real "Post to the feed" path. useFormStatus reflects the
// pending state of the enclosing <form action={createThread}>.
function PostButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-accent px-5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:shadow-none"
    >
      {pending ? "Posting to the feed…" : "Post to the feed"}
      {!pending && <Icon name="arrow-right" size={16} />}
    </button>
  );
}

// `signedIn` is resolved server-side by the page wrapper (src/app/ask/page.tsx).
// Posting is auth-gated on the server in createThread regardless; this just keeps the
// UI honest so signed-out users see a sign-in prompt instead of a throwing action.
export default function AskClient({ signedIn }: { signedIn: boolean }) {
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
    "w-full rounded-[12px] border border-border bg-surface p-3 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/60";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.025em] text-ink">Ask the swarm</h1>
        <p className="text-[15px] leading-relaxed text-ink-2">
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
              className="min-h-[36px] rounded-lg border border-border bg-surface px-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-accent/50 hover:bg-accent-subtle hover:text-accent-ink"
            >
              #{t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-accent px-5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? "Asking the swarm…" : "Get an instant answer"}
          {!loading && <Icon name="arrow-right" size={16} />}
        </button>
      </form>

      {error && (
        <div className="rounded-[12px] border border-danger/30 bg-danger-bg p-4 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-[12px] border border-border bg-accent-subtle p-4 text-sm font-medium text-accent-ink">
          Swarm AI is drafting a first answer…
        </div>
      )}

      {answer && (
        <div className="space-y-3">
          <div className="rounded-[16px] border border-border border-l-[5px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-xs)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                <Icon name="spark" size={14} />
              </span>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 font-bold uppercase tracking-wide text-accent-ink">
                Swarm AI · answered first
              </span>
              <span className="text-ink-3">
                {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
              </span>
            </div>
            <Markish text={answer.text} className="text-[15px] leading-relaxed text-ink-2" />
          </div>

          {signedIn ? (
            <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink-2">
                Looks right? <span className="font-semibold text-ink">Post it to the feed</span> so the
                swarm can refine it.
              </p>
              <form action={createThread} className="shrink-0">
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="body" value={body} />
                <input type="hidden" name="kind" value="question" />
                <PostButton />
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink-2">
                <span className="font-semibold text-ink">Sign in to post</span> this to the feed — your
                thread keeps this AI answer.
              </p>
              <form action={signInWithGoogle} className="shrink-0">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-bold text-ink transition-colors hover:border-accent/50 hover:bg-surface-muted"
                >
                  <GoogleGlyph /> Continue with Google
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
