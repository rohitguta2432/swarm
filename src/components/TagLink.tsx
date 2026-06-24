import Link from "next/link";

// A single #-prefixed tag chip-link, shared across the feed cards, thread, news, and learn
// pages. `inline-block py-1` gives a ≥24px touch target (WCAG 2.5.8 — the inline version was
// 18px tall on mobile). `relative z-10` keeps it clickable above ThreadCard's stretched-link
// overlay and is harmless elsewhere.
export default function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tag/${tag}`}
      className="relative z-10 inline-block rounded-md bg-[rgba(34,197,94,0.1)] px-2.5 py-1 text-[12.5px] font-medium text-accent-ink transition-colors before:text-accent-ink/55 before:content-['#'] hover:bg-[rgba(34,197,94,0.18)]"
    >
      {tag}
    </Link>
  );
}
