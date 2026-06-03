import fs from "fs";
import path from "path";
import type { Friend } from "@/types";

const FRIENDS_FILE = path.join(process.cwd(), "data/friends.json");

export function getFriends(): Friend[] {
  if (!fs.existsSync(FRIENDS_FILE)) return [];
  const raw = fs.readFileSync(FRIENDS_FILE, "utf-8");
  try {
    return JSON.parse(raw) as Friend[];
  } catch {
    return [];
  }
}
