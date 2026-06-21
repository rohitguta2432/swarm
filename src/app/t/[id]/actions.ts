"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { addReply } from "@/lib/replies";

// Deterministic avatar hue from a string (so a user's chip color is stable).
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

// Auth-gated reply. Only a signed-in user can post; the body is server-validated.
export async function postReply(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized — sign in to reply.");

  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId || !body) return;

  await addReply(threadId, {
    author: session.user.name ?? session.user.email ?? "anon",
    authorImage: session.user.image ?? null,
    avatarHue: hueFrom(session.user.email ?? session.user.name ?? "swarm"),
    body: body.slice(0, 4000),
  });

  revalidatePath(`/t/${threadId}`);
}
