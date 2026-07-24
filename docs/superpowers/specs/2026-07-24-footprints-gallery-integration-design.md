# 足迹-图集图片关联重构 — 设计文档

**日期：** 2026-07-24
**状态：** 已确认

---

## 1. 背景与动机

当前足迹页面通过独立的 `data/footprints.json` 手动维护「城市名 → 图片 URL 数组」映射。存在问题：

- 手动维护图片 URL 繁琐易错
- 图片与图集系统完全割裂——图集的"旅行"相册有 23 张照片，足迹却用另一套映射
- `CityGalleryClient` 自建瀑布流+灯箱，与现有的 `AlbumGalleryClient` + `Lightbox` 功能重复
- `ImageInfo.location` 字段已定义但未使用

**目标：** 在图集的旅行模块里按城市子目录存放图片，构建脚本自动发现并生成映射，足迹页自动关联，删除 `data/footprints.json`。

---

## 2. 目录结构变更

### 2.1 磁盘布局

```
public/images/gallery/travel/
  ├── 杭州/                    ← 城市子目录（目录名 = 城市名）
  │   ├── cover.jpg            ← 可选：城市封面图
  │   ├── west-lake.jpg
  │   └── lingyin-temple.jpg
  ├── 成都/
  │   ├── cover.jpg
  │   └── jinli.jpg
  └── loose-photo.jpg          ← 不在子目录的散图仍然支持
```

### 2.2 目录名约定

- 子目录名即为城市中文名（与 GeoJSON 中的 `properties.name` 对应）
- 目录名直接用作 URL 路径（如 `/gallery/travel/杭州`），构建时处理 URL 编码
- 不在任何子目录的图片标记为 `location: undefined`，归入"散图"

---

## 3. 数据模型变更

### 3.1 `ImageInfo.location` 字段启用

构建脚本 `scanImageDir()` 递归扫描时自动提取子目录名：

```
travel/杭州/west-lake.jpg → category: "旅行", location: "杭州"
travel/成都/jinli.jpg     → category: "旅行", location: "成都"
travel/loose-photo.jpg    → category: "旅行", location: undefined
```

### 3.2 新增构建时导出

在 `src/data/generated.ts` 中新增：

```typescript
// 旅行城市列表——从目录结构自动生成
export const travelCities: {
  slug: string;        // URL 安全的城市名，如 "杭州"（中文原样，使用 encodeURIComponent）
  name: string;        // 城市显示名，如 "杭州"
  coverImage: string;  // 封面图 URL（优先 cover.jpg，否则第一张）
  imageCount: number;  // 该城市照片数量
}[];

// 城市→图片列表映射——从 allImages 按 category + location 自动分组
export const footprintsCityData: Record<string, ImageInfo[]>;
```

### 3.3 删除

- **文件：** `data/footprints.json` — 不再需要
- **构建脚本：** 移除对 `data/footprints.json` 的读取和内联逻辑
- **类型：** `FootprintsCityMapping`（`src/types/index.ts`）可移除（如果无其他引用）

---

## 4. 路由与页面变更

### 4.1 图集 — 旅行相册页

**`/gallery/travel`** → `src/app/(public)/gallery/travel/page.tsx`（新增）

从"全部旅行照片瀑布流"变为"去过的城市卡片列表"：

- 复用 `AlbumCard` 组件渲染城市卡片
- 展示数据源：`travelCities`
- 点击城市 → `/gallery/travel/[city]`
- 散图（不在任何子目录的）以独立卡片展示
- 未去过的城市（没有对应子目录）不显示

> **注意：** 现有 `/gallery/travel` 路由由 `src/app/(public)/gallery/[album]/page.tsx` 的动态路由 `[album]` 捕获。新增 `gallery/travel/page.tsx` 作为静态路由会优先匹配（Next.js 静态路由优先级高于动态路由）。

### 4.2 图集 — 城市照片详情页

**`/gallery/travel/[city]`** → `src/app/(public)/gallery/travel/[city]/page.tsx`（新增）

- 复用 `AlbumGalleryClient` + `Lightbox`
- 数据：`allImages.filter(img => img.category === "旅行" && img.location === city)`
- 顶部显示"← 返回旅行"链接
- 封面：`travelCities` 中该城市的 `coverImage`
- 未找到城市 → `notFound()`

### 4.3 足迹 — 城市图片详情页

**`/footprints/[city]`** → 改造现有 `src/app/(public)/footprints/[city]/page.tsx`

**数据获取变更：**
- 之前：`footprintsCityData[cityName]` → 手动维护的 URL 字符串数组
- 之后：`allImages.filter(img => img.category === "旅行" && img.location === cityName)` → 完整的 `ImageInfo[]`

**`generateStaticParams()` 变更：**
- 之前：`Object.keys(footprintsCityData)`
- 之后：`travelCities.map(c => ({ city: c.slug }))`

**组件层面：**
- 保留 `CityGalleryClient`，保持独立视觉风格（返回地图按钮、足迹色调等）
- 但传入的数据类型从 `{ filename, url }[]` 变为 `ImageInfo[]`

