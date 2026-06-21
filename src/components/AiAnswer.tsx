import type { AiAnswer as AiAnswerType } from "@/lib/types";
import Markish from "./Markish";
import Icon from "./Icon";

// The product wedge — a distinct SYSTEM actor (amber tint + 3px rail + brand
// mark), never a human reply. Body text is near-black for AA on the tint.
export default function AiAnswer({ answer }: { answer: AiAnswerType }) {
  return (
    <div className="border-2 border-ink border-l-[6px] border-l-accent bg-accent-subtle p-4 shadow-[var(--shadow-hard)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fef3c7] text-accent-ink">
          <Icon name="spark" size={14} />
        </span>
        <span className="inline-flex items-center gap-1.5 border-[1.5px] border-ink bg-[#fef3c7] px-2 py-0.5 font-bold uppercase tracking-wide text-[#78350f]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Swarm AI · answered first
        </span>
        <span className="text-ink-3">
          {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
        </span>
      </div>
      <Markish text={answer.text} className="text-[15px] leading-relaxed text-[#27272a]" />
    </div>
  );
}
