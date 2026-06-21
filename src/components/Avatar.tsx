// Deterministic generated avatar — initials on an hsl chip derived from the hue.
export default function Avatar({
  name,
  hue,
  size = 32,
}: {
  name: string;
  hue: number;
  size?: number;
}) {
  const initials = name.replace(/[^a-zA-Z0-9]/g, " ").trim().slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 40) % 360} 85% 52%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
