# 足迹-图集图片关联重构 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旅行相册按城市子目录组织，构建脚本自动发现并生成 city→images 映射，足迹页直接从 `allImages` 按 `location` 筛选照片，删除 `data/footprints.json`。

**Architecture:** 构建时扫描 `public/images/gallery/travel/` 的子目录作为城市列表，启用 `ImageInfo.location` 字段自动填入子目录名。`travelCities` 和新的 `footprintsCityData`（类型变为 `Record<string, ImageInfo[]>`）均由构建脚本自动生成。图集新增 `/gallery/travel`（城市列表）和 `/gallery/travel/[city]`（城市照片）两个页面。

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Node.js (build script), react-masonry-css, framer-motion

## Global Constraints

- 所有数据在构建时通过 `scripts/generate-data.mjs` 内联到 `src/data/generated.ts`，零运行时文件系统访问
- 复用现有组件：`AlbumCard`、`AlbumGalleryClient`、`Lightbox`
- 足迹 `CityGalleryClient` 保留独立视觉风格，不受图集页面影响
- 目录名（城市名）直接使用中文，与 GeoJSON `properties.name` 对应
- `npm run build` 必须通过（即 `node scripts/generate-data.mjs` + `opennextjs-cloudflare build`）
- 不影响现有相册（campus、photography）和足迹地图/API

---

### Task 1: Build Script — 扫描城市子目录 + 生成 travelCities 和 footprintsCityData

**Files:**
- Modify: `scripts/generate-data.mjs:61-93` (scanImageDir), `scripts/generate-data.mjs:285-286` (footprintsCityData), `scripts/generate-data.mjs:294-345` (output template)
- Modify: `src/types/index.ts:194-197` (replace FootprintsCityMapping with TravelCity)

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `scanImageDir(dir, category, location?)` — modified signature, sets `location` on images under `travel/` subdirectories
  - `generateTravelCities()` — new function, returns `TravelCity[]`
  - `travelCities: TravelCity[]` — new export in `generated.ts`
  - `footprintsCityData: Record<string, ImageInfo[]>` — changed type (was `Record<string, string[]>`)
  - `TravelCity` type: `{ slug: string; name: string; coverImage: string; imageCount: number }`

- [ ] **Step 1: Add `TravelCity` type to `src/types/index.ts`**

Replace the `FootprintsCityMapping` interface at the bottom of the file:

```typescript
// --- Travel Cities (generated from directory structure) ---
export interface TravelCity {
  slug: string;       // city name as-is (e.g. "杭州")
  name: string;       // display name (same as slug for now)
  coverImage: string; // URL to cover image
  imageCount: number; // number of photos in this city
}
```

Remove the old `FootprintsCityMapping` interface (lines 194-197) since it will no longer be used.

- [ ] **Step 2: Modify `scanImageDir()` to accept and set `location`**

Replace the `scanImageDir` function (lines 61-86) with:

```javascript
function scanImageDir(dir, category, location) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (category === undefined) {
        // Top-level album directories → map to Chinese category labels
        const subCategory = CATEGORY_MAP[entry.name] || entry.name;
        results.push(...scanImageDir(fullPath, subCategory, undefined));
      } else if (category === "旅行") {
        // Subdirectories under "旅行" are city names → keep category, set location
        results.push(...scanImageDir(fullPath, "旅行", entry.name));
      } else {
        // Nested subdirectories under other albums → inherit category, set as location
        results.push(...scanImageDir(fullPath, category, entry.name));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;
      const stats = fs.statSync(fullPath);
      const relativePath = path.relative(GALLERY_DIR, fullPath);
      const url = `/images/gallery/${relativePath.replace(/\\/g, "/")}`;
      results.push({
        filename: entry.name,
        url,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString(),
        category,
        location: location || undefined,
      });
    }
  }
  return results;
}
```

- [ ] **Step 3: Add `generateTravelCities()` function**

Add after `countImagesInDir` (after line 129):

