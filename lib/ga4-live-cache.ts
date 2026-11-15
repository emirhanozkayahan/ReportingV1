type Ga4CacheEntry = {
  body: Record<string, unknown>;
  storedAt: number;
};

const CACHE_TTL_MS = 45 * 60 * 1000; // 45 dk — kota yenilenene kadar tekrar istek azaltır
const STALE_MAX_MS = 24 * 60 * 60 * 1000; // 429'da en fazla 24 saat eski veri

const store = new Map<string, Ga4CacheEntry>();

export function ga4CacheKey(slug: string, range: string) {
  return `${slug}:${range}`;
}

export function getGa4Cached(slug: string, range: string): Ga4CacheEntry | null {
  const entry = store.get(ga4CacheKey(slug, range));
  if (!entry) return null;
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) return null;
  return entry;
}

/** Kota hatasında süresi dolmuş önbelleği de kabul et */
export function getGa4StaleCached(slug: string, range: string): Ga4CacheEntry | null {
  const entry = store.get(ga4CacheKey(slug, range));
  if (!entry) return null;
  if (Date.now() - entry.storedAt > STALE_MAX_MS) return null;
  return entry;
}

export function setGa4Cached(slug: string, range: string, body: Record<string, unknown>) {
  store.set(ga4CacheKey(slug, range), { body, storedAt: Date.now() });
}

export function isGa4QuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: number; status?: string; message?: string };
  return e.code === 429 || e.status === "RESOURCE_EXHAUSTED";
}

export function parseGa4ApiError(payload: { error?: unknown }): unknown {
  return payload?.error ?? null;
}
