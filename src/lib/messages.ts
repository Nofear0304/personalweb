import fs from "fs";
import path from "path";
import type { GuestbookMessage } from "@/types";

const MESSAGES_FILE = path.join(process.cwd(), "data/messages.json");

function ensureFile(): void {
  const dir = path.dirname(MESSAGES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, "[]", "utf-8");
  }
}

export function getMessages(): GuestbookMessage[] {
  ensureFile();
  const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
  try {
    const messages: GuestbookMessage[] = JSON.parse(raw);
    return messages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function addMessage(
  msg: Omit<GuestbookMessage, "id" | "createdAt" | "likes">
): GuestbookMessage {
  ensureFile();
  const messages = getMessages();
  const newMessage: GuestbookMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  messages.push(newMessage);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  return newMessage;
}

export function deleteMessage(id: string): boolean {
  ensureFile();
  const messages = getMessages();
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return false;
  messages.splice(index, 1);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  return true;
}

export function likeMessage(id: string): GuestbookMessage | null {
  ensureFile();
  const messages = getMessages();
  const message = messages.find((m) => m.id === id);
  if (!message) return null;
  message.likes += 1;
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  return message;
}
