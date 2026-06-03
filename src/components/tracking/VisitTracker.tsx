"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    // Only count once per browser session
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("visit_tracked")) return;

    window.sessionStorage.setItem("visit_tracked", "1");

    fetch("/api/visit", { method: "POST" }).catch(() => {
      // Silently ignore errors — visit tracking should never block the UX
    });
  }, []);

  return null; // Invisible component
}
