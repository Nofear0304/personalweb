# 足迹地图功能 — 设计文档

**日期：** 2026-07-24  
**状态：** 已确认  

---

## 1. 功能概述

在个人网站新增"足迹"页面，通过中国地图展示去过的城市（地级市粒度）。管理员可以在地图上点亮/熄灭城市，访客可以查看已点亮城市的照片。

---

## 2. 路由与页面架构

### 新增路由

| 路径 | 文件 | 说明 |
|------|------|------|
| `/footprints` | `src/app/(public)/footprints/page.tsx` | ECharts 中国地图 + 交互 |
| `/footprints/[city]` | `src/app/(public)/footprints/[city]/page.tsx` | 城市图片展示页 |
| `/api/footprints` | `src/app/api/footprints/route.ts` | 点亮/取消城市 API |

### 导航栏变更

在 `src/components/layout/Header.tsx` 的 `navLinks` 数组中新增：

```ts
{ href: "/footprints", label: "足迹" }
```

### 页面归属

所有新页面放在 `(public)` 路由组下，复用 PublicLayout（Header + Footer + 宇宙背景）。

---

## 3. 数据模型

### 3.1 已点亮城市 — Cloudflare KV

- **Key:** `"footprints:cities"`
- **Value:** JSON 字符串数组，如 `["杭州","成都","深圳"]`
- **操作封装:** `src/lib/footprints.ts`

```ts
// getVisitedCities(): Promise<string[]>
// addCity(name: string, password: string): Promise<{ success: boolean; error?: string }>
// removeCity(name: string, password: string): Promise<{ success: boolean; error?: string }>
```

### 3.2 城市-图片映射 — 静态 JSON

新建 `data/footprints.json`：

```json
{
  "杭州": ["gallery/travel/hangzhou-001.jpg", "gallery/travel/hangzhou-002.jpg"],
  "成都": ["gallery/travel/chengdu-001.jpg"]
}
```

图片路径指向 `public/images/` 下的现有图集。构建时 `scripts/generate-data.mjs` 将此 JSON 内联到 `src/data/generated.ts`，与现有文章/笔记处理方式一致。

### 3.3 管理员密码 — 环境变量

- 变量名：`FOOTPRINTS_ADMIN_PASSWORD`
- 默认值：`123456`
- 配置位置：
  - 开发：`.dev.vars`（不上传 Git）
  - 生产：`wrangler.jsonc` 的 `vars` 字段

---

## 4. 地图页面 — 交互设计

### 4.1 技术选型

- **ECharts** 渲染中国地图（需额外安装 `echarts` 包）
- **GeoJSON 数据源：** 使用 DataV.GeoAtlas 或类似来源的中国地级市 GeoJSON（约 370 个地级行政区）
- GeoJSON 文件放在 `public/geojson/china-cities.json`，客户端加载

### 4.2 双模式设计

| 模式 | 入口 | 权限 | 视觉效果 |
|------|------|------|---------|
| 浏览模式（默认） | 页面加载即进入 | 所有人 | 无管理控件 |
| 管理模式 | 点击 🔒 → 输入密码 | 密码校验通过 | 地图上出现操作按钮 |

管理模式 5 分钟无操作自动退出，退回浏览模式。

### 4.3 点击交互详情

**浏览模式：**

| 城市状态 | Tooltip 内容 |
|---------|-------------|
| 未点亮 | 城市名 + 灰色文字"尚未踏足"，不可点击 |
| 已点亮 | 城市名 + "进入查看"按钮 → 跳转 `/footprints/[城市名]` |

**管理模式：**

| 城市状态 | Tooltip 内容 |
|---------|-------------|
| 未点亮 | 城市名 + "✨ 点亮"按钮 → 调用 API 点亮，即时更新地图 |
| 已点亮 | 城市名 + "进入查看"按钮 + "🕯️ 熄灭"按钮 → 调用 API 取消点亮 |

### 4.4 地图视觉

- 底色：与站点暗黑主题一致 (`#020817`)
- 未点亮城市：深灰/暗蓝色 (`#1a1f3a`)
- 已点亮城市：暖金色 (`#f0a500` → `#e8d5a3`)
- 鼠标悬停：轻微高亮 + 边框强调
- 南海诸岛缩略图：右下角小窗展示

### 4.5 组件结构

