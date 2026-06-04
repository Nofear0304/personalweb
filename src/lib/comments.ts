import {
  storeGetComments,
  storeAddComment,
  storeDeleteComment,
  storeLikeComment,
} from "@/lib/store";
import type { ContentComment } from "@/types";

export async function getComments(slug: string): Promise<ContentComment[]> {
  return storeGetComments(slug);
}

export async function addComment(
  data: Omit<ContentComment, "id" | "createdAt" | "likes">
): Promise<ContentComment> {
  return storeAddComment(data);
}

export async function deleteComment(id: string): Promise<boolean> {
  return storeDeleteComment(id);
}

export async function likeComment(id: string): Promise<ContentComment | null> {
  return storeLikeComment(id);
}
