"use client";

import { useFormStatus } from "react-dom";
import Icon from "@/components/Icon";
import { submitLink } from "./actions";
import { signInWithGoogle } from "@/app/auth-actions";

// Submit button for the real "Share to the feed" path. useFormStatus reflects the
// pending state of the enclosing <form action={submitLink}>.
function ShareButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center gap-1.5 border-2 border-ink bg-accent px-4 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)] disabled:opacity-40 disabled:shadow-none"
    >
      {pending ? "Summarizing…" : "Share to the feed"}
      {!pending && <Icon name="arrow-right" size={16} />}
    </button>
  );
}

// `signedIn` is resolved server-side by the page (src/app/news/page.tsx). Submission
// is auth-gated on the server in submitLink regardless; this keeps the UI honest so
// signed-out users see a sign-in prompt instead of a throwing action.
export default function NewsSubmit({ signedIn }: { signedIn: boolean }) {
  const inputCls =
    "w-full border-2 border-ink bg-surface p-3 text-[16px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[var(--shadow-hard-sm)]";

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-3 border-2 border-ink bg-surface p-5 shadow-[var(--shadow-hard)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-ink-2">
          <span className="font-semibold text-ink">Sign in to share a link</span> — Swarm&apos;s AI
          auto-summarizes it for the feed.
        </p>
        <form action={signInWithGoogle} className="shrink-0">
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 border-2 border-ink bg-surface px-4 text-sm font-bold text-ink transition-colors hover:bg-surface-muted"
          >
            <GoogleGlyph /> Continue with Google
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-2 border-ink bg-surface p-5 shadow-[var(--shadow-hard)]">
      <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">
        Share an article
      </h2>
      <p className="text-[13px] text-ink-2">
        Drop a link worth reading — Swarm&apos;s AI writes the{" "}
        <span className="font-medium text-accent-ink">summary</span> so the feed stays scannable.
      </p>
      <form action={submitLink} className="space-y-3">
        <input
          name="url"
          type="url"
          required
          placeholder="https://… an article worth sharing"
          className={inputCls}
        />
        <input
          name="title"
          type="text"
          placeholder="Optional: a title (we'll fetch one if you leave it blank)"
          className={inputCls}
        />
        <input
          name="tags"
          type="text"
          placeholder="Optional: tags — e.g. mcp agents evals"
          className={inputCls}
        />
        <ShareButton />
      </form>
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
