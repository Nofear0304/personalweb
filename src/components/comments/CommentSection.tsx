"use client";

import { useState, useEffect, useCallback } from "react";
import type { ContentComment } from "@/types";
import CommentForm from "@/components/comments/CommentForm";
import CommentCard from "@/components/comments/CommentCard";
import FadeIn from "@/components/ui/FadeIn";

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = useCallback(
    async (data: { nickname: string; content: string }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "提交失败");
      // Refresh list
      await fetchComments();
    },
    [slug, fetchComments]
  );

  const handleLike = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/comments?action=like&id=${id}`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (res.ok && result.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? result.comment : c))
        );
      }
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-white/[0.08]">
      <h2 className="font-serif text-2xl font-bold text-white mb-6">
        评论 ({comments.length})
      </h2>

      <CommentForm onSubmit={handleSubmit} />

      {loading ? (
        <div className="text-center py-10">
          <p className="text-white/30">加载中...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment, index) => (
            <FadeIn key={comment.id} delay={index * 0.05}>
              <CommentCard comment={comment} onLike={handleLike} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[var(--muted)] text-lg">还没有评论，来说点什么吧</p>
        </div>
      )}
    </section>
  );
}
