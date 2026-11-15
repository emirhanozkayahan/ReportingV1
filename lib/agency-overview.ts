import { supabaseAdmin } from "@/lib/supabase";
import { buildRealDashboardData } from "@/lib/dashboard-builder";
import { filterDataByDateRange, getGa4DateRange } from "@/lib/date-range";

const ECOMMERCE_PLATFORMS = new Set([
  "ikas",
  "shopify",
  "tsoft",
  "ticimax",
  "wordpress",
  "ideasoft",
  "faprika",
]);
const AD_PLATFORMS = new Set(["google", "meta"]);

export type BrandCardStatus = "ok" | "stale" | "partial" | "missing";

export type AgencyBrandOverview = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  integrations: string[];
  status: BrandCardStatus;
  latestDataDate: string | null;
  metrics: {
    revenue: number;
    orders: number;
    spend: number;
    roas: number;
    revenueChangePct: number;
  };
};

export type AgencyOverview = {
  period: { key: string; startDate: string; endDate: string; label: string };
  summary: {
    brandCount: number;
    connectedBrands: number;
    totalRevenue: number;
    totalSpend: number;
    blendedRoas: number;
  };
  brands: AgencyBrandOverview[];
  generatedAt: string;
};

function maxDate(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean) as string[];
  if (!valid.length) return null;
  return valid.sort().at(-1) ?? null;
}

function deriveCardStatus(
  integrations: string[],
  salesLatest: string | null,
  adsLatest: string | null,
  periodEnd: string
): BrandCardStatus {
  if (integrations.length === 0) return "missing";

  const needsSales = integrations.some((p) => ECOMMERCE_PLATFORMS.has(p));
  const needsAds = integrations.some((p) => AD_PLATFORMS.has(p));

  const statuses: ("ok" | "stale" | "missing")[] = [];

  if (needsSales) {
    statuses.push(
      !salesLatest ? "missing" : salesLatest >= periodEnd ? "ok" : "stale"
    );
  }
  if (needsAds) {
    statuses.push(!adsLatest ? "missing" : adsLatest >= periodEnd ? "ok" : "stale");
  }

  if (!statuses.length) return "missing";
  if (statuses.every((s) => s === "ok")) return "ok";
  if (statuses.every((s) => s === "missing" || s === "stale")) return "stale";
  return "partial";
}

function periodLabel(key: string): string {
  if (key === "yesterday") return "Dün";
  if (key === "7d") return "Son 7 gün";
  return key;
}

function fetchStartForPeriod(periodKey: string): string {
  if (periodKey === "7d") {
    const range = getGa4DateRange("7d");
    const prev = getGa4DateRange("prev7d");
    return prev.startDate < range.startDate ? prev.startDate : range.startDate;
  }
  const prevYesterday = getGa4DateRange("prev_yesterday");
  return prevYesterday.startDate;
}

