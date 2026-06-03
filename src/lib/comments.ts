import {
  storeGetComments,
  storeAddComment,
  storeDeleteComment,
  storeLikeComment,
} from "@/lib/store";
import type { ContentComment } from "@/types";

export function getComments(slug: string): ContentComment[] {
  return storeGetComments(slug);
}

export function addComment(
  data: Omit<ContentComment, "id" | "createdAt" | "likes">
): ContentComment {
  return storeAddComment(data);
}

export function deleteComment(id: string): boolean {
  return storeDeleteComment(id);
}

export function likeComment(id: string): ContentComment | null {
  return storeLikeComment(id);
}
