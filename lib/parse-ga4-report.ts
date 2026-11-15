import type { AnalyticsOverview, TrafficSource } from "./mock-data-analytics";

/** GA4 Data API runReport yanıtı (kısaltılmış tip) */
export type Ga4FixturePeriod = "today" | "yesterday" | "7d" | "14d" | "30d";

export type Ga4RunReport = {
  dimensionHeaders: { name: string }[];
  metricHeaders: { name: string; type?: string }[];
  rows: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
  totals?: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
  rowCount?: number;
  metadata?: { currencyCode?: string; timeZone?: string };
  /** Fixture dosyasında: bu rapor hangi tarih aralığının toplamı */
  fixturePeriod?: Ga4FixturePeriod;
};

export const GA4_PERIOD_LABELS: Record<Ga4FixturePeriod, string> = {
  today: "Bugün",
  yesterday: "Dün",
  "7d": "Son 7 Gün",
  "14d": "Son 14 Gün",
  "30d": "Son 30 Gün",
};

export function getGa4FixturePeriod(report: Ga4RunReport): Ga4FixturePeriod {
  return report.fixturePeriod ?? "30d";
}

const METRIC = {
  avgSessionDuration: 0,
  bounceRate: 1,
  engagementRate: 2,
  newUsers: 3,
  screenPageViews: 4,
  sessions: 5,
  totalUsers: 6,
  purchases: 7,
} as const;

function num(v: string | undefined): number {
  return parseFloat(v ?? "0") || 0;
}

function int(v: string | undefined): number {
  return Math.round(num(v));
}

export function formatGa4Duration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}dk ${s}sn`;
}

function isReservedRow(medium: string, source: string): boolean {
  return medium.includes("RESERVED") || source.includes("RESERVED");
}

export type Ga4TrafficRow = TrafficSource & { purchases: number };

export function parseGa4TrafficRows(report: Ga4RunReport): Ga4TrafficRow[] {
  return report.rows
    .map((row) => {
      const medium = row.dimensionValues[0]?.value ?? "";
      const source = row.dimensionValues[1]?.value ?? "";
      if (isReservedRow(medium, source)) return null;

      const m = row.metricValues;
      const sessions = int(m[METRIC.sessions]?.value);
      const pageViews = int(m[METRIC.screenPageViews]?.value);
      const purchases = int(m[METRIC.purchases]?.value);

      return {
        source,
        medium,
        sessions,
        users: int(m[METRIC.totalUsers]?.value),
        bounceRate: parseFloat((num(m[METRIC.bounceRate]?.value) * 100).toFixed(1)),
        conversionRate:
          sessions > 0 ? parseFloat(((purchases / sessions) * 100).toFixed(2)) : 0,
        revenue: 0,
        pagesPerSession:
          sessions > 0 ? parseFloat((pageViews / sessions).toFixed(1)) : 0,
        purchases,
      };
    })
    .filter((r): r is Ga4TrafficRow => r !== null)
    .sort((a, b) => b.sessions - a.sessions);
}

export function parseGa4OverviewFromTotals(
  report: Ga4RunReport,
  prevPeriod?: AnalyticsOverview["prevPeriod"]
): AnalyticsOverview {
  const t = report.totals?.[0]?.metricValues ?? [];
  const sessions = int(t[METRIC.sessions]?.value);
  const users = int(t[METRIC.totalUsers]?.value);
  const newUsers = int(t[METRIC.newUsers]?.value);
  const pageViews = int(t[METRIC.screenPageViews]?.value);

  return {
    sessions,
    users,
    newUsers,
    returningUsers: Math.max(0, users - newUsers),
    pageViews,
    avgSessionDuration: formatGa4Duration(num(t[METRIC.avgSessionDuration]?.value)),
    bounceRate: parseFloat((num(t[METRIC.bounceRate]?.value) * 100).toFixed(1)),
    engagementRate: parseFloat((num(t[METRIC.engagementRate]?.value) * 100).toFixed(1)),
    pagesPerSession: sessions > 0 ? parseFloat((pageViews / sessions).toFixed(1)) : 0,
    eventsPerSession: 0,
    prevPeriod: prevPeriod ?? {
      sessionsChange: 0,
      usersChange: 0,
      bounceRateChange: 0,
      engagementChange: 0,
    },
    dailyTrend: [
      {
        date: new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
        sessions,
        users,
        bounceRate: parseFloat((num(t[METRIC.bounceRate]?.value) * 100).toFixed(1)),
        pageViews,
      },
    ],
  };
}

export function getGa4PurchaseTotals(report: Ga4RunReport): number {
  const t = report.totals?.[0]?.metricValues;
  return int(t?.[METRIC.purchases]?.value);
}
