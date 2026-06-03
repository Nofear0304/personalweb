import type { Metadata } from "next";
import { getAlbums } from "@/lib/albums";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import AlbumCard from "@/components/gallery/AlbumCard";

export const metadata: Metadata = {
  title: "图集",
  description: "记录成长路上的风景与瞬间",
};

export default function GalleryPage() {
  const albums = getAlbums();

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Gallery"
          title="图集"
          description="记录成长路上的风景与瞬间"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {albums.map((album, index) => (
            <AlbumCard key={album.slug} album={album} index={index} />
          ))}
        </div>
      </div>
    </CosmicWrapper>
  );
}
