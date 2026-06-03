"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { NoteMeta } from "@/types";
import FadeIn from "@/components/ui/FadeIn";

interface NotesEssaysProps {
  notes: NoteMeta[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function NotesEssays({ notes }: NotesEssaysProps) {
  const displayNotes = notes.slice(0, 3);

  if (displayNotes.length === 0) {
    return (
      <section id="notes" className="max-w-[1400px] mx-auto px-5 py-[120px]">
        <div className="text-center">
          <h2 className="font-serif text-[56px] font-bold mb-4">随笔记录</h2>
          <p className="text-white/60 text-lg">随笔即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="notes" className="max-w-[1400px] mx-auto px-5 py-[120px]">
      {/* Section Header */}
      <FadeIn>
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
            Notes & Essays
          </p>
          <h2 className="font-serif text-[56px] font-bold text-white leading-tight">
            随笔记录
          </h2>
          <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
            零碎的灵感、思考的片段，记录成长路上的每一个想法
          </p>
        </div>
      </FadeIn>

      {/* Notes Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col gap-6 max-w-3xl mx-auto"
      >
        {displayNotes.map((note) => (
          <motion.div key={note.slug} variants={itemVariants}>
            <Link href={`/notes/${note.slug}`}>
              <article
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 ease-out"
                style={{
                  background: "rgba(17,24,39,0.7)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                {/* Left accent line — visible on hover */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, #60A5FA, transparent)",
                    boxShadow: "0 0 12px rgba(96,165,250,0.6)",
                  }}
                />

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[var(--accent)]/[0.02]" />

                {/* Card content */}
                <div className="p-6 sm:p-8 pl-7 sm:pl-9 relative z-10">
                  {/* Top row: reading time + date */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(96,165,250,0.1)",
                        color: "var(--accent)",
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{note.readingTime} 分钟阅读</span>
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(note.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                    {note.title}
                  </h3>

                  {/* Description */}
                  {note.description && (
                    <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
                      {note.description}
                    </p>
                  )}

                  {/* Bottom row: tags + likes */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full text-white/40"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="flex items-center gap-1.5 text-xs text-white/30">
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
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {note.likes ?? 0} 赞
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* View all link */}
      <FadeIn delay={0.3}>
        <div className="text-center mt-14">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group/link"
          >
            查看全部随笔
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
    </section>
  );
}
