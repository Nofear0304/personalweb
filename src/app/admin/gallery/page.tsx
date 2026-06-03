"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ImageInfo } from "@/types";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminGalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch("/api/images");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(filename: string) {
    if (!confirm(`确定要删除图片「${filename}」吗？此操作不可撤销。`)) return;

    setDeleting(filename);
    try {
      const res = await fetch(
        `/api/images?file=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setImages(images.filter((img) => img.filename !== filename));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-8">图片管理</h1>

      {/* Upload Section */}
      <section className="mb-10">
        <h2 className="font-medium text-lg mb-4">上传新图片</h2>
        <ImageUploader />
      </section>

      {/* Image Grid */}
      <section>
        <h2 className="font-medium text-lg mb-4">
          所有图片 ({images.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <p className="text-[var(--muted)]">还没有图片，上传第一张吧。</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image) => (
              <div key={image.filename} className="group relative aspect-square rounded-lg overflow-hidden bg-[var(--border)]">
                <Image
                  src={image.url}
                  alt={image.filename}
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-cover"
                />
                {/* Overlay with delete button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.filename)}
                    disabled={deleting === image.filename}
                    className="p-2 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 disabled:opacity-50"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
                {/* Filename */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{image.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
