"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { JourneyNodeMeta } from "@/types";
import Badge from "@/components/ui/Badge";

interface TimelineProps {
  nodes: JourneyNodeMeta[];
}

export default function Timeline({ nodes }: TimelineProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 text-lg">还没有成长记录。</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/[0.08] md:-translate-x-px" />

      <div className="space-y-12">
        {nodes.map((node, index) => {
          const isLeft = index % 2 === 0;

          return (
            <TimelineNode
              key={node.slug}
              node={node}
              index={index}
              isLeft={isLeft}
            />
          );
        })}
      </div>
    </div>
  );
}

function TimelineNode({
  node,
  index,
  isLeft,
}: {
  node: JourneyNodeMeta;
  index: number;
  isLeft: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: 0 }}
      className={`relative flex items-start gap-6 md:gap-0 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Dot on timeline */}
      <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--background)] ring-4 ring-[var(--accent)]/20 -translate-x-1/2 z-10 mt-5" />

      {/* Spacer for desktop */}
      <div className="hidden md:block w-1/2" />

      {/* Content card */}
      <div className={`flex-1 md:w-1/2 ${isLeft ? "md:pr-12" : "md:pl-12"} pl-12 md:pl-0`}>
        <Link href={`/journey/${node.slug}`}>
          <article className="glass-card overflow-hidden transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 group">
            {node.coverImage && (
              <div className="aspect-[2/1] overflow-hidden bg-white/[0.04]">
                <Image
                  src={node.coverImage}
                  alt={node.title}
                  width={600}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

            <div className="p-6">
              {/* Period badge */}
              <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/8 px-3 py-1 rounded-full mb-3">
                {node.period}
              </span>

              <h3 className="font-serif text-xl font-bold mb-2 text-white group-hover:text-[var(--accent)] transition-colors">
                {node.title}
              </h3>

              <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-3">
                {node.summary}
              </p>

              {node.tags && node.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {node.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </article>
        </Link>
      </div>
    </motion.div>
  );
}
