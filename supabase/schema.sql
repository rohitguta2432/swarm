-- Swarm — durable replies table.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- The app writes via a server-only service-role client (src/lib/replies.ts), so
-- RLS stays ON with NO public policies: the anon/public key can't read or write,
-- and only the server (service role, which bypasses RLS) can insert/select.
-- Writes are additionally gated on a valid Google session in the server action.

create table if not exists swarm_replies (
  id           uuid primary key default gen_random_uuid(),
  thread_id    text not null,
  author       text not null,
  author_image text,
  avatar_hue   int  not null default 40,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists swarm_replies_thread_idx
  on swarm_replies (thread_id, created_at);

-- Lock it down: enable RLS, add no policies → public/anon key has zero access.
alter table swarm_replies enable row level security;
