"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { JourneyNodeMeta } from "@/types";

interface JourneyNodeCardProps {
  node: JourneyNodeMeta;
  index: number;
  totalNodes: number;
}

export default function JourneyNodeCard({
  node,
  index,
  totalNodes,
}: JourneyNodeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className="relative"
    >
      {/* Connecting dot on the SVG line — positioned absolutely */}
      <div className="hidden md:block absolute left-0 top-10 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--background)] shadow-[0_0_12px_var(--glow)] -translate-x-[6.5px] z-10" />

      {/* Card */}
      <Link href={`/journey/${node.slug}`} className="block">
        <motion.article
          whileHover={{ y: -2 }}
          className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 md:ml-12 transition-all duration-500 hover:border-[var(--accent)]"
          style={{
            boxShadow: "0 0 0px var(--glow)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--glow) 0 0 20px";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0px var(--glow)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          {/* Time period */}
          <span className="inline-block text-xs font-semibold text-[var(--accent)] mb-3 px-3 py-1 rounded-full bg-[var(--accent)]/8">
            {node.period}
          </span>

          {/* Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-[var(--accent)] transition-colors">
            {node.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-4">
            {node.summary}
          </p>

          {/* Cover image */}
          {node.coverImage && (
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white/[0.04]">
              <Image
                src={node.coverImage}
                alt={node.title}
                width={600}
                height={338}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Arrow indicator */}
          <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-5 h-5 text-[var(--accent)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}
