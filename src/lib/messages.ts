import {
  storeGetMessages,
  storeAddMessage,
  storeDeleteMessage,
  storeLikeMessage,
} from "@/lib/store";
import type { GuestbookMessage } from "@/types";

export async function getMessages(): Promise<GuestbookMessage[]> {
  return storeGetMessages();
}

export async function addMessage(
  msg: Omit<GuestbookMessage, "id" | "createdAt" | "likes">
): Promise<GuestbookMessage> {
  return storeAddMessage(msg);
}

export async function deleteMessage(id: string): Promise<boolean> {
  return storeDeleteMessage(id);
}

export async function likeMessage(id: string): Promise<GuestbookMessage | null> {
  return storeLikeMessage(id);
}
