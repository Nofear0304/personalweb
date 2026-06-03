"use client";

import type { ReactNode } from "react";
import CosmicBackground from "./CosmicBackground";
import PageTransition from "./PageTransition";

interface CosmicWrapperProps {
  children: ReactNode;
  showNebulae?: boolean;
}

/**
 * Convenience wrapper that combines CosmicBackground + PageTransition.
 * Use this on individual pages for a consistent cosmic look with smooth entry.
 */
export default function CosmicWrapper({
  children,
  showNebulae = true,
}: CosmicWrapperProps) {
  return (
    <CosmicBackground showNebulae={showNebulae}>
      <PageTransition>{children}</PageTransition>
    </CosmicBackground>
  );
}
