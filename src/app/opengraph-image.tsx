// Site-wide Open Graph image for Swarm — generated with next/og ImageResponse.
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md
// Notes:
//   - Exporting `alt`, `size`, `contentType` + a default function returning ImageResponse auto-emits
//     og:image (+ :type/:width/:height). File-based metadata has HIGHER priority than the metadata
//     object (generate-metadata.md line 114), so layout.tsx does NOT hand-set openGraph.images.
//   - No custom font: Satori (next/og's renderer) does not use next/font, so we render with the
//     default sans and lean on the on-brand layout instead. Satori also can't read CSS variables
//     (no DOM/cascade), so the green design tokens are inlined as literal hex, mirroring globals.css.
//   - Root segment: `params` is undefined/unused (opengraph-image.md table, lines 245-249).
//
// Also serves as the twitter:image via layout.tsx's twitter metadata (single asset, summary_large_image).

import { ImageResponse } from "next/og";

export const alt = "Swarm — AI answers first, for agent builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Green soft design tokens (literal values from src/app/globals.css — Satori can't read var()).
const INK = "#0f1a14";
const INK2 = "#44504a";
const CANVAS = "#f6f8f4";
const SURFACE = "#ffffff";
const BORDER = "#e4eae2";
const ACCENT = "#16a34a";

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
        {/* Soft editorial card — thin border + diffuse shadow + rounded corners */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 28,
            boxShadow: "0 24px 60px rgba(15,26,20,0.10)",
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
                borderRadius: 14,
              }}
            />
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: INK, letterSpacing: -1 }}>
              Swarm
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                  color: SURFACE,
                  padding: "8px 18px",
                  borderRadius: 12,
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
