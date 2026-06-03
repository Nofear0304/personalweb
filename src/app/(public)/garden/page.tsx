import { getAllGardenNotes } from "@/lib/garden";
import NoteCard from "@/components/garden/NoteCard";
import SectionHeading from "@/components/ui/SectionHeading";
import TagCloud from "@/components/ui/TagCloud";
import FadeIn from "@/components/ui/FadeIn";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数字花园",
  description: "持续更新的学习笔记与思考，非线性的知识组织。",
};

export default function GardenPage() {
  const notes = getAllGardenNotes();

  return (
    <CosmicWrapper>
      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Digital Garden"
          title="数字花园"
          description="非线性的知识组织，持续更新的学习笔记与思考。每篇笔记都在不断生长。"
        />

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="glass-surface rounded-xl px-4 py-3">
            <span className="text-xs text-white/40">笔记总数</span>
            <p className="text-2xl font-bold text-white">{notes.length}</p>
          </div>
          <div className="glass-surface rounded-xl px-4 py-3">
            <span className="text-xs text-white/40">常青笔记</span>
            <p className="text-2xl font-bold text-white">
              {notes.filter((n) => n.status === "evergreen").length}
            </p>
          </div>
          <div className="glass-surface rounded-xl px-4 py-3">
            <span className="text-xs text-white/40">最近更新</span>
            <p className="text-sm font-medium mt-1 text-white">
              {notes[0]?.updated || "暂无"}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-10">
          <TagCloud tags={notes.flatMap((n) => n.tags)} />
        </div>

        {/* Notes grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, index) => (
              <FadeIn key={note.slug} delay={index * 0.06}>
                <NoteCard note={note} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">花园里还没有笔记。</p>
          </div>
        )}
      </div>
    </CosmicWrapper>
  );
}
