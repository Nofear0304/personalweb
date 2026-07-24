# 足迹地图功能 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在个人网站新建"足迹"页面，使用 ECharts 渲染中国地级市地图，管理员可在地图上点亮/熄灭城市，所有访客可查看已点亮城市的照片。

**Architecture:** 新增 `footprints` 路由组（地图页 + 城市详情页），已点亮城市存 Cloudflare KV（`src/lib/footprints.ts` 封装），城市-图片映射存在 `data/footprints.json`（构建时内联到 `generated.ts`）。地图交互使用 ECharts `registerMap` + GeoJSON，密码保护通过环境变量 `FOOTPRINTS_ADMIN_PASSWORD` 校验。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, ECharts 5, Cloudflare KV, GeoJSON (DataV.GeoAtlas 中国地级市)

## Global Constraints

- 所有新页面放在 `src/app/(public)/` 路由组下，复用 PublicLayout
- 数据持久化通过 KV（`src/lib/store.ts` 的 `getKV()` 模式），开发时降级到 `globalThis`
- 静态 JSON 数据通过构建脚本 `scripts/generate-data.mjs` 内联到 `src/data/generated.ts`
- 暗黑宇宙主题，颜色使用 `bg-[#020817]` 等 Tailwind 类
- 客户端组件标注 `"use client"`，交互组件放 `src/components/`
- 密码 `123456` 存环境变量 `FOOTPRINTS_ADMIN_PASSWORD`

---

## File Structure

```
新增文件:
  src/lib/footprints.ts                      # KV 读写：已点亮城市 CRUD
  data/footprints.json                       # 城市→图片映射（初始种子）
  src/app/api/footprints/route.ts            # GET/POST API
  src/components/footprints/FootprintMap.tsx # "use client" ECharts 地图
  src/components/footprints/PasswordModal.tsx# "use client" 密码弹窗
  src/app/(public)/footprints/page.tsx       # 地图页面（服务端组件）
  src/app/(public)/footprints/[city]/page.tsx# 城市图片详情页
  public/geojson/china-cities.json           # 中国地级市 GeoJSON

修改文件:
  src/types/index.ts                         # 新增 FootprintsCityData 类型
  scripts/generate-data.mjs                  # 内联 footprints.json
  src/components/layout/Header.tsx           # 新增导航项
  package.json                               # 新增 echarts 依赖
  .dev.vars                                  # 新增 FOOTPRINTS_ADMIN_PASSWORD
```

---

### Task 1: 类型定义 + 数据层 + 种子数据

**Files:**
- Create: `src/lib/footprints.ts`
- Create: `data/footprints.json`
- Modify: `src/types/index.ts:193-193`

**Interfaces:**
- Consumes: `getKV()` from `@/lib/store` (existing pattern)
- Produces:
  - `getVisitedCities(): Promise<string[]>` — 返回已点亮城市名数组
  - `addCity(name: string, password: string): Promise<{ success: boolean; error?: string }>`
  - `removeCity(name: string, password: string): Promise<{ success: boolean; error?: string }>`
  - `FootprintsCityMapping` type: `Record<string, string[]>`

- [ ] **Step 1: 在 `src/types/index.ts` 末尾新增类型**

```ts
// --- Footprints ---
export interface FootprintsCityMapping {
  [city: string]: string[];
}
```

- [ ] **Step 2: 创建种子数据 `data/footprints.json`**

```json
{}
```

- [ ] **Step 3: 创建 `src/lib/footprints.ts`**

