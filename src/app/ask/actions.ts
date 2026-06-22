"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { generateAnswer } from "@/lib/ai";
import { addThread } from "@/lib/threads";
import type { ThreadKind } from "@/lib/types";

// Deterministic avatar hue from a string (so a user's chip color is stable).
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

const KINDS: ThreadKind[] = ["question", "discussion", "show"];

// Extract #tags from a tags field and/or the body. Deduped, lowercased, capped.
function parseTags(tagsField: string, body: string): string[] {
  const fromField = tagsField
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
  const fromBody = [...body.matchAll(/#([a-z0-9][a-z0-9-]*)/gi)].map((m) => m[1].toLowerCase());
  return [...new Set([...fromField, ...fromBody])].slice(0, 6);
}

// Auth-gated thread creation. Only a signed-in user can post. Generates an AI-first
// answer, persists a durable thread, then redirects to it. Server Functions are
// reachable by direct POST, so auth is re-verified here regardless of any UI gating.
export async function createThread(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized — sign in to post.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const body = String(formData.get("body") ?? "").trim().slice(0, 8000);
  if (!title) return;

  const kindRaw = String(formData.get("kind") ?? "question");
  const kind: ThreadKind = KINDS.includes(kindRaw as ThreadKind) ? (kindRaw as ThreadKind) : "question";
  const tags = parseTags(String(formData.get("tags") ?? ""), body);

  const ai = await generateAnswer(title, body);

  const id = await addThread({
    kind,
    title,
    body,
    author: session.user.name ?? session.user.email ?? "anon",
    authorImage: session.user.image ?? null,
    avatarHue: hueFrom(session.user.email ?? session.user.name ?? "swarm"),
    tags,
    aiAnswer: ai,
  });

  revalidatePath("/");

  // redirect() throws a control-flow exception — must be the LAST statement,
  // outside any try/catch, and never `return redirect()`.
  redirect(`/t/${id}`);
}
