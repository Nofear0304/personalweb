import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTravelCities, getCityBySlug, getCityImages } from "@/lib/albums";
import { allImages } from "@/data/generated";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import AlbumGalleryClient from "@/components/gallery/AlbumGalleryClient";
import type { Album } from "@/types";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const cities = getTravelCities();
  const params = cities.map((c) => ({ city: c.slug }));

  // Also include _misc for loose photos if any exist
  const looseCount = allImages.filter(
    (img) => img.category === "旅行" && !img.location
  ).length;
  if (looseCount > 0) {
    params.push({ city: "_misc" });
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  if (cityName === "_misc") {
    return { title: "散图 - 旅行 - 图集", description: "旅途中的散图" };
  }

  const data = getCityBySlug(cityName);
  if (!data) return { title: "城市未找到 - 图集" };
  return { title: `${data.name} - 旅行 - 图集`, description: `${data.name}的旅行记录` };
}

export default async function TravelCityPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  // Handle loose photos
  if (cityName === "_misc") {
    const looseImages = allImages
      .filter((img) => img.category === "旅行" && !img.location)
      .sort(
        (a, b) =>
          new Date(b.uploadedAt || 0).getTime() -
          new Date(a.uploadedAt || 0).getTime()
      );

    if (looseImages.length === 0) notFound();

    const miscAlbum: Album = {
      slug: "travel/_misc",
      title: "散图",
      coverImage: looseImages[0]?.url || "/images/gallery/sample.svg",
      description: `${looseImages.length} 张散图`,
      imageCount: looseImages.length,
    };

    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
          <AlbumGalleryClient album={miscAlbum} images={looseImages} backHref="/gallery/travel" />
        </div>
      </CosmicWrapper>
    );
  }

  const cityData = getCityBySlug(cityName);
  if (!cityData) notFound();

  const images = getCityImages(cityName);

  const album: Album = {
    slug: `travel/${cityData.slug}`,
    title: cityData.name,
    coverImage: cityData.coverImage,
    description: `${cityData.imageCount} 张照片`,
    imageCount: cityData.imageCount,
  };

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <AlbumGalleryClient album={album} images={images} backHref="/gallery/travel" />
      </div>
    </CosmicWrapper>
  );
}
