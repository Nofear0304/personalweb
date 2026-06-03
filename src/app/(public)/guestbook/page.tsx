import type { Metadata } from "next";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import GuestbookClient from "@/components/guestbook/GuestbookClient";

export const metadata: Metadata = {
  title: "留言",
  description: "欢迎留下你的足迹与评价",
};

export default function GuestbookPage() {
  return (
    <CosmicWrapper>
      <div className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Guestbook"
          title="留言"
          description="欢迎留下你的足迹与评价"
        />
        <GuestbookClient />
      </div>
    </CosmicWrapper>
  );
}
