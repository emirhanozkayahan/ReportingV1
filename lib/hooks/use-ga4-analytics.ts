"use client";

import { useEffect, useState } from "react";
import type { AnalyticsDataWithGa4 } from "@/lib/merge-ga4-analytics";
import { generateAnalyticsMockData } from "@/lib/mock-data-analytics";
import { getPrevGa4RangeSpec } from "@/lib/date-range";

const USE_LIVE_GA4 = true;
const CLIENT_CACHE_MS = 5 * 60 * 1000;

const clientCache = new Map<string, { data: AnalyticsDataWithGa4; at: number }>();
const inflight = new Map<string, Promise<AnalyticsDataWithGa4>>();

function formatGa4Error(message: string): string {
  if (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.toLowerCase().includes("quota")
  ) {
    return "GA4 API kotası geçici olarak doldu. Yaklaşık 1 saat içinde yenilenecek.";
  }
  return message;
}

function buildGa4Url(
  slug: string,
  range: string,
  start?: string,
  end?: string
): string {
  const params = new URLSearchParams({ slug, range });
  if (range === "custom" && start && end) {
    params.set("start", start);
    params.set("end", end);
  }
  return `/api/analytics/ga4-live?${params.toString()}`;
}

function cacheKey(slug: string, range: string, start?: string, end?: string): string {
  if (range === "custom" && start && end) {
    return `${slug}:custom:${start}:${end}`;
  }
  return `${slug}:${range}`;
}

async function fetchGa4Live(
  slug: string,
  range: string,
  start?: string,
  end?: string
): Promise<AnalyticsDataWithGa4> {
  const key = cacheKey(slug, range, start, end);
  const mem = clientCache.get(key);
  if (mem && Date.now() - mem.at < CLIENT_CACHE_MS) {
    return mem.data;
  }

  const existing = inflight.get(key);
  if (existing) return existing;

  const request = fetch(buildGa4Url(slug, range, start, end))
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        const serverError = json.error
          ? formatGa4Error(String(json.error))
          : "GA4 verisi çekilemedi. Mülk ID veya yetki kontrol edin.";
        throw new Error(serverError);
      }
      return json as AnalyticsDataWithGa4;
    })
    .then((json) => {
      clientCache.set(key, { data: json, at: Date.now() });
      return json;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

export type UseAnalyticsDataOptions = {
  customStart?: string;
  customEnd?: string;
  fetchPrevPeriod?: boolean;
};

export function useAnalyticsData(
  slug: string,
  dateRange: string,
  options: UseAnalyticsDataOptions = {}
) {
  const { customStart, customEnd, fetchPrevPeriod = false } = options;

  const [data, setData] = useState<AnalyticsDataWithGa4>(() =>
    ({ ...generateAnalyticsMockData(slug, dateRange), isGa4Live: false })
  );
  const [prevData, setPrevData] = useState<AnalyticsDataWithGa4 | undefined>(undefined);
  const [loading, setLoading] = useState(USE_LIVE_GA4);
  const [initialLoad, setInitialLoad] = useState(USE_LIVE_GA4);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_LIVE_GA4) {
      setData({ ...generateAnalyticsMockData(slug, dateRange), isGa4Live: false });
      setPrevData(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setWarning(null);

    const prevSpec = fetchPrevPeriod
      ? getPrevGa4RangeSpec(dateRange, customStart, customEnd)
      : null;

    const currentStart = dateRange === "custom" ? customStart : undefined;
    const currentEnd = dateRange === "custom" ? customEnd : undefined;

    const prevPromise = prevSpec
      ? fetchGa4Live(slug, prevSpec.range, prevSpec.start, prevSpec.end).catch(() => undefined)
      : Promise.resolve(undefined);

    Promise.all([
      fetchGa4Live(slug, dateRange, currentStart, currentEnd),
      prevPromise,
    ])
      .then(([json, prevJson]) => {
        if (cancelled) return;
        setData(json);
        setPrevData(prevJson);
        const cacheWarning = (json as AnalyticsDataWithGa4 & { ga4CacheWarning?: string }).ga4CacheWarning;
        if (cacheWarning) setWarning(cacheWarning);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setData({ ...generateAnalyticsMockData(slug, dateRange), isGa4Live: false });
        setPrevData(undefined);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, dateRange, customStart, customEnd, fetchPrevPeriod]);

  return { data, prevData, loading, initialLoad, error, warning, ga4Enabled: USE_LIVE_GA4 };
}
