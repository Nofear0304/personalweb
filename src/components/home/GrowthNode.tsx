"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { JourneyNodeMeta } from "@/types";

interface GrowthNodeProps {
  node: JourneyNodeMeta;
  index: number;
  position: { left: number; top: number };
  isInView: boolean;
  isDimmed: boolean;
}

/**
 * A single star-node on the cosmic growth orbit.
 * Features:
 * - Golden glowing star dot with breathing animation
 * - Info text (period / title / summary) below
 * - On hover: star enlarges, glow intensifies, circular photo appears above
 * - Dims when another node is hovered
 */
export default function GrowthNode({
  node,
  index,
  position,
  isInView,
  isDimmed,
}: GrowthNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={
        isInView
          ? { opacity: isDimmed ? 0.4 : 1, scale: 1 }
          : { opacity: 0, scale: 0.3 }
      }
      transition={{
        opacity: { duration: 0.4 },
        scale: { duration: 0.5, delay: 0.5 + index * 0.2, ease: [0.25, 0.1, 0.25, 1] },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Photo popup (appears on hover above the star) ── */}
      <AnimatePresence>
        {isHovered && node.coverImage && (
          <motion.div
            className="absolute bottom-full mb-8 z-20"
            initial={{ opacity: 0, y: 12, scale: 0.4 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.4 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Photo ring glow */}
            <div
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)",
                transform: "scale(1.3)",
              }}
            />

            {/* Circular photo */}
            <div
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden"
              style={{
                border: "2px solid rgba(255, 215, 0, 0.7)",
                boxShadow:
                  "0 0 20px rgba(255, 215, 0, 0.35), 0 0 50px rgba(255, 215, 0, 0.15), 0 0 80px rgba(255, 180, 0, 0.08)",
              }}
            >
              <Image
                src={node.coverImage}
                alt={node.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, 160px"
              />
            </div>

            {/* Connecting light trail (photo → star) */}
            <div
              className="absolute top-full left-1/2 w-px h-7 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,215,0,0.5), rgba(255,215,0,0.1) 60%, transparent)",
              }}
            />
            {/* Tiny sparkle at the midpoint */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
              style={{
                background: "#FFD700",
                boxShadow: "0 0 6px 2px rgba(255,215,0,0.8)",
                top: "calc(100% + 14px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Star node (the golden glowing dot) ── */}
      <motion.div
        className="relative rounded-full cursor-pointer z-10 flex-shrink-0"
        style={{
          width: "14px",
          height: "14px",
          background:
            "radial-gradient(circle at 35% 35%, #FFF8DC, #FFD700 35%, #B8860B 100%)",
        }}
        animate={{
          scale: isHovered ? 1.5 : [1, 0.82, 1],
          boxShadow: isHovered
            ? [
                "0 0 12px #FFD700, 0 0 28px #FFD700, 0 0 55px rgba(255,215,0,0.55), 0 0 85px rgba(255,200,0,0.25)",
              ]
            : [
                "0 0 6px #FFD700, 0 0 14px rgba(255,215,0,0.45), 0 0 28px rgba(255,215,0,0.2)",
                "0 0 4px #FFD700, 0 0 8px rgba(255,215,0,0.25), 0 0 16px rgba(255,215,0,0.1)",
                "0 0 6px #FFD700, 0 0 14px rgba(255,215,0,0.45), 0 0 28px rgba(255,215,0,0.2)",
              ],
        }}
        transition={{
          scale: isHovered
            ? { duration: 0.3, ease: "easeOut" }
            : { repeat: Infinity, duration: 3, ease: "easeInOut" },
          boxShadow: isHovered
            ? { duration: 0.3, ease: "easeOut" }
            : { repeat: Infinity, duration: 3, ease: "easeInOut" },
        }}
      />

      {/* ── Info text below the star ── */}
      <div className="mt-5 text-center select-none">
        {/* Time period */}
        <p
          className="text-[11px] sm:text-xs font-medium mb-1.5 tracking-wider"
          style={{ color: "rgba(255, 215, 0, 0.75)" }}
        >
          {node.period}
        </p>

        {/* Phase title */}
        <p className="text-sm sm:text-base font-bold text-white mb-1.5 tracking-wide">
          {node.title}
        </p>

        {/* Short description */}
        <p className="text-[11px] sm:text-xs text-white/45 leading-relaxed max-w-[130px] sm:max-w-[160px] line-clamp-2 mx-auto">
          {node.summary}
        </p>
      </div>
    </motion.div>
  );
}
