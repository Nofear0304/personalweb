import {
  storeGetMessages,
  storeAddMessage,
  storeDeleteMessage,
  storeLikeMessage,
} from "@/lib/store";
import type { GuestbookMessage } from "@/types";

export function getMessages(): GuestbookMessage[] {
  return storeGetMessages();
}

export function addMessage(
  msg: Omit<GuestbookMessage, "id" | "createdAt" | "likes">
): GuestbookMessage {
  return storeAddMessage(msg);
}

export function deleteMessage(id: string): boolean {
  return storeDeleteMessage(id);
}

export function likeMessage(id: string): GuestbookMessage | null {
  return storeLikeMessage(id);
}