```ts
/**
 * Footprints data layer — persisted via Cloudflare KV, with in-memory
 * fallback for local dev.
 */

// ─── In-memory fallback ──────────────────────────────────────────────

const g = globalThis as Record<string, unknown>;
const FALLBACK_KEY = "__personalweb_footprints__";
const KV_FOOTPRINTS_KEY = "footprints:cities";

function getFallback(): string[] {
  if (!g[FALLBACK_KEY]) {
    g[FALLBACK_KEY] = [];
  }
  return g[FALLBACK_KEY] as string[];
}

async function getKV() {
  // Mirrors the same pattern used in src/lib/store.ts
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const candidate = (ctx.env as Record<string, unknown>).PERSONALWEB_KV as {
      get(key: string): Promise<string | null>;
      put(key: string, value: string): Promise<void>;
    } | undefined;
    if (!candidate) return null;
    await candidate.get("__health_check__");
    return candidate;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export async function getVisitedCities(): Promise<string[]> {
  const kv = await getKV();
  if (!kv) return [...getFallback()];

  const raw = await kv.get(KV_FOOTPRINTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function addCity(
  name: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const expectedPassword = process.env.FOOTPRINTS_ADMIN_PASSWORD || "123456";
  if (password !== expectedPassword) {
    return { success: false, error: "密码错误" };
  }

  const kv = await getKV();
  if (!kv) {
    const cities = getFallback();
    if (!cities.includes(name)) {
      cities.push(name);
    }
    return { success: true };
  }

  const raw = await kv.get(KV_FOOTPRINTS_KEY);
  const cities: string[] = raw ? JSON.parse(raw) : [];
  if (!cities.includes(name)) {
    cities.push(name);
    await kv.put(KV_FOOTPRINTS_KEY, JSON.stringify(cities));
  }
  return { success: true };
}

export async function removeCity(
  name: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const expectedPassword = process.env.FOOTPRINTS_ADMIN_PASSWORD || "123456";
  if (password !== expectedPassword) {
    return { success: false, error: "密码错误" };
  }

  const kv = await getKV();
  if (!kv) {
    const cities = getFallback();
    const idx = cities.indexOf(name);
    if (idx !== -1) cities.splice(idx, 1);
    return { success: true };
  }

  const raw = await kv.get(KV_FOOTPRINTS_KEY);
  const cities: string[] = raw ? JSON.parse(raw) : [];
  const idx = cities.indexOf(name);
  if (idx !== -1) {
    cities.splice(idx, 1);
    await kv.put(KV_FOOTPRINTS_KEY, JSON.stringify(cities));
  }
  return { success: true };
}
```

- [ ] **Step 4: 验证类型检查通过**

```bash
cd d:/personalweb && npx tsc --noEmit 2>&1 | head -20
```

Expected: 无新增类型错误（可能已有已存在的报错，只需确认无 footprints 相关错误）。

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts data/footprints.json src/lib/footprints.ts
git commit -m "feat: add footprints data layer with KV persistence"
```

---

### Task 2: 构建脚本内联 footprints.json

**Files:**
- Modify: `scripts/generate-data.mjs:340-356`

**Interfaces:**
- Consumes: `data/footprints.json` (created in Task 1)
- Produces: `footprintsCityData` export in `src/data/generated.ts`

- [ ] **Step 1: 修改 `scripts/generate-data.mjs`**

在文件第 280 行附近（`// --- Data files ---` 部分），`visitsData` 之后添加：

```js
  // --- Footprints city-image mapping ---
  const footprintsCityData = readJsonSafe(path.join(DATA_DIR, "footprints.json"), {});
```

在文件末尾的序列化部分，`initialVisitsData` 之后添加：

```js

// ─── Footprints ──────────────────────────────────────────────────────
export const footprintsCityData: Record<string, string[]> = ${JSON.stringify(footprintsCityData, null, 2)};
```

具体修改位置为：
1. 在第 283 行 `const visitsData = ...` 后插入 footprintsCityData 读取
2. 在第 338 行 `export const initialVisitsData` 的闭合引号后插入 footprints 导出

- [ ] **Step 2: 运行构建脚本验证**

```bash
cd d:/personalweb && node scripts/generate-data.mjs
```

Expected: 输出包含 `✓ Generated ...` 且末位显示 footprints 数据。

- [ ] **Step 3: 确认 generated.ts 包含 footprintsCityData**

```bash
grep "footprintsCityData" src/data/generated.ts
```

