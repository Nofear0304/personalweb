"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { SocialLink } from "@/types";

// Inline SVG icons for each social platform
const iconPaths: Record<string, ReactNode> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  gitee: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M11.984.285C5.378.285 0 5.663 0 12.269c0 6.606 5.378 11.984 11.984 11.984 6.606 0 11.984-5.378 11.984-11.984 0-6.606-5.378-11.984-11.984-11.984zm4.917 16.433h-3.618l-1.296-4.097h-4.895l-1.296 4.097H2.26L8.903 5.325h3.193l4.805 11.393z" />
    </svg>
  ),
  bilibili: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M10.573 14.53c-.396 0-.717-.322-.717-.718v-3.623c0-.396.321-.718.717-.718s.717.322.717.718v3.623c0 .396-.321.718-.717.718zm2.854 0c-.396 0-.717-.322-.717-.718v-3.623c0-.396.321-.718.717-.718s.717.322.717.718v3.623c0 .396-.321.718-.717.718zm7.14-5.455s-.588-4.142-2.39-5.967c-1.8-1.826-3.815-1.834-3.815-1.834l-.37-.003H8.887S8.882 1.27 7.08 3.096c-1.803 1.825-2.39 5.967-2.39 5.967s-1.045 4.761-.294 10.369c0 0 .576 2.062 3.37 2.172 1.541.061 2.66-.398 2.66-.398l.535-.805s.084.024.184.051c.508.137 1.172.284 2.054.284.882 0 1.546-.147 2.054-.284.1-.027.184-.051.184-.051l.535.805s1.119.459 2.66.398c2.794-.11 3.37-2.172 3.37-2.172.751-5.608-.294-10.369-.294-10.369z" />
    </svg>
  ),
  zhihu: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M13.328 10.92h-2.912l2.01 5.316c.488 1.289 1.12 2.562 2.368 3.624.932.795 2.162 1.3 3.571 1.48v-2.139a5.696 5.696 0 01-2.283-.785c-.584-.378-1.051-.888-1.393-1.512-.189-.346-.336-.706-.457-1.074l3.037-8.064h-2.758l-1.495 4.294-.391-.825c-.2-.423-.35-.97-.462-1.613h3.397V7.92h-4.64V5.63h-2.24v2.29H5.469v1.898h2.778c.11.645.26 1.192.46 1.615l.386.825L7.598 20.27h2.758l.847-2.387h4.521l.845 2.387h2.758l-4.973-13.21h-2.025v-.14h-.001z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  csdn: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S9 9.83 9 9s.67-1.5 1.5-1.5zM7 9c0 .83-.67 1.5-1.5 1.5S4 9.83 4 9s.67-1.5 1.5-1.5S7 8.17 7 9zm-1.5 4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S4 15.83 4 15s.67-1.5 1.5-1.5zm5 2.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 9c0 .83-.67 1.5-1.5 1.5S14 9.83 14 9s.67-1.5 1.5-1.5S17 8.17 17 9z" />
    </svg>
  ),
  douyin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.89a2.89 2.89 0 01-2.88 2.56 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.52a6.36 6.36 0 00-.79-.05A6.37 6.37 0 005.12 15.5a6.37 6.37 0 006.37 6.37 6.37 6.37 0 006.37-6.37V8.87a8.28 8.28 0 004.84 1.55v-3.4a4.83 4.83 0 01-3.11-1.13v-.2z" />
    </svg>
  ),
};

interface SocialCardProps {
  link: SocialLink;
  index: number;
}

export default function SocialCard({ link, index }: SocialCardProps) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(91,156,245,0.1)]"
      style={
        {
          "--brand-color": link.color,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = link.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div
        className="text-white/40 group-hover:text-[var(--brand-color)] transition-colors duration-300"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = link.color;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "";
        }}
      >
        {iconPaths[link.icon] || (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </div>
      <div className="text-center">
        <h4 className="font-medium text-sm text-white group-hover:text-[var(--brand-color)] transition-colors duration-300">
          {link.name}
        </h4>
        <p className="text-xs text-white/40 mt-1">{link.description}</p>
      </div>
    </motion.a>
  );
}
