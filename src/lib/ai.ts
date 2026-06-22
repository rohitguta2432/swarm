// Swarm's "AI answers first" engine.
//
// This is the platform's wedge: the moment a developer posts a problem, an AI
// agent replies instantly — so the room has value even when no human is online.
// Tiered backend (mirrors Loopr): local Ollama → OpenAI → Anthropic, and a
// deterministic offline fallback so the app ALWAYS returns an answer with zero
// secrets configured (and therefore builds + deploys clean on Vercel).
//
// Wire a real provider by setting one of:
//   OLLAMA_URL   (default http://127.0.0.1:11434)  + OLLAMA_MODEL
//   OPENAI_API_KEY                                   + OPENAI_MODEL
//   ANTHROPIC_API_KEY                                + ANTHROPIC_MODEL

import type { AiAnswer } from "./types";

const SYSTEM = `You are Swarm's triage agent for developers building AI agents
(Claude Code, MCP servers, multi-agent systems, local LLMs, eval harnesses).
Answer the posted problem directly and practically. Be concise: a short diagnosis,
then concrete next steps or a code sketch. If the question is ambiguous, state the
single most likely cause and how to confirm it. Never invent APIs you are unsure of.`;

function buildPrompt(title: string, body: string): string {
  return `${SYSTEM}\n\n---\nTITLE: ${title}\n\nDETAILS:\n${body || "(no extra detail provided)"}\n---\n\nYour answer:`;
}

// Local-Ollama probe gets a short, env-overridable timeout so the deterministic
// fallback fires fast when Ollama is absent or flaky (keeps "answers in seconds").
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? 8000);

async function tryOllama(prompt: string): Promise<string | null> {
  const base = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen3:14b";
  try {
    const res = await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: string };
    return data.response?.trim() || null;
  } catch {
    return null;
  }
}

async function tryOpenAI(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

async function tryAnthropic(prompt: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// Deterministic, key-less fallback. Not a real LLM — a structured triage scaffold
// so the room is never empty. Good enough to ship; replace by setting a provider.
function offlineAnswer(title: string, body: string): string {
  const text = `${title} ${body}`.toLowerCase();
  const hints: string[] = [];
  if (/mcp|tool|stdio|transport/.test(text))
    hints.push("If this is an MCP server, confirm the transport: stdio servers must write logs to **stderr** — anything on stdout corrupts the JSON-RPC stream and the client silently drops the tool.");
  if (/claude code|subagent|skill|hook/.test(text))
    hints.push("For Claude Code, check that the skill/subagent is actually being *selected* — log the tool-use blocks; a missing match usually means the description didn't trigger, not that the logic is wrong.");
  if (/ollama|local|llama|gguf|vram|mlx/.test(text))
    hints.push("For local models, rule out an OOM/quantization issue first: drop to a smaller quant or model and see if the failure disappears before debugging your prompt.");
  if (/eval|score|judge|flaky|nondetermin/.test(text))
    hints.push("Make the scorer deterministic before trusting any eval number — pin temperature to 0 for graders and separate the deterministic check from the LLM judge.");
  if (hints.length === 0)
    hints.push("State the smallest reproducible case: exact input, expected vs actual output, and the one log line where they diverge. That alone resolves most agent bugs.");

  return [
    `**Quick triage** — here's a first pass while the humans weigh in.`,
    ``,
    ...hints.map((h) => `- ${h}`),
    ``,
    `**Next step:** paste the failing log line (or the tool-call JSON) into a reply and the room can pinpoint it. Did this narrow it down?`,
  ].join("\n");
}

// ── Article summaries for /news ────────────────────────────────────────────
// Reuses the SAME tiered backend (tryOllama → tryOpenAI → tryAnthropic) as
// generateAnswer, with a deterministic offline fallback so a submitted link
// always gets a non-empty summary even with zero secrets configured.

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the web";
  }
}

function buildSummaryPrompt(title: string, url: string, excerpt?: string): string {
  return `You are Swarm's news summarizer for developers building AI agents.
Write a concise, neutral 2–3 sentence summary of the linked article for an
agent-builder audience. Plain text only — no preamble, no markdown headers, no
"this article" filler. Just the summary.

---
TITLE: ${title}
URL: ${url}
SOURCE: ${domainOf(url)}
${excerpt ? `EXCERPT:\n${excerpt}` : "(no excerpt available)"}
---

Summary:`;
}

// Deterministic, key-less fallback: a short blurb from title + domain (+ excerpt
// if one was fetched). Keeps summaries non-empty with zero providers/network.
function offlineSummary(title: string, url: string, excerpt?: string): string {
  const domain = domainOf(url);
  const trimmed = excerpt?.replace(/\s+/g, " ").trim().slice(0, 240);
  const base = `Shared from ${domain}. ${title.trim()}.`;
  return trimmed ? `${base} ${trimmed}${trimmed.length >= 240 ? "…" : ""}` : base;
}

export async function summarizeArticle(
  title: string,
  url: string,
  excerpt?: string,
): Promise<AiAnswer> {
  const start = Date.now();
  const prompt = buildSummaryPrompt(title, url, excerpt);

  const ollama = await tryOllama(prompt);
  if (ollama) return { text: ollama, model: process.env.OLLAMA_MODEL ?? "ollama", tookMs: Date.now() - start };

  const openai = await tryOpenAI(prompt);
  if (openai) return { text: openai, model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", tookMs: Date.now() - start };

  const anthropic = await tryAnthropic(prompt);
  if (anthropic) return { text: anthropic, model: process.env.ANTHROPIC_MODEL ?? "claude", tookMs: Date.now() - start };

  return { text: offlineSummary(title, url, excerpt), model: "swarm-summary (offline)", tookMs: Date.now() - start };
}

export async function generateAnswer(title: string, body: string): Promise<AiAnswer> {
  const start = Date.now();
  const prompt = buildPrompt(title, body);

  const ollama = await tryOllama(prompt);
  if (ollama) return { text: ollama, model: process.env.OLLAMA_MODEL ?? "ollama", tookMs: Date.now() - start };

  const openai = await tryOpenAI(prompt);
  if (openai) return { text: openai, model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", tookMs: Date.now() - start };

  const anthropic = await tryAnthropic(prompt);
  if (anthropic) return { text: anthropic, model: process.env.ANTHROPIC_MODEL ?? "claude", tookMs: Date.now() - start };

  return { text: offlineAnswer(title, body), model: "swarm-triage (offline)", tookMs: Date.now() - start };
}
