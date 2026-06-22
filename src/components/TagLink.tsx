import Link from "next/link";

// A single #-prefixed tag chip-link, shared across the feed cards, thread, news, and learn
// pages. `inline-block py-1` gives a ≥24px touch target (WCAG 2.5.8 — the inline version was
// 18px tall on mobile). `relative z-10` keeps it clickable above ThreadCard's stretched-link
// overlay and is harmless elsewhere.
export default function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tag/${tag}`}
      className="relative z-10 inline-block py-1 font-medium text-ink-2 transition-colors before:text-ink-3 before:content-['#'] hover:text-accent-ink"
    >
      {tag}
    </Link>
  );
}
