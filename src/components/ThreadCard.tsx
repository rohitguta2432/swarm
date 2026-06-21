import Link from "next/link";
import type { Thread } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import Avatar from "./Avatar";

const KIND_STYLE: Record<Thread["kind"], string> = {
  question: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  discussion: "text-violet-300 bg-violet-500/10 border-violet-500/20",
  show: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
};

export default function ThreadCard({ thread }: { thread: Thread }) {
  const answered = thread.replies.some((r) => r.isAccepted);
  return (
    <Link
      href={`/t/${thread.id}`}
      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-amber-500/30 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className={`rounded-full border px-2 py-0.5 font-medium ${KIND_STYLE[thread.kind]}`}>
          {KIND_LABEL[thread.kind]}
        </span>
        {answered && (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
            ✓ Solved
          </span>
        )}
        {thread.aiAnswer && (
          <span className="text-amber-400/80">⚡ AI answered</span>
        )}
        <span className="ml-auto text-zinc-500">{thread.createdAt}</span>
      </div>

      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-zinc-100">{thread.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{thread.body}</p>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Avatar name={thread.author} hue={thread.avatarHue} size={20} />
          {thread.author}
        </span>
        <span>▲ {thread.upvotes}</span>
        <span>{thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}</span>
        <span className="ml-auto flex gap-1.5">
          {thread.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400">
              {t}
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
