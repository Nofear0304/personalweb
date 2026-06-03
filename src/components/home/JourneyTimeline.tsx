"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import type { JourneyNodeMeta } from "@/types";
import JourneyNodeCard from "./JourneyNodeCard";

interface JourneyTimelineProps {
  nodes: JourneyNodeMeta[];
}

export default function JourneyTimeline({ nodes }: JourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress for the line animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  });

  if (nodes.length === 0) {
    return (
      <section id="journey" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">成长旅程</h2>
          <p className="text-[var(--muted)]">旅程节点即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="journey"
      ref={containerRef}
      className="max-w-6xl mx-auto px-5 py-24 sm:py-32"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 md:mb-20"
      >
        <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
          Growth Journey
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
          成长轨迹
        </h2>
        <p className="text-[var(--muted)] max-w-lg text-lg leading-relaxed">
          每一个阶段都是独特的篇章，串联起来就是关于成长的故事
        </p>
      </motion.div>

      {/* Timeline layout */}
      <div className="relative">
        {/* SVG vertical line — desktop only */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5">
          {/* Background line (static, light) */}
          <div className="absolute inset-0 bg-[var(--border)] rounded-full" />

          {/* Animated progress line */}
          <motion.div
            className="absolute top-0 left-0 right-0 bg-[var(--accent)] rounded-full origin-top"
            style={{
              scaleY: smoothProgress,
              transformOrigin: "top",
            }}
          />
        </div>

        {/* Mobile line */}
        <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

        {/* Nodes */}
        <div className="flex flex-col gap-12 md:gap-8">
          {nodes.map((node, index) => (
            <div key={node.slug} className="relative">
              {/* Mobile dot */}
              <div className="md:hidden absolute left-4 top-10 w-2.5 h-2.5 rounded-full bg-[var(--accent)] -translate-x-[4.5px] z-10 shadow-[0_0_8px_var(--glow)]" />

              <JourneyNodeCard
                node={node}
                index={index}
                totalNodes={nodes.length}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
