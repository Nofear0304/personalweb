import {
  journeyNodes as generatedJourneyNodes,
  journeyNodeHtmlContents,
} from "@/data/generated";
import type { JourneyNode, JourneyNodeMeta, JourneyEvent } from "@/types";

export function getAllJourneyNodes(): JourneyNodeMeta[] {
  return generatedJourneyNodes;
}

export async function getJourneyNodeBySlug(
  slug: string
): Promise<JourneyNode | null> {
  const meta = generatedJourneyNodes.find((n) => n.slug === slug);
  if (!meta) return null;

  // Use pre-generated HTML content if available
  let htmlContent: string;
  if (journeyNodeHtmlContents[slug]) {
    htmlContent = journeyNodeHtmlContents[slug];
  } else {
    // Dynamic import to avoid loading ESM packages on Cloudflare Workers
    const [{ remark }, { default: remarkHtml }, { journeyNodeRawContents }] = await Promise.all([
      import("remark"),
      import("remark-html"),
      import("@/data/generated"),
    ]);
    const rawMd = journeyNodeRawContents[slug];
    if (!rawMd) return null;
    const processed = await remark().use(remarkHtml).process(rawMd);
    htmlContent = processed.toString();
  }

  return {
    slug,
    title: meta.title,
    period: meta.period,
    coverImage: meta.coverImage,
    summary: meta.summary,
    phase: meta.phase,
    tags: meta.tags,
    events: [] as JourneyEvent[],
    photos: [] as string[],
    insight: "",
    conclusion: "",
    order: meta.order,
    content: htmlContent,
  };
}

// Admin write operations not supported in serverless mode
export function createJourneyNode(
  _filename: string,
  _content: string
): { success: boolean; slug?: string; error?: string } {
  return {
    success: false,
    error: "Content creation is not supported in serverless mode. Please add .md files to content/journey/ and redeploy.",
  };
}

export function deleteJourneyNode(
  _slug: string
): { success: boolean; error?: string } {
  return {
    success: false,
    error: "Content deletion is not supported in serverless mode. Please remove the .md file from content/journey/ and redeploy.",
  };
}
