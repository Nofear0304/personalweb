import fs from "fs";
import path from "path";

const LIKES_FILE = path.join(process.cwd(), "data/likes.json");

interface LikesData {
  articles: Record<string, number>;
  notes: Record<string, number>;
}

function ensureFile(): void {
  const dir = path.dirname(LIKES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LIKES_FILE)) {
    fs.writeFileSync(LIKES_FILE, JSON.stringify({ articles: {}, notes: {} }, null, 2), "utf-8");
  }
}

function readLikes(): LikesData {
  ensureFile();
  const raw = fs.readFileSync(LIKES_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { articles: {}, notes: {} };
  }
}

export function getLikes(type: "article" | "note", slug: string): number {
  const data = readLikes();
  const key = type === "article" ? "articles" : "notes";
  return data[key][slug] ?? 0;
}

export function likeContent(type: "article" | "note", slug: string): number {
  ensureFile();
  const data = readLikes();
  const key = type === "article" ? "articles" : "notes";
  if (!data[key][slug]) {
    data[key][slug] = 0;
  }
  data[key][slug] += 1;
  fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data[key][slug];
}
