import Link from "next/link";
import Image from "next/image";
import type { JourneyNodeMeta } from "@/types";
import FadeIn from "@/components/ui/FadeIn";
import Badge from "@/components/ui/Badge";

interface JourneyPreviewProps {
  nodes: JourneyNodeMeta[];
}

export default function JourneyPreview({ nodes }: JourneyPreviewProps) {
  if (nodes.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-5 py-16 border-t border-[var(--border)]">
      <FadeIn>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[var(--accent)] mb-2 tracking-[0.2em] uppercase">
              成长旅程
            </p>
            <h2 className="font-serif text-3xl font-bold">走过的路</h2>
          </div>
          <Link
            href="/journey"
            className="hidden sm:inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            查看全部
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </FadeIn>

      {/* Horizontal timeline preview */}
      <div className="relative">
        {/* Line */}
        <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-[var(--border)]" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nodes.map((node, index) => (
            <FadeIn key={node.slug} delay={index * 0.15}>
              <Link href={`/journey/${node.slug}`}>
                <article className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  {/* Dot on timeline */}
                  <div className="hidden md:block w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--background)] mx-auto -mt-10 mb-4" />

                  {node.coverImage && (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-[var(--surface)]">
                      <Image
                        src={node.coverImage}
                        alt={node.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <span className="text-xs text-[var(--accent)] font-medium">
                    {node.period}
                  </span>
                  <h3 className="font-serif text-lg font-bold mt-2 mb-2 group-hover:text-[var(--accent)] transition-colors">
                    {node.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {node.summary}
                  </p>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