### 4.4 足迹 — 地图页面

**`/footprints`** → `src/app/(public)/footprints/page.tsx`

无需改动。它只依赖 KV 中的城市名列表（`getVisitedCities()`），图片关联在详情页才用到。

---

## 5. 构建脚本变更

### `scripts/generate-data.mjs`

**`scanImageDir()` 改造：**
- 递归扫描时记录每张图片所在的子目录名
- 子目录名填入 `ImageInfo.location` 字段
- 只有 `travel/` 下的图片按子目录设置 `location`（其他相册不设）

**`CATEGORY_MAP` 保持不变：**
```
campus → "校园"
travel → "旅行"
life   → "生活"
photography → "摄影"
```

**新增逻辑：**
1. 扫描 `public/images/gallery/travel/` 的**直接子目录**作为城市列表
2. 每个城市目录内：`findCoverImage()` + `countImagesInDir()`
3. 生成 `travelCities` 数组
4. 生成 `footprintsCityData`：按 `location` 分组的 `Record<string, ImageInfo[]>`

**删除逻辑：**
- 移除 `readJsonSafe(path.join(DATA_DIR, "footprints.json"), {})`
- 移除 `footprintsCityData` 的旧导出（从 JSON 直接写入）

---

## 6. 组件变更

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `scripts/generate-data.mjs` | 扫描子目录、生成 travelCities/footprintsCityData |
| 新增 | `src/app/(public)/gallery/travel/page.tsx` | 旅行城市列表页 |
| 新增 | `src/app/(public)/gallery/travel/[city]/page.tsx` | 城市照片详情页（复用 AlbumGalleryClient） |
| 修改 | `src/app/(public)/footprints/[city]/page.tsx` | 改为从 allImages 按 location 筛选 |
| 修改 | `src/lib/albums.ts` | 新增 `getTravelCities()`、`getCityImages()` 等辅助函数 |
| 删除 | `data/footprints.json` | 不再需要 |
| 可选 | `src/types/index.ts` | 移除 `FootprintsCityMapping`（如果无其他引用） |
| 可选 | `src/app/(public)/footprints/[city]/CityGalleryClient.tsx` | 类型适配（url 字符串 → ImageInfo） |

---

## 7. 图集旅行页与足迹城市页的关系

| 维度 | 图集 `/gallery/travel/[city]` | 足迹 `/footprints/[city]` |
|------|------------------------------|---------------------------|
| 入口 | 图集 → 旅行 → 城市卡片 | 地图上点击已点亮城市 |
| 权限 | 公开（只要有照片就能看） | 仅已点亮城市可访问 |
| 组件 | `AlbumGalleryClient` + `Lightbox` | `CityGalleryClient`（独立风格） |
| 数据源 | 相同（`allImages` 按 location 筛选） | 相同 |
| 视觉风格 | 图集统一风格 | 足迹独立风格（返回地图、不同色调） |

---

## 8. 边界与异常

- **空子目录：** 某城市目录存在但无图片 → 不计入 `travelCities`
- **散图处理：** 不在任何子目录的 `travel/` 下图片，`location: undefined`，在图集旅行页以"散图"卡片展示
- **城市名 URL 编码：** 中文城市名在 URL 中使用 `encodeURIComponent` / `decodeURIComponent`
- **城市名与 GeoJSON 匹配：** 目录名应与 GeoJSON 中 `properties.name` 一致（如"杭州市" vs "杭州"——构建时不强制校验，由管理员自行保证）
- **现有数据迁移：** 用户需手动将现有 `travel/` 下的 23 张照片移入对应城市子目录（如无可直接放在 `travel/` 根目录作为散图）
- **构建失败降级：** 如果 `travel/` 目录不存在或空，`travelCities` 返回空数组，不阻塞构建
- **图集首页 `/gallery`：** 旅行相册卡片链接从 `/gallery/travel` 不变（但现在进入的是城市列表页而非照片瀑布流）

---

## 9. 不变项

以下无需改动：

- `/footprints` 地图页面（ECharts + GeoJSON + 双模式）
- `/api/footprints` API（城市 CRUD + 密码验证）
- `src/lib/footprints.ts`（KV 数据层）
- `src/components/footprints/FootprintMap.tsx`
- `src/components/footprints/PasswordModal.tsx`
- `/gallery` 图集首页
- `/gallery/campus`、`/gallery/photography` 其他相册
- `AlbumCard`、`AlbumGalleryClient`、`Lightbox` 组件

---

## 10. 自审清单

- ✅ 无 TBD / TODO 占位
- ✅ 路由设计符合现有项目模式（静态路由优先于动态路由 `[album]`）
- ✅ 数据模型最小变更——仅启用已有字段 `location`
- ✅ 完全删除 `data/footprints.json`，消除手工维护
- ✅ 图片只需放到对应城市子目录，构建时自动关联
- ✅ 图集和足迹共享同一套图片源，避免数据分叉
- ✅ 空状态 / 异常状态均有处理
- ✅ 不影响现有其他相册和 API
