import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { JourneyNode, JourneyNodeMeta, JourneyEvent } from "@/types";

const JOURNEY_DIR = path.join(process.cwd(), "content/journey");

export function getAllJourneyNodes(): JourneyNodeMeta[] {
  if (!fs.existsSync(JOURNEY_DIR)) return [];

  const filenames = fs.readdirSync(JOURNEY_DIR);
  const nodes = filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(JOURNEY_DIR, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(content);

      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        period: data.period || "",
        coverImage: data.coverImage || undefined,
        summary: data.summary || "",
        phase: data.phase || "",
        tags: data.tags || [],
        order: data.order ?? 999,
      } as JourneyNodeMeta;
    })
    .sort((a, b) => a.order - b.order);

  return nodes;
}

export async function getJourneyNodeBySlug(
  slug: string
): Promise<JourneyNode | null> {
  const filePath = path.join(JOURNEY_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content: mdContent } = matter(fileContent);

  const processed = await remark().use(remarkHtml).process(mdContent);
  const htmlContent = processed.toString();

  return {
    slug,
    title: data.title || "Untitled",
    period: data.period || "",
    coverImage: data.coverImage || undefined,
    summary: data.summary || "",
    phase: data.phase || "",
    tags: data.tags || [],
    events: (data.events || []) as JourneyEvent[],
    photos: (data.photos || []) as string[],
    insight: data.insight || "",
    conclusion: data.conclusion || "",
    order: data.order || 999,
    content: htmlContent,
  };
}

export function createJourneyNode(
  filename: string,
  content: string
): { success: boolean; slug?: string; error?: string } {
  try {
    if (!filename.endsWith(".md")) filename = `${filename}.md`;
    const safeFilename = filename.replace(/[^a-zA-Z0-9一-鿿\-_\.]/g, "-");

    try {
      matter(content);
    } catch {
      return { success: false, error: "Invalid markdown content" };
    }

    if (!fs.existsSync(JOURNEY_DIR)) {
      fs.mkdirSync(JOURNEY_DIR, { recursive: true });
    }

    fs.writeFileSync(path.join(JOURNEY_DIR, safeFilename), content, "utf-8");
    return { success: true, slug: safeFilename.replace(/\.md$/, "") };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create node",
    };
  }
}

export function deleteJourneyNode(
  slug: string
): { success: boolean; error?: string } {
  try {
    const safeSlug = slug.replace(/[^a-zA-Z0-9一-鿿\-_]/g, "");
    const filePath = path.join(JOURNEY_DIR, `${safeSlug}.md`);
    if (!fs.existsSync(filePath))
      return { success: false, error: "Node not found" };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete node",
    };
  }
}
