import { articles, notes, allImages, journeyNodes, gardenNotes } from "@/data/generated";
import { storeGetVisitCount, storeIncrementVisit, storeGetWeeklyVisits } from "@/lib/store";
import type { SiteStats } from "@/types";

export function getLaunchDate(): Date {
  if (articles.length > 0) {
    const dates = articles.map((a) => new Date(a.date).getTime());
    const earliest = new Date(Math.min(...dates));
    return earliest;
  }
  return new Date("2026-05-01");
}

export function getDaysSinceLaunch(): number {
  const launch = getLaunchDate();
  const now = new Date();
  return Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24));
}

export function getVisitCount(): number {
  return storeGetVisitCount();
}

export function incrementVisitCount(): number {
  return storeIncrementVisit();
}

export function getWeeklyVisits(): { day: string; count: number }[] {
  return storeGetWeeklyVisits();
}

export function getSiteStats(): SiteStats {
  return {
    articleCount: articles.length,
    noteCount: notes.length,
    imageCount: allImages.length,
    journeyCount: journeyNodes.length,
    gardenCount: gardenNotes.length,
    totalVisits: getVisitCount(),
    daysSinceLaunch: getDaysSinceLaunch(),
  };
}
