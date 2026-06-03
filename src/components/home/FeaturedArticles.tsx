"use client";

import { useState, useMemo } from "react";
import type { ArticleMeta } from "@/types";
import ArticleCard from "@/components/articles/ArticleCard";
import FadeIn from "@/components/ui/FadeIn";
import CategoryTabs, { type Category } from "./CategoryTabs";

interface FeaturedArticlesProps {
  articles: ArticleMeta[];
}

const CATEGORIES: Category[] = [
  { key: "all", label: "全部" },
  { key: "技术", label: "技术" },
  { key: "感悟", label: "感悟" },
  { key: "美文分享", label: "美文分享" },
];

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return articles;
    return articles.filter((a) => a.category === activeCategory || a.tags?.includes(activeCategory));
  }, [articles, activeCategory]);

  if (articles.length === 0) {
    return (
      <section id="articles" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">文字与思考</h2>
          <p className="text-[var(--muted)]">文章即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="articles" className="max-w-6xl mx-auto px-5 py-24 sm:py-32">
      {/* Section Header */}
      <FadeIn>
        <div className="mb-12">
          <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
            Articles
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            文字与思考
          </h2>
          <p className="text-[var(--muted)] max-w-lg text-lg leading-relaxed">
            用文字记录技术探索与人生感悟，在书写中沉淀思考
          </p>
        </div>
      </FadeIn>

      {/* Category Tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        activeKey={activeCategory}
        onChange={setActiveCategory}
        className="mb-10"
      />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => (
            <FadeIn key={article.slug} delay={index * 0.08}>
              <ArticleCard article={article} />
            </FadeIn>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-[var(--muted)] text-lg">该分类暂无文章</p>
          </div>
        )}
      </div>

      {/* View all link */}
      {articles.length > filteredArticles.length && (
        <div className="text-center mt-12">
          <a
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            查看全部文章
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </section>
  );
}
