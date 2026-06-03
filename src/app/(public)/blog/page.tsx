import { getAllArticles } from "@/lib/articles";
import BlogList from "@/components/blog/BlogList";
import SectionHeading from "@/components/ui/SectionHeading";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文章",
  description: "技术思考、生活感悟、读书笔记——这里是我写下的所有文字。",
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <CosmicWrapper>
      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Blog"
          title="文章"
          description="技术思考、生活感悟、读书笔记——这里是我写下的所有文字。"
        />
        <BlogList articles={articles} />
      </div>
    </CosmicWrapper>
  );
}
