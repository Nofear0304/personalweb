import fs from "fs";
import path from "path";
import type { ImageInfo } from "@/types";

const GALLERY_DIR = path.join(process.cwd(), "public/images/gallery");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

// Map folder names to Chinese category labels
const CATEGORY_MAP: Record<string, string> = {
  campus: "校园",
  travel: "旅行",
  life: "生活",
  photography: "摄影",
};

function scanDirectory(
  dir: string,
  category?: string
): ImageInfo[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: ImageInfo[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Determine category from folder name
      const folderCategory = CATEGORY_MAP[entry.name] || entry.name;
      results.push(...scanDirectory(fullPath, folderCategory));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;

      const stats = fs.statSync(fullPath);
      const relativePath = path.relative(GALLERY_DIR, fullPath);
      const url = `/images/gallery/${relativePath.replace(/\\/g, "/")}`;

      results.push({
        filename: entry.name,
        url,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString(),
        category,
      } as ImageInfo);
    }
  }

  return results;
}

export function getAllImages(): ImageInfo[] {
  const images = scanDirectory(GALLERY_DIR);
  return images.sort(
    (a, b) =>
      new Date(b.uploadedAt || 0).getTime() -
      new Date(a.uploadedAt || 0).getTime()
  );
}

export function deleteImage(
  filename: string
): { success: boolean; error?: string } {
  try {
    // Prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(GALLERY_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: "Image not found" };
    }

    // Verify it's actually in the gallery directory
    if (!filePath.startsWith(GALLERY_DIR)) {
      return { success: false, error: "Invalid file path" };
    }

    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

export function getImageCount(): number {
  return getAllImages().length;
}
