import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";

// POST /api/ai-answer  { title, body } -> { text, model, tookMs }
// The "AI answers first" endpoint. Runs server-side so provider keys never reach
// the browser. Falls back to the offline triage scaffold when no provider is set.
export async function POST(req: Request) {
  let payload: { title?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const body = (payload.body ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const answer = await generateAnswer(title, body);
  return NextResponse.json(answer);
}
