"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import type { ImageInfo } from "@/types";
import FadeIn from "@/components/ui/FadeIn";
import Lightbox from "@/components/gallery/Lightbox";
import CategoryTabs, { type Category } from "./CategoryTabs";

interface MasonryGalleryProps {
  images: ImageInfo[];
}

const CATEGORIES: Category[] = [
  { key: "all", label: "全部" },
  { key: "校园", label: "校园" },
  { key: "旅行", label: "旅行" },
  { key: "生活", label: "生活" },
  { key: "摄影", label: "摄影" },
];

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2,
};

export default function MasonryGallery({ images }: MasonryGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return images;
    return images.filter((img) => img.category === activeCategory);
  }, [images, activeCategory]);

  if (images.length === 0) {
    return (
      <section id="gallery" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">光影瞬间</h2>
          <p className="text-[var(--muted)]">照片即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="max-w-6xl mx-auto px-5 py-24 sm:py-32">
      {/* Section Header */}
      <FadeIn>
        <div className="mb-12">
          <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
            Gallery
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            光影瞬间
          </h2>
          <p className="text-[var(--muted)] max-w-lg text-lg leading-relaxed">
            用镜头记录生活的美好，每一帧都是独一无二的回忆
          </p>
        </div>
      </FadeIn>

      {/* Category Tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        activeKey={activeCategory}
        onChange={setActiveCategory}
        className="mb-10"
      />

      {/* Masonry Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-3 sm:-ml-4 w-auto"
            columnClassName="pl-3 sm:pl-4 bg-clip-padding"
          >
            {filteredImages.map((image, index) => (
              <FadeIn
                key={image.filename}
                delay={index * 0.05}
                className="mb-3 sm:mb-4"
              >
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="block w-full relative rounded-xl overflow-hidden bg-[var(--border)] group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
                >
                  <Image
                    src={image.url}
                    alt={image.filename}
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>

                  {/* Category badge */}
                  {image.category && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                      {image.category}
                    </span>
                  )}
                </button>
              </FadeIn>
            ))}
          </Masonry>
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filteredImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
