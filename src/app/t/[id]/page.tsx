import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThread, getThreads } from "@/lib/data";
import { KIND_LABEL } from "@/lib/types";
import Avatar from "@/components/Avatar";
import AiAnswer from "@/components/AiAnswer";
import Markish from "@/components/Markish";
import ReplyBox from "./ReplyBox";

export function generateStaticParams() {
  return getThreads().map((t) => ({ id: t.id }));
}

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

      {/* Human replies */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-400">
          {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"} from the swarm
        </h2>
        {thread.replies.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-4 ${
              r.isAccepted ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <Avatar name={r.author} hue={r.avatarHue} size={20} />
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

      <ReplyBox />
    </article>
  );
}
