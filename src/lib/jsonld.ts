// Typed JSON-LD (schema.org) helpers for Swarm — structured data for SEO + GEO.
//
// Next's recommended approach is to inline the JSON-LD as a <script type="application/ld+json">
// in the server component, with the JSON serialized safely. We centralize the builders here so the
// markup is consistent across pages and the XSS-safe stringify lives in one place.
//
// Rendering pattern (in a server component):
//   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />

const SITE_URL = "https://swarm.rohitraj.tech";
const SITE_NAME = "Swarm";

// schema.org nodes are open-shaped; a recursive JSON value type keeps callers typed without `any`.
type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };
export type JsonLdNode = { [key: string]: JsonLdValue };

// Serialize for inlining inside a <script> tag. Escaping `<` prevents a "</script>" or "<!--"
// sequence in the data from breaking out of the script element (the standard JSON-LD XSS guard).
export function jsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}

// Sitewide Organization — identifies the publisher.
export function organizationLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "The community for developers building AI agents. AI answers first; the swarm of builders refines it.",
    logo: `${SITE_URL}/opengraph-image`,
  };
}

// Sitewide WebSite. Deliberately NO SearchAction/Sitelinks-Searchbox: Swarm has no full-text search
// endpoint (the feed only supports fixed ?tab= enum filters), and advertising a non-functional
// searchbox is worse than omitting it. Add a SearchAction here once a real /search?q= endpoint exists.
export function webSiteLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

// BreadcrumbList from an ordered list of { name, path } crumbs (path relative to the site root).
export function breadcrumbLd(crumbs: { name: string; path: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

// A Q&A / discussion thread → schema.org QAPage when it's a question with an accepted answer,
// otherwise DiscussionForumPosting. Models the question, the AI answer + human replies, the author,
// upvotes (interactionStatistic), and an accepted answer when one exists.
export function threadLd(thread: {
  id: string;
  kind: string;
  title: string;
  body: string;
  author: string;
  upvotes: number;
  aiAnswer: { text: string; model: string } | null;
  replies: { author: string; body: string; isAccepted?: boolean }[];
}): JsonLdNode {
  const url = `${SITE_URL}/t/${thread.id}`;

  const answerNodes: JsonLdNode[] = [];
  if (thread.aiAnswer) {
    answerNodes.push({
      "@type": "Answer",
      text: thread.aiAnswer.text,
      author: { "@type": "Organization", name: `Swarm AI (${thread.aiAnswer.model})` },
    });
  }
  for (const r of thread.replies) {
    answerNodes.push({
      "@type": "Answer",
      text: r.body,
      author: { "@type": "Person", name: r.author },
    });
  }

  const accepted = thread.replies.find((r) => r.isAccepted);
  const upvoteStat: JsonLdNode = {
    "@type": "InteractionCounter",
    interactionType: "https://schema.org/LikeAction",
    userInteractionCount: thread.upvotes,
  };

  // A "question" thread maps cleanly to QAPage; discussion/show map to DiscussionForumPosting.
  if (thread.kind === "question") {
    const mainEntity: JsonLdNode = {
      "@type": "Question",
      name: thread.title,
      text: thread.body,
      answerCount: answerNodes.length,
      author: { "@type": "Person", name: thread.author },
      interactionStatistic: upvoteStat,
    };
    if (accepted) {
      mainEntity.acceptedAnswer = {
        "@type": "Answer",
        text: accepted.body,
        author: { "@type": "Person", name: accepted.author },
      };
    }
    const suggested = answerNodes.filter(
      (a) => !(accepted && a.text === accepted.body),
    );
    if (suggested.length > 0) mainEntity.suggestedAnswer = suggested;

    return {
      "@context": "https://schema.org",
      "@type": "QAPage",
      url,
      mainEntity,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    url,
    headline: thread.title,
    articleBody: thread.body,
    author: { "@type": "Person", name: thread.author },
    interactionStatistic: upvoteStat,
    comment: answerNodes.map((a) => ({
      "@type": "Comment",
      text: a.text,
      author: a.author,
    })),
  };
}

// A learn topic → TechArticle.
export function learnArticleLd(topic: {
  id: string;
  title: string;
  summary: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: topic.title,
    description: topic.summary,
    url: `${SITE_URL}/learn/${topic.id}`,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

// A tag landing page → CollectionPage wrapping an ItemList of the matching items
// (threads + reads). Each item links to its on-site page (/t/<id>) or external read URL.
export function tagCollectionLd(tag: string, items: { url: string; name: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag} — agent-builder threads & reads`,
    url: `${SITE_URL}/tag/${tag}`,
    description: `Threads and curated reads tagged #${tag} on ${SITE_NAME}.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: it.url,
        name: it.name,
      })),
    },
  };
}

// The /news feed → ItemList of the curated links.
export function newsItemListLd(links: { url: string; title: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Swarm — agent-building reads",
    itemListElement: links.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: l.url,
      name: l.title,
    })),
  };
}
