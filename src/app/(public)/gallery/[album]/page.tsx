import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlbums, getAlbumBySlug, getAlbumImages } from "@/lib/albums";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import AlbumGalleryClient from "@/components/gallery/AlbumGalleryClient";

interface Props {
  params: Promise<{ album: string }>;
}

export async function generateStaticParams() {
  const albums = getAlbums();
  return albums.map((album) => ({ album: album.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { album } = await params;
  const data = getAlbumBySlug(album);
  if (!data) return { title: "相册未找到" };

  return {
    title: `${data.title} - 图集`,
    description: data.description,
  };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { album } = await params;
  const albumData = getAlbumBySlug(album);
  if (!albumData) notFound();

  const images = getAlbumImages(album);

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <AlbumGalleryClient album={albumData} images={images} />
      </div>
    </CosmicWrapper>
  );
}
