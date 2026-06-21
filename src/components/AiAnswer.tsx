import type { AiAnswer as AiAnswerType } from "@/lib/types";
import Markish from "./Markish";

// The "AI answers first" block — visually distinct so it reads as the room's
// instant first responder, not a human reply.
export default function AiAnswer({ answer }: { answer: AiAnswerType }) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
          </span>
          Swarm AI · answered first
        </span>
        <span className="text-zinc-500">
          {answer.model} · {(answer.tookMs / 1000).toFixed(1)}s
        </span>
      </div>
      <Markish text={answer.text} className="text-[15px] leading-relaxed text-zinc-200" />
    </div>
  );
}
