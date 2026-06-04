import { getAllArticles } from "@/lib/articles";
import { getAllImages } from "@/lib/images";
import { getAllJourneyNodes } from "@/lib/journey";
import { getAllNotes } from "@/lib/notes";
import HeroSection from "@/components/home/HeroSection";
import GrowthJourneyPath from "@/components/home/GrowthJourneyPath";
import LatestBlog from "@/components/home/LatestBlog";
import NotesEssays from "@/components/home/NotesEssays";
import PhotoGallery from "@/components/home/PhotoGallery";
import SocialLinks from "@/components/home/SocialLinks";
import CosmicBackground from "@/components/layout/CosmicBackground";
import PageTransition from "@/components/layout/PageTransition";

export default async function HomePage() {
  const articles = await getAllArticles();
  const images = getAllImages();
  const journeyNodes = getAllJourneyNodes();
  const notes = await getAllNotes();

  return (
    <>
      {/* Hero stays outside the global cosmic wrapper — it has its own self-contained cosmic look */}
      <HeroSection />

      {/* Below-Hero sections get the global cosmic background */}
      <CosmicBackground showNebulae={true} showStars={false}>
        <PageTransition>
          <GrowthJourneyPath nodes={journeyNodes} />
          <LatestBlog articles={articles} />
          <NotesEssays notes={notes} />
          <PhotoGallery images={images} />
          <SocialLinks />
        </PageTransition>
      </CosmicBackground>
    </>
  );
}
