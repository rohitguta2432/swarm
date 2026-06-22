"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { summarizeArticle } from "@/lib/ai";
import { addLink } from "@/lib/news";

// Deterministic avatar hue from a string (so a user's chip color is stable).
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

// Extract #tags from a tags field and/or the title. Deduped, lowercased, capped.
function parseTags(tagsField: string, title: string): string[] {
  const fromField = tagsField
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
  const fromTitle = [...title.matchAll(/#([a-z0-9][a-z0-9-]*)/gi)].map((m) => m[1].toLowerCase());
  return [...new Set([...fromField, ...fromTitle])].slice(0, 6);
}

// Basic SSRF guard on the parsed hostname only (no DNS resolution). Rejects the
// obvious literal private / loopback / link-local hosts. Good enough for this MVP
// scope; not a full SSRF defense.
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (!h || h === "localhost" || h === "0.0.0.0" || h === "::1" || h === "[::1]") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

// Best-effort server-side fetch to derive a title/excerpt. Capped + timed out;
// NEVER throws and NEVER blocks submission — any failure returns nulls.
async function fetchPageMeta(
  url: string,
): Promise<{ title: string | null; excerpt: string | null }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      // Do NOT auto-follow redirects: a submitted URL could 3xx to an internal host
      // (e.g. 169.254.169.254 cloud metadata) that isBlockedHost never got to vet.
      redirect: "manual",
      headers: { "user-agent": "SwarmBot/1.0 (+https://swarm.rohitraj.tech)" },
    });
    // 3xx / opaque redirect → refuse to chase it. Metadata is best-effort anyway,
    // so we fall back to the submitted title rather than re-fetch an unvetted host.
    if (res.status >= 300 && res.status < 400) return { title: null, excerpt: null };
    if (!res.ok) return { title: null, excerpt: null };
    const buf = await res.arrayBuffer();
    // Cap at ~256KB to avoid OOM on huge/streaming pages.
    const html = new TextDecoder().decode(buf.slice(0, 256 * 1024));

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeBasic(titleMatch[1]).replace(/\s+/g, " ").trim() : null;

    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ??
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const excerpt = descMatch ? decodeBasic(descMatch[1]).replace(/\s+/g, " ").trim() : null;

    return { title: title || null, excerpt: excerpt || null };
  } catch {
    return { title: null, excerpt: null };
  }
}

// Codepoint guard — String.fromCodePoint throws on out-of-range values.
function cp(n: number): string {
  return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
}

function decodeBasic(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => cp(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => cp(parseInt(h, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// Auth-gated link submission. Validates the URL + an SSRF guard, optionally fetches
// the page for a title/excerpt (never blocking on it), runs the AI summary, persists
// a durable link, then revalidates /news. Server Functions are reachable by direct
// POST, so auth is re-verified here regardless of any UI gating. No redirect — the
// user stays on the feed.
export async function submitLink(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized — sign in to submit.");

  const rawUrl = String(formData.get("url") ?? "").trim().slice(0, 2048);
  const submittedTitle = String(formData.get("title") ?? "").trim().slice(0, 200);
  if (!rawUrl) return;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return; // invalid URL — silently no-op (UI requires type=url)
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
  if (isBlockedHost(parsed.hostname)) return;

  const url = parsed.toString();
  const sourceDomain = parsed.hostname.replace(/^www\./, "");

  const { title: derivedTitle, excerpt } = await fetchPageMeta(url);
  const title = (derivedTitle || submittedTitle || sourceDomain).slice(0, 200);

  const ai = await summarizeArticle(title, url, excerpt ?? undefined);

  // Parse #tags from the explicit field plus BOTH titles — the submitted one and the
  // derived/displayed one — so tags aren't lost when the page title is the one shown.
  const tags = parseTags(String(formData.get("tags") ?? ""), `${submittedTitle} ${title}`);

  await addLink({
    url,
    title,
    summary: ai.text,
    sourceDomain,
    author: session.user.name ?? session.user.email ?? "anon",
    authorImage: session.user.image ?? null,
    avatarHue: hueFrom(session.user.email ?? session.user.name ?? "swarm"),
    tags,
  });

  revalidatePath("/news");
}
