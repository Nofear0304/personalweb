"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/site-config";
import TypingText from "@/components/ui/TypingText";

export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 text-center">
      {/* ── Avatar with orbital ring and glow ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-10 relative"
      >
        {/* Orbital ring container */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44">
          {/* Orbit ring with dots */}
          <div
            className="absolute rounded-full animate-[orbit-spin_15s_linear_infinite]"
            style={{
              top: "50%",
              left: "50%",
              width: "calc(100% + 32px)",
              height: "calc(100% + 32px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            {/* Orbiting light dots */}
            <span
              className="absolute w-1.5 h-1.5 rounded-full animate-[orbit-dot-pulse_3s_ease-in-out_infinite]"
              style={{
                top: -3,
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                boxShadow: "0 0 8px 3px rgba(180, 210, 255, 0.9), 0 0 16px 6px rgba(140, 180, 255, 0.5)",
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full animate-[orbit-dot-pulse_3s_ease-in-out_infinite]"
              style={{
                bottom: -2,
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                boxShadow: "0 0 6px 2px rgba(200, 210, 255, 0.8), 0 0 12px 4px rgba(140, 180, 255, 0.4)",
                animationDelay: "1s",
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full animate-[orbit-dot-pulse_3s_ease-in-out_infinite]"
              style={{
                left: -2,
                top: "50%",
                transform: "translateY(-50%)",
                background: "white",
                boxShadow: "0 0 6px 2px rgba(180, 200, 255, 0.8), 0 0 12px 4px rgba(140, 180, 255, 0.4)",
                animationDelay: "2s",
              }}
            />
          </div>

          {/* ── Water-wave shimmering ring ── */}
          <div
            className="absolute rounded-full animate-[water-sway_7s_ease-in-out_infinite]"
            style={{
              top: "50%",
              left: "50%",
              width: "calc(100% + 24px)",
              height: "calc(100% + 24px)",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <svg
              className="block w-full h-full overflow-visible"
              viewBox="0 0 200 200"
            >
              {/* Bright shimmer dashes */}
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 30 10 22 14 38 5 28 8 25"
                className="animate-[water-shimmer_3.5s_linear_infinite]"
              />
              {/* Softer glow ring — wider, more transparent, reverse direction */}
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="3 50 18 28 6 42 10 33"
                className="animate-[water-shimmer_6s_linear_infinite]"
                style={{
                  animationDirection: "reverse",
                  filter: "blur(1px)",
                }}
              />
              {/* Thin continuous ring for subtle base glow */}
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Avatar with breathing glow */}
          <div
            className="absolute inset-0 rounded-full z-[2]"
            style={{
              animation: "avatar-breathe 3.5s ease-in-out infinite",
            }}
          >
            {siteConfig.avatar ? (
              <img
                src={siteConfig.avatar}
                alt={siteConfig.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm font-medium text-white/60 mb-6 tracking-[0.25em] uppercase"
      >
        Hello, I&apos;m
      </motion.p>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
      >
        {siteConfig.name}
      </motion.h1>

      {/* Static labels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="flex flex-wrap items-center justify-center gap-3 mb-8"
      >
        {siteConfig.labels.map((label, i) => (
          <span key={label} className="text-sm sm:text-base text-white/55">
            {label}
            {i < siteConfig.labels.length - 1 && (
              <span className="ml-3 text-white/20">·</span>
            )}
          </span>
        ))}
      </motion.div>

      {/* Typing text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-xl sm:text-2xl text-white/55 mb-10 h-10"
      >
        <TypingText
          texts={siteConfig.typewriterTexts}
          speed={80}
          deleteSpeed={40}
          pauseDuration={2000}
        />
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="text-base sm:text-lg text-white/50 leading-relaxed mb-12 max-w-md"
      >
        {siteConfig.tagline}
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/35"
        >
          <span className="text-xs tracking-widest">了解我</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
