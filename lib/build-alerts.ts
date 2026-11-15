import type { AlertInsight } from "@/lib/mock-data";
import type { AnalyticsDataWithGa4 } from "@/lib/merge-ga4-analytics";

const META_ROAS_DROP_THRESHOLD = 10;
const META_CPM_RISE_THRESHOLD = 10;
const CART_DROPOFF_RISE_THRESHOLD = 3;
const GOOGLE_MIN_CLICKS = 50;
const GOOGLE_CONV_STABLE_BAND = 2;

type AdRow = {
  platform?: string;
  spend?: number | string;
  impressions?: number | string;
  clicks?: number | string;
  conversions?: number | string;
  revenue?: number | string;
};

type SalesRow = {
  revenue?: number | string;
  order_count?: number;
};

export type BuildAlertsInput = {
  sales: SalesRow[];
  ads: AdRow[];
  prevSales: SalesRow[];
  prevAds: AdRow[];
  ga4?: AnalyticsDataWithGa4;
  prevGa4?: AnalyticsDataWithGa4;
};

function num(v: number | string | undefined): number {
  return Number(v) || 0;
}

function pctChange(current: number, prev: number): number {
  if (prev === 0 && current === 0) return 0;
  if (prev === 0) return 100;
  return Math.round(((current - prev) / prev) * 100);
}

function filterPlatform(ads: AdRow[], platform: string): AdRow[] {
  return ads.filter((a) => a.platform === platform);
}

function metaRoas(ads: AdRow[]): number {
  const meta = filterPlatform(ads, "Meta");
  const spend = meta.reduce((s, a) => s + num(a.spend), 0);
  const revenue = meta.reduce((s, a) => s + num(a.revenue), 0);
  return spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
}

function metaCpm(ads: AdRow[]): number {
  const meta = filterPlatform(ads, "Meta");
  const spend = meta.reduce((s, a) => s + num(a.spend), 0);
  const impressions = meta.reduce((s, a) => s + num(a.impressions), 0);
  return impressions > 0 ? Number(((spend / impressions) * 1000).toFixed(2)) : 0;
}

function metaSpend(ads: AdRow[]): number {
  return filterPlatform(ads, "Meta").reduce((s, a) => s + num(a.spend), 0);
}

function googleConvRate(ads: AdRow[]): { rate: number; clicks: number } {
  const google = filterPlatform(ads, "Google");
  const clicks = google.reduce((s, a) => s + num(a.clicks), 0);
  const conversions = google.reduce((s, a) => s + num(a.conversions), 0);
  const rate = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
  return { rate, clicks };
}

function cartDropOff(ga4?: AnalyticsDataWithGa4): number {
  const steps = ga4?.purchaseJourney?.steps;
  if (!steps || steps.length < 3) return 0;
  return Number(steps[2]?.dropOff) || 0;
}

function mobileBounce(ga4?: AnalyticsDataWithGa4): number | null {
  const devices = ga4?.deviceDetails;
  if (!devices?.length) return null;
  const mobile = devices.find(
    (d) => String(d.device).toLowerCase() === "mobile"
  );
  return mobile ? Number(mobile.bounceRate) || 0 : null;
}

function formatRevChange(change: number): string {
  if (change > 0) return `%${change} arttı`;
  if (change < 0) return `%${Math.abs(change)} azaldı`;
  return "değişmedi";
}

export function buildAlerts(input: BuildAlertsInput): AlertInsight[] {
  const { sales, ads, prevSales, prevAds, ga4, prevGa4 } = input;
  const alerts: AlertInsight[] = [];

  const totalRevenue = sales.reduce((s, r) => s + num(r.revenue), 0);
  const totalOrders = sales.reduce((s, r) => s + (r.order_count || 0), 0);
  const prevRevenue = prevSales.reduce((s, r) => s + num(r.revenue), 0);

  const currentMetaSpend = metaSpend(ads);
  const currentRoas = metaRoas(ads);
  const prevRoas = metaRoas(prevAds);
  const roasChange = pctChange(currentRoas, prevRoas);

  if (currentMetaSpend > 0 && prevRoas > 0 && roasChange <= -META_ROAS_DROP_THRESHOLD) {
    const currentCpm = metaCpm(ads);
    const prevCpm = metaCpm(prevAds);
    const cpmChange = pctChange(currentCpm, prevCpm);
    let message = `Meta ROAS bu dönemde %${Math.abs(roasChange)} düştü (${currentRoas} → önceki ${prevRoas}).`;
    if (prevCpm > 0 && cpmChange >= META_CPM_RISE_THRESHOLD) {
      message += ` BGBM (CPM) %${cpmChange} yükseldi.`;
    }
    alerts.push({ id: "meta-roas", message, type: "danger" });
  }

  if (totalRevenue > 0 && totalOrders > 0) {
    const revChange = pctChange(totalRevenue, prevRevenue);
    const message = `Bu dönemde ${totalOrders.toLocaleString("tr-TR")} sipariş, ₺${totalRevenue.toLocaleString("tr-TR")} ciro. Önceki döneme göre ciro ${formatRevChange(revChange)}.`;
    alerts.push({ id: "revenue-summary", message, type: "success" });
  }

  if (ga4?.isGa4Live && prevGa4?.isGa4Live) {
    const currDrop = cartDropOff(ga4);
    const prevDrop = cartDropOff(prevGa4);
    const dropDelta = currDrop - prevDrop;

    if (prevDrop > 0 && dropDelta >= CART_DROPOFF_RISE_THRESHOLD) {
      let message = `Sepet terk oranı %${currDrop}'e çıktı (önceki %${prevDrop}).`;
      const currMobileBounce = mobileBounce(ga4);
      const prevMobileBounce = mobileBounce(prevGa4);
      if (
        currMobileBounce !== null &&
        prevMobileBounce !== null &&
        currMobileBounce > prevMobileBounce
      ) {
        message += " Mobil bounce oranı da yükseldi.";
      }
      alerts.push({ id: "cart-dropoff", message, type: "warning" });
    }
  }

  const { rate: googleRate, clicks: googleClicks } = googleConvRate(ads);
  const { rate: prevGoogleRate, clicks: prevGoogleClicks } = googleConvRate(prevAds);

  if (googleClicks >= GOOGLE_MIN_CLICKS) {
    const convDelta =
      prevGoogleClicks >= GOOGLE_MIN_CLICKS && prevGoogleRate > 0
        ? googleRate - prevGoogleRate
        : 0;

    if (
      prevGoogleClicks >= GOOGLE_MIN_CLICKS &&
      Math.abs(convDelta) <= GOOGLE_CONV_STABLE_BAND
    ) {
      alerts.push({
        id: "google-conv-stable",
        message: `Google reklamlarında tıklama başına dönüşüm oranı ~%${googleRate} seviyesinde sabit.`,
        type: "info",
      });
    } else if (convDelta <= -GOOGLE_CONV_STABLE_BAND) {
      alerts.push({
        id: "google-conv-drop",
        message: `Google dönüşüm oranı %${googleRate}'e düştü (önceki %${prevGoogleRate}).`,
        type: "warning",
      });
    } else if (convDelta >= GOOGLE_CONV_STABLE_BAND) {
      alerts.push({
        id: "google-conv-rise",
        message: `Google dönüşüm oranı %${googleRate}'e yükseldi (önceki %${prevGoogleRate}).`,
        type: "success",
      });
    }
  }

  if (alerts.length === 0) {
    return [
      {
        id: "no-data",
        message: "Bu dönem için yeterli veri yok.",
        type: "info",
      },
    ];
  }

  return alerts.slice(0, 4);
}