```javascript
function generateTravelCities() {
  const travelDir = path.join(GALLERY_DIR, "travel");
  if (!fs.existsSync(travelDir)) return [];

  const entries = fs.readdirSync(travelDir, { withFileTypes: true });
  const cities = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const cityDir = path.join(travelDir, entry.name);
    const imageCount = countImagesInDir(cityDir);
    if (imageCount === 0) continue;

    // Find cover image
    const coverPath = path.join(cityDir, "cover.jpg");
    let coverImage;
    if (fs.existsSync(coverPath)) {
      coverImage = `/images/gallery/travel/${entry.name}/cover.jpg`;
    } else {
      const imgs = fs.readdirSync(cityDir, { withFileTypes: true });
      const firstImg = imgs.find(
        (i) => i.isFile() && IMAGE_EXTENSIONS.includes(path.extname(i.name).toLowerCase())
      );
      coverImage = firstImg
        ? `/images/gallery/travel/${entry.name}/${firstImg.name}`
        : "/images/gallery/sample.svg";
    }

    cities.push({
      slug: entry.name,
      name: entry.name,
      coverImage,
      imageCount,
    });
  }
  return cities;
}
```

- [ ] **Step 4: Generate `travelCities` and `footprintsCityData` in `main()`**

After the `allImages` sort (line 276), replace the old footprints logic (lines 285-286) with:

```javascript
  // --- Travel cities (auto-discovered from directory structure) ---
  const travelCities = generateTravelCities();

  // --- Footprints city→images mapping (auto-generated from allImages by location) ---
  const footprintsCityData = {};
  for (const img of allImages) {
    if (img.category === "旅行" && img.location) {
      if (!footprintsCityData[img.location]) {
        footprintsCityData[img.location] = [];
      }
      footprintsCityData[img.location].push(img);
    }
  }
```

- [ ] **Step 5: Update the serialized output template**

In the output template string (around line 294-345):

1. Update the type import line to include `TravelCity`:
```javascript
import type { ArticleMeta, NoteMeta, GardenNoteMeta, JourneyNodeMeta, Album, ImageInfo, Friend, ContentComment, GuestbookMessage, TravelCity } from "@/types";
```

2. Add `travelCities` export before the albums section:
```javascript
// ─── Travel Cities ──────────────────────────────────────────────────
export const travelCities: TravelCity[] = ${JSON.stringify(travelCities, null, 2)};

```

3. Change the `footprintsCityData` type in the output:
```javascript
// ─── Footprints ──────────────────────────────────────────────────────
export const footprintsCityData: Record<string, ImageInfo[]> = ${JSON.stringify(footprintsCityData, null, 2)};
```

- [ ] **Step 6: Run build script and verify output**

Run: `node scripts/generate-data.mjs`
Expected: Script completes without errors. Check `src/data/generated.ts`:
- `travelCities` export exists with correct type
- `footprintsCityData` has type `Record<string, ImageInfo[]>` (not `Record<string, string[]>`)
- Images under `travel/` subdirectories have `location` set in `allImages`

- [ ] **Step 7: Verify build passes**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors about `TravelCity` or `footprintsCityData` types.

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-data.mjs src/types/index.ts src/data/generated.ts
git commit -m "feat: auto-generate travelCities and footprintsCityData from directory structure"
```

---

### Task 2: Library — 添加 getTravelCities, getCityImages, getCityBySlug

**Files:**
- Modify: `src/lib/albums.ts`

**Interfaces:**
- Consumes: `travelCities: TravelCity[]`, `allImages: ImageInfo[]`, `footprintsCityData: Record<string, ImageInfo[]>` from `@/data/generated` (produced by Task 1)
- Produces:
  - `getTravelCities(): TravelCity[]`
  - `getCityBySlug(slug: string): TravelCity | null`
  - `getCityImages(slug: string): ImageInfo[]` — filters `allImages` by `category === "旅行" && location === slug`

- [ ] **Step 1: Add the three new functions to `src/lib/albums.ts`**

Append after the existing `getAlbumImages` function:

```typescript
import { travelCities as generatedTravelCities } from "@/data/generated";
import type { TravelCity } from "@/types";

export function getTravelCities(): TravelCity[] {
  return generatedTravelCities;
}

export function getCityBySlug(slug: string): TravelCity | null {
  return generatedTravelCities.find((c) => c.slug === slug) ?? null;
}

export function getCityImages(slug: string): ImageInfo[] {
  return generatedImages
    .filter(
      (img) => img.category === "旅行" && img.location === slug
    )
    .sort(
      (a, b) =>
        new Date(b.uploadedAt || 0).getTime() -
        new Date(a.uploadedAt || 0).getTime()
    );
}
```

Note: `generatedImages` is already imported as `allImages` at the top of the file — add `travelCities as generatedTravelCities` to the existing import from `@/data/generated`.

Update the import line (line 1) from:
```typescript
import { albums as generatedAlbums, allImages as generatedImages } from "@/data/generated";
```
to:
```typescript
import { albums as generatedAlbums, allImages as generatedImages, travelCities as generatedTravelCities } from "@/data/generated";
```

And add the `TravelCity` import (line 2):
```typescript
import type { Album, ImageInfo, TravelCity } from "@/types";
```

- [ ] **Step 2: Verify with TypeScript**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/albums.ts
git commit -m "feat: add getTravelCities, getCityBySlug, getCityImages to albums lib"
```

