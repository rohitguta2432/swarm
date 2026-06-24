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


-- Swarm — durable threads table.
-- Same service-role-only contract as swarm_replies: the app writes via the
-- server-only service-role client (src/lib/threads.ts), so RLS stays ON with NO
-- public policies — the anon/public key can't read or write, and only the server
-- (service role, which bypasses RLS) can insert/select. Writes are additionally
-- gated on a valid Google session in the createThread server action.

create table if not exists swarm_threads (
  id           text primary key,
  kind         text not null,
  title        text not null,
  body         text not null default '',
  author       text not null,
  author_image text,
  avatar_hue   int  not null default 40,
  tags         text[] not null default '{}',
  upvotes      int  not null default 0,
  ai_answer    jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists swarm_threads_created_idx
  on swarm_threads (created_at desc);

-- Lock it down: enable RLS, add no policies → public/anon key has zero access.
alter table swarm_threads enable row level security;


-- Swarm — durable news links table.
-- Same service-role-only contract as swarm_threads: the app writes via the
-- server-only service-role client (src/lib/news.ts), so RLS stays ON with NO
-- public policies — the anon/public key can't read or write, and only the server
-- (service role, which bypasses RLS) can insert/select. Writes are additionally
-- gated on a valid Google session in the submitLink server action.

create table if not exists swarm_links (
  id            text primary key,
  url           text not null,
  title         text not null,
  summary       text not null default '',
  source_domain text not null default '',
  author        text not null,
  author_image  text,
  avatar_hue    int  not null default 40,
  tags          text[] not null default '{}',
  upvotes       int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists swarm_links_created_idx
  on swarm_links (created_at desc);

-- Lock it down: enable RLS, add no policies → public/anon key has zero access.
alter table swarm_links enable row level security;


-- Swarm — admin activity log (login + content events).
-- Same service-role-only contract as the tables above: the app writes via the
-- server-only service-role client (src/lib/activity.ts), so RLS stays ON with NO
-- public policies — the anon/public key can neither read nor write. Only the
-- server (service role, which bypasses RLS) inserts events and the gated /admin
-- dashboard (src/app/admin/page.tsx) selects them. Stores user email (PII) — it
-- is readable ONLY by an admin (ADMIN_EMAILS) through the server, never the browser.
create table if not exists swarm_activity (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  image      text,
  action     text not null,            -- 'login' | 'new_thread' | 'reply' | 'new_link'
  detail     text,                     -- thread title / link title / thread id (nullable)
  created_at timestamptz not null default now()
);

create index if not exists swarm_activity_created_idx
  on swarm_activity (created_at desc);
create index if not exists swarm_activity_email_idx
  on swarm_activity (email, created_at desc);

-- Lock it down: enable RLS, add no policies → public/anon key has zero access.
alter table swarm_activity enable row level security;

-- Exact distinct-user count for the admin dashboard, computed server-side so the
-- app never transfers rows or caps the scan (a client-side `select email` would be
-- bounded by PostgREST's row limit and silently undercount at scale). Called via
-- supabase.rpc("swarm_unique_login_users") from src/lib/activity.ts.
create or replace function swarm_unique_login_users()
returns integer language sql stable as $$
  select count(distinct email)::int from swarm_activity where action = 'login'
$$;

-- Same no-public-access contract as the table: only the server (service role) may
-- execute it; anon/authenticated (the browser keys) cannot.
revoke all on function swarm_unique_login_users() from public, anon, authenticated;
grant execute on function swarm_unique_login_users() to service_role;
