"use client";

import { motion } from "framer-motion";
import type { Friend } from "@/types";

interface FriendCardProps {
  friend: Friend;
  index: number;
}

export default function FriendCard({ friend, index }: FriendCardProps) {
  return (
    <motion.a
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-[var(--accent)]/30 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]"
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-[var(--accent)]/50 transition-all duration-300 group-hover:scale-105">
        <img
          src={friend.avatar}
          alt={friend.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-[var(--accent)] transition-colors">
          {friend.name}
        </h3>
        <p className="text-sm text-white/40 leading-relaxed">{friend.description}</p>
      </div>

      {/* Visit link */}
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all duration-300">
        访问网站
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </span>
    </motion.a>
  );
}
