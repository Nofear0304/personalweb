"use client";

import StarryBackground from "./StarryBackground";
import ShootingStars from "./ShootingStars";
import HeroContent from "./HeroContent";
import CursorEffect from "@/components/ui/CursorEffect";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ── Deep space gradient background ── */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, #0d1b3e 0%, #0a1530 30%, #080e24 60%, #050a18 100%)
          `,
        }}
      />

      {/* ── Nebula: top-right corner ── */}
      <div
        className="absolute -z-10 pointer-events-none"
        style={{
          top: "-15%",
          right: "-10%",
          width: "55%",
          height: "55%",
          background:
            "radial-gradient(ellipse at center, rgba(60, 90, 180, 0.18) 0%, rgba(40, 70, 160, 0.08) 35%, transparent 70%)",
          filter: "blur(80px)",
          animation: "nebula-float 18s ease-in-out infinite",
        }}
      />

      {/* ── Nebula: bottom-left corner ── */}
      <div
        className="absolute -z-10 pointer-events-none"
        style={{
          bottom: "-10%",
          left: "-8%",
          width: "50%",
          height: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(100, 70, 180, 0.15) 0%, rgba(70, 50, 150, 0.06) 35%, transparent 70%)",
          filter: "blur(80px)",
          animation: "nebula-float 22s ease-in-out infinite reverse",
        }}
      />

      {/* ── Subtle center-top nebula accent ── */}
      <div
        className="absolute -z-10 pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40%",
          height: "30%",
          background:
            "radial-gradient(ellipse at center, rgba(80, 120, 200, 0.1) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Star particle field (tsParticles) ── */}
      <StarryBackground />

      {/* ── Shooting stars ── */}
      <ShootingStars />

      {/* ── Mouse cursor trail effect ── */}
      <CursorEffect />

      {/* ── Hero content ── */}
      <HeroContent />
    </section>
  );
}
