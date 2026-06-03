import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getLikes } from "@/lib/likes";
import type { Note, NoteMeta } from "@/types";

const NOTES_DIR = path.join(process.cwd(), "content/notes");

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 300;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

export function getAllNotes(): NoteMeta[] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  const filenames = fs.readdirSync(NOTES_DIR);

  const notes = filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(NOTES_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const slug = filename.replace(/\.md$/, "");
      const frontmatterLikes = data.likes ?? 0;
      const dynamicLikes = getLikes("note", slug);

      return {
        slug,
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        description: data.description || "",
        tags: data.tags || [],
        readingTime: estimateReadingTime(content),
        likes: frontmatterLikes + dynamicLikes,
      } as NoteMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return notes;
}

export function getAllNoteTags(): string[] {
  const notes = getAllNotes();
  const tags = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getNotesByTag(tag: string): NoteMeta[] {
  return getAllNotes().filter((n) => n.tags.includes(tag));
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const filePath = path.join(NOTES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const processed = await remark().use(remarkHtml).process(content);
  const htmlContent = processed.toString();

  const frontmatterLikes = data.likes ?? 0;
  const dynamicLikes = getLikes("note", slug);

  return {
    slug,
    title: data.title || "Untitled",
    date: data.date || new Date().toISOString().split("T")[0],
    description: data.description || "",
    tags: data.tags || [],
    readingTime: estimateReadingTime(content),
    likes: frontmatterLikes + dynamicLikes,
    content: htmlContent,
  };
}

export function getAdjacentNotes(slug: string): {
  prev: NoteMeta | null;
  next: NoteMeta | null;
} {
  const notes = getAllNotes();
  const index = notes.findIndex((n) => n.slug === slug);
  return {
    prev: index > 0 ? notes[index - 1] : null,
    next: index < notes.length - 1 ? notes[index + 1] : null,
  };
}
