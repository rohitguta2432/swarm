// Swarm mark — a cluster of hexagons (a hive / swarm), amber on dark.
export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M9 3.5 13 5.8v4.6L9 12.7 5 10.4V5.8z" fill="#f59e0b" />
      <path d="M23 3.5 27 5.8v4.6l-4 2.3-4-2.3V5.8z" fill="#f59e0b" opacity="0.55" />
      <path d="M16 11 20 13.3v4.6L16 20.2 12 17.9v-4.6z" fill="#fbbf24" />
      <path d="M9 18.5 13 20.8v4.6L9 27.7 5 25.4v-4.6z" fill="#f59e0b" opacity="0.75" />
      <path d="M23 18.5 27 20.8v4.6l-4 2.3-4-2.3v-4.6z" fill="#f59e0b" />
    </svg>
  );
}
