"use client";

import type { GuestbookMessage } from "@/types";

interface MessageCardProps {
  message: GuestbookMessage;
  onLike: (id: string) => void;
}

export default function MessageCard({ message, onLike }: MessageCardProps) {
  return (
    <article
      className="p-5 sm:p-6 rounded-2xl transition-all duration-300"
      style={{
        background: "rgba(17,24,39,0.7)",
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #60A5FA, #8B5CF6)",
            }}
          >
            {message.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-sm text-white">{message.nickname}</h4>
            <time className="text-xs text-white/30">
              {new Date(message.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-white/70 leading-relaxed mb-4">{message.content}</p>

      {/* Footer */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onLike(message.id)}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[var(--accent)] transition-colors group/like"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover/like:scale-110"
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
          {message.likes}
        </button>
      </div>
    </article>
  );
}
