// Site-wide Open Graph image for Swarm — generated with next/og ImageResponse.
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md
// Notes:
//   - Exporting `alt`, `size`, `contentType` + a default function returning ImageResponse auto-emits
//     og:image (+ :type/:width/:height). File-based metadata has HIGHER priority than the metadata
//     object (generate-metadata.md line 114), so layout.tsx does NOT hand-set openGraph.images.
//   - No custom font: Satori (next/og's renderer) does not use next/font, and there is no bundled
//     Space Grotesk .ttf in the repo (no-new-deps). We render with the default sans and lean on the
//     on-brand layout instead — hard #111 borders, amber #f59e0b accent, warm #fbfbf6 canvas.
//   - Root segment: `params` is undefined/unused (opengraph-image.md table, lines 245-249).
//
// Also serves as the twitter:image via layout.tsx's twitter metadata (single asset, summary_large_image).

import { ImageResponse } from "next/og";

export const alt = "Swarm — AI answers first, for agent builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#111111";
const CANVAS = "#fbfbf6";
const SURFACE = "#ffffff";
const ACCENT = "#f59e0b";
const INK2 = "#555555";

export default function Image() {
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
        {/* Hard-bordered editorial card */}
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
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                background: ACCENT,
                border: `4px solid ${INK}`,
              }}
            />
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: INK, letterSpacing: -1 }}>
              Swarm
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 800,
                color: INK,
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              <span style={{ display: "flex" }}>
                AI answers first
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: INK2 }}>
              <span
                style={{
                  display: "flex",
                  background: ACCENT,
                  color: INK,
                  padding: "4px 14px",
                  border: `3px solid ${INK}`,
                }}
              >
                for agent builders
              </span>
            </div>
          </div>

          {/* Footer line */}
          <div style={{ display: "flex", fontSize: 26, color: INK2, fontWeight: 500 }}>
            ask · go live · ship together — swarm.rohitraj.tech
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