---

### Task 3: Gallery — 创建 /gallery/travel 城市列表页和 /gallery/travel/[city] 照片页

**Files:**
- Create: `src/app/(public)/gallery/travel/page.tsx`
- Create: `src/app/(public)/gallery/travel/[city]/page.tsx`
- Modify: `src/components/gallery/AlbumGalleryClient.tsx:11-13` (add optional `backHref` prop)

**Interfaces:**
- Consumes: `getTravelCities()`, `getCityBySlug()`, `getCityImages()` from `@/lib/albums` (Task 2)
- Produces: Two new routes — `/gallery/travel` and `/gallery/travel/[city]`

- [ ] **Step 1: Modify `AlbumGalleryClient` to accept optional `backHref`**

In `src/components/gallery/AlbumGalleryClient.tsx`, change the props interface and the back link:

```typescript
interface AlbumGalleryClientProps {
  album: Album;
  images: ImageInfo[];
  backHref?: string;  // defaults to "/gallery"
}
```

Destructure with default:
```typescript
export default function AlbumGalleryClient({
  album,
  images,
  backHref = "/gallery",
}: AlbumGalleryClientProps) {
```

Change the back link's `href` from `"/gallery"` to `{backHref}`:
```tsx
<Link
  href={backHref}
  className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition-colors mb-6"
>
```

- [ ] **Step 2: Create `/gallery/travel` city list page**

Create `src/app/(public)/gallery/travel/page.tsx`:

```typescript
import type { Metadata } from "next";
import { getTravelCities } from "@/lib/albums";
import { allImages } from "@/data/generated";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import AlbumCard from "@/components/gallery/AlbumCard";
import type { Album } from "@/types";

export const metadata: Metadata = {
  title: "旅行 - 图集",
  description: "旅途中的风景与故事",
};

export default function TravelPage() {
  const cities = getTravelCities();

  // Build city cards (map TravelCity → Album shape for AlbumCard)
  const cityAlbums: Album[] = cities.map((c) => ({
    slug: `travel/${c.slug}`,
    title: c.name,
    coverImage: c.coverImage,
    description: `${c.imageCount} 张照片`,
    imageCount: c.imageCount,
  }));

  // Loose photos (travel/ images not in any city subdirectory)
  const looseCount = allImages.filter(
    (img) => img.category === "旅行" && !img.location
  ).length;

  if (looseCount > 0) {
    cityAlbums.push({
      slug: "travel/_misc",
      title: "散图",
      coverImage: allImages.find(
        (img) => img.category === "旅行" && !img.location
      )?.url || "/images/gallery/sample.svg",
      description: `${looseCount} 张散图`,
      imageCount: looseCount,
    });
  }

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Travel"
          title="旅行"
          description="旅途中的风景与故事"
        />

        {cityAlbums.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-20 text-lg">
            还没有去过的城市，敬请期待
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {cityAlbums.map((album, index) => (
              <AlbumCard key={album.slug} album={album} index={index} />
            ))}
          </div>
        )}
      </div>
    </CosmicWrapper>
  );
}
```

- [ ] **Step 3: Create `/gallery/travel/[city]` photo detail page**

