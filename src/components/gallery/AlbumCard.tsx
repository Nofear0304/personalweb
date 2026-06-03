"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Album } from "@/types";

interface AlbumCardProps {
  album: Album;
  index: number;
}

export default function AlbumCard({ album, index }: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/gallery/${album.slug}`}>
        <article
          className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 ease-out"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(15,23,42,0.5)",
          }}
        >
          {/* Image */}
          <div className="aspect-[16/10] relative overflow-hidden">
            <Image
              src={album.coverImage}
              alt={album.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(2,8,23,0.95) 0%, rgba(2,8,23,0.4) 40%, transparent 70%)",
              }}
            />

            {/* Enhanced hover overlay */}
            <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Hover glow border */}
            <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_40px_rgba(96,165,250,0.15)]" />

            {/* View button — appears on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-white/10 backdrop-blur-md border border-white/15">
                查看相册
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                {album.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50">{album.description}</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">
                  {album.imageCount} 张照片
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
