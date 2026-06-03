import Link from "next/link";
import Image from "next/image";
import type { ImageInfo } from "@/types";
import FadeIn from "@/components/ui/FadeIn";

interface GalleryPreviewProps {
  images: ImageInfo[];
}

export default function GalleryPreview({ images }: GalleryPreviewProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="max-w-5xl mx-auto px-5 py-20 border-t border-[var(--border)]">
      <FadeIn>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-[var(--accent)] mb-2 tracking-wider uppercase">
              瞬间定格
            </p>
            <h2 className="font-serif text-3xl font-bold">摄影作品</h2>
          </div>
          <Link
            href="/gallery"
            className="hidden sm:inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            查看全部
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {images.slice(0, 6).map((image, index) => (
          <FadeIn key={image.filename} delay={index * 0.08}>
            <Link
              href="/gallery"
              className="block aspect-square relative rounded-xl overflow-hidden bg-[var(--border)] group"
            >
              <Image
                src={image.url}
                alt={image.filename}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
