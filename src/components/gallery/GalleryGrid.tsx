"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageInfo } from "@/types";
import FadeIn from "@/components/ui/FadeIn";
import Lightbox from "@/components/gallery/Lightbox";

interface GalleryGridProps {
  images: ImageInfo[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {images.map((image, index) => (
          <FadeIn key={image.filename} delay={index * 0.05}>
            <button
              onClick={() => setLightboxIndex(index)}
              className="block w-full aspect-square relative rounded-xl overflow-hidden bg-[var(--border)] group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
            >
              <Image
                src={image.url}
                alt={image.filename}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-all duration-500 group-hover:scale-105"
              />
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
            </button>
          </FadeIn>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
