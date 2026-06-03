import Link from "next/link";
import Image from "next/image";
import type { ArticleMeta } from "@/types";
import Badge from "@/components/ui/Badge";

interface ArticleCardProps {
  article: ArticleMeta;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/blog/${encodeURIComponent(article.slug)}`}>
      <article className="glass-card overflow-hidden transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(96,165,250,0.12)] h-full flex flex-col">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="aspect-[16/9] relative overflow-hidden bg-white/[0.05]">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-lg font-bold leading-snug mb-2 text-white group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2 flex-1">
            {article.description}
          </p>

          {/* Meta footer: date + views + likes */}
          <div className="flex items-center justify-between text-xs text-white/40 pt-3 border-t border-white/[0.06]">
            <time>
              {new Date(article.date).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <div className="flex items-center gap-3">
              {/* Views */}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views ?? 0}
              </span>
              {/* Likes */}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {article.likes ?? 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
