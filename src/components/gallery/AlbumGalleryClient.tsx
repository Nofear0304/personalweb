"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Masonry from "react-masonry-css";
import type { Album, ImageInfo } from "@/types";
import FadeIn from "@/components/ui/FadeIn";
import Lightbox from "@/components/gallery/Lightbox";

interface AlbumGalleryClientProps {
  album: Album;
  images: ImageInfo[];
}

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
};

export default function AlbumGalleryClient({
  album,
  images,
}: AlbumGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--muted)] text-lg">该相册暂无照片</p>
      </div>
    );
  }

  return (
    <>
      <FadeIn>
        <div className="mb-12">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回图集
          </Link>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">
            {album.title}
          </h1>
          <p className="text-[var(--muted)] text-lg">{album.description}</p>
        </div>
      </FadeIn>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-3 sm:-ml-4 w-auto"
        columnClassName="pl-3 sm:pl-4 bg-clip-padding"
      >
        {images.map((image, index) => (
          <FadeIn key={image.filename} delay={index * 0.05} className="mb-3 sm:mb-4">
            <button
              onClick={() => setLightboxIndex(index)}
              className="block w-full relative rounded-xl overflow-hidden bg-[var(--border)] group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <Image
                src={image.url}
                alt={image.filename}
                width={400}
                height={300}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
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
      </Masonry>

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
