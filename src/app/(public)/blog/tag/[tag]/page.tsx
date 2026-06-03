import { getArticlesByTag, getAllTags } from "@/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tag: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `标签: ${tag}`, description: `查看所有标记为 ${tag} 的文章` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const articles = getArticlesByTag(decodeURIComponent(tag));

  return (
    <CosmicWrapper>
      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Tag"
          title={`#${decodeURIComponent(tag)}`}
          description={`共 ${articles.length} 篇文章`}
        />

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <FadeIn key={article.slug} delay={index * 0.05}>
                <ArticleCard article={article} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50">该标签下暂无文章。</p>
          </div>
        )}
      </div>
    </CosmicWrapper>
  );
}
