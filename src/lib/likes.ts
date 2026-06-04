import { storeGetLikes, storeLikeContent } from "@/lib/store";

export async function getLikes(type: "article" | "note", slug: string): Promise<number> {
  return storeGetLikes(type, slug);
}

export async function likeContent(type: "article" | "note", slug: string): Promise<number> {
  return storeLikeContent(type, slug);
}
