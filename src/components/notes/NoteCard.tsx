import Link from "next/link";
import type { NoteMeta } from "@/types";

interface NoteCardProps {
  note: NoteMeta;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/notes/${encodeURIComponent(note.slug)}`}>
      <article className="glass-card overflow-hidden transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(96,165,250,0.1)] h-full flex flex-col">
        <div className="p-5 flex flex-col flex-1">
          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-lg font-bold leading-snug mb-2 text-white group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {note.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2 flex-1">
            {note.description}
          </p>

          {/* Meta footer */}
          <div className="flex items-center justify-between text-xs text-white/40 pt-3 border-t border-white/[0.06]">
            <time>
              {new Date(note.date).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {note.readingTime} 分钟
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {note.likes ?? 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
