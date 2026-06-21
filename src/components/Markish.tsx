import { Fragment, type ReactNode } from "react";

// Minimal, dependency-free, XSS-safe markdown-ish renderer.
// Supports: **bold**, `code`, "- " bullet lists, and blank-line paragraph breaks.
// We parse to React nodes (never dangerouslySetInnerHTML), so user content is inert.

function inline(text: string, keyBase: string): ReactNode[] {
  // Split on **bold** and `code`, keeping delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={`${keyBase}-${i}`}
          className="rounded border border-border bg-surface-muted px-1 py-0.5 font-mono text-[0.85em] text-accent-ink"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={`${keyBase}-${i}`}>{p}</Fragment>;
  });
}

export default function Markish({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <ul key={key} className="my-2 list-disc space-y-1.5 pl-5 marker:text-accent">
          {bullets.map((b, i) => (
            <li key={i}>{inline(b, `${key}-li-${i}`)}</li>
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
        {inline(line, `p-${i}`)}
      </p>,
    );
  });
  flush("ul-end");

  return <div className={className}>{blocks}</div>;
}
