import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import PageTransition from "@/components/layout/PageTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CosmicBackground showNebulae={true} showStars={false}>
      <Header />
      <main className="flex-1 relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </CosmicBackground>
  );
}
