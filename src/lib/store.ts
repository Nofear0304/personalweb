/**
 * Persistent key-value store backed by Cloudflare KV, with an in-memory
 * fallback for local development.
 *
 * On Cloudflare Workers, `fs` is not available. This module uses Cloudflare KV
 * (via the PERSONALWEB_KV binding) for durable persistence across worker
 * instances and evictions.
 *
 * In local dev (`next dev`), KV bindings aren't available; falls back to
 * `globalThis` — data lives for the lifetime of the dev server.
 */

import { initialLikesData, initialCommentsData, initialMessagesData, initialVisitsData } from "@/data/generated";
import type { GuestbookMessage, ContentComment } from "@/types";

// ─── Minimal KV interface (avoids requiring @cloudflare/workers-types) ──

interface SimpleKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
  delete(key: string): Promise<void>;
}

// ─── KV helper ────────────────────────────────────────────────────────

/** Lazily resolve and verify the KV binding. Returns null if unavailable. */
let _kv: SimpleKV | null | undefined;

async function getKV(): Promise<SimpleKV | null> {
  if (_kv !== undefined) return _kv as SimpleKV | null;
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const candidate = (ctx.env as Record<string, unknown>).PERSONALWEB_KV as SimpleKV | undefined;
    if (!candidate) {
      _kv = null;
      return null;
    }
    // Verify the binding works with a lightweight read — at build time or
    // when the binding is misconfigured, KV operations may throw.
    await candidate.get("__health_check__");
    _kv = candidate;
  } catch {
    _kv = null;
  }
  return _kv as SimpleKV | null;
}

// ─── In-memory fallback (globalThis) ──────────────────────────────────

const g = globalThis as Record<string, unknown>;

// ─── Likes ────────────────────────────────────────────────────────────
const LIKES_KEY = "__personalweb_likes__";
const KV_LIKES_KEY = "likes";

function getLikesFallback(): { articles: Record<string, number>; notes: Record<string, number> } {
  if (!g[LIKES_KEY]) {
    g[LIKES_KEY] = structuredClone(initialLikesData);
  }
  return g[LIKES_KEY] as { articles: Record<string, number>; notes: Record<string, number> };
}

async function readLikesFromKV(): Promise<{ articles: Record<string, number>; notes: Record<string, number> }> {
  const kv = await getKV();
  if (!kv) return getLikesFallback();
  const raw = await kv.get(KV_LIKES_KEY);
  if (raw) return JSON.parse(raw) as { articles: Record<string, number>; notes: Record<string, number> };
  // Seed KV with initial data on first read
  const seed = structuredClone(initialLikesData);
  await kv.put(KV_LIKES_KEY, JSON.stringify(seed));
  return seed;
}

export async function storeGetLikes(type: "article" | "note", slug: string): Promise<number> {
  const kv = await getKV();
  if (!kv) {
    const data = getLikesFallback();
    const key = type === "article" ? "articles" : "notes";
    return data[key][slug] ?? 0;
  }
  const data = await readLikesFromKV();
  const key = type === "article" ? "articles" : "notes";
  return data[key][slug] ?? 0;
}

export async function storeLikeContent(type: "article" | "note", slug: string): Promise<number> {
  const kv = await getKV();
  if (!kv) {
    const data = getLikesFallback();
    const key = type === "article" ? "articles" : "notes";
    if (!data[key][slug]) data[key][slug] = 0;
    data[key][slug] += 1;
    return data[key][slug];
  }
  const data = await readLikesFromKV();
  const key = type === "article" ? "articles" : "notes";
  if (!data[key][slug]) data[key][slug] = 0;
  data[key][slug] += 1;
  await kv.put(KV_LIKES_KEY, JSON.stringify(data));
  return data[key][slug];
}

// ─── Comments ─────────────────────────────────────────────────────────
const COMMENTS_KEY = "__personalweb_comments__";

function getCommentsFallback(): ContentComment[] {
  if (!g[COMMENTS_KEY]) {
    g[COMMENTS_KEY] = structuredClone(initialCommentsData);
  }
  return g[COMMENTS_KEY] as ContentComment[];
}

function kvCommentsKey(slug: string): string {
  return `comments:${slug}`;
}

