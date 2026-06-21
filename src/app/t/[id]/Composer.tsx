"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { postReply } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-40"
    >
      {pending ? "Posting…" : "Reply"}
    </button>
  );
}

// Authed reply composer. Posts via the server action (which re-checks auth and
// persists), then revalidatePath re-renders the thread with the new reply.
export default function Composer({ threadId }: { threadId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await postReply(fd);
        formRef.current?.reset();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="threadId" value={threadId} />
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Add to the answer, share a fix, or ask a follow-up…"
        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
