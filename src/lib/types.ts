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
