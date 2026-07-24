import type { Metadata } from "next";
import { getTravelCities } from "@/lib/albums";
import { allImages } from "@/data/generated";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import AlbumCard from "@/components/gallery/AlbumCard";
import type { Album } from "@/types";

export const metadata: Metadata = {
  title: "旅行 - 图集",
  description: "旅途中的风景与故事",
};

export default function TravelPage() {
  const cities = getTravelCities();

  // Build city cards (map TravelCity → Album shape for AlbumCard)
  const cityAlbums: Album[] = cities.map((c) => ({
    slug: `travel/${c.slug}`,
    title: c.name,
    coverImage: c.coverImage,
    description: `${c.imageCount} 张照片`,
    imageCount: c.imageCount,
  }));

  // Loose photos (travel/ images not in any city subdirectory)
  const looseCount = allImages.filter(
    (img) => img.category === "旅行" && !img.location
  ).length;

  if (looseCount > 0) {
    cityAlbums.push({
      slug: "travel/_misc",
      title: "散图",
      coverImage: allImages.find(
        (img) => img.category === "旅行" && !img.location
      )?.url || "/images/gallery/sample.svg",
      description: `${looseCount} 张散图`,
      imageCount: looseCount,
    });
  }

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Travel"
          title="旅行"
          description="旅途中的风景与故事"
        />

        {cityAlbums.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-20 text-lg">
            还没有去过的城市，敬请期待
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {cityAlbums.map((album, index) => (
              <AlbumCard key={album.slug} album={album} index={index} />
            ))}
          </div>
        )}
      </div>
    </CosmicWrapper>
  );
}
