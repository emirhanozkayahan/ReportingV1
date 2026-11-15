import type { Ga4RunReport } from "./parse-ga4-report";
import {
  getGa4FixturePeriod,
  getGa4PurchaseTotals,
  parseGa4OverviewFromTotals,
  parseGa4TrafficRows,
} from "./parse-ga4-report";
import { generateAnalyticsMockData } from "./mock-data-analytics";

type AnalyticsData = ReturnType<typeof generateAnalyticsMockData>;

export type AnalyticsDataWithGa4 = AnalyticsData & {
  isGa4Live: boolean;
  ga4Meta?: { currencyCode?: string; timeZone?: string; rowCount?: number; fixturePeriod?: string };
  ga4PeriodMismatch?: boolean;
  ga4FixturePeriod?: string;
  ga4CacheWarning?: string;
  ga4FromCache?: boolean;
  ga4QuotaExceeded?: boolean;
  realtime?: {
    activeUsers: number;
    activeCountries: { country: string; users: number }[];
  };
  devices?: any[];
  demographicsAges?: any[];
};

/** Mock veriyi GA4 runReport yanıtı ile birleştirir (trafik + üst KPI + purchase özeti). */
export function mergeAnalyticsWithGa4Report(
  slug: string,
  dateRange: string,
  report: Ga4RunReport
): AnalyticsDataWithGa4 {
  const mock = generateAnalyticsMockData(slug, dateRange);
  const trafficSources = parseGa4TrafficRows(report);
  const overview = parseGa4OverviewFromTotals(report, {
    sessionsChange: 0,
    usersChange: 0,
    bounceRateChange: 0,
    engagementChange: 0,
  });
  const totalPurchases = getGa4PurchaseTotals(report);
  const sessions = overview.sessions;
  const conversionRate =
    sessions > 0 ? parseFloat(((totalPurchases / sessions) * 100).toFixed(2)) : 0;

  const events = mock.events.map((ev) =>
    ev.eventName === "purchase"
      ? { ...ev, count: totalPurchases, users: totalPurchases }
      : ev
  );

  const getEventUsers = (name: string) => events.find((e: any) => e.eventName === name)?.users || 0;
  
  const step1 = getEventUsers('session_start') || sessions;
  const step2 = getEventUsers('view_item');
  const step3 = getEventUsers('add_to_cart');
  const step4 = getEventUsers('begin_checkout');
  const step5 = getEventUsers('purchase') || totalPurchases;

  return {
    ...mock,
    overview,
    trafficSources,
    purchaseJourney: {
      ...mock.purchaseJourney,
      steps: [
        { step: 'Oturum Başlatma', users: step1, percentage: 100, dropOff: step2 ? parseFloat(((step1 - step2) / step1 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Ürünü Görüntüleme', users: step2, percentage: step1 ? parseFloat((step2 / step1 * 100).toFixed(1)) : 0, dropOff: step3 ? parseFloat(((step2 - step3) / step2 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Sepete Ekleme', users: step3, percentage: step1 ? parseFloat((step3 / step1 * 100).toFixed(1)) : 0, dropOff: step4 ? parseFloat(((step3 - step4) / step3 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Ödeme Başlatma', users: step4, percentage: step1 ? parseFloat((step4 / step1 * 100).toFixed(1)) : 0, dropOff: step5 ? parseFloat(((step4 - step5) / step4 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Satın Alma', users: step5, percentage: step1 ? parseFloat((step5 / step1 * 100).toFixed(1)) : 0, dropOff: 0, avgTime: '-' }
      ],
      conversionRate,
      microConversions: events
        .filter((e: any) => ['add_to_cart', 'begin_checkout', 'add_to_wishlist', 'sign_up', 'login', 'search', 'view_item', 'view_item_list', 'scroll', 'click'].includes(e.eventName))
        .map((e: any) => ({
          event: e.eventName,
          count: e.count,
          rate: step1 > 0 ? parseFloat(((e.users / step1) * 100).toFixed(2)) : 0
        })),
    },
    events,
    isGa4Live: true,
    ga4Meta: {
      currencyCode: report.metadata?.currencyCode,
      timeZone: report.metadata?.timeZone,
      rowCount: report.rowCount ?? trafficSources.length,
      fixturePeriod: getGa4FixturePeriod(report),
    },
  };
}
