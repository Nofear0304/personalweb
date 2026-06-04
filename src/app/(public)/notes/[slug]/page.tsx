import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug, getAdjacentNotes } from "@/lib/notes";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FadeIn from "@/components/ui/FadeIn";
import LikeButton from "@/components/ui/LikeButton";
import CommentSection from "@/components/comments/CommentSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const notes = await getAllNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return { title: "随笔未找到" };

  return {
    title: note.title,
    description: note.description,
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) notFound();

  const { prev, next } = await getAdjacentNotes(slug);

  return (
    <CosmicWrapper>
      <article className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
        <FadeIn>
          {/* Back link */}
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回随笔列表
          </Link>

          {/* Header */}
          <header className="mb-10">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {note.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-white/40">
              <time>
                {new Date(note.date).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{note.readingTime} 分钟阅读</span>
              <span>·</span>
              <LikeButton type="note" slug={note.slug} initialLikes={note.likes ?? 0} />
            </div>
          </header>

          {/* Content */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </FadeIn>

        {/* Comments */}
        <CommentSection slug={note.slug} />

        {/* Prev / Next navigation */}
        <nav className="mt-16 pt-8 border-t border-white/[0.06] grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/notes/${encodeURIComponent(prev.slug)}`}
              className="group p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-xs text-white/30">上一篇</span>
              <p className="text-sm font-medium text-white/70 group-hover:text-white mt-1 line-clamp-1">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={`/notes/${encodeURIComponent(next.slug)}`}
              className="group p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-right"
            >
              <span className="text-xs text-white/30">下一篇</span>
              <p className="text-sm font-medium text-white/70 group-hover:text-white mt-1 line-clamp-1">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      </article>
    </CosmicWrapper>
  );
}
