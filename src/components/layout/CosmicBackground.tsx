"use client";

import type { ReactNode } from "react";
import StarryBackground from "@/components/home/StarryBackground";

interface CosmicBackgroundProps {
  children: ReactNode;
  showNebulae?: boolean;
  showStars?: boolean;
}

/**
 * Global cosmic background wrapper.
 * Provides the deep space gradient + optional nebulae + optional star field
 * that sits behind all page content.
 */
export default function CosmicBackground({
  children,
  showNebulae = true,
  showStars = false,
}: CosmicBackgroundProps) {
  return (
    <div className="relative">
      {/* ── Deep space gradient background (fixed, behind everything) ── */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 60% at 50% 40%,
              #081229 0%,
              #051020 30%,
              #030c1a 60%,
              #020817 100%
            )
          `,
        }}
      />

      {/* ── Nebulae (fixed, behind content) ── */}
      {showNebulae && (
        <>
          {/* Top-right corner — blue nebula */}
          <div
            className="fixed -z-40 pointer-events-none"
            style={{
              top: "-15%",
              right: "-10%",
              width: "55%",
              height: "55%",
              background:
                "radial-gradient(ellipse at center, rgba(60, 90, 180, 0.12) 0%, rgba(40, 70, 160, 0.04) 35%, transparent 70%)",
              filter: "blur(80px)",
              animation: "nebula-float 18s ease-in-out infinite",
            }}
          />

          {/* Bottom-left corner — purple nebula */}
          <div
            className="fixed -z-40 pointer-events-none"
            style={{
              bottom: "-10%",
              left: "-8%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(100, 70, 180, 0.10) 0%, rgba(70, 50, 150, 0.04) 35%, transparent 70%)",
              filter: "blur(80px)",
              animation: "nebula-float 22s ease-in-out infinite reverse",
            }}
          />

          {/* Center-top subtle accent nebula */}
          <div
            className="fixed -z-40 pointer-events-none"
            style={{
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "40%",
              height: "30%",
              background:
                "radial-gradient(ellipse at center, rgba(80, 120, 200, 0.06) 0%, transparent 60%)",
              filter: "blur(60px)",
            }}
          />
        </>
      )}

      {/* ── Optional star field (fixed, behind content but above gradient) ── */}
      {showStars && (
        <div className="fixed inset-0 -z-30">
          <StarryBackground />
        </div>
      )}

      {/* ── Page content ── */}
      {children}
    </div>
  );
}
