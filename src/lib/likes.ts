import { storeGetLikes, storeLikeContent } from "@/lib/store";

export function getLikes(type: "article" | "note", slug: string): number {
  return storeGetLikes(type, slug);
}

export function likeContent(type: "article" | "note", slug: string): number {
  return storeLikeContent(type, slug);
}
