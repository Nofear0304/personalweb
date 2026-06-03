/**
 * In-memory key-value store for Cloudflare Workers.
 *
 * On Cloudflare Workers, `fs` is not available for persisting data.
 * This module provides an in-memory store that persists data for the
 * lifetime of the worker instance.
 *
 * For production persistence, consider upgrading to Cloudflare KV:
 * - Use a KV namespace binding and replace these get/set calls.
 */

import { initialLikesData, initialCommentsData, initialMessagesData, initialVisitsData } from "@/data/generated";

// Use globalThis so data survives across module re-evaluations within the same worker
const g = globalThis as Record<string, unknown>;

// ─── Likes ──────────────────────────────────────────────────────────
const LIKES_KEY = "__personalweb_likes__";
function getLikesStore(): { articles: Record<string, number>; notes: Record<string, number> } {
  if (!g[LIKES_KEY]) {
    g[LIKES_KEY] = structuredClone(initialLikesData);
  }
  return g[LIKES_KEY] as { articles: Record<string, number>; notes: Record<string, number> };
}

export function storeGetLikes(type: "article" | "note", slug: string): number {
  const data = getLikesStore();
  const key = type === "article" ? "articles" : "notes";
  return data[key][slug] ?? 0;
}

export function storeLikeContent(type: "article" | "note", slug: string): number {
  const data = getLikesStore();
  const key = type === "article" ? "articles" : "notes";
  if (!data[key][slug]) data[key][slug] = 0;
  data[key][slug] += 1;
  return data[key][slug];
}

// ─── Comments ───────────────────────────────────────────────────────
const COMMENTS_KEY = "__personalweb_comments__";
function getCommentsStore(): import("@/types").ContentComment[] {
  if (!g[COMMENTS_KEY]) {
    g[COMMENTS_KEY] = structuredClone(initialCommentsData);
  }
  return g[COMMENTS_KEY] as import("@/types").ContentComment[];
}

export function storeGetComments(slug: string): import("@/types").ContentComment[] {
  return getCommentsStore()
    .filter((c) => c.slug === slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function storeAddComment(data: Omit<import("@/types").ContentComment, "id" | "createdAt" | "likes">): import("@/types").ContentComment {
  const comments = getCommentsStore();
  const newComment: import("@/types").ContentComment = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  comments.push(newComment);
  return newComment;
}

export function storeDeleteComment(id: string): boolean {
  const comments = getCommentsStore();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return false;
  comments.splice(index, 1);
  return true;
}

export function storeLikeComment(id: string): import("@/types").ContentComment | null {
  const comments = getCommentsStore();
  const comment = comments.find((c) => c.id === id);
  if (!comment) return null;
  comment.likes += 1;
  return comment;
}

// ─── Messages (Guestbook) ───────────────────────────────────────────
const MESSAGES_KEY = "__personalweb_messages__";
function getMessagesStore(): import("@/types").GuestbookMessage[] {
  if (!g[MESSAGES_KEY]) {
    g[MESSAGES_KEY] = structuredClone(initialMessagesData);
  }
  return g[MESSAGES_KEY] as import("@/types").GuestbookMessage[];
}

export function storeGetMessages(): import("@/types").GuestbookMessage[] {
  return getMessagesStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function storeAddMessage(msg: Omit<import("@/types").GuestbookMessage, "id" | "createdAt" | "likes">): import("@/types").GuestbookMessage {
  const messages = getMessagesStore();
  const newMessage: import("@/types").GuestbookMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  messages.push(newMessage);
  return newMessage;
}

export function storeDeleteMessage(id: string): boolean {
  const messages = getMessagesStore();
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return false;
  messages.splice(index, 1);
  return true;
}

export function storeLikeMessage(id: string): import("@/types").GuestbookMessage | null {
  const messages = getMessagesStore();
  const message = messages.find((m) => m.id === id);
  if (!message) return null;
  message.likes += 1;
  return message;
}

// ─── Visits ─────────────────────────────────────────────────────────
const VISITS_KEY = "__personalweb_visits__";
function getVisitsStore(): { count: number; daily: Record<string, number> } {
  if (!g[VISITS_KEY]) {
    g[VISITS_KEY] = structuredClone(initialVisitsData);
  }
  return g[VISITS_KEY] as { count: number; daily: Record<string, number> };
}

export function storeGetVisitCount(): number {
  return getVisitsStore().count;
}

export function storeIncrementVisit(): number {
  const data = getVisitsStore();
  data.count += 1;
  const today = new Date().toISOString().split("T")[0];
  data.daily[today] = (data.daily[today] || 0) + 1;
  return data.count;
}

export function storeGetWeeklyVisits(): { day: string; count: number }[] {
  const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const data = getVisitsStore();
  const result: { day: string; count: number }[] = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const labelIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    result.push({ day: DAY_LABELS[labelIndex], count: data.daily[key] || 0 });
  }
  return result;
}
