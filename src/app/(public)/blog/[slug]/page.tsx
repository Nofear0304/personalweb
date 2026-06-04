import { notFound } from "next/navigation";
import Image from "next/image";
import { getArticleBySlug, getAllArticles, getAdjacentArticles } from "@/lib/articles";
import FadeIn from "@/components/ui/FadeIn";
import Badge from "@/components/ui/Badge";
import ReadingTime from "@/components/blog/ReadingTime";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import LikeButton from "@/components/ui/LikeButton";
import CommentSection from "@/components/comments/CommentSection";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const { prev, next } = await getAdjacentArticles(slug);

  return (
    <CosmicWrapper>
      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <div className="flex gap-10">
          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <FadeIn>
              <a
                href="/blog"
                className="inline-flex items-center text-sm text-white/50 hover:text-[var(--accent)] transition-colors mb-8"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回文章列表
              </a>

              <header className="mb-10">
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                      <a key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                        <Badge>{tag}</Badge>
                      </a>
                    ))}
                  </div>
                )}

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
                  {article.title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-white/50">
                  <time>
                    {new Date(article.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {article.readingTime && <ReadingTime minutes={article.readingTime} />}
                  <LikeButton type="article" slug={article.slug} initialLikes={article.likes ?? 0} />
                </div>
              </header>
            </FadeIn>

            {article.coverImage && (
              <FadeIn>
                <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-white/[0.04] mb-12">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    width={1200}
                    height={514}
                    className="w-full h-full object-cover"
                  />
                </div>
              </FadeIn>
            )}

            <FadeIn>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </FadeIn>

            {/* Share + Tags footer */}
            <FadeIn>
              <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <ShareButtons
                  title={article.title}
                  url={`/blog/${encodeURIComponent(article.slug)}`}
                />
                {article.tags && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <a key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                        <Badge>{tag}</Badge>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Comments */}
            <CommentSection slug={article.slug} />

            {/* Prev / Next navigation */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev ? (
                <a
                  href={`/blog/${encodeURIComponent(prev.slug)}`}
                  className="group p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md hover:border-[var(--accent)] transition-colors"
                >
                  <span className="text-xs text-white/40">← 上一篇</span>
                  <p className="font-medium mt-1 text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {prev.title}
                  </p>
                </a>
              ) : (
                <div />
              )}
              {next && (
                <a
                  href={`/blog/${encodeURIComponent(next.slug)}`}
                  className="group p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md hover:border-[var(--accent)] transition-colors text-right"
                >
                  <span className="text-xs text-white/40">下一篇 →</span>
                  <p className="font-medium mt-1 text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {next.title}
                  </p>
                </a>
              )}
            </div>
          </article>

          {/* TOC sidebar */}
          <TableOfContents />
        </div>
      </div>
    </CosmicWrapper>
  );
}