Expected: 输出 `export const footprintsCityData: Record<string, string[]> = {};`

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-data.mjs src/data/generated.ts
git commit -m "feat: inline footprints.json into generated data at build time"
```

---

### Task 3: API 路由

**Files:**
- Create: `src/app/api/footprints/route.ts`

**Interfaces:**
- Consumes: `getVisitedCities`, `addCity`, `removeCity` from `@/lib/footprints` (Task 1)
- Produces: `GET /api/footprints` → `{ cities: string[] }`, `POST /api/footprints` → `{ success, cities?, error? }`

- [ ] **Step 1: 创建 `src/app/api/footprints/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getVisitedCities, addCity, removeCity } from "@/lib/footprints";

export async function GET() {
  try {
    const cities = await getVisitedCities();
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, city, password } = body;

    // "verify" action: check password only, no data mutation
    if (action === "verify") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const expectedPassword = process.env.FOOTPRINTS_ADMIN_PASSWORD || "123456";
      if (password !== expectedPassword) {
        return NextResponse.json({ error: "密码错误" }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    if (!city || typeof city !== "string" || !city.trim()) {
      return NextResponse.json({ error: "请指定城市" }, { status: 400 });
    }

    const cityName = city.trim();

    if (action === "add") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const result = await addCity(cityName, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      const cities = await getVisitedCities();
      return NextResponse.json({ success: true, cities });
    }

    if (action === "remove") {
      if (!password) {
        return NextResponse.json({ error: "请输入密码" }, { status: 400 });
      }
      const result = await removeCity(cityName, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      const cities = await getVisitedCities();
      return NextResponse.json({ success: true, cities });
    }

    return NextResponse.json({ error: `未知操作: ${action}` }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "操作失败，请重试" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 测试 API（本地 dev server 启动后）**

```bash
# GET
curl -s http://localhost:3000/api/footprints | cat
# Expected: {"cities":[]}

# POST add (wrong password)
curl -s -X POST http://localhost:3000/api/footprints \
  -H "Content-Type: application/json" \
  -d '{"action":"add","city":"杭州","password":"wrong"}' | cat
# Expected: {"error":"密码错误"}

# POST add (correct password)
curl -s -X POST http://localhost:3000/api/footprints \
  -H "Content-Type: application/json" \
  -d '{"action":"add","city":"杭州","password":"123456"}' | cat
# Expected: {"success":true,"cities":["杭州"]}

# GET verify
curl -s http://localhost:3000/api/footprints | cat
# Expected: {"cities":["杭州"]}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/footprints/route.ts
git commit -m "feat: add footprints API for city CRUD with password protection"
```

---

### Task 4: 环境变量 + ECharts 依赖 + GeoJSON

**Files:**
- Modify: `.dev.vars:4`
- Modify: `package.json:28` (add `echarts` dependency)
- Create: `public/geojson/china-cities.json` (需手动下载)

**Interfaces:**
- Consumes: none (infrastructure setup)
- Produces: `process.env.FOOTPRINTS_ADMIN_PASSWORD`, `import * as echarts from 'echarts'`, GeoJSON at `/geojson/china-cities.json`

- [ ] **Step 1: 添加环境变量到 `.dev.vars`**

在文件末尾追加一行：

```
FOOTPRINTS_ADMIN_PASSWORD=123456
```

- [ ] **Step 2: 安装 echarts**

```bash
cd d:/personalweb && npm install echarts
```

Expected: `echarts` 添加到 `package.json` 的 `dependencies`。

- [ ] **Step 3: 下载中国地级市 GeoJSON**

从 DataV.GeoAtlas 下载中国地级市边界数据，保存为 `public/geojson/china-cities.json`。

下载命令（PowerShell 可用 `Invoke-WebRequest`，bash 可用 `curl`）：

```bash
curl -L -o public/geojson/china-cities.json \
  "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full"
```

Expected: 文件大小约 2-5MB，JSON 格式，包含 `features` 数组，每个 feature 的 `properties.name` 为城市名（如"杭州市"）。

> **注意：** 如果该 API 不可用，也可从 https://github.com/apache/echarts-examples/tree/master/public/data/asset/geo 或其他公开源获取中国地图 GeoJSON。

- [ ] **Step 4: 验证 GeoJSON 格式**

```bash
node -e "const g = require('./public/geojson/china-cities.json'); console.log('Features:', g.features.length); console.log('Sample:', g.features[0].properties.name);"
```

Expected: 输出城市数量（约 370+）和一个城市名示例。

- [ ] **Step 5: Commit**

```bash
git add .dev.vars package.json package-lock.json public/geojson/china-cities.json
git commit -m "feat: add echarts, GeoJSON, and footprints env var setup"
```

---

### Task 5: PasswordModal 组件

**Files:**
- Create: `src/components/footprints/PasswordModal.tsx`

**Interfaces:**
- Consumes: none (独立客户端组件)
- Produces:
  ```ts
  interface PasswordModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void    // 密码正确后回调
  }
  ```

- [ ] **Step 1: 创建 `src/components/footprints/PasswordModal.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setError("");
      // Focus input after open animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError("请输入密码");
      return;
    }
    // Verify against the env var via a lightweight API check
    try {
      const res = await fetch("/api/footprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password: value.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        setValue("");
      } else {
        setError(data.error || "密码错误，请重试");
        setValue("");
        inputRef.current?.focus();
      }
    } catch {
      setError("网络错误，请重试");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-[#0f1325] border border-white/10 rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          >
            <h3 className="text-white font-semibold text-lg mb-1">🔒 管理模式</h3>
            <p className="text-white/50 text-sm mb-4">输入密码以管理足迹地图</p>

            <input
              ref={inputRef}
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="请输入密码"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
            />

            {error && (
              <motion.p
                className="text-red-400 text-xs mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                确认
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 验证组件编译通过**

```bash
cd d:/personalweb && npx tsc --noEmit 2>&1 | grep -i "passwordmodal" || echo "No errors for PasswordModal"
```

Expected: 无 PasswordModal 相关错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/footprints/PasswordModal.tsx
git commit -m "feat: add PasswordModal for footprints admin access"
```

---

### Task 6: FootprintMap 组件

**Files:**
- Create: `src/components/footprints/FootprintMap.tsx`

**Interfaces:**
- Consumes: `getVisitedCities`, `addCity`, `removeCity` from `@/lib/footprints` (Task 1); `PasswordModal` (Task 5)
- Produces:
  ```ts
  // Props: { cities: string[]; isAdmin: boolean; onAdminEnter: () => void; onAdminExit: () => void }
  // 导出为 default export
  ```

- [ ] **Step 1: 创建 `src/components/footprints/FootprintMap.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import PasswordModal from "./PasswordModal";

const UNLIT_COLOR = "#1a1f3a";
const LIT_COLOR = "#f0a500";
const HOVER_COLOR = "#f5c842";

interface FootprintMapProps {
  cities: string[];
}

export default function FootprintMap({ cities }: FootprintMapProps) {
  const router = useRouter();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const geoJsonRef = useRef<unknown>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);

  // Track admin timeout
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAdminTimer = useCallback(() => {
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    adminTimerRef.current = setTimeout(() => {
      setIsAdmin(false);
    }, 5 * 60 * 1000); // 5 minutes
  }, []);

  // Load GeoJSON and init chart
  useEffect(() => {
    let cancelled = false;
    const initChart = async () => {
      try {
        const res = await fetch("/geojson/china-cities.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geoJson = await res.json();
        if (cancelled) return;
        geoJsonRef.current = geoJson;
        renderChart(geoJson);
      } catch (err) {
        console.error("Failed to load GeoJSON:", err);
      }
    };
    initChart();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render when cities or admin mode changes
  useEffect(() => {
    if (geoJsonRef.current) {
      renderChart(geoJsonRef.current);
    }
  }, [cities, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const visitedSet = new Set(cities);

  const renderChart = (geoJson: unknown) => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Convert GeoJSON features to ECharts data
    const features = (geoJson as { features: Array<{ properties: { name: string } }> }).features;

    echarts.registerMap("china", geoJson as Parameters<typeof echarts.registerMap>[1]);

    const mapData = features.map((f) => {
      const name = f.properties.name;
      const visited = visitedSet.has(name);
      return {
        name,
        itemStyle: {
          areaColor: visited ? LIT_COLOR : UNLIT_COLOR,
          borderColor: visited ? "#d4940a" : "#2a2f4a",
          borderWidth: 0.5,
        },
        emphasis: {
          itemStyle: {
            areaColor: visited ? HOVER_COLOR : "#2a2f5a",
          },
        },
      };
    });

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 19, 40, 0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#fff", fontSize: 13 },
        formatter: (params: { name: string }) => {
          const visited = visitedSet.has(params.name);
          if (visited) {
            return `<strong>${params.name}</strong><br/>✅ 已踏足`;
          }
          return `<strong>${params.name}</strong><br/>🌫️ 尚未踏足`;
        },
      },
      series: [
        {
          type: "map",
          map: "china",
          roam: true,
          scaleLimit: { min: 1, max: 5 },
          label: { show: false },
          itemStyle: {
            areaColor: UNLIT_COLOR,
            borderColor: "#2a2f4a",
            borderWidth: 0.5,
          },
          emphasis: {
            label: { show: true, color: "#fff", fontSize: 10 },
            itemStyle: { areaColor: HOVER_COLOR },
          },
          data: mapData,
        },
      ],
    });

    // Click handler
    chart.off("click");
    chart.on("click", (params: { name: string }) => {
      const cityName = params.name;
      const visited = visitedSet.has(cityName);
      setSelectedCity(cityName);
      setShowCityModal(true);

      if (isAdmin) {
        // Admin mode: show action options for every click
      } else {
        // Browse mode: only allow entry for visited cities
        if (visited) {
          // Auto-navigate (or show confirm — let's auto-navigate)
          router.push(`/footprints/${encodeURIComponent(cityName)}`);
        }
      }
    });

    // Responsive resize
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };

  const handlePasswordSuccess = () => {
    setIsAdmin(true);
    setShowPasswordModal(false);
    resetAdminTimer();
  };

  const handleAdminExit = () => {
    setIsAdmin(false);
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
  };

  const handleCityAction = async (action: "enter" | "add" | "remove") => {
    setShowCityModal(false);
    if (!selectedCity) return;

    if (action === "enter") {
      router.push(`/footprints/${encodeURIComponent(selectedCity)}`);
      return;
    }

    if (action === "add" || action === "remove") {
      try {
        const res = await fetch("/api/footprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            city: selectedCity,
            password: "123456", // Already verified via PasswordModal
          }),
        });
        const data = await res.json();
        if (data.success && data.cities) {
          // Trigger re-render — parent will pass updated cities
          // For local state, re-fetch
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to update city:", err);
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Admin toggle */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-2">
        {isAdmin ? (
          <button
            onClick={handleAdminExit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            🔓 退出管理
          </button>
        ) : (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            🔒 管理
          </button>
        )}
      </div>

      {/* Chart container */}
      <div ref={chartRef} className="w-full" style={{ height: "calc(100vh - 180px)", minHeight: 500 }} />

      {/* Password modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Admin action modal */}
      {showCityModal && isAdmin && selectedCity && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCityModal(false)} />
          <div className="relative bg-[#0f1325] border border-white/10 rounded-xl p-5 shadow-xl min-w-[200px]">
            <h4 className="text-white font-medium mb-3 text-center">{selectedCity}</h4>
            <div className="flex flex-col gap-2">
              {visitedSet.has(selectedCity) ? (
                <>
                  <button
                    onClick={() => handleCityAction("enter")}
                    className="px-4 py-2 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    📷 进入查看
                  </button>
                  <button
                    onClick={() => handleCityAction("remove")}
                    className="px-4 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    🕯️ 熄灭
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCityAction("add")}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  ✨ 点亮
                </button>
              )}
              <button
                onClick={() => setShowCityModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd d:/personalweb && npx tsc --noEmit 2>&1 | grep -i "footprintmap" || echo "No errors for FootprintMap"
```

Expected: 无 FootprintMap 相关错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/footprints/FootprintMap.tsx
git commit -m "feat: add FootprintMap with ECharts China map and admin mode"
```

---

### Task 7: 足迹地图页面

**Files:**
- Create: `src/app/(public)/footprints/page.tsx`

**Interfaces:**
- Consumes: `getVisitedCities` from `@/lib/footprints` (Task 1); `FootprintMap` (Task 6); `CosmicWrapper` (existing)
- Produces: 服务端渲染的页面，传递 `cities` 给客户端 `FootprintMap`

- [ ] **Step 1: 创建 `src/app/(public)/footprints/page.tsx`**

```tsx
import type { Metadata } from "next";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FootprintMap from "@/components/footprints/FootprintMap";
import { getVisitedCities } from "@/lib/footprints";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "足迹 - 我的足迹地图",
  description: "用地图记录我去过的每一座城市",
};

export default async function FootprintsPage() {
  const cities = await getVisitedCities();

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-8 sm:py-12">
        <FadeIn>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white text-center mb-2">
            🗺️ 足迹
          </h1>
          <p className="text-white/50 text-sm text-center mb-8">
            已点亮 {cities.length} 座城市
          </p>
        </FadeIn>

        <FootprintMap cities={cities} />
      </div>
    </CosmicWrapper>
  );
}
```

- [ ] **Step 2: 验证页面可访问**

启动 `npm run dev` 后访问 `http://localhost:3000/footprints`，确认：
- 页面渲染中国地图
- 无城市被点亮（初始空数据）
- "管理"按钮可见（右上角）

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/footprints/page.tsx
git commit -m "feat: add footprints map page with ECharts integration"
```

---

### Task 8: 城市图片详情页

**Files:**
- Create: `src/app/(public)/footprints/[city]/page.tsx`

**Interfaces:**
- Consumes: `footprintsCityData` from `@/data/generated` (Task 2); `getVisitedCities` from `@/lib/footprints` (Task 1); `MasonryGallery` (existing); `Lightbox` (existing); `CosmicWrapper` (existing)
- Produces: 城市照片墙页面

- [ ] **Step 1: 创建 `src/app/(public)/footprints/[city]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import FadeIn from "@/components/ui/FadeIn";
import { getVisitedCities } from "@/lib/footprints";
import { footprintsCityData } from "@/data/generated";
import CityGalleryClient from "./CityGalleryClient";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return Object.keys(footprintsCityData).map((city) => ({
    city, // Next.js handles encoding automatically
  }));
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

  // Check if city is in the mapping
  const cityImages = footprintsCityData[cityName];

  // Check if visited
  const visitedCities = await getVisitedCities();
  const isVisited = visitedCities.includes(cityName);

  // City not in mapping at all
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

  // Happy path: visited + has photos
  // Convert string paths to ImageInfo-like objects
  const images = cityImages.map((url, i) => ({
    filename: url.split("/").pop() || `photo-${i}`,
    url,
    category: cityName,
  }));

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

        <CityGalleryClient images={images} cityName={cityName} />
      </div>
    </CosmicWrapper>
  );
}
```

- [ ] **Step 2: 创建 `src/app/(public)/footprints/[city]/CityGalleryClient.tsx`**

```tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";

interface CityImage {
  filename: string;
  url: string;
  category?: string;
}

interface CityGalleryClientProps {
  images: CityImage[];
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

- [ ] **Step 3: 验证类型检查**

```bash
cd d:/personalweb && npx tsc --noEmit 2>&1 | grep -E "(footprints|CityGallery)" || echo "No related type errors"
```

Expected: 无相关类型错误。

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/footprints/\[city\]/
git commit -m "feat: add city detail page with photo gallery and lightbox"
```

---

### Task 9: 导航栏更新 + 集成测试

**Files:**
- Modify: `src/components/layout/Header.tsx:8-16`

**Interfaces:**
- Consumes: none (纯 UI 变更)
- Produces: 导航栏显示"足迹"链接

- [ ] **Step 1: 修改 `src/components/layout/Header.tsx` 的 navLinks 数组**

在 `navLinks` 数组中，第 12 行之后（`/gallery` 之后）插入：

```tsx
  { href: "/footprints", label: "足迹" },
```

修改后的数组：

```tsx
const navLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/notes", label: "随笔" },
  { href: "/gallery", label: "图集" },
  { href: "/footprints", label: "足迹" },
  { href: "/guestbook", label: "留言" },
  { href: "/friends", label: "朋友" },
  { href: "/about", label: "关于" },
];
```

- [ ] **Step 2: 视觉验证**

启动 `npm run dev`，访问首页，确认：
- 导航栏显示"足迹"链接（桌面端 + 移动端）
- 点击跳转到 `/footprints`
- 当前在 `/footprints` 页面时，"足迹"链接显示激活态（白色 + 背景高亮）

- [ ] **Step 3: 端到端流程测试**

在 `npm run dev` 运行状态下：

1. 访问 `http://localhost:3000/footprints`
   - [ ] 地图正常渲染
   - [ ] 无城市被点亮

2. 点击 🔒 管理按钮
   - [ ] 密码弹窗出现
   - [ ] 输入错误密码 → 提示"密码错误"
   - [ ] 输入 `123456` → 弹窗关闭，显示"🔓 退出管理"

3. 管理模式下点击一个城市区域（如"杭州市"）
   - [ ] 弹出"✨ 点亮"按钮
   - [ ] 点击"点亮" → 该城市变为金色
   - [ ] 再次点击 → 显示"📷 进入查看" + "🕯️ 熄灭"

4. 退出管理模式，点击已点亮的城市
   - [ ] 自动跳转到 `/footprints/杭州`

5. 手动访问 `/footprints/杭州`
   - [ ] 显示城市名 + 照片数量（目前为空状态"暂无照片"）

6. 手动访问一个未点亮但有映射的城市
   - [ ] 显示"你还未踏足此地"

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add footprints link to navigation bar"
```

---

### Task 10: 最终验证 + Cloudflare 配置

**Files:**
- Modify: `wrangler.jsonc:14-18` (添加 `FOOTPRINTS_ADMIN_PASSWORD` 环境变量)

**Interfaces:**
- Consumes: all previous tasks
- Produces: 可部署到 Cloudflare Workers 的完整功能

- [ ] **Step 1: 配置 Cloudflare 环境变量**

在 `wrangler.jsonc` 的顶层对象中添加 `vars` 字段（如果尚不存在）：

```jsonc
"vars": {
  "FOOTPRINTS_ADMIN_PASSWORD": "123456"
}
```

找到 `"images"` 字段之后，插入 `"vars"` 配置块。最终效果类似：

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "personalweb",
  "compatibility_date": "2026-06-03",
  // ... 其他现有配置 ...
  "vars": {
    "FOOTPRINTS_ADMIN_PASSWORD": "123456"
  },
  "images": {
    "binding": "IMAGES"
  }
}
```

> **注意：** `ADMIN_PASSWORD` 和 `SESSION_SECRET` 已经通过其他方式配置（如 Cloudflare Dashboard 或已有的 secret 机制），此处仅新增 `FOOTPRINTS_ADMIN_PASSWORD`。

- [ ] **Step 2: 运行完整构建并本地预览**

```bash
cd d:/personalweb && npm run build
```

Expected: 构建成功，无报错。检查输出中包含新增的 footprints 页面路由。

- [ ] **Step 3: 本地预览验证**

```bash
cd d:/personalweb && npm run preview
```

访问预览地址，重复 Task 9 的端到端流程测试。

- [ ] **Step 4: 更新 GeoJSON 的静态资源缓存**

在 `public/_headers` 文件中添加 GeoJSON 的缓存头（如果文件存在）：

```
/geojson/*
  Cache-Control: public, max-age=604800, immutable
```

- [ ] **Step 5: Commit**

```bash
git add wrangler.jsonc public/_headers
git commit -m "chore: add Cloudflare env var for footprints and GeoJSON caching"
```

---

## 部署后操作

部署到 Cloudflare Workers 后，管理员操作：

1. 访问 `/footprints`
2. 输入密码进入管理模式
3. 点亮去过的城市
4. 编辑 `data/footprints.json` 添加城市-图片映射
5. 上传图片到 `public/images/gallery/` 对应路径
6. 提交代码并重新部署以更新图片映射

> **后续扩展建议：** 如果频繁更新城市-图片映射，可考虑将其迁移到 KV 存储，通过管理 API 动态更新，避免每次都需要重新部署。
