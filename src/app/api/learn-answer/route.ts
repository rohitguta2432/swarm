import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";

// POST /api/learn-answer  { title, body } -> { text, model, tookMs }
// The "Ask the knowledge base" endpoint for /learn. A thin variant of
// /api/ai-answer: it prefixes a knowledge-base framing onto the title and then
// reuses generateAnswer, so the entire tiered Ollama→OpenAI→Anthropic→offline
// fallback is inherited unchanged. Runs server-side so provider keys never reach
// the browser; with zero secrets set the offline triage scaffold still answers.
// Not cached by default (correct for an AI/mutation call) — do NOT force-static.
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

  const answer = await generateAnswer(`Agent-building knowledge base question: ${title}`, body);
  return NextResponse.json(answer);
}
