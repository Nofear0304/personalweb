import { allImages as generatedImages } from "@/data/generated";
import type { ImageInfo } from "@/types";

export function getAllImages(): ImageInfo[] {
  return generatedImages;
}

export function deleteImage(
  _filename: string
): { success: boolean; error?: string } {
  // Image deletion is not supported in serverless mode
  // Images can be managed by adding/removing files from public/images/gallery/ and redeploying
  return {
    success: false,
    error: "Image deletion is not supported in serverless mode. Please remove the image from public/images/gallery/ and redeploy.",
  };
}

export function getImageCount(): number {
  return generatedImages.length;
}