Create `src/app/(public)/gallery/travel/[city]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTravelCities, getCityBySlug, getCityImages } from "@/lib/albums";
import { allImages } from "@/data/generated";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import AlbumGalleryClient from "@/components/gallery/AlbumGalleryClient";
import type { Album } from "@/types";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const cities = getTravelCities();
  const params = cities.map((c) => ({ city: c.slug }));

  // Also include _misc for loose photos if any exist
  const looseCount = allImages.filter(
    (img) => img.category === "旅行" && !img.location
  ).length;
  if (looseCount > 0) {
    params.push({ city: "_misc" });
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  if (cityName === "_misc") {
    return { title: "散图 - 旅行 - 图集", description: "旅途中的散图" };
  }

  const data = getCityBySlug(cityName);
  if (!data) return { title: "城市未找到 - 图集" };
  return { title: `${data.name} - 旅行 - 图集`, description: `${data.name}的旅行记录` };
}

export default async function TravelCityPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  // Handle loose photos
  if (cityName === "_misc") {
    const looseImages = allImages
      .filter((img) => img.category === "旅行" && !img.location)
      .sort(
        (a, b) =>
          new Date(b.uploadedAt || 0).getTime() -
          new Date(a.uploadedAt || 0).getTime()
      );

    if (looseImages.length === 0) notFound();

    const miscAlbum: Album = {
      slug: "travel/_misc",
      title: "散图",
      coverImage: looseImages[0]?.url || "/images/gallery/sample.svg",
      description: `${looseImages.length} 张散图`,
      imageCount: looseImages.length,
    };

    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
          <AlbumGalleryClient album={miscAlbum} images={looseImages} backHref="/gallery/travel" />
        </div>
      </CosmicWrapper>
    );
  }

  const cityData = getCityBySlug(cityName);
  if (!cityData) notFound();

  const images = getCityImages(cityName);

  const album: Album = {
    slug: `travel/${cityData.slug}`,
    title: cityData.name,
    coverImage: cityData.coverImage,
    description: `${cityData.imageCount} 张照片`,
    imageCount: cityData.imageCount,
  };

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <AlbumGalleryClient album={album} images={images} backHref="/gallery/travel" />
      </div>
    </CosmicWrapper>
  );
}
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. Check that `/gallery/travel` and `/gallery/travel/[city]` routes appear in the static page list.

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/gallery/travel/ src/components/gallery/AlbumGalleryClient.tsx
git commit -m "feat: add gallery travel city list and city photo pages"
```

---

### Task 4: Footprints — 改造 /footprints/[city] 使用 allImages 按 location 筛选

**Files:**
- Modify: `src/app/(public)/footprints/[city]/page.tsx`
- Modify: `src/app/(public)/footprints/[city]/CityGalleryClient.tsx:8-13` (CityImage interface → use ImageInfo)

**Interfaces:**
- Consumes: `footprintsCityData: Record<string, ImageInfo[]>` from `@/data/generated` (Task 1), `getVisitedCities()` from `@/lib/footprints`
- Produces: Updated `/footprints/[city]` pages with ImageInfo-based photo data

- [ ] **Step 1: Update `CityGalleryClient` to accept `ImageInfo[]`**

In `src/app/(public)/footprints/[city]/CityGalleryClient.tsx`, replace the local `CityImage` interface with `ImageInfo` from types:

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";
import type { ImageInfo } from "@/types";

interface CityGalleryClientProps {
  images: ImageInfo[];
  cityName: string;
}

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2,
};

export default function CityGalleryClient({ images, cityName }: CityGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const current = lightboxIndex !== null ? images[lightboxIndex] : null;
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0;
  const hasNext = lightboxIndex !== null && lightboxIndex < images.length - 1;

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-3 w-auto"
        columnClassName="pl-3 bg-clip-padding"
      >
        {images.map((img, i) => (
          <motion.div
            key={img.url}
            className="mb-3 cursor-pointer group relative overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={img.url}
              alt={`${cityName} - ${img.filename}`}
              width={400}
              height={300}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.div>
        ))}
      </Masonry>

      {/* Lightbox */}
      <AnimatePresence>
        {current && lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
              onClick={() => setLightboxIndex(null)}
            >
              ✕
            </button>

            {hasPrev && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              >
                ‹
              </button>
            )}

            <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={current.url}
                alt={current.filename}
                width={1200}
                height={900}
                className="max-w-full max-h-[85vh] object-contain"
                unoptimized
              />
            </div>

            {hasNext && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              >
                ›
              </button>
            )}

            <div className="absolute bottom-4 text-white/50 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

Changes from original:
- Remove `useMemo` import (unused)
- Replace local `CityImage` interface with `import type { ImageInfo } from "@/types"`
- `CityGalleryClientProps.images` type changed from `CityImage[]` to `ImageInfo[]`

- [ ] **Step 2: Update `/footprints/[city]/page.tsx` to use new data format**

Replace `src/app/(public)/footprints/[city]/page.tsx`:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FadeIn from "@/components/ui/FadeIn";
import { getVisitedCities } from "@/lib/footprints";
import { getTravelCities } from "@/lib/albums";
import { footprintsCityData } from "@/data/generated";
import CityGalleryClient from "./CityGalleryClient";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const cities = getTravelCities();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return {
    title: `${cityName} - 足迹`,
    description: `${cityName}的旅行记录`,
  };
}

