import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { GardenNote, GardenNoteMeta } from "@/types";

const GARDEN_DIR = path.join(process.cwd(), "content/garden");

export function getAllGardenNotes(): GardenNoteMeta[] {
  if (!fs.existsSync(GARDEN_DIR)) return [];

  const filenames = fs.readdirSync(GARDEN_DIR);
  const notes = filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(GARDEN_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content: mdContent } = matter(fileContent);

      // Extract excerpt: first non-empty, non-heading paragraph (max 150 chars)
      const excerpt =
        data.excerpt ||
        mdContent
          .split("\n")
          .filter(
            (line: string) =>
              line.trim() && !line.startsWith("#") && !line.startsWith("---")
          )
          .slice(0, 2)
          .join(" ")
          .replace(/[#*`\[\]()>|~_-]/g, "")
          .trim()
          .slice(0, 150) ||
        undefined;

      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        updated: data.updated || data.date || new Date().toISOString().split("T")[0],
        tags: data.tags || [],
        links: data.links || [],
        status: data.status || "seedling",
        excerpt,
        likes: data.likes,
      } as GardenNoteMeta;
    })
    .sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

  return notes;
}

export function findBacklinks(slug: string): GardenNoteMeta[] {
  const allNotes = getAllGardenNotes();
  return allNotes.filter((note) => note.links.includes(slug));
}

export async function getGardenNoteBySlug(
  slug: string
): Promise<GardenNote | null> {
  const filePath = path.join(GARDEN_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content: mdContent } = matter(fileContent);

  const processed = await remark().use(remarkHtml).process(mdContent);
  const htmlContent = processed.toString();

  return {
    slug,
    title: data.title || "Untitled",
    date: data.date || new Date().toISOString().split("T")[0],
    updated: data.updated || data.date || new Date().toISOString().split("T")[0],
    tags: data.tags || [],
    links: data.links || [],
    status: data.status || "seedling",
    content: htmlContent,
    backlinks: findBacklinks(slug),
  };
}

export function createGardenNote(
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

    if (!fs.existsSync(GARDEN_DIR)) {
      fs.mkdirSync(GARDEN_DIR, { recursive: true });
    }

    fs.writeFileSync(path.join(GARDEN_DIR, safeFilename), content, "utf-8");
    return { success: true, slug: safeFilename.replace(/\.md$/, "") };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create note",
    };
  }
}

export function deleteGardenNote(
  slug: string
): { success: boolean; error?: string } {
  try {
    const safeSlug = slug.replace(/[^a-zA-Z0-9一-鿿\-_]/g, "");
    const filePath = path.join(GARDEN_DIR, `${safeSlug}.md`);
    if (!fs.existsSync(filePath))
      return { success: false, error: "Note not found" };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}
