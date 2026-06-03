import {
  gardenNotes as generatedGardenNotes,
  gardenNoteHtmlContents,
} from "@/data/generated";
import type { GardenNote, GardenNoteMeta } from "@/types";

export function getAllGardenNotes(): GardenNoteMeta[] {
  return generatedGardenNotes;
}

export function findBacklinks(slug: string): GardenNoteMeta[] {
  return generatedGardenNotes.filter((note) => note.links.includes(slug));
}

export async function getGardenNoteBySlug(
  slug: string
): Promise<GardenNote | null> {
  const meta = generatedGardenNotes.find((n) => n.slug === slug);
  if (!meta) return null;

  // Use pre-generated HTML content if available
  let htmlContent: string;
  if (gardenNoteHtmlContents[slug]) {
    htmlContent = gardenNoteHtmlContents[slug];
  } else {
    // Dynamic import to avoid loading ESM packages on Cloudflare Workers
    const [{ remark }, { default: remarkHtml }, { gardenNoteRawContents }] = await Promise.all([
      import("remark"),
      import("remark-html"),
      import("@/data/generated"),
    ]);
    const rawMd = gardenNoteRawContents[slug];
    if (!rawMd) return null;
    const processed = await remark().use(remarkHtml).process(rawMd);
    htmlContent = processed.toString();
  }

  return {
    slug,
    title: meta.title,
    date: meta.date,
    updated: meta.updated,
    tags: meta.tags,
    links: meta.links,
    status: meta.status,
    content: htmlContent,
    backlinks: findBacklinks(slug),
  };
}

// Admin write operations not supported in serverless mode
export function createGardenNote(
  _filename: string,
  _content: string
): { success: boolean; slug?: string; error?: string } {
  return {
    success: false,
    error: "Content creation is not supported in serverless mode. Please add .md files to content/garden/ and redeploy.",
  };
}

export function deleteGardenNote(
  _slug: string
): { success: boolean; error?: string } {
  return {
    success: false,
    error: "Content deletion is not supported in serverless mode. Please remove the .md file from content/garden/ and redeploy.",
  };
}
