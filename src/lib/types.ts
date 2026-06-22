// Core domain types for Swarm — the unit of the platform is a "thread":
// a question, a discussion, or a "show" (share-your-agent). Every thread can
// carry an AI-first answer plus human replies on top.

export type ThreadKind = "question" | "discussion" | "show";

export type Reply = {
  id: string;
  author: string;
  avatarHue: number; // 0–360, drives the generated avatar color
  body: string;
  createdAt: string; // pre-rendered relative label, e.g. "3h ago"
  isAccepted?: boolean;
  image?: string | null; // profile image (e.g. Google avatar) when signed in
};

export type AiAnswer = {
  text: string;
  model: string; // e.g. "swarm-triage (offline)", "gpt-4o-mini", "claude-…"
  tookMs: number;
};

export type Thread = {
  id: string;
  kind: ThreadKind;
  title: string;
  body: string;
  author: string;
  avatarHue: number;
  tags: string[];
  createdAt: string;
  upvotes: number;
  aiAnswer: AiAnswer | null;
  replies: Reply[];
};

export const KIND_LABEL: Record<ThreadKind, string> = {
  question: "Question",
  discussion: "Discussion",
  show: "Show & tell",
};

// Knowledge layer — the applied how-to of building AI agents. Authored as typed
// data (src/lib/knowledge.ts) and rendered by /learn, mirroring the data-driven
// style of Thread / src/lib/data.ts. Section bodies are Markish-formatted
// (**bold**, `code`, "- " bullets only — anything else renders as plain text).
export type KnowledgeSection = {
  heading: string;
  body: string; // Markish-formatted text
};

export type KnowledgeTopic = {
  id: string; // lowercase-kebab slug used in the URL (/learn/<id>)
  title: string;
  summary: string;
  icon?: string;
  tags: string[];
  relatedThreadIds: string[]; // must match real ids in src/lib/data.ts
  sections: KnowledgeSection[];
};
