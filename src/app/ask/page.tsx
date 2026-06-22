import type { Metadata } from "next";
import { auth } from "@/auth";
import AskClient from "./AskClient";

export const metadata: Metadata = {
  title: "Ask the swarm",
  description:
    "Post your agent-building problem and get an AI answer in seconds — then let the swarm of builders refine it. MCP, evals, tool design, reliability, and more.",
  alternates: { canonical: "/ask" },
};

// Server wrapper: resolves the session so the client UI can gate the "Post to the
// feed" action behind sign-in. Posting is also auth-checked server-side in
// createThread (server actions are reachable by direct POST), so this is UX, not the
// security boundary.
export default async function AskPage() {
  const session = await auth();
  return <AskClient signedIn={!!session?.user} />;
}
