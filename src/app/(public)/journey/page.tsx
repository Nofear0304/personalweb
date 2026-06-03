import { getAllJourneyNodes } from "@/lib/journey";
import Timeline from "@/components/journey/Timeline";
import SectionHeading from "@/components/ui/SectionHeading";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "成长旅程",
  description: "回顾成长过程中的每一个重要节点",
};

export default function JourneyPage() {
  const nodes = getAllJourneyNodes();

  return (
    <CosmicWrapper>
      <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Journey"
          title="成长旅程"
          description="每一个阶段都是独一无二的风景，记录下成长的足迹。"
        />

        <Timeline nodes={nodes} />
      </div>
    </CosmicWrapper>
  );
}
