import type { AiAnswer as AiAnswerType } from "@/lib/types";
import Markish from "./Markish";
import Icon from "./Icon";

// The product wedge — a distinct SYSTEM actor (green tint + accent rail + brand
// mark), never a human reply. accent-subtle fill with a solid-accent spark chip
// keeps it separate from live (amber) and danger (red).
export default function AiAnswer({ answer }: { answer: AiAnswerType }) {
  return (
    <div className="rounded-[16px] border border-border border-l-[5px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-xs)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
          <Icon name="spark" size={14} />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-0.5 font-bold uppercase tracking-wide text-accent-ink">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Swarm AI · answered first
        </span>
        <span className="text-ink-3">
          {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
        </span>
      </div>
      <Markish text={answer.text} className="text-[15px] leading-relaxed text-ink-2" />
    </div>
  );
}
