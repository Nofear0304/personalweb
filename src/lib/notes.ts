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

export async function getAllNotes(): Promise<NoteMeta[]> {
  const notes = await Promise.all(
    generatedNotes.map(async (n) => {
      const dynamicLikes = await storeGetLikes("note", n.slug);
      return {
        ...n,
        likes: (n.likes ?? 0) + dynamicLikes,
      };
    })
  );
  return notes;
}

export async function getAllNoteTags(): Promise<string[]> {
  const notes = await getAllNotes();
  const tags = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export async function getNotesByTag(tag: string): Promise<NoteMeta[]> {
  const notes = await getAllNotes();
  return notes.filter((n) => n.tags.includes(tag));
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

  const dynamicLikes = await storeGetLikes("note", slug);

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

export async function getAdjacentNotes(slug: string): Promise<{
  prev: NoteMeta | null;
  next: NoteMeta | null;
}> {
  const notes = await getAllNotes();
  const index = notes.findIndex((n) => n.slug === slug);
  return {
    prev: index > 0 ? notes[index - 1] : null,
    next: index < notes.length - 1 ? notes[index + 1] : null,
  };
}
