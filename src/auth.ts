import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js v5 — Google SSO with JWT sessions (no database needed for auth itself;
// the session lives in a signed cookie). The Google provider auto-reads
// AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET; signing uses AUTH_SECRET.
// trustHost: true lets it work behind the custom domain swarm.rohitraj.tech.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true,
});
