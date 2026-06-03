import fs from "fs";
import path from "path";
import type { Album, ImageInfo } from "@/types";

const GALLERY_DIR = path.join(process.cwd(), "public/images/gallery");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

interface AlbumDef {
  slug: string;
  title: string;
  description: string;
}

const ALBUM_DEFS: AlbumDef[] = [
  {
    slug: "campus",
    title: "学校",
    description: "校园生活的点滴记录",
  },
  {
    slug: "travel",
    title: "旅行",
    description: "旅途中的风景与故事",
  },
  {
    slug: "photography",
    title: "摄影",
    description: "精心拍摄的摄影作品",
  },
];

function countImagesInDir(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countImagesInDir(path.join(dir, entry.name));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      count++;
    }
  }
  return count;
}

function findCoverImage(albumSlug: string): string {
  const albumDir = path.join(GALLERY_DIR, albumSlug);
  if (!fs.existsSync(albumDir)) return "/images/gallery/sample.svg";

  // Look for cover.jpg or first image
  const coverPath = path.join(albumDir, "cover.jpg");
  if (fs.existsSync(coverPath)) {
    return `/images/gallery/${albumSlug}/cover.jpg`;
  }

  // Find first image file
  const entries = fs.readdirSync(albumDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      return `/images/gallery/${albumSlug}/${entry.name}`;
    }
  }

  return "/images/gallery/sample.svg";
}

export function getAlbums(): Album[] {
  return ALBUM_DEFS.map((def) => ({
    slug: def.slug,
    title: def.title,
    description: def.description,
    coverImage: findCoverImage(def.slug),
    imageCount: countImagesInDir(path.join(GALLERY_DIR, def.slug)),
  }));
}

export function getAlbumBySlug(slug: string): Album | null {
  const album = ALBUM_DEFS.find((a) => a.slug === slug);
  if (!album) return null;

  return {
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImage: findCoverImage(album.slug),
    imageCount: countImagesInDir(path.join(GALLERY_DIR, album.slug)),
  };
}

export function getAlbumImages(slug: string): ImageInfo[] {
  const albumDir = path.join(GALLERY_DIR, slug);
  if (!fs.existsSync(albumDir)) return [];

  const images: ImageInfo[] = [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (
        IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()) &&
        entry.name !== "cover.jpg"
      ) {
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(GALLERY_DIR, fullPath);
        const url = `/images/gallery/${relativePath.replace(/\\/g, "/")}`;
        images.push({
          filename: entry.name,
          url,
          size: stats.size,
          uploadedAt: stats.mtime.toISOString(),
        });
      }
    }
  }

  scan(albumDir);
  return images.sort(
    (a, b) =>
      new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
  );
}
