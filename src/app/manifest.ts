// Web app manifest for Swarm — MetadataRoute.Manifest (Next 16).
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md
// Uses the existing src/app/favicon.ico as the icon (zero new assets). Theme/background colors
// mirror the editorial-light brand: amber accent (#f59e0b) + warm canvas (#fbfbf6 from globals.css).

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swarm — for agent builders",
    short_name: "Swarm",
    description:
      "The community for developers building AI agents. Ask, go live, ship together — AI answers first; the swarm makes it right.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbf6",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
