export type DailySaleRow = {
  date: string;
  order_count?: number | null;
  revenue?: number | null;
  platform?: string | null;
};

export type EcommerceStats = {
  revenue: number;
  orderCount: number;
  aov: number;
  avgDailyRevenue: number;
  avgDailyOrders: number;
  prevPeriod: {
    revenueScore: number;
    orderScore: number;
    aovScore: number;
  };
};

export type EcommerceTrendPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type EcommerceDayRow = {
  date: string;
  dateLabel: string;
  revenue: number;
  orders: number;
  aov: number;
};

function calcChange(current: number, prev: number) {
  if (prev === 0 && current === 0) return 0;
  if (prev === 0) return 100;
  return Math.round(((current - prev) / prev) * 100);
}

function aggregateSales(salesData: DailySaleRow[]) {
  const revenue = salesData.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
  const orderCount = salesData.reduce((sum, s) => sum + (s.order_count || 0), 0);
  const dayCount = new Set(salesData.map((s) => s.date)).size || 1;

  return {
    revenue,
    orderCount,
    aov: orderCount > 0 ? Number((revenue / orderCount).toFixed(2)) : 0,
    avgDailyRevenue: Number((revenue / dayCount).toFixed(2)),
    avgDailyOrders: Number((orderCount / dayCount).toFixed(1)),
  };
}

export function buildEcommerceData(
  salesData: DailySaleRow[],
  prevSalesData: DailySaleRow[] = []
) {
  const current = aggregateSales(salesData);
  const prev = aggregateSales(prevSalesData);

  const stats: EcommerceStats = {
    revenue: current.revenue,
    orderCount: current.orderCount,
    aov: current.aov,
    avgDailyRevenue: current.avgDailyRevenue,
    avgDailyOrders: current.avgDailyOrders,
    prevPeriod: {
      revenueScore: calcChange(current.revenue, prev.revenue),
      orderScore: calcChange(current.orderCount, prev.orderCount),
      aovScore: calcChange(current.aov, prev.aov),
    },
  };

  const trendMap = new Map<string, { revenue: number; orders: number }>();
  salesData.forEach((row) => {
    const entry = trendMap.get(row.date) || { revenue: 0, orders: 0 };
    entry.revenue += Number(row.revenue) || 0;
    entry.orders += row.order_count || 0;
    trendMap.set(row.date, entry);
  });

  const trends: EcommerceTrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      revenue: Math.round(vals.revenue),
      orders: vals.orders,
    }));

  const dailyBreakdown: EcommerceDayRow[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, vals]) => ({
      date,
      dateLabel: new Date(date).toLocaleDateString("tr-TR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      revenue: vals.revenue,
      orders: vals.orders,
      aov: vals.orders > 0 ? Number((vals.revenue / vals.orders).toFixed(2)) : 0,
    }));

  return { stats, trends, dailyBreakdown };
}

export function generateMockEcommerceSales(platform: string, days = 365): DailySaleRow[] {
  const sales: DailySaleRow[] = [];
  const baseOrders = platform === "shopify" ? 28 : 22;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const weekendBoost = [0, 6].includes(d.getDay()) ? 1.25 : 1;
    const orderCount = Math.max(1, Math.round((baseOrders + Math.random() * 18) * weekendBoost));
    const revenue = Math.round(orderCount * (750 + Math.random() * 550));

    sales.push({ date, platform, order_count: orderCount, revenue });
  }

  return sales;
}

export function filterSalesByPlatform(sales: DailySaleRow[], platform: string) {
  const normalized = platform.toLowerCase();
  return sales.filter((row) => (row.platform ?? "").toLowerCase() === normalized);
}

export type DailyProductSaleRow = {
  date: string;
  platform?: string | null;
  rank?: number | null;
  product_id: string;
  product_name: string;
  sku?: string | null;
  category_name?: string | null;
  quantity?: number | null;
  revenue?: number | null;
};

export type TopProductRow = {
  rank: number;
  productId: string;
  productName: string;
  sku: string | null;
  categoryName: string | null;
  quantity: number;
  revenue: number;
  revenueShare: number;
};

export const TOP_PRODUCTS_LIMIT = 10;

export function buildTopProducts(
  productRows: DailyProductSaleRow[],
  limit = TOP_PRODUCTS_LIMIT
): TopProductRow[] {
  const aggregated = new Map<
    string,
    {
      productId: string;
      productName: string;
      sku: string | null;
      categoryName: string | null;
      quantity: number;
      revenue: number;
    }
  >();

  for (const row of productRows) {
    const key = row.product_id;
    const existing = aggregated.get(key) ?? {
      productId: row.product_id,
      productName: row.product_name,
      sku: row.sku ?? null,
      categoryName: row.category_name ?? null,
      quantity: 0,
      revenue: 0,
    };

    existing.quantity += row.quantity || 0;
    existing.revenue += Number(row.revenue) || 0;
    if (!existing.sku && row.sku) existing.sku = row.sku;
    if (!existing.categoryName && row.category_name) existing.categoryName = row.category_name;

    aggregated.set(key, existing);
  }

  const totalRevenue = Array.from(aggregated.values()).reduce((sum, p) => sum + p.revenue, 0);

  return Array.from(aggregated.values())
    .sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity)
    .slice(0, limit)
    .map((product, index) => ({
      rank: index + 1,
      productId: product.productId,
      productName: product.productName,
      sku: product.sku,
      categoryName: product.categoryName,
      quantity: product.quantity,
      revenue: Number(product.revenue.toFixed(2)),
      revenueShare: totalRevenue > 0 ? Number(((product.revenue / totalRevenue) * 100).toFixed(1)) : 0,
    }));
}

const MOCK_PRODUCT_NAMES = [
  "Oversize Basic Tişört",
  "Slim Fit Chino Pantolon",
  "Oversize Hoodie",
  "Keten Gömlek",
  "Mom Jean Pantolon",
  "Triko Kazak",
  "Midi Elbise",
  "Deri Ceket",
  "Şort Etek",
  "Crop Bluz",
];

export function generateMockTopProducts(platform: string): DailyProductSaleRow[] {
  const rows: DailyProductSaleRow[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const date = d.toISOString().split("T")[0];

    MOCK_PRODUCT_NAMES.forEach((name, index) => {
      const quantity = Math.max(1, Math.round(12 - index + Math.random() * 8));
      const revenue = Math.round(quantity * (400 + index * 120 + Math.random() * 200));
      rows.push({
        date,
        platform,
        rank: index + 1,
        product_id: `${platform}-mock-${index + 1}`,
        product_name: name,
        sku: `SKU-${1000 + index}`,
        category_name: index < 4 ? "Üst Giyim" : index < 7 ? "Alt Giyim" : "Dış Giyim",
        quantity,
        revenue,
      });
    });
  }

  return rows;
}

export function filterProductSalesInRange(
  rows: DailyProductSaleRow[],
  startDate: string,
  endDate: string,
  singleDay: boolean
) {
  return rows.filter((row) =>
    singleDay ? row.date === endDate : row.date >= startDate && row.date <= endDate
  );
}