export async function storeGetComments(slug: string): Promise<ContentComment[]> {
  const kv = await getKV();
  if (!kv) {
    return getCommentsFallback()
      .filter((c) => c.slug === slug)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const raw = await kv.get(kvCommentsKey(slug));
  if (!raw) return [];
  return JSON.parse(raw) as ContentComment[];
}

export async function storeAddComment(
  data: Omit<ContentComment, "id" | "createdAt" | "likes">
): Promise<ContentComment> {
  const newComment: ContentComment = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const kv = await getKV();
  if (!kv) {
    getCommentsFallback().push(newComment);
    return newComment;
  }

  const key = kvCommentsKey(data.slug);
  const raw = await kv.get(key);
  const comments: ContentComment[] = raw ? JSON.parse(raw) : [];
  comments.push(newComment);
  await kv.put(key, JSON.stringify(comments));
  return newComment;
}

export async function storeDeleteComment(id: string): Promise<boolean> {
  const kv = await getKV();
  if (!kv) {
    const comments = getCommentsFallback();
    const index = comments.findIndex((c) => c.id === id);
    if (index === -1) return false;
    comments.splice(index, 1);
    return true;
  }

  // KV: we don't know the slug from the id alone, so we need to search all comment keys.
  // For simplicity, we iterate through all keys matching "comments:*".
  // Since comment volume is low, this is acceptable.
  const { keys } = await kv.list({ prefix: "comments:" });
  for (const k of keys) {
    const raw = await kv.get(k.name);
    if (!raw) continue;
    const comments: ContentComment[] = JSON.parse(raw);
    const idx = comments.findIndex((c) => c.id === id);
    if (idx !== -1) {
      comments.splice(idx, 1);
      await kv.put(k.name, JSON.stringify(comments));
      return true;
    }
  }
  return false;
}

export async function storeLikeComment(id: string): Promise<ContentComment | null> {
  const kv = await getKV();
  if (!kv) {
    const comments = getCommentsFallback();
    const comment = comments.find((c) => c.id === id);
    if (!comment) return null;
    comment.likes += 1;
    return comment;
  }

  const { keys } = await kv.list({ prefix: "comments:" });
  for (const k of keys) {
    const raw = await kv.get(k.name);
    if (!raw) continue;
    const comments: ContentComment[] = JSON.parse(raw);
    const comment = comments.find((c) => c.id === id);
    if (comment) {
      comment.likes += 1;
      await kv.put(k.name, JSON.stringify(comments));
      return comment;
    }
  }
  return null;
}

// ─── Messages (Guestbook) ─────────────────────────────────────────────
const MESSAGES_KEY = "__personalweb_messages__";
const KV_MESSAGES_KEY = "messages";

function getMessagesFallback(): GuestbookMessage[] {
  if (!g[MESSAGES_KEY]) {
    g[MESSAGES_KEY] = structuredClone(initialMessagesData);
  }
  return g[MESSAGES_KEY] as GuestbookMessage[];
}

export async function storeGetMessages(): Promise<GuestbookMessage[]> {
  const kv = await getKV();
  if (!kv) {
    return getMessagesFallback().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  const raw = await kv.get(KV_MESSAGES_KEY);
  if (!raw) {
    // Seed with initial data
    const seed = structuredClone(initialMessagesData);
    await kv.put(KV_MESSAGES_KEY, JSON.stringify(seed));
    return seed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return (JSON.parse(raw) as GuestbookMessage[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function storeAddMessage(
  msg: Omit<GuestbookMessage, "id" | "createdAt" | "likes">
): Promise<GuestbookMessage> {
  const newMessage: GuestbookMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const kv = await getKV();
  if (!kv) {
    getMessagesFallback().push(newMessage);
    return newMessage;
  }

  const raw = await kv.get(KV_MESSAGES_KEY);
  const messages: GuestbookMessage[] = raw ? JSON.parse(raw) : [];
  messages.push(newMessage);
  await kv.put(KV_MESSAGES_KEY, JSON.stringify(messages));
  return newMessage;
}

export async function storeDeleteMessage(id: string): Promise<boolean> {
  const kv = await getKV();
  if (!kv) {
    const messages = getMessagesFallback();
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return false;
    messages.splice(index, 1);
    return true;
  }

  const raw = await kv.get(KV_MESSAGES_KEY);
  if (!raw) return false;
  const messages: GuestbookMessage[] = JSON.parse(raw);
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return false;
  messages.splice(index, 1);
  await kv.put(KV_MESSAGES_KEY, JSON.stringify(messages));
  return true;
}

export async function storeLikeMessage(id: string): Promise<GuestbookMessage | null> {
  const kv = await getKV();
  if (!kv) {
    const messages = getMessagesFallback();
    const message = messages.find((m) => m.id === id);
    if (!message) return null;
    message.likes += 1;
    return message;
  }

  const raw = await kv.get(KV_MESSAGES_KEY);
  if (!raw) return null;
  const messages: GuestbookMessage[] = JSON.parse(raw);
  const message = messages.find((m) => m.id === id);
  if (!message) return null;
  message.likes += 1;
  await kv.put(KV_MESSAGES_KEY, JSON.stringify(messages));
  return message;
}

// ─── Visits ───────────────────────────────────────────────────────────
const VISITS_KEY = "__personalweb_visits__";
const KV_VISITS_KEY = "visits";

function getVisitsFallback(): { count: number; daily: Record<string, number> } {
  if (!g[VISITS_KEY]) {
    g[VISITS_KEY] = structuredClone(initialVisitsData);
  }
  return g[VISITS_KEY] as { count: number; daily: Record<string, number> };
}

async function readVisitsFromKV(): Promise<{ count: number; daily: Record<string, number> }> {
  const kv = await getKV();
  if (!kv) return getVisitsFallback();
  const raw = await kv.get(KV_VISITS_KEY);
  if (raw) return JSON.parse(raw) as { count: number; daily: Record<string, number> };
  const seed = structuredClone(initialVisitsData);
  await kv.put(KV_VISITS_KEY, JSON.stringify(seed));
  return seed;
}

export async function storeGetVisitCount(): Promise<number> {
  const kv = await getKV();
  if (!kv) return getVisitsFallback().count;
  const data = await readVisitsFromKV();
  return data.count;
}

export async function storeIncrementVisit(): Promise<number> {
  const kv = await getKV();
  if (!kv) {
    const data = getVisitsFallback();
    data.count += 1;
    const today = new Date().toISOString().split("T")[0];
    data.daily[today] = (data.daily[today] || 0) + 1;
    return data.count;
  }

  const data = await readVisitsFromKV();
  data.count += 1;
  const today = new Date().toISOString().split("T")[0];
  data.daily[today] = (data.daily[today] || 0) + 1;
  await kv.put(KV_VISITS_KEY, JSON.stringify(data));
  return data.count;
}

export async function storeGetWeeklyVisits(): Promise<{ day: string; count: number }[]> {
  const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const kv = await getKV();
  let daily: Record<string, number>;
  if (!kv) {
    daily = getVisitsFallback().daily;
  } else {
    const data = await readVisitsFromKV();
    daily = data.daily;
  }

  const result: { day: string; count: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const labelIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    result.push({ day: DAY_LABELS[labelIndex], count: daily[key] || 0 });
  }
  return result;
}
