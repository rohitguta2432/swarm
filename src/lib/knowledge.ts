// Curated knowledge layer for Swarm — the applied how-to of building AI agents:
// what evals, guardrails, tool design, reliability, observability, and cost
// control actually require in practice. Authored as typed data (no env, no
// network, no providers) and rendered by /learn, mirroring src/lib/data.ts's
// const-array + sync-accessor shape. Section bodies use Markish formatting only
// (**bold**, `code`, "- " bullets). Topics cross-link to real seed threads.

import type { KnowledgeTopic } from "./types";

export const TOPICS: KnowledgeTopic[] = [
  {
    id: "evals",
    title: "Evals: gate on recall, not vibes",
    summary:
      "Make the metric deterministic before you trust any number. Gate releases on recall over a fixed must-handle set; keep the LLM judge off the gate.",
    icon: "check",
    tags: ["evals", "agents", "testing"],
    relatedThreadIds: ["evals-vs-vibes"],
    sections: [
      {
        heading: "Recall on a must-handle set is the only release gate",
        body: [
          "For judgment-heavy agents (e.g. *should this escalate to a human?*) overall \"quality\" is unmeasurable, but **recall on a labeled must-handle set** is not.",
          "",
          "- Hand-label ~30–50 **golden cases** you *know* the agent must catch.",
          "- Measure one number: how many did it catch? That is fully deterministic and repeatable.",
          "- Treat a missed must-handle case (false negative) as the **only** failure that blocks a release.",
          "- False positives are a tuning **dial**, not a gate — track them on a dashboard, don't fail the build on them.",
        ].join("\n"),
      },
      {
        heading: "Separate the deterministic scorer from the judgment",
        body: [
          "Most flaky eval numbers come from mixing a deterministic check with a fuzzy one.",
          "",
          "- Run the deterministic scorer first: exact match, schema-valid, contains-required-field. Pin it; it should never move between runs.",
          "- Only after that, score the subjective part separately so a tone regression can't masquerade as a correctness regression.",
        ].join("\n"),
      },
      {
        heading: "Pin the LLM judge at temperature 0 — and keep it off the gate",
        body: [
          "An LLM judge is useful for **tone and phrasing**, never for the release decision.",
          "",
          "- Set `temperature: 0` (and a fixed seed where the provider supports it) so the judge is reproducible.",
          "- Use it for soft signals only; the recall gate above is what blocks deploy.",
          "- If the judge's score and your recall metric disagree, trust recall.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "guardrails",
    title: "Guardrails: hard gates vs soft dials",
    summary:
      "Validate what comes in, validate what goes out, and give the agent an explicit escalation path. Decide up front which checks block and which only nudge.",
    icon: "shield",
    tags: ["agents", "reliability", "testing"],
    relatedThreadIds: ["evals-vs-vibes"],
    sections: [
      {
        heading: "Hard gates vs soft dials",
        body: [
          "Every guardrail is one of two things — be explicit about which.",
          "",
          "- **Hard gate:** a violation stops the action. Schema mismatch, missing auth, a tool returning an error — the run halts or escalates.",
          "- **Soft dial:** a signal that tunes behavior but never blocks. Confidence scores, style preferences, length nudges.",
          "- Failure mode to avoid: a soft dial silently behaving like a gate (or worse, a gate quietly downgraded to a dial).",
        ].join("\n"),
      },
      {
        heading: "Validate the input before the model sees it",
        body: [
          "Cheap deterministic checks at the boundary catch the majority of bad runs.",
          "",
          "- Reject or normalize malformed input *before* spending a model call on it.",
          "- Strip or clearly delimit untrusted text so it can't override instructions (prompt-injection surface).",
          "- Cap sizes — an oversized payload is a cost and reliability hazard, not just a correctness one.",
        ].join("\n"),
      },
      {
        heading: "Validate the output and schema-check it",
        body: [
          "Never trust raw model output as structured data.",
          "",
          "- Parse tool args and final outputs against a strict schema; on failure, **retry once with the error fed back**, then escalate.",
          "- Validate the *meaning* too: a well-formed JSON object can still be a wrong decision.",
        ].join("\n"),
      },
      {
        heading: "Always have an escalation-to-human path",
        body: [
          "An agent that can't say \"I'm not sure\" will confidently do the wrong thing.",
          "",
          "- Define explicit conditions that route to a human: low confidence, repeated tool failures, a hard-gate trip.",
          "- Make escalation a first-class outcome, not an exception you forgot to handle.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "tool-design",
    title: "Tool design: narrow, described, idempotent",
    summary:
      "Tool selection is driven by descriptions, not names. Make tools single-purpose, describe them for the model, take structured args, and make writes safe to retry.",
    icon: "wrench",
    tags: ["mcp", "claude-code", "agents"],
    relatedThreadIds: ["subagent-not-triggering", "mcp-tool-not-showing"],
    sections: [
      {
        heading: "Narrow, single-purpose tools",
        body: [
          "A tool that does one thing is easier for the model to select correctly and easier for you to test.",
          "",
          "- Prefer `create_invoice` and `send_invoice` over one `manage_invoice` that branches on a mode arg.",
          "- Narrow tools shrink the decision space, which raises selection accuracy.",
        ].join("\n"),
      },
      {
        heading: "Descriptions drive selection",
        body: [
          "Selection is driven almost entirely by the tool/agent **description**, not its name.",
          "",
          "- Lead the description with concrete trigger phrases: *\"Use when running database migrations, altering schemas…\"*.",
          "- Add 2–3 example scenarios — they measurably improve routing.",
          "- If the model does the work inline instead of calling your tool, that's a description miss, not a logic bug. See [[subagent-not-triggering]].",
        ].join("\n"),
      },
      {
        heading: "Structured args and idempotency",
        body: [
          "Tools are an API the model calls — design them like one.",
          "",
          "- Take typed, structured arguments with a strict schema rather than a free-text blob.",
          "- Make writes **idempotent** (accept a client-supplied key) so a retry after a timeout can't double-charge or double-send.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "reliability",
    title: "Reliability: centralize backoff, don't retry per call",
    summary:
      "Naive per-call retry makes 429s worse. Put one concurrency limiter in front of the pool, back the whole pool off on a retry-after, and add jitter.",
    icon: "refresh",
    tags: ["agents", "rate-limits", "reliability"],
    relatedThreadIds: ["rate-limit-backoff"],
    sections: [
      {
        heading: "Why naive per-call retry worsens 429s",
        body: [
          "When you fan out N agents and each retries its own failed call, every retry fires at once — a thundering herd that keeps you rate-limited. See [[rate-limit-backoff]].",
        ].join("\n"),
      },
      {
        heading: "One concurrency limiter in front of the pool",
        body: [
          "Centralize the throttle instead of scattering retries.",
          "",
          "- Put a single **concurrency limiter** (cap at `min(cores, 8)` or a token bucket) in front of *all* agents so excess calls queue instead of firing.",
          "- Excess work waits in line — it never becomes a burst.",
        ].join("\n"),
      },
      {
        heading: "Retry-after-aware pool backoff with jitter",
        body: [
          "React to the provider's own signal, and react as a pool.",
          "",
          "- On a `429`, read the `retry-after` header and back off the **whole pool**, not just the failed call.",
          "- Add **jitter** to the backoff so retries don't resync into a new herd.",
          "- A token bucket in front of the pool is the pattern that consistently fixes this.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "observability",
    title: "Observability: log selection vs logic",
    summary:
      "You can't fix what you can't see. Log every tool-call block, separate selection failures from logic failures, and keep structured per-run logs.",
    icon: "search",
    tags: ["agents", "claude-code", "testing"],
    relatedThreadIds: ["subagent-not-triggering"],
    sections: [
      {
        heading: "Log every tool-call block",
        body: [
          "The tool-call is the agent's reasoning made observable.",
          "",
          "- Record each tool/agent invocation: which tool, the args, the result, the latency.",
          "- If you never see a Task/tool-use block where you expected one, the model never selected it.",
        ].join("\n"),
      },
      {
        heading: "Trace selection failures vs logic failures",
        body: [
          "These two failure classes need opposite fixes — don't confuse them.",
          "",
          "- **Selection miss:** the right tool was never called → fix the **description** (see [[tool-design]]).",
          "- **Logic failure:** the right tool was called but did the wrong thing → fix the tool or the prompt.",
          "- A missing tool-use block is the tell that distinguishes them.",
        ].join("\n"),
      },
      {
        heading: "Structured run logs",
        body: [
          "Make runs queryable, not just printable.",
          "",
          "- Emit one structured record per run: inputs, the tool-call trace, the final output, the eval result.",
          "- Structured logs are what let you build the recall dashboard from [[evals]] instead of eyeballing transcripts.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "cost-control",
    title: "Cost control: tier, cache, and cap fan-out",
    summary:
      "Most agent spend is avoidable. Route easy work to cheap models, cache repeated calls, set token budgets, and cap fan-out concurrency.",
    icon: "spark",
    tags: ["agents", "local-llm", "ollama"],
    relatedThreadIds: ["show-local-agent-stack", "rate-limit-backoff"],
    sections: [
      {
        heading: "Model tiering",
        body: [
          "Not every step needs your most expensive model.",
          "",
          "- Route classification, routing, and extraction to a small/cheap (or **local**) model; reserve the frontier model for hard reasoning. See [[show-local-agent-stack]].",
          "- A tiered fallback (local → cheap API → frontier) keeps both cost and the zero-key floor in check.",
        ].join("\n"),
      },
      {
        heading: "Caching and token budgets",
        body: [
          "Stop paying twice for the same answer.",
          "",
          "- Cache deterministic or repeated calls (identical prompt → cached result).",
          "- Set a **token budget** per run and truncate or summarize context that exceeds it — runaway context is the silent cost driver.",
        ].join("\n"),
      },
      {
        heading: "Cap fan-out concurrency",
        body: [
          "Unbounded fan-out spends money *and* triggers rate limits.",
          "",
          "- The same concurrency limiter that fixes reliability ([[reliability]]) is also a cost cap — bounded parallelism bounds spend.",
        ].join("\n"),
      },
    ],
  },
];

export function getKnowledge(): KnowledgeTopic[] {
  return TOPICS;
}

export function getTopic(id: string): KnowledgeTopic | undefined {
  return TOPICS.find((t) => t.id === id);
}