```
src/components/footprints/
  FootprintMap.tsx        → "use client"，ECharts 地图核心
  PasswordModal.tsx       → 密码输入弹窗
  CityTooltip.tsx         → 点击城市后的气泡/弹窗（替代 ECharts 默认 tooltip）
```

---

## 5. 城市图片展示页

### 5.1 页面路径

`/footprints/[city]` → `src/app/(public)/footprints/[city]/page.tsx`

### 5.2 数据获取

- 从 `generated.ts` 读取 `footprintsData`（即 `footprints.json` 内容）
- 按 `[city]` 参数匹配对应图片列表
- 从 KV 读取已点亮城市列表（用于判断访问合法性）

### 5.3 页面布局

```
┌─────────────────────────────────────────┐
│  ← 返回足迹地图                          │
│                                          │
│           🏙️ 杭州                        │
│      共 X 张照片 · 你的足迹              │
│                                          │
│  [瀑布流照片墙 — 复用 MasonryGallery]     │
│  [点击照片 — 复用 Lightbox 灯箱]          │
│                                          │
│  （暂无照片时显示空状态占位）              │
└─────────────────────────────────────────┘
```

### 5.4 状态处理

| 场景 | 展示 |
|------|------|
| 城市已点亮 + 有照片 | 正常展示瀑布流照片墙 |
| 城市已点亮 + 无照片 | "照片即将上传，敬请期待"占位 |
| 城市未点亮 + 直接访问 URL | "你还未踏足此地"提示 + 返回地图按钮 |
| 城市名不存在于映射中 | 404 提示，返回地图 |

### 5.5 Props 与依赖

- 复用组件：`MasonryGallery`（`src/components/home/MasonryGallery.tsx`）、`Lightbox`（`src/components/gallery/Lightbox.tsx`）
- `generateStaticParams()` 从 `footprints.json` 的 keys 生成所有城市页面的静态参数

---

## 6. API 设计

### `POST /api/footprints`

请求体：

```json
{
  "action": "add" | "remove",
  "city": "杭州",
  "password": "123456"
}
```

响应：

```json
{ "success": true, "cities": ["杭州", "成都"] }
// 或
{ "success": false, "error": "密码错误" }
```

### `GET /api/footprints`

无需认证，返回已点亮城市列表：

```json
{ "cities": ["杭州", "成都", "深圳"] }
```

---

## 7. 文件变更清单

| 操作 | 文件 |
|------|------|
| 新增 | `src/app/(public)/footprints/page.tsx` |
| 新增 | `src/app/(public)/footprints/[city]/page.tsx` |
| 新增 | `src/app/api/footprints/route.ts` |
| 新增 | `src/lib/footprints.ts` |
| 新增 | `src/components/footprints/FootprintMap.tsx` |
| 新增 | `src/components/footprints/PasswordModal.tsx` |
| 新增 | `src/components/footprints/CityTooltip.tsx` |
| 新增 | `data/footprints.json` |
| 新增 | `public/geojson/china-cities.json` |
| 修改 | `src/components/layout/Header.tsx` — 新增导航项 |
| 修改 | `scripts/generate-data.mjs` — 内联 footprints.json |
| 修改 | `src/types/index.ts` — 新增 FootprintsData 类型 |
| 修改 | `package.json` — 新增 echarts 依赖 |

---

## 8. 边界与异常

- 未登录管理员访问地图：正常浏览模式，无管理功能
- 密码错误：显示错误提示，不清空输入框
- KV 读取失败：降级显示空城市列表，所有城市显示为未点亮
- GeoJSON 加载失败：显示"地图数据加载失败"错误提示，提供重试按钮
- 城市名含特殊字符（如 URL 编码）：统一使用 `encodeURIComponent` / `decodeURIComponent` 处理
- 管理模式超时：5 分钟后自动退出，下次操作需重新输入密码

---

## 9. 自审清单

- ✅ 无 TBD / TODO 占位
- ✅ 路由设计符合现有项目模式（`(public)` 路由组 + 动态路由）
- ✅ 数据模型与现有 KV 存储模式一致
- ✅ 图片系统复用现有图集，不引入新上传逻辑
- ✅ 密码保护在地图页面上操作，不依赖 admin 登录态
- ✅ 空状态 / 错误状态均有处理
