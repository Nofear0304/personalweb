import {
  notes as generatedNotes,
  noteHtmlContents,
} from "@/data/generated";
import { storeGetLikes } from "@/lib/store";
import type { Note, NoteMeta } from "@/types";

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 300;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

export function getAllNotes(): NoteMeta[] {
  return generatedNotes.map((n) => {
    const dynamicLikes = storeGetLikes("note", n.slug);
    return {
      ...n,
      likes: (n.likes ?? 0) + dynamicLikes,
    };
  });
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
  const meta = generatedNotes.find((n) => n.slug === slug);
  if (!meta) return null;

  // Use pre-generated HTML content if available
  let htmlContent: string;
  if (noteHtmlContents[slug]) {
    htmlContent = noteHtmlContents[slug];
  } else {
    // Dynamic import to avoid loading ESM packages on Cloudflare Workers
    const [{ remark }, { default: remarkHtml }, { noteRawContents }] = await Promise.all([
      import("remark"),
      import("remark-html"),
      import("@/data/generated"),
    ]);
    const rawMd = noteRawContents[slug];
    if (!rawMd) return null;
    const processed = await remark().use(remarkHtml).process(rawMd);
    htmlContent = processed.toString();
  }

  const dynamicLikes = storeGetLikes("note", slug);

  return {
    slug,
    title: meta.title,
    date: meta.date,
    description: meta.description,
    tags: meta.tags,
    readingTime: meta.readingTime,
    likes: (meta.likes ?? 0) + dynamicLikes,
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
