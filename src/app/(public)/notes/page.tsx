import type { Metadata } from "next";
import { getAllNotes, getAllNoteTags } from "@/lib/notes";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import NotesList from "@/components/notes/NotesList";

export const metadata: Metadata = {
  title: "随笔",
  description: "零碎的灵感、思考的片段，记录成长路上的每一个想法",
};

export default async function NotesPage() {
  const notes = await getAllNotes();

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Notes & Essays"
          title="随笔"
          description="零碎的灵感、思考的片段，记录成长路上的每一个想法"
        />
        <NotesList notes={notes} />
      </div>
    </CosmicWrapper>
  );
}
