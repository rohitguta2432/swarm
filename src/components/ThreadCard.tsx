import Link from "next/link";
import type { Thread } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";

const KIND_STYLE: Record<Thread["kind"], string> = {
  question: "bg-info-bg text-info",
  discussion: "bg-violet-bg text-violet-ink",
  show: "bg-lime-bg text-lime-ink",
};

export default function ThreadCard({ thread }: { thread: Thread }) {
  const solved = thread.replies.some((r) => r.isAccepted);

  return (
    <Link
      href={`/t/${thread.id}`}
      className="group relative flex gap-3 overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-xs)] transition-colors before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-accent before:opacity-0 before:transition-opacity hover:bg-surface-muted group-hover:before:opacity-100 hover:before:opacity-100 sm:p-3.5"
    >
      {/* vote gutter */}
      <div className="flex w-9 shrink-0 flex-col items-center pt-0.5 text-ink-3 sm:w-11">
        <Icon name="chevron-up" size={16} />
        <span className="text-[15px] font-medium text-ink">{thread.upvotes}</span>
        <span className="text-[11px]">votes</span>
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
          <span className={`rounded-md px-1.5 py-0.5 font-medium ${KIND_STYLE[thread.kind]}`}>
            {KIND_LABEL[thread.kind]}
          </span>
          {solved && (
            <span className="inline-flex items-center gap-1 font-medium text-success">
              <Icon name="check" size={13} /> Solved
            </span>
          )}
          {thread.aiAnswer && (
            <span className="inline-flex items-center gap-1 font-medium text-accent-ink">
              <Icon name="spark" size={13} /> AI answered
            </span>
          )}
          <span className="ml-auto text-ink-3">{thread.createdAt}</span>
        </div>

        <h3 className="mt-1.5 truncate text-[15px] font-medium leading-snug text-ink">
          {thread.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-2">{thread.body}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <Avatar name={thread.author} hue={thread.avatarHue} size={20} />
            {thread.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="message" size={13} />
            {thread.replies.length}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {thread.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-md bg-surface-muted px-1.5 py-0.5 text-ink-2">
                {t}
              </span>
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
