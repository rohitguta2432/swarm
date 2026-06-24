// Swarm mark — four overlapping nodes (a swarm/cluster), emerald palette.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="6" r="4" fill="#22c55e" />
      <circle cx="6.5" cy="18" r="4" fill="#16a34a" />
      <circle cx="21.5" cy="18" r="4" fill="#4ade80" />
      <circle cx="14" cy="14.5" r="2.6" fill="#15803d" />
    </svg>
  );
}
