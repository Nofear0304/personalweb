import {
  articles as generatedArticles,
  articleHtmlContents,
} from "@/data/generated";
import { storeGetLikes } from "@/lib/store";
import type { Article, ArticleMeta } from "@/types";

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 300;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const articles = await Promise.all(
    generatedArticles.map(async (a) => {
      const dynamicLikes = await storeGetLikes("article", a.slug);
      return {
        ...a,
        likes: (a.likes ?? 0) + dynamicLikes,
      };
    })
  );
  return articles;
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  const tags = new Set<string>();
  articles.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export async function getArticlesByTag(tag: string): Promise<ArticleMeta[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.tags?.includes(tag));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const meta = generatedArticles.find((a) => a.slug === slug);
  if (!meta) return null;

  // Use pre-generated HTML content if available
  let htmlContent: string;
  if (articleHtmlContents[slug]) {
    htmlContent = articleHtmlContents[slug];
  } else {
    // Fallback: convert raw markdown (for content added at runtime)
    // Dynamic import to avoid loading ESM packages on Cloudflare Workers
    const [{ remark }, { default: remarkHtml }, { articleRawContents }] = await Promise.all([
      import("remark"),
      import("remark-html"),
      import("@/data/generated"),
    ]);
    const rawMd = articleRawContents[slug];
    if (!rawMd) return null;
    const processed = await remark().use(remarkHtml).process(rawMd);
    htmlContent = processed.toString();
  }

  const dynamicLikes = await storeGetLikes("article", slug);
  const articleMeta = generatedArticles.find((a) => a.slug === slug)!;

  return {
    slug,
    title: articleMeta.title,
    date: articleMeta.date,
    description: articleMeta.description,
    coverImage: articleMeta.coverImage,
    tags: articleMeta.tags,
    content: htmlContent,
    readingTime: articleMeta.readingTime,
    category: articleMeta.category,
    likes: (articleMeta.likes ?? 0) + dynamicLikes,
  };
}

export async function getAdjacentArticles(slug: string): Promise<{
  prev: ArticleMeta | null;
  next: ArticleMeta | null;
}> {
  const articles = await getAllArticles();
  const index = articles.findIndex((a) => a.slug === slug);
  return {
    prev: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  };
}

// Note: createArticle and deleteArticle are admin-only functions
// that require filesystem access. On Cloudflare Workers, these won't work.
// For a serverless deployment, content management should use a database or
// file storage service like Cloudflare R2.
// These functions are kept for VPS-based deployments.
export function createArticle(
  _filename: string,
  _content: string
): { success: boolean; slug?: string; error?: string } {
  return {
    success: false,
    error: "Content creation is not supported in serverless mode. Please add .md files to content/articles/ and redeploy.",
  };
}

export function deleteArticle(
  _slug: string
): { success: boolean; error?: string } {
  return {
    success: false,
    error: "Content deletion is not supported in serverless mode. Please remove the .md file from content/articles/ and redeploy.",
  };
}
