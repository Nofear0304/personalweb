import { notFound } from "next/navigation";
import Link from "next/link";
import { getGardenNoteBySlug, getAllGardenNotes } from "@/lib/garden";
import FadeIn from "@/components/ui/FadeIn";
import Badge from "@/components/ui/Badge";
import NoteCard from "@/components/garden/NoteCard";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

const statusLabels = {
  seedling: "🌱 幼苗",
  budding: "🌿 生长中",
  evergreen: "🌳 常青",
};

export async function generateStaticParams() {
  return getAllGardenNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await getGardenNoteBySlug(slug);
  if (!note) return { title: "Not Found" };
  return { title: note.title, description: `标签: ${note.tags.join(", ")}` };
}

export default async function GardenDetailPage({ params }: Props) {
  const { slug } = await params;
  const note = await getGardenNoteBySlug(slug);
  if (!note) notFound();

  return (
    <CosmicWrapper>
      <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <FadeIn>
          <a
            href="/garden"
            className="inline-flex items-center text-sm text-white/50 hover:text-[var(--accent)] transition-colors mb-8"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回花园
          </a>
        </FadeIn>

        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-[var(--accent)] font-medium">
                {statusLabels[note.status]}
              </span>
              <span className="text-sm text-white/50">
                创建于 {note.date} · 更新于 {note.updated}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
              {note.title}
            </h1>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {/* Linked notes */}
        {note.links.length > 0 && (
          <FadeIn>
            <div className="mb-10 p-4 bg-white/[0.04] backdrop-blur-md rounded-xl border border-white/[0.06]">
              <span className="text-xs text-white/40 uppercase tracking-wider">
                关联笔记
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {note.links.map((linkSlug) => (
                  <Link
                    key={linkSlug}
                    href={`/garden/${linkSlug}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    [[{linkSlug}]]
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn>
          <div
            className="prose max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </FadeIn>

        {/* Backlinks */}
        {note.backlinks.length > 0 && (
          <FadeIn>
            <section className="border-t border-white/[0.08] pt-12">
              <h2 className="font-serif text-2xl font-bold mb-6 text-white">反向链接</h2>
              <p className="text-sm text-white/50 mb-6">
                以下笔记链接到了这篇文章：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {note.backlinks.map((bl) => (
                  <NoteCard key={bl.slug} note={bl} />
                ))}
              </div>
            </section>
          </FadeIn>
        )}
      </div>
    </CosmicWrapper>
  );
}
