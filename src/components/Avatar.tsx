// Avatar — a real profile image when available (e.g. Google), else a deterministic
// initials chip derived from the hue.
export default function Avatar({
  name,
  hue,
  size = 32,
  image,
}: {
  name: string;
  hue: number;
  size?: number;
  image?: string | null;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="inline-block shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
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
