import { albums as generatedAlbums, allImages as generatedImages } from "@/data/generated";
import type { Album, ImageInfo } from "@/types";

export function getAlbums(): Album[] {
  return generatedAlbums;
}

export function getAlbumBySlug(slug: string): Album | null {
  return generatedAlbums.find((a) => a.slug === slug) ?? null;
}

export function getAlbumImages(slug: string): ImageInfo[] {
  const album = generatedAlbums.find((a) => a.slug === slug);
  if (!album) return [];

  // Images are already pre-categorized by the data generation script
  return generatedImages
    .filter((img) => {
      // Match images whose category maps to this album
      const categoryMap: Record<string, string> = {
        campus: "校园",
        travel: "旅行",
        life: "生活",
        photography: "摄影",
      };
      const expectedCategory = categoryMap[slug] || slug;
      return img.category === expectedCategory;
    })
    .sort(
      (a, b) =>
        new Date(b.uploadedAt || 0).getTime() -
        new Date(a.uploadedAt || 0).getTime()
    );
}
