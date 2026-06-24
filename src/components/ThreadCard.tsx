import Link from "next/link";
import type { Thread } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import TagLink from "./TagLink";

// Soft-green kind pills — tinted fill + matching ink, never color alone (the
// uppercase label carries the meaning for non-color users).
const KIND_STYLE: Record<Thread["kind"], string> = {
  question: "bg-info-bg text-info",
  discussion: "bg-violet-bg text-violet-ink",
  show: "bg-lime-bg text-lime-ink",
};

export default function ThreadCard({ thread }: { thread: Thread }) {
  const solved = thread.replies.some((r) => r.isAccepted);

  return (
    <article className="group relative flex gap-4 rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-xs)] transition-colors hover:border-accent/40 hover:shadow-[var(--shadow-glow)] sm:gap-[18px] sm:p-[22px]">
      {/* Whole-card link as a stretched overlay so the tag links below can be real
          siblings (nested <a> is invalid HTML). Tag links sit above it via z-10. */}
      <Link href={`/t/${thread.id}`} className="absolute inset-0 z-0" aria-label={thread.title} />

      {/* vote gutter */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-0.5 pt-0.5 sm:w-11">
        <Icon name="chevron-up" size={18} className="text-ink-3 transition-colors group-hover:text-accent" />
        <span className="text-[20px] font-extrabold leading-none tracking-[-0.02em] text-ink">{thread.upvotes}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">votes</span>
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${KIND_STYLE[thread.kind]}`}>
            {KIND_LABEL[thread.kind]}
          </span>
          {solved && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-success">
              <Icon name="check" size={13} /> Solved
            </span>
          )}
          {thread.aiAnswer && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-3">
              <Icon name="spark" size={13} /> AI answered
            </span>
          )}
          <span className="ml-auto text-[13px] text-ink-3">{thread.createdAt}</span>
        </div>

        <h3 className="mt-2.5 text-[18px] font-bold leading-snug tracking-[-0.015em] text-ink sm:text-[20px]">
          {thread.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-2">{thread.body}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]">
          <span className="flex items-center gap-2 font-medium text-ink-2">
            <Avatar name={thread.author} hue={thread.avatarHue} size={24} />
            {thread.author}
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-3">
            <Icon name="message" size={14} />
            {thread.replies.length}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {thread.tags.slice(0, 3).map((t) => (
              <TagLink key={t} tag={t} />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}
