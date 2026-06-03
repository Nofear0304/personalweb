import fs from "fs";
import path from "path";
import type { SiteStats } from "@/types";
import { getAllArticles } from "./articles";
import { getAllNotes } from "./notes";
import { getAllImages } from "./images";
import { getAllJourneyNodes } from "./journey";
import { getAllGardenNotes } from "./garden";

const VISITS_FILE = path.join(process.cwd(), "data/visits.json");

// Use first article date as launch date, or fallback
export function getLaunchDate(): Date {
  const articles = getAllArticles();
  if (articles.length > 0) {
    const dates = articles.map((a) => new Date(a.date).getTime());
    const earliest = new Date(Math.min(...dates));
    return earliest;
  }
  return new Date("2026-05-01"); // fallback
}

export function getDaysSinceLaunch(): number {
  const launch = getLaunchDate();
  const now = new Date();
  return Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24));
}

function readVisitsData(): { count: number; daily: Record<string, number> } {
  if (!fs.existsSync(VISITS_FILE)) return { count: 0, daily: {} };
  try {
    const data = JSON.parse(fs.readFileSync(VISITS_FILE, "utf-8"));
    return {
      count: data.count || 0,
      daily: data.daily || {},
    };
  } catch {
    return { count: 0, daily: {} };
  }
}

export function getVisitCount(): number {
  return readVisitsData().count;
}

export function incrementVisitCount(): number {
  const dir = path.dirname(VISITS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const data = readVisitsData();

  // Increment total count
  data.count += 1;

  // Increment today's daily count
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  data.daily[today] = (data.daily[today] || 0) + 1;

  fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data.count;
}

const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

// Real weekly visit data for the chart (last 7 days)
export function getWeeklyVisits(): { day: string; count: number }[] {
  const data = readVisitsData();
  const result: { day: string; count: number }[] = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
    // Map JS getDay (0=Sun) to our labels (周一=index 0)
    const labelIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    result.push({
      day: DAY_LABELS[labelIndex],
      count: data.daily[key] || 0,
    });
  }

  return result;
}

export function getSiteStats(): SiteStats {
  const articles = getAllArticles();
  const notes = getAllNotes();
  const images = getAllImages();
  const journeyNodes = getAllJourneyNodes();
  const gardenNotes = getAllGardenNotes();

  return {
    articleCount: articles.length,
    noteCount: notes.length,
    imageCount: images.length,
    journeyCount: journeyNodes.length,
    gardenCount: gardenNotes.length,
    totalVisits: getVisitCount(),
    daysSinceLaunch: getDaysSinceLaunch(),
  };
}
