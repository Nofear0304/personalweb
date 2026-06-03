import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getLikes } from "@/lib/likes";
import type { Article, ArticleMeta } from "@/types";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 300; // Chinese chars per minute
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  const filenames = fs.readdirSync(ARTICLES_DIR);

  const articles = filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(ARTICLES_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const slug = filename.replace(/\.md$/, "");
      const frontmatterLikes = data.likes ?? 0;
      const dynamicLikes = getLikes("article", slug);

      return {
        slug,
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        description: data.description || "",
        coverImage: data.coverImage || undefined,
        tags: data.tags || [],
        readingTime: estimateReadingTime(content),
        category: data.category || undefined,
        likes: frontmatterLikes + dynamicLikes,
      } as ArticleMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tags = new Set<string>();
  articles.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getArticlesByTag(tag: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.tags?.includes(tag));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const processedContent = await remark().use(remarkHtml).process(content);
  const htmlContent = processedContent.toString();

  const frontmatterLikes = data.likes ?? 0;
  const dynamicLikes = getLikes("article", slug);

  return {
    slug,
    title: data.title || "Untitled",
    date: data.date || new Date().toISOString().split("T")[0],
    description: data.description || "",
    coverImage: data.coverImage || undefined,
    tags: data.tags || [],
    content: htmlContent,
    readingTime: estimateReadingTime(content),
    category: data.category || undefined,
    likes: frontmatterLikes + dynamicLikes,
  };
}

export function getAdjacentArticles(slug: string): {
  prev: ArticleMeta | null;
  next: ArticleMeta | null;
} {
  const articles = getAllArticles();
  const index = articles.findIndex((a) => a.slug === slug);
  return {
    prev: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export function createArticle(
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

    if (!fs.existsSync(ARTICLES_DIR)) {
      fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    }

    fs.writeFileSync(path.join(ARTICLES_DIR, safeFilename), content, "utf-8");
    return { success: true, slug: safeFilename.replace(/\.md$/, "") };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create article",
    };
  }
}

export function deleteArticle(slug: string): { success: boolean; error?: string } {
  try {
    const safeSlug = slug.replace(/[^a-zA-Z0-9一-鿿\-_]/g, "");
    const filePath = path.join(ARTICLES_DIR, `${safeSlug}.md`);
    if (!fs.existsSync(filePath)) return { success: false, error: "Article not found" };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete article",
    };
  }
}
