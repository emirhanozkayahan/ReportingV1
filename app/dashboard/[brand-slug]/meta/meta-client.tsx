"use client";

import { useState, useEffect } from "react";
import { generateMetaMockData } from "@/lib/mock-data-meta";
import type { MetaOverview, MetaCampaign, MetaAdSet, MetaAdCreative } from "@/lib/mock-data-meta";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, DollarSign, Eye, MousePointerClick, ShoppingCart,
  Target, Users, Filter, Clock, Zap, BarChart3, PieChart as PieChartIcon,
} from "lucide-react";
import { MetaLogo } from "@/components/platform-nav-icons";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import MetricCard, { type MetricAccent } from "@/components/dashboard/metric-card";
import ReportCard, { SectionHeading } from "@/components/dashboard/report-card";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(val);

const formatNumber = (val: number) => val.toLocaleString("tr-TR");

type TabKey = "campaigns" | "adsets" | "ads";

type MetaReportData = {
  overview: MetaOverview;
  campaigns: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAdCreative[];
};

export default function MetaAdsClient({
  brand,
  metaConfigured = false,
}: {
  brand: { slug: string; name: string };
  metaConfigured?: boolean;
}) {
  const [dateRange, setDateRange] = useState("yesterday");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [activeTab, setActiveTab] = useState<TabKey>("campaigns");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [filterAdSet, setFilterAdSet] = useState<string>("all");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(metaConfigured);
  const [initialLoad, setInitialLoad] = useState(metaConfigured);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveMeta, setLiveMeta] = useState<{ since?: string; until?: string }>({});
  const [data, setData] = useState<MetaReportData>(() =>
    generateMetaMockData(brand.slug, "30d")
  );

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc"; // Default to desc for metrics
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (arr: any[]) => {
    if (!sortConfig) return arr;
    return [...arr].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortableHeader = ({ label, sortKey, align = "left" }: { label: string; sortKey: string; align?: "left" | "right" }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <th 
        className={`pb-3 px-4 font-semibold cursor-pointer select-none hover:text-[#F5403F] transition-colors text-${align}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {isActive ? (sortConfig.direction === "asc" ? "↑" : "↓") : <span className="text-slate-300">↕</span>}
        </div>
      </th>
    );
  };

  const rangeLabels: Record<string, string> = {
    today: "Bugün", yesterday: "Dün", "7d": "Son 7 Gün", "14d": "Son 14 Gün", "30d": "Son 30 Gün", custom: "Özel",
  };

  const tabs: { key: TabKey; label: string; desc: string }[] = [
    { key: "campaigns", label: "Kampanya Bazlı", desc: "Tüm kampanyalar" },
    { key: "adsets", label: "Reklam Seti Bazlı", desc: "Hedef kitle ve yerleşim" },
    { key: "ads", label: "Reklam Bazlı", desc: "Kreatif performansı" },
  ];

  useEffect(() => {
    if (!metaConfigured) {
      setData(generateMetaMockData(brand.slug, dateRange === "custom" ? "30d" : dateRange));
      setIsLive(false);
      setLoading(false);
      setApiError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setApiError(null);

    const apiRange = dateRange === "custom" ? `${customStart}_${customEnd}` : dateRange;

    fetch(`/api/brands/${brand.slug}/meta?dateRange=${encodeURIComponent(apiRange)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Meta verisi alınamadı");
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setData({
          overview: json.overview,
          campaigns: json.campaigns,
          adSets: json.adSets ?? [],
          ads: json.ads ?? [],
        });
        setIsLive(json.isLive === true);
        setLiveMeta({ since: json.since, until: json.until });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setApiError(err.message);
        setIsLive(false);
        setData(generateMetaMockData(brand.slug, dateRange === "custom" ? "30d" : dateRange));
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
  }, [brand.slug, dateRange, customStart, customEnd, metaConfigured]);

  const filteredAdSets = filterCampaign === "all"
    ? data.adSets
    : data.adSets.filter((as) => as.campaignId === filterCampaign);

  const filteredAds = filterCampaign === "all" && filterAdSet === "all"
    ? data.ads
    : data.ads.filter((ad) => {
        let match = true;
        if (filterCampaign !== "all") {
          const campaign = data.campaigns.find((c) => c.id === filterCampaign);
          if (ad.campaignName !== campaign?.name) match = false;
        }
        if (filterAdSet !== "all") {
          if (ad.adSetName !== filterAdSet) match = false;
        }
        return match;
      });

  const ov = data.overview;

  if (initialLoad) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#F5403F] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Meta Ads verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const kpis: {
    label: string;
    value: string;
    score?: number | null;
    accent: MetricAccent;
    icon: typeof Target;
    invertTrend?: boolean;
  }[] = [
    { label: "Toplam Harcama", value: formatCurrency(ov.totalSpend), score: ov.prevPeriod.spendChange, accent: "rose", icon: Target, invertTrend: true },
    { label: "Toplam Ciro", value: formatCurrency(ov.totalRevenue), score: ov.prevPeriod.revenueChange, accent: "emerald", icon: TrendingUp },
    { label: "ROAS", value: `${ov.overallRoas}x`, score: ov.prevPeriod.roasChange, accent: "brand", icon: Zap },
    { label: "Dönüşüm", value: formatNumber(ov.totalConversions), score: ov.prevPeriod.convChange, accent: "blue", icon: ShoppingCart },
    { label: "Tıklama Oranı (CTR)", value: `%${ov.avgCtr}`, score: null, accent: "violet", icon: MousePointerClick },
    { label: "TBM (CPC)", value: `₺${ov.avgCpc}`, score: null, accent: "amber", icon: DollarSign },
    { label: "BGBM (CPM)", value: `₺${ov.avgCpm}`, score: null, accent: "violet", icon: Eye },
    { label: "Erişim", value: formatNumber(ov.totalReach), score: null, accent: "blue", icon: Users },
  ];

  const placementColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 text-slate-700 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <DashboardPageHeader
          title="Meta Ads Raporu"
          subtitle={`${brand.name} — Kampanya, Reklam Seti ve Reklam Analizi`}
          iconNode={<MetaLogo className="w-6 h-6" colored bordered />}
          accent="meta"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          rangeLabels={rangeLabels}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          showPeriodBadge
          onPeriodClick={() => setDateRange("custom")}
          periodLabel={
            isLive
              ? `Meta API canlı veri — ${rangeLabels[dateRange]}${liveMeta.since && liveMeta.until ? ` (${liveMeta.since} → ${liveMeta.until})` : ""}`
              : undefined
          }
          badges={
            <>
              {!metaConfigured && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-100">
                  Örnek veri — Admin&apos;den Meta Ad Account ID ve token kaydedin.
                </span>
              )}
              {metaConfigured && !isLive && !loading && apiError && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-rose-50 text-rose-700 border-rose-100">
                  Meta API: {apiError} (örnek veri gösteriliyor)
                </span>
              )}
              {loading && metaConfigured && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200">
                  Meta verisi yükleniyor…
                </span>
              )}
            </>
          }
        />

        <SectionHeading title="Özet Metrikler" icon={BarChart3} accent="blue" />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {kpis.map((kpi, i) => (
            <MetricCard
              key={i}
              label={kpi.label}
              value={kpi.value}
              score={kpi.score}
              accent={kpi.accent}
              icon={kpi.icon}
              invertTrend={kpi.invertTrend}
              hideTrend={isLive}
              compact
            />
          ))}
        </div>

        <SectionHeading title="Trend ve Dağılım" icon={TrendingUp} accent="emerald" />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-8"
            label="Grafik"
            title="Harcama & Ciro Trendi"
            icon={TrendingUp}
            accent="blue"
          >
            <div className="h-[280px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ov.dailyTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metaGradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#0f172a", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#metaGradRev)" name="Ciro" />
                  <Line type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Harcama" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>

          <ReportCard
            className="lg:col-span-4"
            label="Dağılım"
            title="Yerleşim Dağılımı"
            icon={PieChartIcon}
            accent="violet"
          >
            <div className="h-[180px] -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ov.placementBreakdown} dataKey="spend" nameKey="placement" cx="50%" cy="50%" innerRadius={45} outerRadius={70} stroke="none">
                    {ov.placementBreakdown.map((_, i) => (
                      <Cell key={i} fill={placementColors[i % placementColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} formatter={(v: any) => formatCurrency(Number(v || 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ov.placementBreakdown.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: placementColors[i % placementColors.length] }} />
                  <span className="text-slate-500 truncate">{p.placement}</span>
                </div>
              ))}
            </div>
          </ReportCard>
        </div>

        {ov.hourlyClicks && ov.genderClicks && (
          <>
            <SectionHeading title="Saatlik ve Kitle" icon={Clock} accent="indigo" />
            <div className="grid gap-6 lg:grid-cols-12">
            <ReportCard
              className="lg:col-span-8"
              label="Saatlik"
              title="Saatlik Tıklama Eğilimi"
              icon={Clock}
              accent="indigo"
            >
              <div className="h-[280px] w-full -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ov.hourlyClicks} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#0f172a", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 2, fill: "#6366f1" }} name="Tıklama" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ReportCard>

            <ReportCard
              className="lg:col-span-4"
              label="Kitle"
              title="Cinsiyet Dağılımı (Tıklama)"
              icon={Users}
              accent="rose"
            >
              <div className="h-[180px] w-full flex-1 -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ov.genderClicks} dataKey="clicks" nameKey="gender" cx="50%" cy="50%" innerRadius={45} outerRadius={70} stroke="none">
                      {ov.genderClicks.map((entry, i) => (
                        <Cell key={i} fill={entry.gender === 'Kadın' ? '#fb7185' : entry.gender === 'Erkek' ? '#60a5fa' : '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} formatter={(v: any) => formatNumber(Number(v || 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                {ov.genderClicks.map((g, i) => {
                  const total = ov.genderClicks.reduce((acc, curr) => acc + curr.clicks, 0);
                  const pct = total > 0 ? Math.round((g.clicks / total) * 100) : 0;
                  return (
                    <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.gender === 'Kadın' ? '#fb7185' : g.gender === 'Erkek' ? '#60a5fa' : '#94a3b8' }} />
                        {g.gender}
                      </div>
                      <span className="text-xs font-bold text-slate-900 mt-1 tabular-nums">%{pct}</span>
                    </div>
                  );
                })}
              </div>
            </ReportCard>
          </div>
          </>
        )}

        {/* Tab Selector + Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex bg-[#F3F4F6] p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar flex-nowrap max-w-full">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === tab.key ? "bg-[#F5403F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
              >{tab.label}</button>
            ))}
          </div>
          {(activeTab === "adsets" || activeTab === "ads") && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select value={filterCampaign} onChange={(e) => {
                  setFilterCampaign(e.target.value);
                  setFilterAdSet("all"); // Reset ad set filter when campaign changes
                }}
                className="flex-1 md:flex-none bg-[#F3F4F6] border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500">
                <option value="all">Tüm Kampanyalar</option>
                {data.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {activeTab === "ads" && (
                <select value={filterAdSet} onChange={(e) => setFilterAdSet(e.target.value)}
                  className="flex-1 md:flex-none bg-[#F3F4F6] border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500">
                  <option value="all">Tüm Reklam Setleri</option>
                  {Array.from(new Set(data.adSets.map(a => a.name))).map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Campaign Table */}
        {activeTab === "campaigns" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Kampanya Adı" sortKey="name" />
                    <SortableHeader label="Hedef" sortKey="objective" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Erişim" sortKey="reach" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="CPM" sortKey="cpm" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Ciro" sortKey="revenue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                    <SortableHeader label="Sıklık" sortKey="frequency" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(data.campaigns).map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td 
                        className="py-3 px-4 text-blue-600 font-medium max-w-[200px] truncate cursor-pointer hover:text-blue-800 hover:underline"
                        onClick={() => {
                          setFilterCampaign(c.id);
                          setActiveTab("adsets");
                        }}
                        title="Tıklayarak reklam setlerini görüntüle"
                      >
                        {c.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.objective}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "Aktif" ? "bg-emerald-500/15 text-emerald-400" :
                          c.status === "Duraklatıldı" ? "bg-amber-500/15 text-amber-400" :
                          "bg-slate-500/15 text-slate-500"
                        }`}>{c.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(c.spend)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(c.reach)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(c.impressions)}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(c.clicks)}</td>
                      <td className="py-3 px-4 text-right text-[#F5403F]">%{c.ctr}</td>
                      <td className="py-3 px-4 text-right text-slate-500">₺{c.cpc}</td>
                      <td className="py-3 px-4 text-right text-slate-500">₺{c.cpm}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{c.conversions}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(c.revenue)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-400">{c.roas}x</td>
                      <td className="py-3 px-4 text-right text-slate-500">{c.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ad Set Table */}
        {activeTab === "adsets" && isLive && data.adSets.length === 0 && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            Reklam seti seviyesi henüz API&apos;den çekilmiyor. Kampanya sekmesinde canlı veriler mevcut.
          </div>
        )}
        {activeTab === "adsets" && (!isLive || data.adSets.length > 0) && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Reklam Seti" sortKey="name" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Hedef Kitle" sortKey="audience" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Erişim" sortKey="reach" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Ciro" sortKey="revenue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                    <SortableHeader label="Sıklık" sortKey="frequency" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(filteredAdSets).map((as) => (
                    <tr key={as.id} className="hover:bg-white/[0.02] transition-colors">
                      <td 
                        className="py-3 px-4 text-blue-600 font-medium max-w-[180px] truncate cursor-pointer hover:text-blue-800 hover:underline"
                        onClick={() => {
                          setFilterAdSet(as.name);
                          setActiveTab("ads");
                        }}
                        title="Tıklayarak reklamları görüntüle"
                      >
                        {as.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate text-xs">{as.campaignName}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{as.audience}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          as.status === "Aktif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>{as.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(as.spend)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(as.reach)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(as.impressions)}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(as.clicks)}</td>
                      <td className="py-3 px-4 text-right text-[#F5403F]">%{as.ctr}</td>
                      <td className="py-3 px-4 text-right text-slate-500">₺{as.cpc}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{as.conversions}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(as.revenue)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-400">{as.roas}x</td>
                      <td className="py-3 px-4 text-right text-slate-500">{as.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ads Table */}
        {activeTab === "ads" && isLive && data.ads.length === 0 && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            Reklam seviyesi henüz API&apos;den çekilmiyor. Kampanya sekmesinde canlı veriler mevcut.
          </div>
        )}
        {activeTab === "ads" && (!isLive || data.ads.length > 0) && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Reklam" sortKey="name" />
                    <SortableHeader label="Reklam Seti" sortKey="adSetName" />
                    <SortableHeader label="Format" sortKey="format" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Erişim" sortKey="reach" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                    <SortableHeader label="Sıklık" sortKey="frequency" align="right" />
                    <SortableHeader label="Thumb Stop" sortKey="thumbStopRatio" align="right" />
                    <SortableHeader label="Hook Rate" sortKey="hookRate" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(filteredAds).map((ad) => (
                    <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-800 font-medium max-w-[200px] truncate">{ad.name}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate text-xs">{ad.adSetName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400">{ad.format}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ad.status === "Aktif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>{ad.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(ad.spend)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(ad.reach)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(ad.impressions)}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(ad.clicks)}</td>
                      <td className="py-3 px-4 text-right text-[#F5403F]">%{ad.ctr}</td>
                      <td className="py-3 px-4 text-right text-slate-500">₺{ad.cpc}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{ad.conversions}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-400">{ad.roas}x</td>
                      <td className="py-3 px-4 text-right text-slate-500">{ad.frequency}</td>
                      <td className="py-3 px-4 text-right text-amber-400">%{ad.thumbStopRatio}</td>
                      <td className="py-3 px-4 text-right text-pink-400">%{ad.hookRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
