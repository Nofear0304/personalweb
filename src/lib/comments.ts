import fs from "fs";
import path from "path";
import type { ContentComment } from "@/types";

const COMMENTS_FILE = path.join(process.cwd(), "data/comments.json");

function ensureFile(): void {
  const dir = path.dirname(COMMENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, "[]", "utf-8");
  }
}

function readComments(): ContentComment[] {
  ensureFile();
  const raw = fs.readFileSync(COMMENTS_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeComments(comments: ContentComment[]): void {
  ensureFile();
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf-8");
}

export function getComments(slug: string): ContentComment[] {
  const comments = readComments();
  return comments
    .filter((c) => c.slug === slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addComment(
  data: Omit<ContentComment, "id" | "createdAt" | "likes">
): ContentComment {
  const comments = readComments();
  const newComment: ContentComment = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  comments.push(newComment);
  writeComments(comments);
  return newComment;
}

export function deleteComment(id: string): boolean {
  const comments = readComments();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return false;
  comments.splice(index, 1);
  writeComments(comments);
  return true;
}

export function likeComment(id: string): ContentComment | null {
  const comments = readComments();
  const comment = comments.find((c) => c.id === id);
  if (!comment) return null;
  comment.likes += 1;
  writeComments(comments);
  return comment;
}