export default async function CityDetailPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);

  // Check if city has images in the auto-generated mapping
  const cityImages = footprintsCityData[cityName];

  // Check if visited
  const visitedCities = await getVisitedCities();
  const isVisited = visitedCities.includes(cityName);

  // City not in mapping at all (no travel/ subdirectory for this city)
  if (cityImages === undefined) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">城市未找到</h1>
          <p className="text-white/50 mb-6">该城市尚未收录到足迹地图中</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // City in mapping but not visited yet
  if (!isVisited) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">{cityName}</h1>
          <p className="text-white/50 mb-2">🌫️ 你还未踏足此地</p>
          <p className="text-white/30 text-sm mb-6">管理员点亮该城市后可以查看照片</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // Visited, no photos yet
  if (cityImages.length === 0) {
    return (
      <CosmicWrapper>
        <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-white mb-4">{cityName}</h1>
          <p className="text-white/50 mb-2">📷 暂无照片</p>
          <p className="text-white/30 text-sm mb-6">照片即将上传，敬请期待</p>
          <Link
            href="/footprints"
            className="inline-flex px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← 返回足迹地图
          </Link>
        </div>
      </CosmicWrapper>
    );
  }

  // Happy path: visited + has photos (cityImages is now ImageInfo[])
  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-8 sm:py-12">
        <FadeIn>
          <Link
            href="/footprints"
            className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
          >
            ← 返回足迹地图
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">🏙️ {cityName}</h1>
          <p className="text-white/50 text-sm mb-8">
            共 {cityImages.length} 张照片 · 你的足迹
          </p>
        </FadeIn>

        <CityGalleryClient images={cityImages} cityName={cityName} />
      </div>
    </CosmicWrapper>
  );
}
```

Key changes from original:
- `generateStaticParams()` now uses `getTravelCities()` instead of `Object.keys(footprintsCityData)`
- `cityImages` is now `ImageInfo[]` instead of `string[]` — no more manual `{ filename, url }` conversion
- `CityGalleryClient` receives `ImageInfo[]` directly
- Removed the `notFound` import (unused)

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. All `/footprints/[city]` pages generated. No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/"(public)"/footprints/
git commit -m "refactor: switch footprints city page to use allImages filtered by location"
```

---

### Task 5: Cleanup — 删除 data/footprints.json 和死代码

**Files:**
- Delete: `data/footprints.json`
- Modify: `scripts/generate-data.mjs` — no changes needed (old read logic already replaced in Task 1, but double-check no residual references)
- Verify: `src/types/index.ts` — `FootprintsCityMapping` already removed in Task 1

**Interfaces:**
- Consumes: all prior tasks
- Produces: clean repo with no footprints.json dependency

- [ ] **Step 1: Delete `data/footprints.json`**

```bash
rm data/footprints.json
```

- [ ] **Step 2: Verify no remaining references**

Run: `rg "footprints\.json" --type-add 'all:*' -t all`
Expected: No matches (the only references should have been in `scripts/generate-data.mjs` which was already updated in Task 1).

Run: `rg "FootprintsCityMapping"`
Expected: No matches (removed in Task 1).

- [ ] **Step 3: Verify full build passes**

Run: `npm run build`
Expected: Build succeeds, all pages generated, no errors.

- [ ] **Step 4: Commit**

```bash
git add data/footprints.json
git commit -m "chore: remove data/footprints.json, now auto-generated from directory structure"
```

---

## Verification Checklist

After all tasks complete:

1. `node scripts/generate-data.mjs` — runs without error
2. `npx tsc --noEmit` — zero type errors
3. `npm run build` — all static pages generated, including:
   - `/footprints` — map page
   - `/footprints/[city]` — one page per city in `travel/` subdirectories
   - `/gallery` — unchanged
   - `/gallery/travel` — city list
   - `/gallery/travel/[city]` — one page per city + `_misc` if loose photos exist
4. `travelCities` exported from `generated.ts` with correct data
5. `footprintsCityData` has type `Record<string, ImageInfo[]>` and correct content
6. `ImageInfo.location` is populated for images under `travel/<city>/`
7. `data/footprints.json` no longer exists
8. `FootprintsCityMapping` type no longer exists

## Migration Notes

After deployment, the admin must:

1. Move existing `public/images/gallery/travel/*.jpg` photos into city subdirectories, e.g.:
   ```
   travel/杭州/west-lake.jpg
   travel/成都/jinli.jpg
   ```
2. Optionally add `cover.jpg` in each city directory as the cover image
3. Rebuild and redeploy — `travelCities` and `footprintsCityData` are regenerated automatically
