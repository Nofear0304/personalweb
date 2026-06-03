import { notFound } from "next/navigation";
import Image from "next/image";
import { getJourneyNodeBySlug, getAllJourneyNodes } from "@/lib/journey";
import FadeIn from "@/components/ui/FadeIn";
import Badge from "@/components/ui/Badge";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const nodes = getAllJourneyNodes();
  return nodes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const node = await getJourneyNodeBySlug(slug);
  if (!node) return { title: "Not Found" };
  return { title: node.title, description: node.summary };
}

export default async function JourneyDetailPage({ params }: Props) {
  const { slug } = await params;
  const node = await getJourneyNodeBySlug(slug);
  if (!node) notFound();

  return (
    <CosmicWrapper>
      <article className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        {/* Back */}
        <FadeIn>
          <a
            href="/journey"
            className="inline-flex items-center text-sm text-white/50 hover:text-[var(--accent)] transition-colors mb-8"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回旅程
          </a>
        </FadeIn>

        {/* Header */}
        <FadeIn>
          <header className="mb-12">
            <span className="inline-block text-sm font-medium text-[var(--accent)] bg-[var(--accent)]/8 px-4 py-1.5 rounded-full mb-4">
              {node.period}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">
              {node.title}
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              {node.summary}
            </p>

            {node.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {node.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {/* Featured Image */}
        {node.coverImage && (
          <FadeIn>
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-white/[0.04] mb-16">
              <Image
                src={node.coverImage}
                alt={node.title}
                width={1200}
                height={514}
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
        )}

        {/* Content */}
        <FadeIn>
          <div className="prose max-w-none mb-16" dangerouslySetInnerHTML={{ __html: node.content }} />
        </FadeIn>

        {/* Key Events */}
        {node.events.length > 0 && (
          <FadeIn>
            <section className="mb-16">
              <h2 className="font-serif text-2xl font-bold mb-8 text-white">关键事件</h2>
              <div className="space-y-4">
                {node.events.map((event, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl"
                  >
                    <div className="shrink-0 text-sm font-medium text-[var(--accent)] min-w-[4.5rem]">
                      {event.date}
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 text-white">{event.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Photo Wall */}
        {node.photos.length > 0 && (
          <FadeIn>
            <section className="mb-16">
              <h2 className="font-serif text-2xl font-bold mb-8 text-white">阶段照片</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {node.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden bg-white/[0.04]"
                  >
                    <Image
                      src={photo}
                      alt={`${node.title} photo ${i + 1}`}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Insight */}
        {node.insight && (
          <FadeIn>
            <section className="mb-16 bg-white/[0.04] backdrop-blur-md rounded-2xl p-8 border border-white/[0.06]">
              <h2 className="font-serif text-xl font-bold mb-4 text-white">💭 自我感悟</h2>
              <p className="text-white/50 leading-relaxed">{node.insight}</p>
            </section>
          </FadeIn>
        )}

        {/* Conclusion */}
        {node.conclusion && (
          <FadeIn>
            <section className="border-t border-white/[0.08] pt-12">
              <h2 className="font-serif text-2xl font-bold mb-4 text-white">阶段总结</h2>
              <p className="text-lg text-white/50 leading-relaxed">{node.conclusion}</p>
            </section>
          </FadeIn>
        )}
      </article>
    </CosmicWrapper>
  );
}
