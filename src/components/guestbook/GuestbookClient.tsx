"use client";

import { useState, useEffect, useCallback } from "react";
import type { GuestbookMessage } from "@/types";
import MessageForm from "@/components/guestbook/MessageForm";
import MessageCard from "@/components/guestbook/MessageCard";
import FadeIn from "@/components/ui/FadeIn";

export default function GuestbookClient() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = useCallback(
    async (data: { nickname: string; content: string }) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "提交失败");
      // Refresh list and collapse form
      await fetchMessages();
      setShowForm(false);
    },
    [fetchMessages]
  );

  const handleLike = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/messages?action=like&id=${id}`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (res.ok && result.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? result.message : m))
        );
      }
    } catch (err) {
      console.error("Failed to like message:", err);
    }
  }, []);

  return (
    <div className="mt-8">
      {/* Write message button or form */}
      {showForm ? (
        <MessageForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      ) : (
        <div className="mb-10">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #60A5FA, #3B82F6)",
              boxShadow: "0 4px 15px rgba(96,165,250,0.3)",
            }}
          >
            ✍️ 写留言
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-white/30">加载中...</p>
        </div>
      ) : messages.length > 0 ? (
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <FadeIn key={msg.id} delay={index * 0.05}>
              <MessageCard message={msg} onLike={handleLike} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[var(--muted)] text-lg">还没有留言，来说点什么吧</p>
        </div>
      )}
    </div>
  );
}
