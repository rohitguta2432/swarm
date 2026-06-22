// Per-thread Open Graph image for /t/[id] — generated with next/og ImageResponse.
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md
// Notes:
//   - v16.0.0: `params` is now a Promise (opengraph-image.md lines 245-249, 524-528) — MUST be awaited.
//   - Falls back to the brand card copy when a thread id doesn't resolve, so the route never throws.
//   - No custom font (see root opengraph-image.tsx for the rationale): default sans + on-brand layout.

import { ImageResponse } from "next/og";
import { getThreadById } from "@/lib/threads";
import { KIND_LABEL } from "@/lib/types";

export const alt = "A thread on Swarm — for agent builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#111111";
const CANVAS = "#fbfbf6";
const SURFACE = "#ffffff";
const ACCENT = "#f59e0b";
const INK2 = "#555555";
const INK3 = "#7a7a72";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getThreadById(id);

  const kind = thread ? KIND_LABEL[thread.kind] : "Thread";
  const title = thread?.title ?? "A thread on Swarm";
  const tags = thread?.tags?.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: CANVAS,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: SURFACE,
            border: `4px solid ${INK}`,
            boxShadow: `16px 16px 0 ${INK}`,
            padding: 56,
            justifyContent: "space-between",
          }}
        >
          {/* Top row: wordmark + kind pill */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", width: 40, height: 40, background: ACCENT, border: `3px solid ${INK}` }} />
              <div style={{ display: "flex", fontSize: 32, fontWeight: 800, color: INK, letterSpacing: -1 }}>
                Swarm
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                color: INK,
                textTransform: "uppercase",
                letterSpacing: 1,
                border: `3px solid ${INK}`,
                background: "#f4f3ee",
                padding: "6px 16px",
              }}
            >
              {kind}
            </div>
          </div>

          {/* Thread title (clamped) */}
          <div
            style={{
              display: "flex",
              fontSize: title.length > 80 ? 46 : 56,
              fontWeight: 800,
              color: INK,
              lineHeight: 1.08,
              letterSpacing: -1.5,
            }}
          >
            {title.length > 130 ? `${title.slice(0, 127)}…` : title}
          </div>

          {/* Tags + footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    fontSize: 22,
                    fontWeight: 600,
                    color: INK2,
                    background: "#fef6e7",
                    border: `2px solid ${INK}`,
                    padding: "2px 12px",
                  }}
                >
                  #{t}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: INK3, fontWeight: 500 }}>
              AI answers first — the swarm makes it right · swarm.rohitraj.tech
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
