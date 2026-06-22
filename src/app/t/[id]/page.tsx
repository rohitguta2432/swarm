import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThreadById } from "@/lib/threads";
import { getStoredReplies } from "@/lib/replies";
import { KIND_LABEL } from "@/lib/types";
import { auth } from "@/auth";
import { signInWithGoogle } from "@/app/auth-actions";
import Avatar from "@/components/Avatar";
import AiAnswer from "@/components/AiAnswer";
import Markish from "@/components/Markish";
import Icon from "@/components/Icon";
import Composer from "./Composer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = await getThreadById(id);
  if (!thread) return { title: "Not found · Swarm" };
  return { title: `${thread.title} · Swarm` };
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getThreadById(id);
  if (!thread) notFound();

  const [session, stored] = await Promise.all([auth(), getStoredReplies(id)]);
  const replies = [...thread.replies, ...stored].sort(
    (a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0),
  );

  return (
    <article>
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      {/* Question */}
      <header className="mt-4 flex gap-3 border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] sm:p-5">
        <div className="hidden w-11 shrink-0 flex-col items-center pt-0.5 text-ink-3 sm:flex">
          <Icon name="chevron-up" size={16} />
          <span className="text-[16px] font-extrabold text-ink">{thread.upvotes}</span>
          <span className="text-[10px] uppercase tracking-wide">votes</span>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="border-[1.5px] border-ink bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
              {KIND_LABEL[thread.kind]}
            </span>
            <span className="text-ink-3">asked {thread.createdAt} by {thread.author}</span>
          </div>
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {thread.title}
          </h1>
          <p className="whitespace-pre-wrap text-[16px] leading-relaxed text-ink-2">{thread.body}</p>
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {thread.tags.map((t) => (
              <span key={t} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* AI answers first — TIGHT 12px gap, reads as an immediate response */}
      {thread.aiAnswer && (
        <div className="mt-3">
          <AiAnswer answer={thread.aiAnswer} />
        </div>
      )}

      {/* LARGE gap + labeled divider — humans refine */}
      <div className="mt-9 mb-4 flex items-center gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          {replies.length} {replies.length === 1 ? "reply" : "replies"} from the swarm
        </h2>
        <span className="h-0.5 flex-1 bg-ink" />
      </div>

      <section className="space-y-3">
        {replies.map((r) =>
          r.isAccepted ? (
            <div
              key={r.id}
              className="border-2 border-ink border-l-[6px] border-l-success bg-success-bg p-4 shadow-[var(--shadow-hard)]"
            >
              <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-3">
                <Avatar name={r.author} hue={r.avatarHue} size={20} image={r.image} />
                <span className="font-medium text-ink">{r.author}</span>
                <span>· {r.createdAt}</span>
                <span className="ml-auto inline-flex items-center gap-1 border-[1.5px] border-ink bg-[#d6f0df] px-2 py-0.5 font-bold uppercase tracking-wide text-success">
                  <Icon name="check" size={13} /> Accepted answer
                </span>
              </div>
              <Markish text={r.body} className="text-[15px] leading-relaxed text-[#0b3d2e]" />
            </div>
          ) : (
            <div key={r.id} className="border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)]">
              <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-3">
                <Avatar name={r.author} hue={r.avatarHue} size={20} image={r.image} />
                <span className="font-medium text-ink">{r.author}</span>
                <span>· {r.createdAt}</span>
              </div>
              <Markish text={r.body} className="text-[15px] leading-relaxed text-ink-2" />
            </div>
          ),
        )}
      </section>

      {/* Reply composer — auth-gated */}
      <div className="mt-6">
        {session?.user ? (
          <Composer threadId={id} />
        ) : (
          <div className="border-2 border-ink bg-surface p-5 text-center shadow-[var(--shadow-hard)]">
            <p className="mb-3 text-sm text-ink-2">Sign in to add your answer to the swarm.</p>
            <form action={signInWithGoogle} className="flex justify-center">
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center gap-2 border-2 border-ink bg-surface px-4 text-sm font-bold text-ink transition-colors hover:bg-surface-muted"
              >
                <GoogleGlyph /> Continue with Google
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
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
