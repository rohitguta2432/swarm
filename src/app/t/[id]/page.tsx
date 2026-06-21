import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThread } from "@/lib/data";
import { getStoredReplies } from "@/lib/replies";
import { KIND_LABEL } from "@/lib/types";
import { auth } from "@/auth";
import { signInWithGoogle } from "@/app/auth-actions";
import Avatar from "@/components/Avatar";
import AiAnswer from "@/components/AiAnswer";
import Markish from "@/components/Markish";
import Composer from "./Composer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = getThread(id);
  if (!thread) return { title: "Not found · Swarm" };
  return { title: `${thread.title} · Swarm` };
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = getThread(id);
  if (!thread) notFound();

  const [session, stored] = await Promise.all([auth(), getStoredReplies(id)]);
  const replies = [...thread.replies, ...stored];

  return (
    <article className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-amber-400">
        ← Back to the swarm
      </Link>

      {/* Question / post */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-medium text-zinc-300">
            {KIND_LABEL[thread.kind]}
          </span>
          <span className="text-zinc-500">{thread.createdAt}</span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-white">{thread.title}</h1>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">{thread.body}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Avatar name={thread.author} hue={thread.avatarHue} size={22} />
            {thread.author}
          </span>
          <span>▲ {thread.upvotes}</span>
          <span className="flex gap-1.5">
            {thread.tags.map((t) => (
              <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400">
                {t}
              </span>
            ))}
          </span>
        </div>
      </header>

      {/* AI answers first */}
      {thread.aiAnswer && <AiAnswer answer={thread.aiAnswer} />}

      {/* Replies */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-400">
          {replies.length} {replies.length === 1 ? "reply" : "replies"} from the swarm
        </h2>
        {replies.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-4 ${
              r.isAccepted ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <Avatar name={r.author} hue={r.avatarHue} size={20} image={r.image} />
              <span className="text-zinc-300">{r.author}</span>
              <span>· {r.createdAt}</span>
              {r.isAccepted && (
                <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-300">
                  ✓ Accepted
                </span>
              )}
            </div>
            <Markish text={r.body} className="text-[15px] leading-relaxed text-zinc-200" />
          </div>
        ))}
      </section>

      {/* Reply composer — auth-gated */}
      {session?.user ? (
        <Composer threadId={id} />
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="mb-3 text-sm text-zinc-400">Sign in to add your answer to the swarm.</p>
          <form action={signInWithGoogle} className="flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
            >
              <GoogleGlyph /> Continue with Google
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
