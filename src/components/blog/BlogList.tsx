"use client";

import { useState, useMemo, useCallback } from "react";
import type { ArticleMeta } from "@/types";
import ArticleCard from "@/components/articles/ArticleCard";
import SearchBar from "@/components/blog/SearchBar";
import FadeIn from "@/components/ui/FadeIn";
import Pagination from "@/components/ui/Pagination";

interface BlogListProps {
  articles: ArticleMeta[];
}

const ITEMS_PER_PAGE = 9;

export default function BlogList({ articles }: BlogListProps) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTags.size > 0) {
      result = result.filter((a) => a.tags?.some((t) => selectedTags.has(t)));
    }

    return result;
  }, [articles, query, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleTag = useCallback(
    (tag: string) => {
      setSelectedTags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) {
          next.delete(tag);
        } else {
          next.add(tag);
        }
        return next;
      });
      setCurrentPage(1);
    },
    []
  );

  const clearTags = useCallback(() => {
    setSelectedTags(new Set());
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <div className="mb-10 space-y-4">
        <SearchBar onSearch={handleSearch} placeholder="搜索文章标题、描述、标签..." />

        {/* Multi-select tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                  selectedTags.has(tag)
                    ? "bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                    : "bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={clearTags}
                className="text-xs text-white/30 hover:text-white/60 transition-colors px-2"
              >
                清除筛选
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <p className="text-xs text-white/30">
          {selectedTags.size > 0 || query
            ? `找到 ${filtered.length} 篇文章`
            : `共 ${articles.length} 篇文章`}
        </p>
      </div>

      {paginatedArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((article, index) => (
              <FadeIn key={article.slug} delay={index * 0.05}>
                <ArticleCard article={article} />
              </FadeIn>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-[var(--muted)] text-lg">
            {query || selectedTags.size > 0 ? "没有找到匹配的文章" : "还没有文章。"}
          </p>
        </div>
      )}
    </>
  );
}
