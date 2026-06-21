// Tiny dependency-free icon set (outline, currentColor) — replaces emoji
// (✓ ⚡ ▲ ●) which render inconsistently and fail screen readers.
import type { SVGProps } from "react";

type Name =
  | "chevron-up"
  | "check"
  | "message"
  | "spark"
  | "circle-dot"
  | "dot"
  | "menu"
  | "close"
  | "arrow-right";

const PATHS: Record<Name, React.ReactNode> = {
  "chevron-up": <path d="M5 14l7-7 7 7" />,
  check: <path d="M5 12l5 5L20 6" />,
  message: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" />,
  spark: <path d="M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4z" />,
  "circle-dot": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
};

export default function Icon({
  name,
  size = 16,
  ...props
}: { name: Name; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
