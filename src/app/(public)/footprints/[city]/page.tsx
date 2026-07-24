import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FadeIn from "@/components/ui/FadeIn";
import { getVisitedCities } from "@/lib/footprints";
import { footprintsCityData } from "@/data/generated";
import CityGalleryClient from "./CityGalleryClient";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return Object.keys(footprintsCityData).map((city) => ({
    city, // Next.js handles encoding automatically
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return {
    title: `${cityName} - 足迹`,
    description: `${cityName}的旅行记录`,
  };
}

export default async function CityDetailPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  // Check if city is in the mapping
  const cityImages = footprintsCityData[cityName];

  // Check if visited
  const visitedCities = await getVisitedCities();
  const isVisited = visitedCities.includes(cityName);

  // City not in mapping at all
  if (cityImages === undefined) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">城市未找到</h1>
          <p className="text-white/50 mb-6">该城市尚未收录到足迹地图中</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // City in mapping but not visited yet
  if (!isVisited) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">{cityName}</h1>
          <p className="text-white/50 mb-2">🌫️ 你还未踏足此地</p>
          <p className="text-white/30 text-sm mb-6">管理员点亮该城市后可以查看照片</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // Visited, no photos yet
  if (cityImages.length === 0) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">{cityName}</h1>
          <p className="text-white/50 mb-2">📷 暂无照片</p>
          <p className="text-white/30 text-sm mb-6">照片即将上传，敬请期待</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // Happy path: visited + has photos
  // ImageInfo objects already have all fields CityGalleryClient needs
  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-8 sm:py-12">
        <FadeIn>
          <Link
            href="/footprints"
            className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
          >
            ← 返回足迹地图
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">🏙️ {cityName}</h1>
          <p className="text-white/50 text-sm mb-8">
            共 {cityImages.length} 张照片 · 你的足迹
          </p>
        </FadeIn>

        <CityGalleryClient images={cityImages} cityName={cityName} />
      </div>
    </CosmicWrapper>
  );
}
