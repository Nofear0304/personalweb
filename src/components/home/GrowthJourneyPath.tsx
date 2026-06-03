"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { JourneyNodeMeta } from "@/types";
import GrowthNode from "./GrowthNode";
import ShootingStars from "./ShootingStars";

interface GrowthJourneyPathProps {
  nodes: JourneyNodeMeta[];
}

/**
 * SVG path for the cosmic orbit — a gentle wave across the viewBox.
 * viewBox is 0 0 1000 200; path undulates like a planet's orbital trajectory.
 */
const ORBIT_PATH =
  "M 40,100 C 220,40 320,160 500,100 C 680,40 780,160 960,100";

/**
 * Phase → position mapping (as percentages of container).
 * Keyed by phase so ordering is explicit, not reliant on array index.
 */
const PHASE_POSITIONS: Record<string, { left: number; top: number }> = {
  childhood:    { left: 8,  top: 42 }, // 童年
  "middle-school": { left: 24, top: 60 }, // 初中
  "high-school":   { left: 40, top: 42 }, // 高中
  college:      { left: 56, top: 60 }, // 大学
  career:       { left: 72, top: 42 }, // 工作
  life:         { left: 88, top: 60 }, // 生活
};

/**
 * GrowthJourneyPath — horizontal cosmic growth orbit.
 *
 * Replaces the vertical JourneyTimeline with a horizontal orbit-style layout
 * that matches the site's deep-space / nebula / starfield aesthetic.
 *
 * Key features:
 *  - SVG bezier-curve orbit drawn left-to-right on scroll-into-view
 *  - 6 golden star nodes placed along the curve
 *  - Breathing glow animation on each node
 *  - Hover: star enlarges + golden photo pops up above
 *  - Other nodes dim when one is hovered (focus effect)
 */
export default function GrowthJourneyPath({
  nodes,
}: GrowthJourneyPathProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-12%" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort by order then take at most 6, so 童年 (order 0) is always leftmost
  const displayNodes = [...nodes]
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  // ── Empty state ──
  if (displayNodes.length === 0) {
    return (
      <section id="journey" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">成长轨迹</h2>
          <p className="text-[var(--muted)]">旅程节点即将上线...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32 overflow-hidden"
    >
      {/* ── Shooting stars passing through the orbit ── */}
      <ShootingStars />

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-14 text-center"
      >
        <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
          Growth Journey
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-white">
          成长轨迹
        </h2>
        <p className="text-[var(--muted)] max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
          人生像一颗星球在宇宙中运行，每个阶段都是一段独特的轨迹
        </p>
      </motion.div>

      {/* ── Orbit Container ── */}
      <div
        className="relative w-full h-[460px] sm:h-[520px]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* ── SVG Orbit Path ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Soft glow for the main orbit line */}
            <filter
              id="orbit-glow"
              x="-10%"
              y="-50%"
              width="120%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Wider, softer outer glow (CornflowerBlue tint) */}
            <filter
              id="orbit-glow-outer"
              x="-10%"
              y="-50%"
              width="120%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle background track — always visible */}
          <path
            d={ORBIT_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1.5"
          />

          {/* Outer blue-ish glow — drawn on enter */}
          <motion.path
            d={ORBIT_PATH}
            fill="none"
            stroke="rgba(100, 149, 237, 0.25)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#orbit-glow-outer)"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {/* Main white orbit line — drawn on enter */}
          <motion.path
            d={ORBIT_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.8"
            strokeLinecap="round"
            filter="url(#orbit-glow)"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Bright core line — thin, high-opacity */}
          <motion.path
            d={ORBIT_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="0.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
          />
        </svg>

        {/* ── Orbiting dust particles (subtle decorative dots near the curve) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          {[
            { left: "4%",  top: "38%", size: 2, delay: 0 },
            { left: "16%", top: "65%", size: 1.5, delay: 0.2 },
            { left: "32%", top: "37%", size: 2.5, delay: 0.4 },
            { left: "48%", top: "66%", size: 1.5, delay: 0.6 },
            { left: "64%", top: "37%", size: 2, delay: 0.8 },
            { left: "80%", top: "66%", size: 1.5, delay: 1.0 },
            { left: "94%", top: "38%", size: 2, delay: 1.2 },
          ].map((dot, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
                background: "rgba(255,255,255,0.4)",
                boxShadow: "0 0 4px rgba(200,220,255,0.5)",
              }}
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + dot.delay,
                ease: "easeInOut",
                delay: dot.delay,
              }}
            />
          ))}
        </motion.div>

        {/* ── Growth Nodes ── */}
        {displayNodes.map((node, index) => {
          const pos = PHASE_POSITIONS[node.phase] ?? { left: 50, top: 50 };
          return (
            <div
              key={node.slug}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <GrowthNode
                node={node}
                index={index}
                position={pos}
                isInView={isInView}
                isDimmed={hoveredIndex !== null && hoveredIndex !== index}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
