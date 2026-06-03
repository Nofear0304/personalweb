"use client";

import { useState, useCallback } from "react";

interface LikeButtonProps {
  type: "article" | "note";
  slug: string;
  initialLikes: number;
}

export default function LikeButton({ type, slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);

  const handleLike = useCallback(async () => {
    setAnimating(true);
    // Optimistic update
    setLikes((prev) => prev + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug }),
      });
      const data = await res.json();
      if (res.ok && data.likes != null) {
        setLikes(data.likes);
      }
    } catch {
      // Revert on error
      setLikes((prev) => prev - 1);
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  }, [type, slug]);

  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-sm text-white/60 hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all duration-300 group/like"
      title="点赞"
    >
      <svg
        className={`w-4 h-4 transition-all duration-300 ${
          animating ? "scale-125 text-[var(--accent)]" : ""
        } group-hover/like:scale-110`}
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
      <span className="tabular-nums">{likes}</span>
    </button>
  );
}
