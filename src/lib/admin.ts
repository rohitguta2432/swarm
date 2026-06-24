// Admin gating — env-var based, no roles table. An email is admin iff it appears
// in ADMIN_EMAILS (comma/space-separated, case-insensitive). One source of truth,
// changeable without a migration; promote someone by editing the env var + redeploy.
// ponytail: env-var allowlist, swap for a roles table only if non-devs must grant admin at runtime.

import type { Session } from "next-auth";

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(/[\s,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdmin(session: Session | null): boolean {
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  return adminEmails().has(email);
}
