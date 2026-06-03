import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-8xl font-serif font-bold text-[var(--accent)]/20 mb-4">
          404
        </p>
        <h1 className="font-serif text-2xl font-bold mb-2 text-white">页面未找到</h1>
        <p className="text-white/50 mb-8">
          你访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
        >
          回到首页
        </Link>
      </div>
    </div>
  );
}
