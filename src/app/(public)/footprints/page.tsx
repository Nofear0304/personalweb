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
      <div className="max-w-[1400px] mx-auto px-5 py-8 sm:py-12">
        <FadeIn>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white text-center mb-2">
            🗺️ 足迹
          </h1>
          <p className="text-white/50 text-sm text-center mb-8">
            已点亮 {cities.length} 座城市
          </p>
        </FadeIn>

        <FootprintMap cities={cities} />
      </div>
    </CosmicWrapper>
  );
}
