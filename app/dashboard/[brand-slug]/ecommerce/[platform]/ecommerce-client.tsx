"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
} from "recharts";
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Award,
} from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import MetricCard, { type MetricAccent } from "@/components/dashboard/metric-card";
import ReportCard, { SectionHeading } from "@/components/dashboard/report-card";
import { getPlatformLabel } from "@/lib/admin-platforms";
import { EcommercePlatformIcon } from "@/components/ecommerce-platform-icon";
import { filterDataByDateRange, getGa4DateRange } from "@/lib/date-range";
import {
  buildEcommerceData,
  buildTopProducts,
  filterProductSalesInRange,
  filterSalesByPlatform,
  generateMockEcommerceSales,
  generateMockTopProducts,
  type DailyProductSaleRow,
  type DailySaleRow,
  TOP_PRODUCTS_LIMIT,
} from "@/lib/ecommerce-builder";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(val);

const formatNumber = (val: number) => val.toLocaleString("tr-TR");

export default function EcommerceClient({
  brand,
  platform,
  salesData = [],
  productSalesData = [],
  isMocked,
}: {
  brand: { slug: string; name: string };
  platform: string;
  salesData?: DailySaleRow[];
  productSalesData?: DailyProductSaleRow[];
  isMocked?: boolean;
}) {
  const platformLabel = getPlatformLabel(platform);

  const [dateRange, setDateRange] = useState("yesterday");
  const [localSales, setLocalSales] = useState<DailySaleRow[]>(salesData);
  const [localProducts, setLocalProducts] = useState<DailyProductSaleRow[]>(productSalesData);
  const [isTodaySyncing, setIsTodaySyncing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const formatLocal = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatLocal(d);
  });
  const [customEnd, setCustomEnd] = useState(() => formatLocal(new Date()));

  useEffect(() => {
    setLocalSales(salesData);
    setLocalProducts(productSalesData);
  }, [salesData, productSalesData]);

  useEffect(() => {
    if (isMocked || (dateRange !== "today" && dateRange !== "yesterday")) return;

    setIsTodaySyncing(true);
    fetch(`/api/brands/${brand.slug}/sync-today?period=${dateRange}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        const dateStr = data.syncDate || getGa4DateRange(dateRange).startDate;
        const platformSales = filterSalesByPlatform(data.sales || [], platform);
        setLocalSales((prev) => {
          const filtered = prev.filter((s) => s.date !== dateStr);
          return [...filtered, ...platformSales];
        });
      })
      .finally(() => setIsTodaySyncing(false));
  }, [dateRange, brand.slug, isMocked, platform]);

  const rangeLabels: Record<string, string> = {
    today: "Bugün",
    yesterday: "Dün",
    "7d": "Son 7 Gün",
    "14d": "Son 14 Gün",
    "30d": "Son 30 Gün",
    custom: "Özel",
  };

  const filteredPeriod = useMemo(() => {
    if (isMocked) return null;
    return filterDataByDateRange(dateRange, localSales, [], customStart, customEnd);
  }, [dateRange, customStart, customEnd, localSales, isMocked]);

  const data = useMemo(() => {
    if (isMocked) {
      const mockSales = generateMockEcommerceSales(platform);
      const { startDate, endDate } =
        dateRange === "custom"
          ? { startDate: customStart, endDate: customEnd }
          : getGa4DateRange(dateRange);
      const singleDay = dateRange === "today" || dateRange === "yesterday";
      const inRange = (date: string) =>
        singleDay ? date === endDate : date >= startDate && date <= endDate;
      const filtered = mockSales.filter((s) => inRange(s.date));
      return buildEcommerceData(filtered);
    }

    return buildEcommerceData(
      filteredPeriod!.filteredSales as DailySaleRow[],
      filteredPeriod!.prevFilteredSales as DailySaleRow[]
    );
  }, [isMocked, platform, dateRange, customStart, customEnd, filteredPeriod]);

  const topProducts = useMemo(() => {
    const range =
      dateRange === "custom"
        ? { startDate: customStart, endDate: customEnd }
        : getGa4DateRange(dateRange);
    const singleDay = dateRange === "today" || dateRange === "yesterday";
    const source = isMocked ? generateMockTopProducts(platform) : localProducts;
    const filtered = filterProductSalesInRange(
      source,
      range.startDate,
      range.endDate,
      singleDay
    );
    return buildTopProducts(filtered, TOP_PRODUCTS_LIMIT);
  }, [isMocked, platform, dateRange, customStart, customEnd, localProducts]);

  const topProductsChartData = useMemo(
    () =>
      [...topProducts]
        .reverse()
        .map((p) => ({
          name: p.productName.length > 28 ? `${p.productName.slice(0, 28)}…` : p.productName,
          revenue: p.revenue,
        })),
    [topProducts]
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch(`/api/brands/${brand.slug}/sync-today`, { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
    }
  };

  const kpis: {
    label: string;
    value: string;
    score?: number;
    accent: MetricAccent;
    icon: typeof TrendingUp;
  }[] = [
    {
      label: "Toplam Ciro",
      value: formatCurrency(data.stats.revenue),
      score: data.stats.prevPeriod.revenueScore,
      accent: "emerald",
      icon: TrendingUp,
    },
    {
      label: "Toplam Sipariş",
      value: formatNumber(data.stats.orderCount),
      score: data.stats.prevPeriod.orderScore,
      accent: "blue",
      icon: ShoppingBag,
    },
    {
      label: "Ortalama Sepet (AOV)",
      value: formatCurrency(data.stats.aov),
      score: data.stats.prevPeriod.aovScore,
      accent: "amber",
      icon: DollarSign,
    },
    {
      label: "Günlük Ort. Ciro",
      value: formatCurrency(data.stats.avgDailyRevenue),
      accent: "violet",
      icon: BarChart3,
    },
    {
      label: "Günlük Ort. Sipariş",
      value: formatNumber(data.stats.avgDailyOrders),
      accent: "brand",
      icon: Package,
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 text-slate-700 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <DashboardPageHeader
          title={`${platformLabel} Raporu`}
          subtitle={`${brand.name} — ${platformLabel} satış ve sipariş verileri`}
          iconNode={
            <EcommercePlatformIcon platformId={platform} className="w-6 h-6" colored bordered />
          }
          accent="ecommerce"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          rangeLabels={rangeLabels}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          isTodayLoading={isTodaySyncing}
          showPeriodBadge
          onPeriodClick={() => setDateRange("custom")}
          sync={{
            onClick: handleSync,
            disabled: isSyncing,
            loading: isSyncing,
          }}
          badges={
            <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
              {platformLabel} entegrasyonu
            </span>
          }
        />

        <SectionHeading
          title="Satış Özeti"
          description={`${platformLabel} kaynağından gelen ciro ve sipariş metrikleri`}
          icon={ShoppingBag}
          accent="emerald"
        />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <MetricCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              score={kpi.score}
              accent={kpi.accent}
              icon={kpi.icon}
            />
          ))}
        </div>

        <SectionHeading
          title="En Çok Satan Ürünler"
          description={`Seçili dönemin top ${TOP_PRODUCTS_LIMIT} ürünü — ${platformLabel} sipariş kalemleri`}
          icon={Award}
          accent="emerald"
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-5"
            label="Grafik"
            title={`Top ${TOP_PRODUCTS_LIMIT} Ciro`}
            description="Ürün bazlı ciro dağılımı"
            icon={BarChart3}
            accent="emerald"
          >
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">
                Bu dönem için ürün verisi yok. Sync sonrası dolacaktır.
              </p>
            ) : (
              <div className="h-[360px] w-full -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={110} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }}
                      formatter={(value) => [formatCurrency(Number(value) || 0), "Ciro"]}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportCard>

          <ReportCard
            className="lg:col-span-7"
            label="Tablo"
            title={`Top ${TOP_PRODUCTS_LIMIT} Ürün`}
            description="Adet, ciro ve pay"
            icon={Package}
            accent="emerald"
          >
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">
                Bu dönem için ürün verisi yok. Sync sonrası dolacaktır.
              </p>
            ) : (
              <div className="overflow-x-auto -mt-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                      <th className="pb-3 font-semibold w-10">#</th>
                      <th className="pb-3 font-semibold">Ürün</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">SKU</th>
                      <th className="pb-3 font-semibold text-right">Adet</th>
                      <th className="pb-3 font-semibold text-right">Ciro</th>
                      <th className="pb-3 font-semibold text-right">Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.productId} className="border-b border-slate-50 hover:bg-slate-50/80">
                        <td className="py-3 font-bold text-slate-400">{product.rank}</td>
                        <td className="py-3">
                          <span className="font-medium text-slate-800 block truncate max-w-[220px] lg:max-w-none">
                            {product.productName}
                          </span>
                          {product.categoryName && (
                            <span className="text-[11px] text-slate-500">{product.categoryName}</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 hidden md:table-cell">{product.sku ?? "—"}</td>
                        <td className="py-3 text-right text-slate-700">{formatNumber(product.quantity)}</td>
                        <td className="py-3 text-right font-semibold text-emerald-700">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="py-3 text-right text-slate-600">%{product.revenueShare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportCard>
        </div>

        <SectionHeading title="Satış Trendi" icon={BarChart3} accent="emerald" />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-8"
            label="Grafik"
            title="Ciro Eğilimi"
            description="Günlük toplam ciro"
            icon={TrendingUp}
            accent="emerald"
            headerExtra={
              <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ciro
                </div>
              </div>
            }
          >
            <div className="h-[320px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ecomRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }}
                    formatter={(value, name) => {
                      const num = Number(value) || 0;
                      return name === "revenue"
                        ? [formatCurrency(num), "Ciro"]
                        : [formatNumber(num), "Sipariş"];
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#ecomRevGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>

          <ReportCard
            className="lg:col-span-4"
            label="Grafik"
            title="Sipariş Adedi"
            description="Günlük sipariş hacmi"
            icon={ShoppingBag}
            accent="blue"
          >
            <div className="h-[320px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>
        </div>

        <SectionHeading title="Günlük Detay" icon={Package} accent="emerald" />
        <ReportCard
          label="Tablo"
          title="Günlük Satış Dökümü"
          description="Seçili dönemdeki gün bazlı ciro ve sipariş"
          icon={ShoppingBag}
          accent="emerald"
        >
          {data.dailyBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Bu dönem için {platformLabel} satış verisi bulunamadı.
            </p>
          ) : (
            <div className="overflow-x-auto -mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Tarih</th>
                    <th className="pb-3 font-semibold text-right">Sipariş</th>
                    <th className="pb-3 font-semibold text-right">Ciro</th>
                    <th className="pb-3 font-semibold text-right">AOV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyBreakdown.slice(0, 31).map((row) => (
                    <tr key={row.date} className="border-b border-slate-50 hover:bg-slate-50/80">
                      <td className="py-3 font-medium text-slate-800">{row.dateLabel}</td>
                      <td className="py-3 text-right text-slate-700">{formatNumber(row.orders)}</td>
                      <td className="py-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="py-3 text-right text-slate-600">{formatCurrency(row.aov)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>

        {data.trends.length > 1 && (
          <ReportCard
            label="Grafik"
            title="Ciro ve Sipariş Birlikte"
            description="İki metriği aynı zaman ekseninde karşılaştırın"
            icon={BarChart3}
            accent="emerald"
          >
            <div className="h-[280px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="#10b98122" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>
        )}
      </div>
    </div>
  );
}
