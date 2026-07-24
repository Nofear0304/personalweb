"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";

interface CityImage {
  filename: string;
  url: string;
  category?: string;
}

interface CityGalleryClientProps {
  images: CityImage[];
  cityName: string;
}

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2,
};

export default function CityGalleryClient({ images, cityName }: CityGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const current = lightboxIndex !== null ? images[lightboxIndex] : null;
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0;
  const hasNext = lightboxIndex !== null && lightboxIndex < images.length - 1;

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-3 w-auto"
        columnClassName="pl-3 bg-clip-padding"
      >
        {images.map((img, i) => (
          <motion.div
            key={img.url}
            className="mb-3 cursor-pointer group relative overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={img.url}
              alt={`${cityName} - ${img.filename}`}
              width={400}
              height={300}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.div>
        ))}
      </Masonry>

      {/* Lightbox */}
      <AnimatePresence>
        {current && lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
              onClick={() => setLightboxIndex(null)}
            >
              ✕
            </button>

            {hasPrev && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              >
                ‹
              </button>
            )}

            <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={current.url}
                alt={current.filename}
                width={1200}
                height={900}
                className="max-w-full max-h-[85vh] object-contain"
                unoptimized
              />
            </div>

            {hasNext && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 text-white/50 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
