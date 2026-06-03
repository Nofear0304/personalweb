"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ArticleMeta } from "@/types";
import FadeIn from "@/components/ui/FadeIn";

interface LatestBlogProps {
  articles: ArticleMeta[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function LatestBlog({ articles }: LatestBlogProps) {
  const latestArticles = articles.slice(0, 3);

  if (latestArticles.length === 0) {
    return (
      <section id="blog" className="max-w-[1400px] mx-auto px-5 py-[120px]">
        <div className="text-center">
          <h2 className="font-serif text-[56px] font-bold mb-4">最新博客</h2>
          <p className="text-white/60 text-lg">文章即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="max-w-[1400px] mx-auto px-5 py-[120px]">
      {/* Section Header */}
      <FadeIn>
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
            Latest Blog
          </p>
          <h2 className="font-serif text-[56px] font-bold text-white leading-tight">
            最新博客
          </h2>
          <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
            用文字记录技术探索与人生感悟，在书写中沉淀思考
          </p>
        </div>
      </FadeIn>

      {/* Blog Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {latestArticles.map((article) => (
          <motion.div key={article.slug} variants={cardVariants}>
            <Link href={`/blog/${article.slug}`}>
              <article
                className="group relative rounded-[20px] overflow-hidden h-full flex flex-col transition-all duration-500 ease-out"
                style={{
                  background: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "0 0 30px rgba(96,165,250,0.3)",
                  }}
                />

                {/* Cover Image */}
                {article.coverImage ? (
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Gradient overlay at bottom of image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.9)] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[16/9] relative overflow-hidden bg-white/[0.03] flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white/10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 relative z-10">
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors duration-300">
                    {article.title}
                  </h3>

                  {/* Description */}
                  {article.description && (
                    <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2 flex-1">
                      {article.description}
                    </p>
                  )}

                  {/* Meta: date + views */}
                  <div className="flex items-center justify-between text-xs text-white/40 mt-auto pt-4 border-t border-white/[0.06]">
                    <time>
                      {new Date(article.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {article.views ?? Math.floor(Math.random() * 500) + 50} 阅读
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* View all link */}
      <FadeIn delay={0.3}>
        <div className="text-center mt-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group/link"
          >
            查看全部文章
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