export async function buildAgencyOverview(
  periodKey: string = "yesterday"
): Promise<AgencyOverview | null> {
  if (!supabaseAdmin) return null;

  const period = getGa4DateRange(periodKey === "7d" ? "7d" : "yesterday");
  const fetchFrom = fetchStartForPeriod(periodKey);

  const [
    { data: brands, error: brandsErr },
    { data: integrations },
    { data: sales },
    { data: ads },
  ] = await Promise.all([
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, logo_url")
      .order("name"),
    supabaseAdmin.from("integrations").select("brand_id, platform"),
    supabaseAdmin.from("daily_sales").select("*").gte("date", fetchFrom),
    supabaseAdmin.from("daily_ad_stats").select("*").gte("date", fetchFrom),
  ]);

  if (brandsErr || !brands?.length) return null;

  const integrationsByBrand: Record<string, string[]> = {};
  (integrations || []).forEach((row) => {
    if (!integrationsByBrand[row.brand_id]) integrationsByBrand[row.brand_id] = [];
    integrationsByBrand[row.brand_id].push(row.platform);
  });

  const salesByBrand: Record<string, typeof sales> = {};
  const adsByBrand: Record<string, typeof ads> = {};
  (sales || []).forEach((row) => {
    if (!salesByBrand[row.brand_id]) salesByBrand[row.brand_id] = [];
    salesByBrand[row.brand_id]!.push(row);
  });
  (ads || []).forEach((row) => {
    if (!adsByBrand[row.brand_id]) adsByBrand[row.brand_id] = [];
    adsByBrand[row.brand_id]!.push(row);
  });

  let totalRevenue = 0;
  let totalSpend = 0;
  let connectedBrands = 0;

  const brandOverviews: AgencyBrandOverview[] = brands.map((brand) => {
    const brandSales = salesByBrand[brand.id] || [];
    const brandAds = adsByBrand[brand.id] || [];
    const brandIntegrations = integrationsByBrand[brand.id] || [];

    if (brandIntegrations.length > 0) connectedBrands++;

    const salesLatest = maxDate(brandSales.map((s) => s.date));
    const adsLatest = maxDate(brandAds.map((a) => a.date));
    const status = deriveCardStatus(
      brandIntegrations,
      salesLatest,
      adsLatest,
      period.endDate
    );

    const { filteredSales, filteredAds, prevFilteredSales, prevFilteredAds } =
      filterDataByDateRange(periodKey === "7d" ? "7d" : "yesterday", brandSales, brandAds);

    const dashboard = buildRealDashboardData(
      filteredSales as { date: string; revenue?: number; order_count?: number }[],
      filteredAds as { date: string; platform?: string; spend?: number }[],
      prevFilteredSales as { date: string; revenue?: number; order_count?: number }[],
      prevFilteredAds as { date: string; platform?: string; spend?: number }[]
    );

    totalRevenue += dashboard.stats.revenue;
    totalSpend += dashboard.stats.totalSpend;

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url ?? undefined,
      integrations: brandIntegrations,
      status,
      latestDataDate: maxDate([salesLatest, adsLatest]),
      metrics: {
        revenue: dashboard.stats.revenue,
        orders: dashboard.stats.orderCount,
        spend: dashboard.stats.totalSpend,
        roas: dashboard.stats.roi,
        revenueChangePct: dashboard.stats.prevPeriod.revenueScore,
      },
    };
  });

  return {
    period: {
      key: periodKey,
      startDate: period.startDate,
      endDate: period.endDate,
      label: periodLabel(periodKey),
    },
    summary: {
      brandCount: brands.length,
      connectedBrands,
      totalRevenue,
      totalSpend,
      blendedRoas:
        totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0,
    },
    brands: brandOverviews,
    generatedAt: new Date().toISOString(),
  };
}

/** Demo veri — Supabase yokken */
export function buildMockAgencyOverview(): AgencyOverview {
  const period = getGa4DateRange("yesterday");
  return {
    period: {
      key: "yesterday",
      startDate: period.startDate,
      endDate: period.endDate,
      label: "Dün",
    },
    summary: {
      brandCount: 3,
      connectedBrands: 3,
      totalRevenue: 284500,
      totalSpend: 42100,
      blendedRoas: 6.76,
    },
    brands: [
      {
        id: "1",
        name: "Navira",
        slug: "navira",
        integrations: ["ikas", "meta", "google"],
        status: "ok",
        latestDataDate: period.endDate,
        metrics: { revenue: 125000, orders: 89, spend: 18500, roas: 6.76, revenueChangePct: 12 },
      },
      {
        id: "2",
        name: "Banamio",
        slug: "banamio",
        integrations: ["shopify", "meta"],
        status: "stale",
        latestDataDate: null,
        metrics: { revenue: 98500, orders: 62, spend: 14200, roas: 6.94, revenueChangePct: -5 },
      },
      {
        id: "3",
        name: "Efotech",
        slug: "efotech",
        integrations: ["ikas"],
        status: "partial",
        latestDataDate: period.endDate,
        metrics: { revenue: 61000, orders: 41, spend: 9400, roas: 6.49, revenueChangePct: 3 },
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
