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
