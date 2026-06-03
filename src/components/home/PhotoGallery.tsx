"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ImageInfo } from "@/types";
import FadeIn from "@/components/ui/FadeIn";

interface PhotoGalleryProps {
  images: ImageInfo[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function PhotoGallery({ images }: PhotoGalleryProps) {
  const featuredImages = images.slice(0, 4);

  if (featuredImages.length === 0) {
    return (
      <section id="gallery" className="max-w-[1400px] mx-auto px-5 py-[120px]">
        <div className="text-center">
          <h2 className="font-serif text-[56px] font-bold mb-4">摄影集</h2>
          <p className="text-white/60 text-lg">摄影作品即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="max-w-[1400px] mx-auto px-5 py-[120px]">
      {/* Section Header */}
      <FadeIn>
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
            Gallery
          </p>
          <h2 className="font-serif text-[56px] font-bold text-white leading-tight">
            摄影集
          </h2>
          <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
            用镜头记录成长与生活中的每一个瞬间
          </p>
        </div>
      </FadeIn>

      {/* Gallery Grid: 2 columns on large screens, 1 on mobile */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {featuredImages.map((image) => {
          // Derive title from filename (remove extension, replace dashes/underscores)
          const rawName = image.filename.replace(/\.[^.]+$/, "");
          const title = rawName.replace(/[-_]/g, " ");

          return (
            <motion.div key={image.filename} variants={cardVariants}>
              <Link href="/gallery">
                <article
                  className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(15,23,42,0.5)",
                  }}
                >
                  {/* Hover glow border */}
                  <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                  {/* Image container */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.filename}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                    />

                    {/* Gradient overlay — always visible, enhances on hover */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(2,8,23,0.95) 0%, rgba(2,8,23,0.4) 40%, rgba(2,8,23,0.05) 70%, transparent 100%)",
                      }}
                    />
                    {/* Enhanced overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Arrow icon — top right, appears on hover */}
                    <div
                      className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 17L17 7m0 0H7m10 0v10"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
                      {/* Category */}
                      {image.category && (
                        <span
                          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-3"
                          style={{
                            background: "rgba(91,156,245,0.15)",
                            color: "var(--accent)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(91,156,245,0.2)",
                          }}
                        >
                          {image.category}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 capitalize">
                        {title}
                      </h3>

                      {/* Description */}
                      {image.location && (
                        <p className="text-sm text-white/50 flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {image.location}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View all link */}
      {images.length > 4 && (
        <FadeIn delay={0.3}>
          <div className="text-center mt-14">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group/link"
            >
              查看全部摄影
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
