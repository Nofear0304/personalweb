"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ArticleMeta } from "@/types";
import ArticleUploader from "@/components/admin/ArticleUploader";
import Button from "@/components/ui/Button";

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`确定要删除文章「${slug}」吗？此操作不可撤销。`)) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setArticles(articles.filter((a) => a.slug !== slug));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-8">文章管理</h1>

      {/* Upload Section */}
      <section className="mb-10">
        <h2 className="font-medium text-lg mb-4">上传新文章</h2>
        <ArticleUploader />
      </section>

      {/* Article List */}
      <section>
        <h2 className="font-medium text-lg mb-4">
          所有文章 ({articles.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-[var(--border)] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <p className="text-[var(--muted)]">还没有文章，上传第一篇吧。</p>
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.slug}
                className="flex items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--muted)] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{article.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[var(--muted)]">
                      {article.slug}.md
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(article.date).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    className="p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    title="预览"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(article.slug)}
                    disabled={deleting === article.slug}
                    className="p-2 text-[var(--muted)] hover:text-red-600 transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
