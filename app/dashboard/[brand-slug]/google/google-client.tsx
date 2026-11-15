"use client";

import { useState, useMemo, useEffect } from "react";
import { generateGoogleMockData } from "@/lib/mock-data-google";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Line,
} from "recharts";
import {
  Filter, Zap, RotateCw, Target, TrendingUp,
  ShoppingCart, MousePointerClick, DollarSign, Star, BarChart3, BarChart2,
} from "lucide-react";
import { GoogleAdsLogo } from "@/components/platform-nav-icons";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import MetricCard, { type MetricAccent } from "@/components/dashboard/metric-card";
import ReportCard, { SectionHeading } from "@/components/dashboard/report-card";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => val.toLocaleString("tr-TR");

type TabKey = "campaigns" | "adgroups" | "keywords" | "searchterms" | "pmax";

export default function GoogleAdsClient({ brand }: { brand: { slug: string; name: string } }) {
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

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (arr: any[]) => {
    if (!sortConfig || !arr) return arr;
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
        className={`pb-3 font-semibold cursor-pointer select-none hover:text-[#f97316] transition-colors text-${align}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {isActive ? (sortConfig.direction === "asc" ? "↑" : "↓") : <span className="text-slate-300">↕</span>}
        </div>
      </th>
    );
  };

  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const range = dateRange === "custom" ? "30d" : dateRange; // Custom date can be added later
        const res = await fetch(`/api/ads/google-live?slug=${brand.slug}&range=${range}`);
        const contentType = res.headers.get("content-type") || "";
        const result = contentType.includes("application/json")
          ? await res.json()
          : { error: `Sunucu beklenmeyen yanıt döndü (HTTP ${res.status})` };
        if (!res.ok) throw new Error(result.error || "Google Ads verisi alınamadı");
        
        setData(result);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
        // Fallback to mock data if API fails or no integration found
        setData(generateGoogleMockData(brand.slug, dateRange === "custom" ? "30d" : dateRange));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brand.slug, dateRange]);

  const rangeLabels: Record<string, string> = {
    today: "Bugün", yesterday: "Dün", "7d": "Son 7 Gün", "14d": "Son 14 Gün", "30d": "Son 30 Gün", custom: "Özel",
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "campaigns", label: "Kampanyalar" },
    { key: "adgroups", label: "Öğe Grupları" },
    { key: "keywords", label: "Anahtar Kelimeler" },
    { key: "searchterms", label: "Arama Terimleri" },
    { key: "pmax", label: "PMax Yerleşimleri" },
  ];

  const filtered = useMemo(() => {
    if (!data) return { adGroups: [], keywords: [] };
    return {
      adGroups: filterCampaign === "all" ? data.adGroups : data.adGroups.filter((ag: any) => ag.campaignId === filterCampaign),
      keywords: filterCampaign === "all" ? data.keywords : data.keywords.filter((kw: any) => {
        const ag = data.adGroups.find((a: any) => a.id === kw.adGroupId);
        return ag?.campaignId === filterCampaign || kw.campaignId === filterCampaign;
      }),
    };
  }, [data, filterCampaign]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RotateCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Google Ads verileri eşzamanlı olarak çekiliyor...</p>
      </div>
    );
  }

  const ov = data.overview;

  const kpis: {
    label: string;
    value: string;
    score?: number | null;
    accent: MetricAccent;
    icon: typeof Target;
    invertTrend?: boolean;
  }[] = [
    { label: "Toplam Harcama", value: formatCurrency(ov.totalSpend), score: ov.prevPeriod?.spendChange, accent: "rose", icon: Target, invertTrend: true },
    { label: "Dönüşüm Değeri", value: formatCurrency(ov.totalConvValue), score: ov.prevPeriod?.convValueChange, accent: "emerald", icon: TrendingUp },
    { label: "ROAS", value: `${ov.overallRoas}x`, score: ov.prevPeriod?.roasChange, accent: "brand", icon: Zap },
    { label: "Dönüşüm", value: formatNumber(ov.totalConversions), score: ov.prevPeriod?.convChange, accent: "blue", icon: ShoppingCart },
    { label: "Tıklama", value: formatNumber(ov.totalClicks), score: null, accent: "violet", icon: MousePointerClick },
    { label: "CTR", value: `%${ov.avgCtr}`, score: null, accent: "blue", icon: Filter },
    { label: "Ort. CPC", value: `₺${ov.avgCpc}`, score: null, accent: "amber", icon: DollarSign },
    { label: "Kalite Skoru", value: `${ov.avgQualityScore}`, score: null, accent: "amber", icon: Star },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 text-slate-700 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <DashboardPageHeader
          title="Google Ads Raporu"
          subtitle={`${brand.name} — Arama, Alışveriş, PMax ve Display Analizi`}
          iconNode={<GoogleAdsLogo className="w-6 h-6" colored bordered />}
          accent="google"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          rangeLabels={rangeLabels}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          showPeriodBadge
          onPeriodClick={() => setDateRange("custom")}
          badges={
            error ? (
              <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-100">
                API: {error} (örnek veri gösteriliyor)
              </span>
            ) : undefined
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
              compact
            />
          ))}
        </div>

        <SectionHeading title="Trend ve Dağılım" icon={TrendingUp} accent="emerald" />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-8"
            label="Grafik"
            title="Harcama & Dönüşüm Değeri Trendi"
            icon={TrendingUp}
            accent="blue"
          >
            <div className="h-[280px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ov.dailyTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#0f172a", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="convValue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#convGrad)" name="Dönüşüm Değeri" />
                  <Area type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2.5} fill="url(#spendGrad)" name="Harcama" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>

          <ReportCard
            className="lg:col-span-4"
            label="Dağılım"
            title="Kampanya Türü Dağılımı"
            icon={BarChart2}
            accent="orange"
          >
            <div className="h-[250px] w-full -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ov.spendByType} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                  <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} formatter={(v) => formatCurrency(Number(v ?? 0))} />
                  <Bar dataKey="spend" fill="#f97316" radius={[0, 4, 4, 0]} name="Harcama" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>
        </div>

        {/* Tabs + Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-[#F3F4F6] p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar flex-nowrap">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === tab.key ? "bg-orange-600 text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-800"}`}
              >{tab.label}</button>
            ))}
          </div>
          {(activeTab === "adgroups" || activeTab === "keywords") && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)}
                className="flex-1 md:flex-none bg-[#F3F4F6] border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-orange-500">
                <option value="all">Tüm Kampanyalar</option>
                {getSortedData(data.campaigns).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Campaigns */}
        {activeTab === "campaigns" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Kampanya" sortKey="name" />
                    <SortableHeader label="Tür" sortKey="type" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                    <SortableHeader label="Gös. Payı" sortKey="impressionShare" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.campaigns.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td 
                        className="py-3 text-blue-600 font-medium max-w-[200px] truncate cursor-pointer hover:text-blue-800 hover:underline"
                        onClick={() => {
                          setFilterCampaign(c.id);
                          setActiveTab("adgroups");
                        }}
                        title="Tıklayarak öğe gruplarını görüntüle"
                      >
                        {c.name}
                      </td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400">{c.type}</span></td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === "Aktif" ? "bg-emerald-500/15 text-emerald-400" : c.status === "Duraklatıldı" ? "bg-amber-500/15 text-amber-400" : "bg-slate-500/15 text-slate-500"}`}>{c.status}</span></td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(c.spend)}</td>
                      <td className="py-3 text-right text-slate-500">{formatNumber(c.impressions)}</td>
                      <td className="py-3 text-right text-slate-700">{formatNumber(c.clicks)}</td>
                      <td className="py-3 text-right text-orange-400">%{c.ctr}</td>
                      <td className="py-3 text-right text-slate-500">₺{c.cpc}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{c.conversions}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(c.convValue)}</td>
                      <td className="py-3 text-right font-bold text-indigo-400">{c.roas}x</td>
                      <td className="py-3 text-right text-slate-500">%{c.impressionShare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ad Groups */}
        {activeTab === "adgroups" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Öğe Grubu" sortKey="name" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(filtered.adGroups).map((ag: any) => (
                    <tr key={ag.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-slate-800 font-medium">{ag.name}</td>
                      <td className="py-3 text-slate-500 text-xs max-w-[150px] truncate">{ag.campaignName}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ag.status === "Aktif" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{ag.status}</span></td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(ag.spend)}</td>
                      <td className="py-3 text-right text-slate-500">{formatNumber(ag.impressions)}</td>
                      <td className="py-3 text-right text-slate-700">{formatNumber(ag.clicks)}</td>
                      <td className="py-3 text-right text-orange-400">%{ag.ctr}</td>
                      <td className="py-3 text-right text-slate-500">₺{ag.cpc}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{ag.conversions}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(ag.convValue)}</td>
                      <td className="py-3 text-right font-bold text-indigo-400">{ag.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Keywords */}
        {activeTab === "keywords" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Anahtar Kelime" sortKey="keyword" />
                    <SortableHeader label="Eşleşme" sortKey="matchType" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="Kalite" sortKey="qualityScore" align="right" />
                    <SortableHeader label="Konum" sortKey="position" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(filtered.keywords).map((kw: any) => (
                    <tr key={kw.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-slate-800 font-medium">{kw.keyword}</td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-[#F5403F]">{kw.matchType}</span></td>
                      <td className="py-3 text-slate-500 text-xs max-w-[130px] truncate">{kw.campaignName}</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(kw.spend)}</td>
                      <td className="py-3 text-right text-slate-500">{formatNumber(kw.impressions)}</td>
                      <td className="py-3 text-right text-slate-700">{formatNumber(kw.clicks)}</td>
                      <td className="py-3 text-right text-orange-400">%{kw.ctr}</td>
                      <td className="py-3 text-right text-slate-500">₺{kw.cpc}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{kw.conversions}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(kw.convValue)}</td>
                      <td className="py-3 text-right"><span className={`font-bold ${kw.qualityScore >= 7 ? "text-emerald-400" : kw.qualityScore >= 5 ? "text-amber-400" : "text-rose-400"}`}>{kw.qualityScore}/10</span></td>
                      <td className="py-3 text-right text-slate-500">{kw.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search Terms */}
        {activeTab === "searchterms" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Arama Terimi" sortKey="searchTerm" />
                    <SortableHeader label="Eşleşen Anahtar Kelime" sortKey="matchedKeyword" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(data.searchTerms).map((st: any) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-slate-800 font-medium">{st.searchTerm}</td>
                      <td className="py-3 text-slate-500 text-xs">{st.matchedKeyword}</td>
                      <td className="py-3 text-slate-500 text-xs max-w-[130px] truncate">{st.campaignName}</td>
                      <td className="py-3 text-right text-slate-500">{formatNumber(st.impressions)}</td>
                      <td className="py-3 text-right text-slate-700">{formatNumber(st.clicks)}</td>
                      <td className="py-3 text-right text-orange-400">%{st.ctr}</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(st.spend)}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{st.conversions}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(st.convValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PMax Placements */}
        {activeTab === "pmax" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <SortableHeader label="Yerleşim" sortKey="placement" />
                    <SortableHeader label="Tür" sortKey="type" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {getSortedData(data.pmaxPlacements || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-slate-800 font-medium">{p.placement}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.type?.includes("YOUTUBE") ? "bg-red-500/15 text-red-400" :
                          p.type === "WEBSITE" ? "bg-blue-500/15 text-blue-400" :
                          p.type === "MOBILE_APPLICATION" ? "bg-emerald-500/15 text-emerald-400" :
                          "bg-slate-500/15 text-slate-400"
                        }`}>{p.type === "WEBSITE" ? "Web Sitesi" : p.type === "MOBILE_APPLICATION" ? "Mobil Uygulama" : p.type === "YOUTUBE_VIDEO" ? "YouTube Video" : p.type === "YOUTUBE_CHANNEL" ? "YouTube Kanalı" : p.type}</span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs max-w-[130px] truncate">{p.campaignName}</td>
                      <td className="py-3 text-right text-slate-500">{formatNumber(p.impressions)}</td>
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
