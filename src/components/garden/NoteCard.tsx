import Link from "next/link";
import type { GardenNoteMeta } from "@/types";
import Badge from "@/components/ui/Badge";

const statusConfig = {
  seedling: { label: "🌱 幼苗", color: "text-green-400" },
  budding: { label: "🌿 生长中", color: "text-blue-400" },
  evergreen: { label: "🌳 常青", color: "text-emerald-400" },
};

interface NoteCardProps {
  note: GardenNoteMeta;
}

export default function NoteCard({ note }: NoteCardProps) {
  const status = statusConfig[note.status];

  return (
    <Link href={`/garden/${note.slug}`}>
      <article className="glass-card p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs ${status.color} font-medium`}>
            {status.label}
          </span>
          <span className="text-xs text-white/40">{note.updated}</span>
        </div>

        <h3 className="font-serif text-lg font-bold mb-2 text-white group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {note.title}
        </h3>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        {note.links.length > 0 && (
          <p className="text-xs text-white/40 mt-2">
            关联 {note.links.length} 篇笔记
          </p>
        )}
      </article>
    </Link>
  );
}
