// --- Existing types ---
export interface Article {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage?: string;
  tags?: string[];
  content: string;
  readingTime?: number;
  category?: string;
  likes?: number;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage?: string;
  tags?: string[];
  readingTime?: number;
  category?: string;
  views?: number;
  likes?: number;
}

// --- Notes types ---
export interface NoteMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: number;
  likes?: number;
  views?: number;
}

export interface Note {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: number;
  likes?: number;
  views?: number;
  content: string; // HTML
}

export interface GardenNoteMeta {
  slug: string;
  title: string;
  date: string;
  updated: string;
  tags: string[];
  links: string[];
  status: GardenStatus;
  excerpt?: string;
  likes?: number;
}

export interface ImageInfo {
  filename: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  category?: string;
  description?: string;
  location?: string;
  takenAt?: string;
}

export interface SessionData {
  isLoggedIn: boolean;
}

// --- Journey types ---
export interface JourneyEvent {
  date: string;
  title: string;
  description: string;
}

export interface JourneyNode {
  slug: string;
  title: string;
  period: string;
  coverImage?: string;
  summary: string;
  phase: string;
  tags: string[];
  events: JourneyEvent[];
  photos: string[];
  insight: string;
  conclusion: string;
  order: number;
  content: string; // HTML
}

export interface JourneyNodeMeta {
  slug: string;
  title: string;
  period: string;
  coverImage?: string;
  summary: string;
  phase: string;
  tags: string[];
  order: number;
}

// --- Garden types ---
export type GardenStatus = "seedling" | "budding" | "evergreen";

export interface GardenNote {
  slug: string;
  title: string;
  date: string;
  updated: string;
  tags: string[];
  links: string[];
  status: GardenStatus;
  content: string; // HTML
  backlinks: GardenNoteMeta[]; // computed at runtime
}

// --- Stats ---
export interface SiteStats {
  articleCount: number;
  imageCount: number;
  journeyCount: number;
  gardenCount: number;
  noteCount: number;
  totalVisits?: number;
  daysSinceLaunch?: number;
}

// --- Theme ---
export type Theme = "light" | "dark";

// --- Philosophy ---
export interface PhilosophyItem {
  text: string;
  description: string;
}

// --- Social Links ---
export interface SocialLink {
  name: string;
  url: string;
  icon: string; // SVG key name
  color: string; // brand color
  description: string;
}

// --- Friends ---
export interface Friend {
  name: string;
  url: string;
  avatar: string;
  description: string;
}

// --- Comments (articles & notes) ---
export interface ContentComment {
  id: string;
  slug: string;
  nickname: string;
  content: string;
  createdAt: string;
  likes: number;
}

// --- Guestbook ---
export interface GuestbookMessage {
  id: string;
  nickname: string;
  email?: string;
  content: string;
  createdAt: string;
  likes: number;
}

// --- Album ---
export interface Album {
  slug: string;
  title: string;
  coverImage: string;
  description: string;
  imageCount: number;
}
