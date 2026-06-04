import { getAllArticles } from "@/lib/articles";
import { getAllImages } from "@/lib/images";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理面板",
};

export default async function AdminDashboard() {
  const articles = await getAllArticles();
  const images = getAllImages();

  const stats = [
    {
      label: "文章总数",
      value: articles.length,
      href: "/admin/articles",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      label: "图片总数",
      value: images.length,
      href: "/admin/gallery",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
      ),
    },
    {
      label: "最新文章",
      value: articles[0]?.title || "暂无",
      href: "/admin/articles",
      isTitle: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-8">仪表盘</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[var(--accent)]">{stat.icon}</div>
              <span className="text-sm text-[var(--muted)]">{stat.label}</span>
            </div>
            <p
              className={`font-bold ${
                stat.isTitle
                  ? "text-base text-[var(--accent)] truncate"
                  : "text-3xl"
              }`}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-serif text-lg font-bold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/articles"
            className="flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">上传新文章</p>
              <p className="text-sm text-[var(--muted)]">拖拽 .md 文件即可</p>
            </div>
          </Link>

          <Link
            href="/admin/gallery"
            className="flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">上传新图片</p>
              <p className="text-sm text-[var(--muted)]">支持多图同时上传</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
