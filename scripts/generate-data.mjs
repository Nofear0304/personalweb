/**
 * Build-time data generation script.
 * Reads all content files and generates src/data/generated.ts with
 * all data inlined, so no runtime `fs` calls are needed.
 *
 * Run: node scripts/generate-data.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CONTENT_DIR = path.join(ROOT, "content");
const DATA_DIR = path.join(ROOT, "data");
const GALLERY_DIR = path.join(ROOT, "public", "images", "gallery");
const OUTPUT_FILE = path.join(ROOT, "src", "data", "generated.ts");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

function readJsonSafe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function estimateReadingTime(text) {
  const wordsPerMinute = 300;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

async function mdToHtml(mdContent) {
  const processed = await remark().use(remarkHtml).process(mdContent);
  return processed.toString();
}

function scanMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push({
        filename: entry.name,
        filePath: path.join(dir, entry.name),
      });
    }
  }
  return results;
}

function scanImageDir(dir, category) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subCategory = CATEGORY_MAP[entry.name] || entry.name;
      results.push(...scanImageDir(fullPath, subCategory));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;
      const stats = fs.statSync(fullPath);
      const relativePath = path.relative(GALLERY_DIR, fullPath);
      const url = `/images/gallery/${relativePath.replace(/\\/g, "/")}`;
      results.push({
        filename: entry.name,
        url,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString(),
        category,
      });
    }
  }
  return results;
}

const CATEGORY_MAP = {
  campus: "校园",
  travel: "旅行",
  life: "生活",
  photography: "摄影",
};

const ALBUM_DEFS = [
  { slug: "campus", title: "学校", description: "校园生活的点滴记录" },
  { slug: "travel", title: "旅行", description: "旅途中的风景与故事" },
  { slug: "photography", title: "摄影", description: "精心拍摄的摄影作品" },
];

function findCoverImage(albumSlug) {
  const albumDir = path.join(GALLERY_DIR, albumSlug);
  if (!fs.existsSync(albumDir)) return "/images/gallery/sample.svg";

  const coverPath = path.join(albumDir, "cover.jpg");
  if (fs.existsSync(coverPath)) return `/images/gallery/${albumSlug}/cover.jpg`;

  const entries = fs.readdirSync(albumDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      return `/images/gallery/${albumSlug}/${entry.name}`;
    }
  }
  return "/images/gallery/sample.svg";
}

function countImagesInDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countImagesInDir(path.join(dir, entry.name));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      count++;
    }
  }
  return count;
}

function extractExcerpt(mdContent) {
  return (
    mdContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#") && !line.startsWith("---"))
      .slice(0, 2)
      .join(" ")
      .replace(/[#*`\[\]()>|~_-]/g, "")
      .trim()
      .slice(0, 150) || undefined
  );
}

// ─── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log("Generating content data...");

  // --- Articles ---
  const articlesDir = path.join(CONTENT_DIR, "articles");
  const articleFiles = scanMarkdownFiles(articlesDir);
  const articles = [];
  const articleContents = {};
  const articleHtmlContents = {};

  for (const { filename, filePath } of articleFiles) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const slug = filename.replace(/\.md$/, "");
    const htmlContent = await mdToHtml(content);

    articles.push({
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      description: data.description || "",
      coverImage: data.coverImage || undefined,
      tags: data.tags || [],
      readingTime: estimateReadingTime(content),
      category: data.category || undefined,
      likes: data.likes ?? 0,
    });
    articleContents[slug] = content;
    articleHtmlContents[slug] = htmlContent;
  }
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- Notes ---
  const notesDir = path.join(CONTENT_DIR, "notes");
  const noteFiles = scanMarkdownFiles(notesDir);
  const notes = [];
  const noteContents = {};
  const noteHtmlContents = {};

  for (const { filename, filePath } of noteFiles) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const slug = filename.replace(/\.md$/, "");
    const htmlContent = await mdToHtml(content);

    notes.push({
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      description: data.description || "",
      tags: data.tags || [],
      readingTime: estimateReadingTime(content),
      likes: data.likes ?? 0,
    });
    noteContents[slug] = content;
    noteHtmlContents[slug] = htmlContent;
  }
  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- Garden ---
  const gardenDir = path.join(CONTENT_DIR, "garden");
  const gardenFiles = scanMarkdownFiles(gardenDir);
  const gardenNotes = [];
  const gardenNoteContents = {};
  const gardenNoteHtmlContents = {};

  for (const { filename, filePath } of gardenFiles) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content: mdContent } = matter(fileContent);
    const slug = filename.replace(/\.md$/, "");
    const htmlContent = await mdToHtml(mdContent);

    const excerpt =
      data.excerpt ||
      extractExcerpt(mdContent);

    gardenNotes.push({
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      updated: data.updated || data.date || new Date().toISOString().split("T")[0],
      tags: data.tags || [],
      links: data.links || [],
      status: data.status || "seedling",
      excerpt,
      likes: data.likes,
    });
    gardenNoteContents[slug] = mdContent;
    gardenNoteHtmlContents[slug] = htmlContent;
  }
  gardenNotes.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

  // --- Journey ---
  const journeyDir = path.join(CONTENT_DIR, "journey");
  const journeyFiles = scanMarkdownFiles(journeyDir);
  const journeyNodes = [];
  const journeyNodeContents = {};
  const journeyNodeHtmlContents = {};

  for (const { filename, filePath } of journeyFiles) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content: mdContent } = matter(fileContent);
    const slug = filename.replace(/\.md$/, "");
    const htmlContent = await mdToHtml(mdContent);

    journeyNodes.push({
      slug,
      title: data.title || "Untitled",
      period: data.period || "",
      coverImage: data.coverImage || undefined,
      summary: data.summary || "",
      phase: data.phase || "",
      tags: data.tags || [],
      order: data.order ?? 999,
    });
    journeyNodeContents[slug] = mdContent;
    journeyNodeHtmlContents[slug] = htmlContent;
  }
  journeyNodes.sort((a, b) => a.order - b.order);

  // --- Gallery / Albums ---
  const albums = ALBUM_DEFS.map((def) => ({
    slug: def.slug,
    title: def.title,
    description: def.description,
    coverImage: findCoverImage(def.slug),
    imageCount: countImagesInDir(path.join(GALLERY_DIR, def.slug)),
  }));

  // --- Images ---
  const allImages = scanImageDir(GALLERY_DIR, undefined);
  allImages.sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());

  // --- Data files ---
  const friends = readJsonSafe(path.join(DATA_DIR, "friends.json"), []);
  const likesData = readJsonSafe(path.join(DATA_DIR, "likes.json"), { articles: {}, notes: {} });
  const commentsData = readJsonSafe(path.join(DATA_DIR, "comments.json"), []);
  const messagesData = readJsonSafe(path.join(DATA_DIR, "messages.json"), []);
  const visitsData = readJsonSafe(path.join(DATA_DIR, "visits.json"), { count: 0, daily: {} });

  // --- Write output ---
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const serialized = `// Auto-generated by scripts/generate-data.mjs — DO NOT EDIT
// Generated at: ${new Date().toISOString()}

import type { ArticleMeta, NoteMeta, GardenNoteMeta, JourneyNodeMeta, Album, ImageInfo, Friend, ContentComment, GuestbookMessage } from "@/types";

// ─── Articles ───────────────────────────────────────────────────────
export const articles: ArticleMeta[] = ${JSON.stringify(articles, null, 2)};

export const articleRawContents: Record<string, string> = ${JSON.stringify(articleContents, null, 2)};

export const articleHtmlContents: Record<string, string> = ${JSON.stringify(articleHtmlContents, null, 2)};

// ─── Notes ─────────────────────────────────────────────────────────
export const notes: NoteMeta[] = ${JSON.stringify(notes, null, 2)};

export const noteRawContents: Record<string, string> = ${JSON.stringify(noteContents, null, 2)};

export const noteHtmlContents: Record<string, string> = ${JSON.stringify(noteHtmlContents, null, 2)};

// ─── Garden ────────────────────────────────────────────────────────
export const gardenNotes: GardenNoteMeta[] = ${JSON.stringify(gardenNotes, null, 2)};

export const gardenNoteRawContents: Record<string, string> = ${JSON.stringify(gardenNoteContents, null, 2)};

export const gardenNoteHtmlContents: Record<string, string> = ${JSON.stringify(gardenNoteHtmlContents, null, 2)};

// ─── Journey ───────────────────────────────────────────────────────
export const journeyNodes: JourneyNodeMeta[] = ${JSON.stringify(journeyNodes, null, 2)};

export const journeyNodeRawContents: Record<string, string> = ${JSON.stringify(journeyNodeContents, null, 2)};

export const journeyNodeHtmlContents: Record<string, string> = ${JSON.stringify(journeyNodeHtmlContents, null, 2)};

// ─── Gallery / Albums ──────────────────────────────────────────────
export const albums: Album[] = ${JSON.stringify(albums, null, 2)};

export const allImages: ImageInfo[] = ${JSON.stringify(allImages, null, 2)};

// ─── Data Files ────────────────────────────────────────────────────
export const friends: Friend[] = ${JSON.stringify(friends, null, 2)};

export const initialLikesData: { articles: Record<string, number>; notes: Record<string, number> } = ${JSON.stringify(likesData, null, 2)};

export const initialCommentsData: ContentComment[] = ${JSON.stringify(commentsData, null, 2)};

export const initialMessagesData: GuestbookMessage[] = ${JSON.stringify(messagesData, null, 2)};

export const initialVisitsData: { count: number; daily: Record<string, number> } = ${JSON.stringify(visitsData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, serialized, "utf-8");
  console.log(`✓ Generated ${OUTPUT_FILE}`);
  console.log(`  Articles: ${articles.length}`);
  console.log(`  Notes: ${notes.length}`);
  console.log(`  Garden notes: ${gardenNotes.length}`);
  console.log(`  Journey nodes: ${journeyNodes.length}`);
  console.log(`  Albums: ${albums.length}`);
  console.log(`  Images: ${allImages.length}`);
  console.log(`  Friends: ${friends.length}`);
}

main().catch((err) => {
  console.error("Error generating data:", err);
  process.exit(1);
});
