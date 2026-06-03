"use client";

import { useState } from "react";

interface CommentFormProps {
  onSubmit: (data: { nickname: string; content: string }) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("请输入昵称");
      return;
    }
    if (nickname.trim().length > 50) {
      setError("昵称最多50个字符");
      return;
    }
    if (!content.trim()) {
      setError("请输入评论内容");
      return;
    }
    if (content.trim().length > 500) {
      setError("评论内容最多500个字符");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ nickname: nickname.trim(), content: content.trim() });
      setNickname("");
      setContent("");
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl mb-8 space-y-4"
      style={{
        background: "rgba(17,24,39,0.7)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <h3 className="font-serif text-xl font-bold text-white">发表评论</h3>

      {/* Nickname */}
      <div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="你的昵称"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow text-sm"
        />
      </div>

      {/* Content */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的想法..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow text-sm resize-none"
        />
        <p className="text-xs text-white/20 mt-1 text-right">{content.length}/500</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-300 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #60A5FA, #3B82F6)",
          boxShadow: "0 4px 15px rgba(96,165,250,0.3)",
        }}
      >
        {submitting ? "提交中..." : "发布评论"}
      </button>
    </form>
  );
}
