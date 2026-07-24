import type { Metadata } from "next";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FootprintMap from "@/components/footprints/FootprintMap";
import { getVisitedCities } from "@/lib/footprints";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "足迹 - 我的足迹地图",
  description: "用地图记录我去过的每一座城市",
};

export default async function FootprintsPage() {
  const cities = await getVisitedCities();

  return (
    <CosmicWrapper>
      <div className="max-w-[1600px] mx-auto px-4 py-4 sm:py-6 h-screen flex flex-col">
        <FadeIn>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white text-center mb-1">
            🗺️ 足迹
          </h1>
          <p className="text-white/50 text-xs text-center mb-3">
            已点亮 {cities.length} 座城市
          </p>
        </FadeIn>

        <FootprintMap cities={cities} />
      </div>
    </CosmicWrapper>
  );
}
