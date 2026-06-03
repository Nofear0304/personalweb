"use client";

import { useState, useMemo } from "react";
import type { ImageInfo } from "@/types";
import GalleryGrid from "@/components/gallery/GalleryGrid";

interface GalleryPageClientProps {
  images: ImageInfo[];
  phases: { slug: string; title: string }[];
}

export default function GalleryPageClient({ images, phases }: GalleryPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = [{ slug: "all", title: "全部" }, ...phases];

  const filteredImages = useMemo(() => {
    if (activeFilter === "all") return images;
    return images.filter((img) => img.category === activeFilter);
  }, [images, activeFilter]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((filter) => (
          <button
            key={filter.slug}
            onClick={() => setActiveFilter(filter.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === filter.slug
                ? "bg-[var(--accent)] text-white"
                : "bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.08]"
            }`}
          >
            {filter.title}
          </button>
        ))}
      </div>

      {filteredImages.length > 0 ? (
        <GalleryGrid images={filteredImages} />
      ) : (
        <div className="text-center py-20">
          <p className="text-[var(--muted)] text-lg">该分类下还没有照片。</p>
        </div>
      )}
    </>
  );
}
