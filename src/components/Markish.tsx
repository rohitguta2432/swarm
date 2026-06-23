import { Fragment, type ReactNode } from "react";
import Link from "next/link";

// Minimal, dependency-free, XSS-safe markdown-ish renderer.
// Supports: **bold**, `code`, [[wikilinks]], "- " bullet lists, and blank-line
// paragraph breaks. We parse to React nodes (never dangerouslySetInnerHTML), so
// content is inert.
//
// Wikilinks: [[slug]] or [[slug|Display text]]. Resolution is delegated to an
// optional `resolveLink` prop (slug -> href, or null when unknown) so this
// component stays dumb and the caller — which knows the topic/thread registries
// — decides where a slug points. Without a resolver (e.g. on the client in
// KnowledgeAsk) a wikilink degrades to plain de-kebabed text.

type ResolveLink = (slug: string) => string | null;

const linkCls =
  "font-medium text-accent-ink underline decoration-accent/50 decoration-2 underline-offset-2 transition-colors hover:decoration-accent";

function inline(text: string, keyBase: string, resolveLink?: ResolveLink): ReactNode[] {
  // Split on **bold**, `code`, and [[wikilink]], keeping delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g).filter(Boolean);
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded border border-border bg-surface-muted px-1 py-0.5 font-mono text-[0.85em] text-accent-ink"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    if (p.startsWith("[[") && p.endsWith("]]")) {
      const [slug, label] = p.slice(2, -2).split("|");
      const text = (label ?? slug).trim().replace(/-/g, " ");
      const href = resolveLink?.(slug.trim()) ?? null;
      return href ? (
        <Link key={key} href={href} className={linkCls}>
          {text}
        </Link>
      ) : (
        <Fragment key={key}>{text}</Fragment>
      );
    }
    return <Fragment key={key}>{p}</Fragment>;
  });
}

export default function Markish({
  text,
  className,
  resolveLink,
}: {
  text: string;
  className?: string;
  resolveLink?: ResolveLink;
}) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <ul key={key} className="my-2 list-disc space-y-1.5 pl-5 marker:text-accent">
          {bullets.map((b, i) => (
            <li key={i}>{inline(b, `${key}-li-${i}`, resolveLink)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s*-\s+/.test(line)) {
      bullets.push(line.replace(/^\s*-\s+/, ""));
      return;
    }
    flush(`ul-${i}`);
    if (line.trim() === "") return;
    blocks.push(
      <p key={`p-${i}`} className="my-2 first:mt-0 last:mb-0">
        {inline(line, `p-${i}`, resolveLink)}
      </p>,
    );
  });
  flush("ul-end");

  return <div className={className}>{blocks}</div>;
}
