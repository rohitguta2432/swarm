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
      className="h-11 border-2 border-ink bg-accent px-4 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)] disabled:opacity-40 disabled:shadow-none"
    >
      {pending ? "Posting…" : "Post answer"}
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
        className="w-full resize-y border-2 border-ink bg-surface p-3 text-[16px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[var(--shadow-hard-sm)]"
      />
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-3">Markdown supported</span>
        <SubmitButton />
      </div>
    </form>
  );
}
