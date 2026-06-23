// Curated knowledge layer for Swarm — the applied how-to of building AI agents:
// what evals, guardrails, tool design, reliability, observability, and cost
// control actually require in practice. Authored as typed data (no env, no
// network, no providers) and rendered by /learn, mirroring src/lib/data.ts's
// const-array + sync-accessor shape. Section bodies use Markish formatting only
// (**bold**, `code`, "- " bullets). Topics cross-link to real seed threads.

import type { KnowledgeTopic } from "./types";

export const TOPICS: KnowledgeTopic[] = [
  // ── Design patterns track — how to build an agent. Adapted from Antonio Gullí's
  // "Agentic Design Patterns", drafted to the book's 4-beat chapter shape
  // (what it is / when to use it / how it works / watch out for).
  {
    id: "prompt-chaining",
    title: "Prompt chaining: decompose, verify each step",
    summary:
      "Prompt chaining splits a complex task into a fixed sequence of focused LLM steps, each feeding the next, with a deterministic check between them so one bad step can't poison the rest.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "prompt", "reliability"],
    relatedThreadIds: [],
    relatedTopicIds: ["routing", "reflection", "planning"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Prompt chaining breaks one complex task into a fixed sequence of small LLM steps, where each step's output becomes the next step's input. Instead of one giant prompt that does everything at once, you run several focused prompts in order.",
          "",
          "- Each step has one job and one clear output.",
          "- A deterministic check sits between steps to catch garbage before it propagates.",
          "- The chain is fixed: same steps, same order, every run.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for it when a task naturally splits into stages that depend on each other.",
          "",
          "- **Multi-stage transforms:** extract data, then validate it, then format it.",
          "- **Generate-then-refine:** draft an answer, then rewrite it against a rubric.",
          "- **Anything you can't reliably get from one prompt** because the model drops requirements or hallucinates structure.",
          "",
          "Skip it when the task is genuinely one step, or when the path branches on the input — that's [[routing]], not a fixed chain. Don't chain just to look sophisticated; each hop adds latency and [[cost-control|cost]].",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "You wire steps so each consumes the prior output, with a hard check between them.",
          "",
          "- **Step 1** extracts raw fields from a document, returning JSON.",
          "- A check runs `JSON.parse(output)` against a schema — if it fails, you retry or stop, you do not pass bad data forward.",
          "- **Step 2** takes the validated fields and writes a summary.",
          "- A check confirms the summary mentions every required field before it ships.",
          "",
          "The checks are plain code, not more LLM calls. They are your [[guardrails]] between hops — deterministic, cheap, and they keep one bad step from poisoning the rest of the chain.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Errors compound.** A small mistake in step 1 becomes a confident wrong answer by step 4. The between-step checks exist precisely to stop this — don't skip them.",
          "- **Context drift.** Each step only sees what you pass it; forget to forward a field and a later step invents one. Be explicit about what flows forward.",
          "- **Latency and cost stack.** Four sequential calls means four round-trips. If steps are independent, you want [[parallelization]] instead.",
          "- **Over-decomposition.** Splitting a trivial task into six prompts is slower and more fragile, not smarter. Chain only where a real dependency exists.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "routing",
    title: "Routing: send each input to the right handler",
    summary:
      "Routing puts a thin classifier in front of your specialists — it inspects each input, picks the handler best suited to it, and dispatches without doing the work itself.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "routing", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["prompt-chaining", "parallelization", "multi-agent"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Routing puts a thin classifier in front of your specialists. It reads each input, decides which handler fits, and hands off — nothing more.",
          "",
          "- The **router** classifies and dispatches; it does no real work itself.",
          "- The **handlers** are specialized prompts, tools, or sub-agents, each good at one kind of input.",
          "- The classifier can be an LLM call, a cheap embedding match, or plain rules — whatever reliably picks the right lane.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for routing when one entrypoint has to serve genuinely different kinds of work.",
          "",
          "- A support agent where *refund*, *bug report*, and *sales* each need a different prompt and toolset.",
          "- Mixed difficulty: send easy classification to a small/cheap model, hard reasoning to the frontier one — a cost lever, see [[cost-control]].",
          "- Anywhere a single mega-prompt is sprawling because it tries to handle every case at once.",
          "",
          "Skip it when inputs are uniform, or when steps always run in a fixed order — that's [[prompt-chaining]], not routing.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "The router classifies into one of a fixed, known set of routes, then dispatches. Keep the route set small and the classifier's only job classification.",
          "",
          "- Define routes up front, e.g. `\"refund\" | \"bug\" | \"sales\" | \"other\"`.",
          "- The classifier returns one route label — constrain it to that enum, don't let it free-text.",
          "- Dispatch the original input to the matching handler; the router does not answer.",
          "- Always include a fallback route (`\"other\"`) for inputs that match nothing.",
          "",
          "The handler downstream may itself chain, call tools, or be a full sub-agent — see [[multi-agent]].",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Misroutes are silent.** A wrong label sends good input to the wrong specialist and you get a confident wrong answer. Log the chosen route and treat misroutes as a measurable failure — see [[evals]].",
          "- **No fallback.** Without an explicit `\"other\"` lane, novel inputs get force-fit into the nearest route. Make the catch-all a real, handled outcome.",
          "- **The router creeping into doing work.** The moment it starts answering instead of dispatching, you've lost the separation that made routing testable. Keep it thin.",
          "- **Too many routes.** A bloated enum tanks classification accuracy; merge rarely-used lanes.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "parallelization",
    title: "Parallelization: fan out independent work",
    summary:
      "Parallelization runs independent sub-tasks concurrently — split-and-merge for speed, or same-task-N-ways for accuracy — but only when no step depends on another's output.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "orchestration", "reliability"],
    relatedThreadIds: [],
    relatedTopicIds: ["routing", "multi-agent", "cost-control"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Parallelization runs work that has no data dependency at the same time instead of one step after another. Two shapes:",
          "",
          "- **Sectioning:** split one job into independent sub-tasks, run them concurrently, merge the results.",
          "- **Voting:** run the *same* task several ways (or several times) in parallel, then aggregate — majority vote, best-of-N, or a judge.",
          "",
          "If step B needs step A's output, that's [[prompt-chaining]], not this.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for it when latency or coverage matters and the pieces don't depend on each other:",
          "",
          "- **Sectioning:** summarize 10 documents, call 3 unrelated APIs, score one input on safety + tone + relevance at once.",
          "- **Voting:** generate 5 answers and take the majority for a flaky reasoning task; or run strict + lenient graders and combine.",
          "- Pair it with [[routing]] to dispatch each branch to the right model.",
          "",
          "Don't use it when one step feeds the next, or when fan-out cost outweighs the time saved.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "You launch N calls together, wait for all to finish, then combine. Sketch with `Promise.all`:",
          "",
          "- Build independent prompts: `tasks = [summarize(doc1), summarize(doc2), summarize(doc3)]`.",
          "- Fire them concurrently: `results = await Promise.all(tasks)` — wall-clock time is the slowest branch, not the sum.",
          "- **Aggregate** explicitly: concatenate sections, take a `majority(results)`, or pass all outputs to a synthesizer step.",
          "- Decide failure policy per branch: one rejected branch shouldn't sink the batch unless it must (`Promise.allSettled` keeps partial results).",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Fake independence:** if branches secretly share state or order matters, parallel runs produce subtly wrong merges. Confirm zero data dependency first.",
          "- **Cost multiplies:** voting N-ways is N times the tokens for one answer. Worth it for accuracy, brutal on your bill — see [[cost-control]].",
          "- **The merge is the hard part:** aggregation logic (dedupe, conflict resolution, tie-breaking) is where bugs hide, not the fan-out.",
          "- **Partial failure:** one branch timing out shouldn't silently drop from the result — handle it, log it (see [[observability]]).",
        ].join("\n"),
      },
    ],
  },
  {
    id: "reflection",
    title: "Reflection: let the agent critique its own output",
    summary:
      "Reflection runs your agent twice — generate, then critique against explicit criteria and feed the fixes back — so a weak first draft becomes a stronger final answer.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "reasoning", "reliability"],
    relatedThreadIds: [],
    relatedTopicIds: ["evals", "planning", "learning-adaptation"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Reflection is when the agent grades its own work before you ship it. You run two passes instead of one:",
          "",
          "- **Generate:** the agent produces a draft answer, plan, or code.",
          "- **Critique:** a second step reviews that draft against explicit criteria and writes concrete fixes.",
          "- **Revise:** the generator takes the critique and tries again.",
          "",
          "It is often the same model in both roles, just with a fresh prompt. People also call it self-correction or an evaluator-optimizer loop.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for reflection when a first draft is rarely good enough and quality matters more than latency:",
          "",
          "- Code that must compile, pass tests, or match a spec.",
          "- Long writing where structure and accuracy drift.",
          "- Multi-step plans worth sanity-checking before execution (pairs well with [[planning]]).",
          "- Anything you can score against clear criteria — lean on [[evals]] to define them.",
          "",
          "Skip it for simple, low-stakes, or latency-sensitive calls. Two-plus model passes cost more and add delay — if a single shot is reliably fine, reflection is wasted spend ([[cost-control]]).",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Split the roles. Give the critic a fresh context so it judges the output, not its own reasoning.",
          "",
          "- Generator returns a draft, e.g. a function `parse_dates(s)`.",
          "- Critic gets the draft plus a checklist — `handles empty input?`, `timezone-aware?`, `tested?` — and returns a verdict plus specific fixes, not vague praise.",
          "- If the verdict is `pass`, you ship. If `revise`, the fixes feed back to the generator for another round.",
          "- A loop counter caps it: stop after `max_iters` (say 3) or when the critic says `pass`.",
          "",
          "Ground the critic in something real — test results, a schema, a rubric — so the signal is objective.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **No exit condition.** Without a `max_iters` cap or a clear `pass` signal, the loop runs forever or burns budget chasing diminishing returns.",
          "- **Ungrounded critique.** A critic with no rubric, tests, or tool output just rephrases the draft. Give it real criteria or feed it actual results — see [[tool-design]].",
          "- **Same-context bias.** If the critic shares the generator's context, it rubber-stamps its own mistakes. Use a fresh prompt or a separate model.",
          "- **Confident regressions.** Revisions can fix one thing and break another. Re-check the full criteria each pass, and log the rounds so you can debug ([[observability]]).",
        ].join("\n"),
      },
    ],
  },
  {
    id: "planning",
    title: "Planning: make a plan before acting",
    summary:
      "Make the agent write an explicit, ordered plan before it acts, execute the steps, and replan when reality breaks the plan.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "planning", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["goal-monitoring", "reasoning", "multi-agent"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Planning means the agent writes down the steps *before* it touches anything. Instead of reacting one move at a time, it produces an explicit, ordered plan — then executes it.",
          "",
          "- It splits the work in two: **deciding what to do** and **actually doing it**.",
          "- The plan is a first-class artifact you can read, check, and revise — not hidden inside the model's head.",
          "- When reality breaks the plan, the agent **replans** instead of blundering ahead.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for planning when the task has shape that a single step can't capture.",
          "",
          "- **Multi-step goals** where order matters — book the flight before the hotel, not after.",
          "- **Long-horizon tasks** where reacting step-by-step loses the thread or loops.",
          "- **Work you want to inspect or approve** before it runs — the plan is your checkpoint.",
          "- Pairs well with [[reflection]] (critique the plan) and [[goal-monitoring]] (track progress against it).",
          "",
          "Skip it for one-shot or trivial tasks. A lookup or single tool call doesn't need a plan — planning just adds latency and tokens. See [[routing]] for picking the cheap path.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Two phases: **plan**, then **execute**.",
          "",
          "- The agent takes the goal and emits an ordered list of steps, e.g. `[\"search flights\", \"pick cheapest\", \"book\", \"email itinerary\"]`.",
          "- An executor walks the steps, calling tools for each one and feeding results forward.",
          "- After each step it checks: did this succeed, and is the rest of the plan still valid?",
          "- If a step fails or returns surprising data — no flights under budget — the agent **replans** from the current state instead of forcing the stale plan.",
          "",
          "The plan can be plain text, a structured list, or a small task graph. Keep it explicit so you can log and audit it — see [[observability]].",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Stale plans.** A plan made up front goes wrong mid-run. Always re-check validity and replan — a plan with no replan loop is just a brittle script.",
          "- **Over-planning small tasks.** Generating a 7-step plan for a one-line answer burns tokens and time. Gate planning behind task complexity; watch your [[cost-control]].",
          "- **Plans that ignore real constraints.** The model invents steps using tools or data that don't exist. Ground the planner in the actual [[tool-design|available tools]].",
          "- **Endless replanning.** If every step triggers a rewrite, cap replans and fail loudly instead of looping forever.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "multi-agent",
    title: "Multi-agent: split roles, coordinate the work",
    summary:
      "Break a hard job into specialized agents with narrow roles and separate context windows, then coordinate their work through an orchestrator or a structured exchange.",
    track: "patterns",
    group: "Core",
    tags: ["agents", "multi-agent", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["agent-comms", "routing", "parallelization"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Instead of one agent juggling everything, you split the job across several specialized agents — each with a narrow role and its own context window.",
          "",
          "- **Orchestrator + workers:** a lead agent decomposes the task, hands subtasks to workers, then merges their results.",
          "- **Debate / roles:** two or more agents take opposing or distinct stances (proposer vs critic, researcher vs writer) and the exchange sharpens the output.",
          "",
          "The win is focus: each agent sees only what its job needs, so prompts stay short and behavior stays predictable.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for this when one agent is straining:",
          "",
          "- The task has **distinct skills** — research, then code, then review — that benefit from different prompts and tools.",
          "- Subtasks are **independent** and can run in [[parallelization|parallel]], cutting wall-clock time.",
          "- You want **adversarial pressure** — a critic agent catching what the author missed (close cousin of [[reflection]]).",
          "- One context window is overflowing with mixed concerns.",
          "",
          "Don't use it when a single agent with good [[tool-design|tools]] already does the job. Every extra agent adds coordination overhead, latency, and [[cost-control|token cost]]. Start with one; split only when you feel the strain.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "An orchestrator owns the goal and delegates; workers do narrow jobs and report back.",
          "",
          "- The orchestrator decomposes the goal — e.g. `plan(\"ship feature X\")` returns subtasks `research`, `implement`, `test`.",
          "- It spawns a worker per subtask, passing only that subtask's context — not the whole conversation.",
          "- Each worker runs in its **own context window** and returns a structured result, like `{status, output}`.",
          "- The orchestrator collects results, resolves conflicts, and synthesizes the final answer.",
          "",
          "Delegation often leans on [[planning]] up front, and the messages between agents are the surface you'll standardize via [[agent-comms]].",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Coordination cost compounds.** More agents means more round-trips, more tokens, more places to fail. A two-agent setup that works beats a five-agent one that thrashes.",
          "- **Context loss at the seams.** A worker only knows what you pass it; forget a key constraint and it confidently does the wrong thing.",
          "- **Error propagation.** A bad subtask result poisons the merge. Have the orchestrator validate worker output, not just concatenate it — see [[reliability]].",
          "- **No clear owner.** Exactly one agent must own the final decision. Diffuse responsibility produces mush.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "memory",
    title: "Memory: what the agent keeps between turns",
    summary:
      "An agent's memory has two layers — the short-term context window and a long-term store you retrieve from — and the skill is deciding what to keep, summarize, and forget.",
    track: "patterns",
    group: "State & Learning",
    tags: ["agents", "memory", "retrieval"],
    relatedThreadIds: [],
    relatedTopicIds: ["rag", "learning-adaptation"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Memory is everything your agent carries forward so each turn isn't a blank slate. It comes in two layers.",
          "",
          "- **Short-term:** the context window — the running conversation, tool results, and a scratchpad the model sees on this turn. Fast, but bounded and lost when the run ends.",
          "- **Long-term:** an external store (a database, vector index, or file) you write to and retrieve from across sessions. Durable, unbounded, but only present when you fetch it.",
          "",
          "The pattern is deciding what lives where.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for explicit memory when:",
          "",
          "- A task spans more turns than fit comfortably in context, so you summarize old turns instead of dropping them.",
          "- The agent should remember facts across sessions — user preferences, prior decisions, a project's state.",
          "- You want retrieval of past knowledge on demand rather than stuffing everything into every prompt (see [[rag]]).",
          "",
          "Don't bother for short, single-shot tasks. If the whole job fits in one context window and nothing needs to outlive the run, plain conversation history is your memory — adding a store is just overhead.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "You manage three moves: persist, summarize, forget.",
          "",
          "- **Persist:** when something matters beyond this turn, write it out — `memory.save(\"user prefers metric units\")`.",
          "- **Summarize:** when context fills up, compress old turns into a short recap and keep that instead of the raw transcript.",
          "- **Retrieve:** on a new turn, pull only the relevant slice back in — `memory.recall(\"units\")` — and inject it into the prompt.",
          "- **Forget:** drop or expire anything stale so it can't poison future reasoning.",
          "",
          "Example flow: turn 1 the user says they're in Berlin, you `save` it; turn 40 the window is full, you summarize turns 1-30; turn 41 they ask about the weather, you `recall` \"Berlin\" and answer without re-reading the whole history.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Lossy summaries:** compression silently discards the one detail you needed later. Summarize facts and decisions, not vibes, and keep raw records retrievable.",
          "- **Stale memory:** an old fact retrieved as current is worse than no memory. Timestamp entries and expire or overwrite them.",
          "- **Retrieval misses:** if `recall` returns the wrong slice, the agent reasons confidently on bad context. Treat retrieval quality as something to measure with [[evals]].",
          "- **Unbounded growth:** every saved item is future cost and noise. Be deliberate about what earns a place in long-term store — see [[cost-control]].",
        ].join("\n"),
      },
    ],
  },
  {
    id: "learning-adaptation",
    title: "Learning & adaptation: improve from feedback",
    summary:
      "Let the agent improve at runtime by storing scored outcomes and retrieving the wins as few-shot examples and the failures as warnings — no retraining required.",
    track: "patterns",
    group: "State & Learning",
    tags: ["agents", "memory", "reasoning"],
    relatedThreadIds: [],
    relatedTopicIds: ["memory", "reflection", "evals"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Learning and adaptation is how an agent gets better at a task **at runtime** — from its own outcomes — without retraining the base model. The weights stay frozen. What changes is the context you feed the model on the next turn.",
          "",
          "Three common levers:",
          "- **Few-shot selection:** pull the examples that worked for similar inputs into the prompt.",
          "- **Reflection traces:** after a run, write down what went wrong, then read it back next time.",
          "- **Preference signals:** thumbs-up, edits, and corrections that re-rank future behavior.",
          "",
          "Think of it as the agent keeping a notebook, not going back to school.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for it when the same kinds of tasks recur and you have a signal for what \"good\" looked like:",
          "- Repeated workflows where past successes are a template for the next one (support replies, code fixes, extraction).",
          "- Tasks with a verifiable outcome — tests passed, user accepted the answer, the tool returned clean.",
          "- Domains that **drift**, so yesterday's good example beats a static prompt.",
          "",
          "It leans on [[memory]] to persist what's learned and pairs naturally with [[reflection]].",
          "",
          "Don't bother for one-shot or stateless tasks, or when there's no honest outcome signal — you'll just memorize noise. For correctness rules that must never bend, use [[guardrails]], not learning.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "The loop is **act, judge, store, retrieve** — and retrieval is the part that actually changes behavior.",
          "",
          "- After a run, score the outcome (a test result, a user edit, an LLM judge) and write a record: input, what you did, what happened.",
          "- Example: store `{task, plan, result: \"failed — wrong date format\", fix: \"use ISO-8601\"}` keyed by an embedding of `task`.",
          "- On the next similar task, `retrieve(top_k)` the closest records and inject the wins as few-shot examples and the failures as \"avoid this\" notes.",
          "- The model now conditions on lived evidence instead of a frozen prompt.",
          "",
          "Keep the store small and ranked; relevance beats volume.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Poisoned memory:** one bad outcome stored as a \"good\" example teaches the wrong lesson forever. Gate writes on a real success signal, not just task completion.",
          "- **Stale wins:** an example that worked last quarter can mislead after the domain shifts. Expire or down-weight old records.",
          "- **Feedback loops:** the agent retrieves its own past output, reinforces it, and drifts. Mix in ground-truth examples and watch for collapse via [[observability]].",
          "- **No honest signal:** if your \"reward\" is the model grading itself unchecked, you're amplifying bias, not learning. Anchor scoring to something external.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "mcp",
    title: "MCP: a standard port for tools and context",
    summary:
      "MCP is a standard client/server protocol that exposes tools, resources, and prompts to an agent, so you build an integration once and reuse it across every host.",
    track: "patterns",
    group: "State & Learning",
    tags: ["mcp", "agents", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["tool-design", "agent-comms"],
    sections: [
      {
        heading: "What it is",
        body: [
          "MCP (the Model Context Protocol) is a standard wire format that connects an agent to its tools and data. Instead of hand-coding a bespoke integration for every API, you run an **MCP server** that exposes its capabilities, and any **MCP host** (an agent, an IDE, a chat client) can plug in.",
          "",
          "- It's a contract, not a framework — like USB or HTTP for agent integrations.",
          "- A server advertises three things: **tools** (actions the agent can call), **resources** (read-only context like files or rows), and **prompts** (reusable templates).",
          "- Write the integration once; every MCP-speaking host gets it for free.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "- You want a tool or data source usable across **multiple agents or hosts**, not welded into one app.",
          "- You're integrating a third party that already ships an MCP server — wire it up instead of rebuilding it.",
          "- You want to swap or add capabilities at runtime without redeploying the agent.",
          "- You're standardizing internal tools so teams stop reinventing the same connectors.",
          "",
          "When NOT to use it: for one agent calling one in-process function, plain [[tool-design|tool definitions]] are simpler — MCP's client/server overhead buys you nothing.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "The host runs an MCP **client**; each integration runs as an MCP **server**. They speak JSON-RPC over a transport (local stdio, or HTTP for remote).",
          "",
          "The flow for one turn:",
          "",
          "- On connect, the client calls `list_tools` and the server returns tools with names, descriptions, and JSON-Schema inputs.",
          "- The host hands those schemas to the model as available [[tool-design|tools]].",
          "- The model picks one, say `get_weather`, and the client sends `call_tool` with `{\"city\": \"Berlin\"}`.",
          "- The server runs the real work and returns a result the model reads.",
          "- Resources work the same way — the client lists and fetches them to feed context, often backing a [[rag]] step.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **A server is attack surface.** A connected MCP server can expose tools you didn't audit; prompt-injected content from one can trigger another. Gate calls with [[guardrails]] and least-privilege scopes.",
          "- **Tool descriptions are the API.** The model only knows what `list_tools` says — vague names and schemas cause wrong calls. The [[tool-design]] rules still apply over MCP.",
          "- **More servers, more tokens.** Every advertised tool sits in the context window; prune what the agent doesn't need and watch [[cost-control]].",
          "- **Transport and version mismatches** fail quietly — pin versions and surface connection errors instead of swallowing them.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "goal-monitoring",
    title: "Goal setting & monitoring: track progress to a target",
    summary:
      "Give the agent an explicit target plus a way to measure progress, so loops terminate on done, stuck, or off-track instead of wandering until they run out of tokens.",
    track: "patterns",
    group: "State & Learning",
    tags: ["agents", "planning", "reliability"],
    relatedThreadIds: [],
    relatedTopicIds: ["planning", "prioritization", "observability"],
    sections: [
      {
        heading: "What it is",
        body: [
          "An agent without a finish line keeps going. Goal setting & monitoring fixes that by pairing a clear target with a way to check progress against it on every loop.",
          "",
          "- **The goal:** a concrete, checkable definition of done — not \"help the user\" but \"all tests pass and the diff is under 50 lines.\"",
          "- **The monitor:** a check that runs each iteration and answers one question — are we closer, stuck, or done?",
          "",
          "The monitor is what turns an open-ended loop into something that actually stops.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for this whenever an agent runs in a loop and decides for itself when to quit.",
          "",
          "- Multi-step tasks with a measurable end state — \"green build,\" \"form submitted,\" \"report covers all five sections.\"",
          "- Long-running or autonomous runs where nobody is watching each step.",
          "- Anything that pairs with [[reflection]] or [[planning]] — the goal is what reflection grades against.",
          "- It overlaps with [[evals]]: the same success criteria can score a run live and offline.",
          "",
          "Skip it for single-shot calls with no loop — there's no progress to track, so the monitor is dead weight.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Encode the goal as something a check can evaluate, then run that check every turn.",
          "",
          "- Define success criteria the agent can read — e.g. `tests_passing == true and lint_errors == 0`.",
          "- After each step, run the monitor and compute progress against the criteria.",
          "- Branch on the result — **done** ends the run, **progressing** continues, **stuck or off-track** triggers a retry, replan, or escalation.",
          "- Track a `no_progress_count`; if the metric hasn't moved in N turns, stop calling it progress and break the loop.",
          "",
          "The key move — the goal lives in data the agent inspects, not just in a prompt it might drift away from.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **No stuck-detection.** A done-check alone isn't enough. Without a no-progress counter, a failing agent loops until it burns the budget — see [[cost-control]].",
          "- **Vague goals.** \"Make it better\" can't be measured, so the monitor can't fire. If you can't write the check, the goal isn't defined yet.",
          "- **Gaming the metric.** The agent optimizes exactly what you measure — a goal of \"tests pass\" invites deleting the tests. Pair criteria with [[guardrails]].",
          "- **Monitor drift.** A check that's cheaper than the real goal (token count instead of quality) quietly steers the agent off-target.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "rag",
    title: "RAG: ground answers in retrieved knowledge",
    summary:
      "RAG fetches the most relevant chunks from your knowledge store and drops them into context, so the agent answers from retrieved facts with citations instead of guessing from training memory.",
    track: "patterns",
    group: "Reliability",
    tags: ["rag", "retrieval", "agents"],
    relatedThreadIds: [],
    relatedTopicIds: ["memory", "tool-design"],
    sections: [
      {
        heading: "What it is",
        body: [
          "RAG is how you make an agent answer from facts it can look up instead of facts it half-remembers from training.",
          "",
          "- You keep a knowledge store (docs, tickets, code) chunked and indexed.",
          "- At question time you **retrieve** the few chunks most relevant to the query.",
          "- You paste those chunks into the prompt so the model answers from them, with citations.",
          "",
          "The model stops guessing and starts quoting. That's the whole trick.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for RAG when the answer lives in data the model never saw or that changes often.",
          "",
          "- Private or internal knowledge: your docs, your codebase, your support history.",
          "- Fast-moving facts: pricing, policies, anything stale a week after training.",
          "- Anywhere you need a **citation** so the user can verify the source.",
          "- When hallucination is expensive and you'd rather the agent say \"not in the docs.\"",
          "",
          "When NOT to use it: skip RAG for reasoning or general-knowledge tasks where retrieval just adds noise and latency. See [[tool-design]] when the answer should come from a live API call instead.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Two phases: build the index once, then retrieve per query.",
          "",
          "- **Chunk:** split each doc into passages (say, a few hundred tokens). Too big buries the answer; too small loses context.",
          "- **Embed:** run each chunk through an embedding model to get a vector, store it in a vector index alongside the raw text.",
          "- **Retrieve:** embed the user's question the same way, find the top-k nearest chunks (e.g. `top_k=5`).",
          "- **Ground:** drop those chunks into the prompt — `Answer using only the context below` — and ask the model to cite which chunk it used.",
          "",
          "Example: query `\"what's our refund window?\"` pulls the billing-policy chunk, and the model answers `\"30 days\"` straight from that text.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Retrieval is the bottleneck, not the model.** If the right chunk isn't in the top-k, no prompt can save the answer. Measure retrieval quality first — make it part of your [[evals]].",
          "- **Grounding is a request, not a guarantee.** The model can still answer from memory and ignore your chunks. Instruct it to say \"not found\" when context is thin, and treat that as a [[guardrails]] check.",
          "- **Chunk boundaries cut answers in half.** A fact split across two chunks may surface neither cleanly. Overlap chunks slightly.",
          "- **Stale index, wrong answers.** If your store drifts from reality, RAG confidently serves old facts. Re-index on a schedule.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "agent-comms",
    title: "Inter-agent comms: how agents talk (A2A)",
    summary:
      "Inter-agent comms lets independent agents hand off work and share results through structured messages, a shared blackboard, or protocols like A2A.",
    track: "patterns",
    group: "Advanced",
    tags: ["agents", "multi-agent", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["multi-agent", "mcp"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Inter-agent comms is how independent agents hand work to each other and share results — instead of one agent doing everything, several specialists coordinate.",
          "",
          "- **Direct messages:** one agent sends a structured request to another and gets a structured reply.",
          "- **Shared state (blackboard):** agents read and write a common workspace instead of messaging point-to-point.",
          "- **Protocols (A2A):** an agreed envelope — message format, identity, capabilities — so agents built by different teams or frameworks can still talk.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for it when work splits cleanly across specialists or across machines:",
          "",
          "- A pipeline where a `researcher` agent feeds a `writer` agent feeds an `editor` agent.",
          "- Agents owned by different teams or vendors that must interoperate — that's what protocols like A2A standardize.",
          "- Long-running tasks where one agent delegates and polls for results.",
          "",
          "This builds on [[multi-agent]] structure; once they talk, [[agent-comms]] is the wire.",
          "",
          "Skip it when a single agent with the right tools already does the job — extra agents add latency, cost, and failure points for no gain.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Agents exchange typed messages instead of free text. Keep the envelope explicit.",
          "",
          "- A coordinator sends `{from, to, task_id, intent: \"summarize\", payload}` to a worker.",
          "- The worker replies with `{task_id, status: \"done\", result}` — or `status: \"failed\"` with a reason.",
          "- The `task_id` ties request to response so async replies don't get crossed.",
          "- With a blackboard, agents skip addressing entirely: the worker writes `result` to a shared key and the coordinator watches for it.",
          "- A protocol like A2A pins down the schema, identity, and a capability list so an agent can discover what another can do before sending.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Free-text handoffs:** passing raw prose between agents loses structure and invites misreads. Use a schema and validate it — see [[guardrails]].",
          "- **Lost or duplicate messages:** without a `task_id` and acks, async replies get dropped or double-processed. Treat the channel as unreliable and design for retries; [[reliability]] applies.",
          "- **Silent failures:** a worker that errors but never reports stalls the whole chain. Make failure a first-class message, not a timeout.",
          "- **Chatter cost:** every hop is tokens and latency. Fewer, richer messages beat many tiny ones — watch [[cost-control]].",
        ].join("\n"),
      },
    ],
  },
  {
    id: "reasoning",
    title: "Reasoning techniques: think before you answer",
    summary:
      "Reasoning techniques trade extra tokens for accuracy on hard problems — chain-of-thought, self-consistency voting, ReAct's think-act loop, and tree search — but only when the failure is reasoning, not facts.",
    track: "patterns",
    group: "Advanced",
    tags: ["agents", "reasoning", "evals"],
    relatedThreadIds: [],
    relatedTopicIds: ["planning", "reflection"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Reasoning techniques are prompting and control-flow tricks that make a model **think before it answers** instead of blurting the first token. You spend extra tokens deriving intermediate steps, and accuracy on hard problems goes up.",
          "",
          "- **Chain-of-thought (CoT):** ask for step-by-step working before the final answer.",
          "- **Self-consistency:** sample several CoT runs, then take the majority answer.",
          "- **ReAct:** interleave reasoning with real tool calls — think, act, observe, repeat.",
          "- **Tree/Graph-of-Thought:** branch into multiple paths and explore, not just one line.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for these when one-shot answers are wrong and the failure is *reasoning*, not missing facts.",
          "",
          "- **CoT:** math, logic, multi-constraint decisions — anything with steps.",
          "- **Self-consistency:** high-stakes answers where you can afford 3-5x the calls to vote out flukes.",
          "- **ReAct:** the task needs live data or actions — pair it with [[tool-design]] and [[planning]].",
          "- **Tree/Graph-of-Thought:** search-like problems with many viable paths (puzzles, planning).",
          "",
          "Do **not** use them for simple lookups, classification, or extraction — the extra tokens buy nothing and just add latency and [[cost-control|cost]].",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "The core move is forcing intermediate tokens between question and answer.",
          "",
          "- **CoT:** append `Let's think step by step.` or give a worked example. The model writes its reasoning, then the answer.",
          "- **Self-consistency:** run the same CoT prompt N times at `temperature > 0`, collect the final answers, return the mode. Five runs, three say `42` → answer is `42`.",
          "- **ReAct:** loop `Thought → Action → Observation`. `Thought: I need the price. Action: search(\"X\"). Observation: $9.` → next thought.",
          "- **Tree-of-Thought:** generate several candidate next steps, score each, expand the best — a search over reasoning, not a straight line.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Reasoning is not truth.** A confident chain can be confidently wrong — verify the answer, don't trust the prose. Treat it like any output behind a [[guardrails|guardrail]].",
          "- **Cost scales fast.** Self-consistency and tree search multiply token spend; measure whether the accuracy lift is worth it with real [[evals]].",
          "- **Exposed CoT can leak.** Visible reasoning may reveal hidden instructions or sensitive logic — don't show it to end users by default.",
          "- **More steps ≠ better.** Past a point, longer chains drift off-track. Cap depth and let the model stop early.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "prioritization",
    title: "Prioritization: decide what to do next",
    summary:
      "When an agent faces a pile of possible actions, score and order them by urgency, value, dependencies, and cost instead of just grabbing whatever came in first.",
    track: "patterns",
    group: "Advanced",
    tags: ["agents", "planning", "orchestration"],
    relatedThreadIds: [],
    relatedTopicIds: ["goal-monitoring", "planning", "cost-control"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Prioritization is the agent deciding **what to do next** when it has more than one option on the table. Instead of acting first-in-first-out, it scores each candidate task or action and picks the best one.",
          "",
          "- The input is a list of pending things — tasks, tool calls, sub-goals.",
          "- The output is an ordered queue, re-ranked as new information arrives.",
          "- The ranking is explicit, not whatever the loop happened to surface first.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for it when the agent has a backlog and the order matters:",
          "",
          "- A long-running agent juggling many open tasks (support tickets, a research to-do list, a build pipeline).",
          "- Tasks with **dependencies** — B can't start until A finishes.",
          "- Scarce budget where you want high-value work first (ties into [[cost-control]]).",
          "- Mixed urgency — a deadline item should jump ahead of a nice-to-have.",
          "",
          "Skip it when there's one obvious next step, or the queue is short and cheap to just drain in order. Ranking overhead you don't need is wasted tokens.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "Give each candidate a score, then act on the top one.",
          "",
          "- Define the factors that matter: `urgency`, `value`, `cost`, and whether dependencies are satisfied.",
          "- Score each task — e.g. `score = (urgency * value) / cost`, with blocked tasks forced to the bottom.",
          "- Pick the highest, execute it, then **re-rank** the remainder before the next pick.",
          "",
          "Example: the queue holds `send_invoice` (blocked on `approve_invoice`) and `reply_to_customer` (urgent). The agent ranks `reply_to_customer` first, does it, marks `approve_invoice` ready, and on the next pass `send_invoice` rises to the top. Pairs naturally with [[planning]], which produces the tasks you're ranking.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Starvation:** a low-priority task that never wins gets stuck forever. Add aging — bump a task's score the longer it waits.",
          "- **Gameable scores:** if value comes from the model's own estimate, it can inflate everything. Anchor scores to concrete signals and sanity-check with [[evals]].",
          "- **Stale rankings:** prioritize once and the order rots as the world changes. Re-rank when new tasks or results land, not just at the start.",
          "- **Ignoring dependencies:** picking a high-value but blocked task wastes a turn. Treat unmet dependencies as a hard disqualifier, not a small penalty.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "exploration",
    title: "Exploration & discovery: search an open space",
    summary:
      "Exploration lets an agent attack open-ended problems by generating, testing, and pruning candidate paths, always balancing exploiting the best lead against trying something new.",
    track: "patterns",
    group: "Advanced",
    tags: ["agents", "reasoning", "planning"],
    relatedThreadIds: [],
    relatedTopicIds: ["planning", "reasoning", "learning-adaptation"],
    sections: [
      {
        heading: "What it is",
        body: [
          "Exploration is what an agent does when there is no fixed plan to follow. Instead of executing known steps, it searches an open space of possibilities — generating candidate moves, trying them, and keeping what works.",
          "",
          "- It **generates** several possible next steps instead of committing to one.",
          "- It **tests** them against the goal or a cheap signal.",
          "- It **prunes** dead ends and pushes deeper on the promising branches.",
          "",
          "The core tension: **exploit** what already looks good, or **explore** something new that might be better.",
        ].join("\n"),
      },
      {
        heading: "When to use it",
        body: [
          "Reach for exploration when the path is genuinely unknown:",
          "",
          "- Open-ended problems where you can't write the steps in advance — research questions, optimization, game-like decisions.",
          "- Many candidate solutions exist and you need to find a good one, not the obvious one.",
          "- The environment gives feedback you can act on — a test passes, a metric moves, a check returns.",
          "- Discovery work: probing an API, mapping unfamiliar data, finding edge cases.",
          "",
          "When NOT to use it: if the task has a known, reliable sequence, use [[planning]] or [[prompt-chaining]] instead — exploration just burns tokens on a solved problem.",
        ].join("\n"),
      },
      {
        heading: "How it works",
        body: [
          "The agent runs a generate-test-prune loop over candidate paths.",
          "",
          "- **Generate:** propose N next moves. Example: `candidates = expand(state, n=3)` produces three different code fixes for a failing test.",
          "- **Test:** score each against a signal — `score = run_tests(candidate)` or a [[reflection]] step that judges quality.",
          "- **Select:** keep the best branches, drop the rest. A frontier (queue) holds live candidates ranked by score.",
          "- **Balance:** mostly follow the top branch (exploit), but spend some budget on weaker or untried ones (explore) so you don't miss a better route.",
          "- **Repeat** until the goal is met or budget runs out.",
          "",
          "This is the shape behind tree search, beam search, and self-improving agent loops.",
        ].join("\n"),
      },
      {
        heading: "Watch out for",
        body: [
          "- **Pure exploitation gets stuck.** Always taking the top candidate locks you into a local best and misses better paths. Keep a slice of budget for exploring.",
          "- **Pure exploration never finishes.** Without pruning and a stop condition, the frontier explodes. Cap depth, breadth, and total spend — see [[cost-control]].",
          "- **A weak test signal poisons everything.** If your scoring is noisy, you prune good branches and keep bad ones. Invest in the eval — pair this with [[evals]].",
          "- **No reproducibility.** Branching is stochastic; log the search tree and decisions via [[observability]] so a run can be understood and replayed.",
        ].join("\n"),
      },
    ],
  },
  // ── Operational practices track — how to run an agent in production.
  {
    id: "evals",
    title: "Evals: gate on recall, not vibes",
    summary:
      "Make the metric deterministic before you trust any number. Gate releases on recall over a fixed must-handle set; keep the LLM judge off the gate.",
    icon: "check",
    track: "operational",
    relatedTopicIds: ["reflection", "observability", "learning-adaptation"],
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
    track: "operational",
    relatedTopicIds: ["reflection", "evals"],
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
    track: "operational",
    relatedTopicIds: ["mcp", "rag", "reasoning"],
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
    track: "operational",
    relatedTopicIds: ["parallelization", "guardrails"],
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
    track: "operational",
    relatedTopicIds: ["evals", "goal-monitoring"],
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
    track: "operational",
    relatedTopicIds: ["parallelization", "prioritization", "routing"],
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
