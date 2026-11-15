"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { useAnalyticsData } from "@/lib/hooks/use-ga4-analytics";
import type { Ga4TrafficRow } from "@/lib/parse-ga4-report";
import { GA4_PERIOD_LABELS, type Ga4FixturePeriod } from "@/lib/parse-ga4-report";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line,
} from "recharts";
import {
  Users, Globe as GlobeIcon, Route, Activity, MapPin,
  Clock, Eye, UserPlus, TrendingUp, MousePointerClick, BarChart3,
} from "lucide-react";
import { GoogleAnalyticsLogo } from "@/components/platform-nav-icons";
import Globe from "@/components/ui/globe";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import MetricCard, { type MetricAccent } from "@/components/dashboard/metric-card";
import ReportCard, { SectionHeading } from "@/components/dashboard/report-card";

const formatNumber = (val: number) => val.toLocaleString("tr-TR");
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(val);

type TabKey = "traffic" | "journey" | "pages" | "audience" | "events";

export default function AnalyticsClient({ brand }: { brand: { slug: string; name: string } }) {
  const [dateRange, setDateRange] = useState("yesterday");
  const [activeTab, setActiveTab] = useState<TabKey>("traffic");

  const rangeLabels: Record<string, string> = {
    today: "Bugün", yesterday: "Dün", "7d": "Son 7 Gün", "14d": "Son 14 Gün", "30d": "Son 30 Gün",
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "traffic", label: "Trafik Kaynakları" },
    { key: "journey", label: "Satın Alma Yolculuğu" },
    { key: "pages", label: "Sayfa Performansı" },
    { key: "audience", label: "Kitle & Cihaz" },
    { key: "events", label: "Etkinlikler" },
  ];

  const { data, loading, initialLoad, error, warning, ga4Enabled } = useAnalyticsData(brand.slug, dateRange);
  const ov = data.overview;
  const ga4FixturePeriod = data.ga4Meta?.fixturePeriod ?? data.ga4FixturePeriod;

  if (initialLoad) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Analytics verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const kpis: {
    label: string;
    value: string;
    score?: number | null;
    accent: MetricAccent;
    icon: typeof Activity;
    invertTrend?: boolean;
  }[] = [
    { label: "Oturum", value: formatNumber(ov.sessions), score: ov.prevPeriod.sessionsChange, accent: "blue", icon: Activity },
    { label: "Kullanıcı", value: formatNumber(ov.users), score: ov.prevPeriod.usersChange, accent: "amber", icon: Users },
    { label: "Yeni Kullanıcı", value: formatNumber(ov.newUsers), score: null, accent: "amber", icon: UserPlus },
    { label: "Sayfa Görüntüleme", value: formatNumber(ov.pageViews), score: null, accent: "violet", icon: Eye },
    { label: "Hemen Çıkma", value: `%${ov.bounceRate}`, score: ov.prevPeriod.bounceRateChange, accent: "rose", icon: TrendingUp, invertTrend: true },
    { label: "Etkileşim Oranı", value: `%${ov.engagementRate}`, score: ov.prevPeriod.engagementChange, accent: "emerald", icon: MousePointerClick },
    { label: "Ort. Oturum Süresi", value: ov.avgSessionDuration, score: null, accent: "violet", icon: Clock },
    { label: "Sayfa / Oturum", value: `${ov.pagesPerSession}`, score: null, accent: "blue", icon: Route },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 text-slate-700 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <DashboardPageHeader
          title="Google Analytics Raporu"
          subtitle={`${brand.name} — GA4, trafik ve kullanıcı yolculuğu`}
          iconNode={<GoogleAnalyticsLogo className="w-6 h-6 shrink-0" colored bordered />}
          accent="analytics"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          rangeLabels={rangeLabels}
          dateRangeOptions={Object.keys(rangeLabels)}
          showPeriodBadge={false}
          getDateButtonProps={(val) => {
            const isFixturePeriod = ga4Enabled && ga4FixturePeriod === val;
            return {
              className: isFixturePeriod && dateRange !== val ? "ring-1 ring-[#E37400]/40" : "",
              title: isFixturePeriod ? "GA4 fixture bu dönem için" : undefined,
            };
          }}
          badges={
            <>
              {data.isGa4Live && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-[#E37400]/10 text-[#E37400] border-[#E37400]/20">
                  GA4 canlı veri — {GA4_PERIOD_LABELS[(data.ga4Meta?.fixturePeriod as Ga4FixturePeriod) ?? "30d"]} toplamı
                  {" · "}{data.ga4Meta?.rowCount ?? 0} kaynak/ortam
                  {data.ga4Meta?.timeZone ? ` · ${data.ga4Meta.timeZone}` : ""}
                </span>
              )}
              {data.ga4PeriodMismatch && data.ga4FixturePeriod && (
                <span className="inline-flex flex-wrap items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-100">
                  Bu GA4 dosyası <strong>{GA4_PERIOD_LABELS[data.ga4FixturePeriod as Ga4FixturePeriod]}</strong> verisidir.
                  Şu an <strong>{rangeLabels[dateRange]}</strong> seçili — örnek veri gösteriliyor.
                  Gerçek GA4 için{" "}
                  <button
                    type="button"
                    onClick={() => setDateRange(data.ga4FixturePeriod!)}
                    className="underline font-semibold hover:text-amber-800"
                  >
                    {GA4_PERIOD_LABELS[data.ga4FixturePeriod as Ga4FixturePeriod]}
                  </button>{" "}
                  seçin.
                </span>
              )}
              {loading && ga4Enabled && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200">
                  GA4 verisi yükleniyor…
                </span>
              )}
              {warning && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-amber-50 text-amber-800 border-amber-200">
                  {warning}
                </span>
              )}
              {error && (
                <span className="inline-flex px-3 py-1.5 rounded-xl border text-xs font-semibold bg-rose-50 text-rose-700 border-rose-100">
                  {error} (örnek veri gösteriliyor)
                </span>
              )}
            </>
          }
        />

        <SectionHeading title="Özet Metrikler" icon={BarChart3} accent="amber" />
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
              hideTrend={data.isGa4Live}
              compact
            />
          ))}
        </div>

        {/* Canlı 3D Dünya Haritası */}
        {data.isGa4Live && data.realtime && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-12 bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              {/* Globe Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="w-full md:w-1/2 flex flex-col justify-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold w-fit mb-6">
                  <Activity className="w-4 h-4 animate-pulse" />
                  ŞU AN SİTEDE CANLI
                </div>
                <div className="flex items-baseline gap-4 mb-8">
                  <h2 className="text-8xl font-black text-white tabular-nums tracking-tighter">
                    {data.realtime.activeUsers}
                  </h2>
                  <span className="text-xl text-slate-400 font-medium">Kullanıcı</span>
                </div>
                
                <div className="space-y-4 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Canlı Lokasyonlar</h4>
                  {data.realtime.activeCountries.length > 0 ? (
                    <div className="space-y-3">
                      {data.realtime.activeCountries.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{c.country}</span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">{c.users}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">Şu an aktif ziyaretçi tespit edilemedi.</p>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 relative z-10 flex justify-center items-center">
                <Globe topCountry={data.realtime.activeCountries[0]?.country} />
              </div>
            </div>
          </div>
        )}

        <SectionHeading title="Trafik Özeti" icon={Activity} accent="emerald" />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-8"
            label="Analiz"
            title={data.isGa4Live ? "En Çok Ziyaret Edilen Açılış Sayfaları (İlk 10)" : "Oturum & Kullanıcı Trendi"}
            description={data.isGa4Live ? "Bu veriler seçili dönemin toplamına göre sıralanmıştır." : undefined}
            icon={Activity}
            accent="emerald"
          >
            <div className="h-[280px] w-full min-h-[200px] -mt-2">
              {data.isGa4Live ? (
                <div className="space-y-4 mt-2 h-full overflow-y-auto pr-2">
                  {data.landingPages && data.landingPages.slice(0, 10).map((lp, i) => {
                    const maxSessions = data.landingPages[0]?.sessions || 1;
                    const percent = Math.max((lp.sessions / maxSessions) * 100, 2); // En az %2 görünürlük
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-5/12 truncate text-xs font-semibold text-slate-700" title={`${lp.title} / ${lp.path}`}>
                          {lp.title} <span className="text-slate-400 font-normal">/ {lp.path}</span>
                        </div>
                        <div className="w-7/12 flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 w-10 text-right tabular-nums">{formatNumber(lp.sessions)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <AreaChart data={ov.dailyTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#0f172a", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2.5} fill="url(#gaGrad)" name="Oturum" />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={false} name="Kullanıcı" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ReportCard>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <ReportCard
              className="flex-1"
              label="Coğrafya"
              title="En Çok Ziyaretçi Gelen Şehirler"
              icon={MapPin}
              accent="blue"
            >
              <div className="space-y-3 -mt-2">
                {data.cities && data.cities.length > 0 ? data.cities.slice(0, 4).map((city: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{city.city}</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded tabular-nums">{formatNumber(city.sessions)} oturum</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 italic">Şehir verisi bulunamadı.</p>
                )}
              </div>
            </ReportCard>

            <ReportCard
              className="flex-1"
              label="Kitle"
              title="Cinsiyet Dağılımı"
              icon={Users}
              accent="rose"
            >
              <div className="space-y-3 -mt-2">
                {data.genders && data.genders.length > 0 ? data.genders.slice(0, 2).map((g: any, i: number) => {
                  const totalGenders = data.genders.reduce((s: number, g: any) => s + g.sessions, 0);
                  const percent = totalGenders > 0 ? ((g.sessions / totalGenders) * 100).toFixed(1) : 0;
                  const isFemale = g.gender.toLowerCase() === 'female' || g.gender.toLowerCase() === 'kadın';
                  const label = isFemale ? 'Kadın' : (g.gender.toLowerCase() === 'male' || g.gender.toLowerCase() === 'erkek' ? 'Erkek' : g.gender);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isFemale ? 'bg-rose-400' : 'bg-blue-400'}`}></div>
                        {label}
                      </span>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">%{percent}</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-500 italic">Cinsiyet verisi bulunamadı (Google Signals gerektirebilir).</p>
                )}
              </div>
            </ReportCard>
          </div>
        </div>

        <div className="flex bg-[#F3F4F6] p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar flex-nowrap w-full max-w-full">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === tab.key ? "bg-emerald-600 text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === "traffic" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 overflow-hidden w-full max-w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-emerald-500" />
              Kaynak / Ortam
            </h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <th className="pb-3 px-4 font-semibold">Kaynak</th>
                    <th className="pb-3 px-4 font-semibold">Ortam</th>
                    <th className="pb-3 px-4 font-semibold text-right">Oturum</th>
                    <th className="pb-3 px-4 font-semibold text-right">Kullanıcı</th>
                    <th className="pb-3 px-4 font-semibold text-right">Hemen Çıkma</th>
                    <th className="pb-3 px-4 font-semibold text-right">Dönüşüm</th>
                    <th className="pb-3 px-4 font-semibold text-right">{data.isGa4Live ? "Satın Alma" : "Gelir"}</th>
                    <th className="pb-3 px-4 font-semibold text-right">Sayfa/Oturum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.trafficSources.map((ts, i) => {
                    const ga4 = ts as Ga4TrafficRow;
                    return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-800 font-medium">{ts.source}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">{ts.medium}</span></td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(ts.sessions)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(ts.users)}</td>
                      <td className="py-3 px-4 text-right text-amber-400">%{ts.bounceRate}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">%{ts.conversionRate}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {data.isGa4Live ? formatNumber(ga4.purchases ?? 0) : formatCurrency(ts.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">{ts.pagesPerSession}</td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "journey" && (
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-x-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Satın Alma Hunisi</h3>
              <div className="flex w-full min-w-[600px] h-[280px] items-end pb-4">
                {data.purchaseJourney.steps.map((step, i, arr) => {
                  const nextStep = arr[i + 1];
                  // Yüzde çok düşükse en az %2 gösterelim ki bar tamamen kaybolmasın.
                  const heightPercent = Math.max(step.percentage, 2);
                  const nextHeightPercent = nextStep ? Math.max(nextStep.percentage, 2) : 0;
                  return (
                    <Fragment key={step.step}>
                      {/* Bar */}
                      <div className="flex-[2] h-full flex flex-col justify-end relative group">
                        <div className="absolute top-0 w-full">
                          <p className="text-[10px] text-slate-400">{i + 1}. adım</p>
                          <p className="text-xs font-semibold text-slate-700 truncate" title={step.step}>{step.step}</p>
                          <div className="flex justify-between items-baseline mt-1 pr-2">
                            <p className="text-slate-500 text-[10px]">{formatNumber(step.users)} oturum</p>
                            <p className="text-sm font-bold text-slate-900">%{step.percentage}</p>
                          </div>
                        </div>
                        <div 
                          className="w-full bg-[#2563eb] border-t-2 border-white/20 transition-all duration-700 ease-in-out relative" 
                          style={{ height: `${heightPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors cursor-pointer" />
                        </div>
                      </div>
                      {/* Connector Polygon */}
                      {nextStep && (
                        <div className="flex-[1] h-full relative">
                          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <polygon 
                              points={`0,${100 - heightPercent} 100,${100 - nextHeightPercent} 100,100 0,100`} 
                              fill="#93c5fd" 
                              opacity="0.5" 
                              className="transition-all duration-700 ease-in-out"
                            />
                          </svg>
                          {step.dropOff > 0 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap hidden sm:block">
                              %{step.dropOff} terk
                            </div>
                          )}
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Etkinlik Dönüşüm Oranları</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.purchaseJourney.microConversions.map((mc) => {
                  const labelMap: Record<string, string> = {
                    'add_to_cart': 'Sepete Ekleme',
                    'begin_checkout': 'Ödemeye Başlama',
                    'add_to_wishlist': 'İstek Listesine Ekleme',
                    'sign_up': 'Kayıt Olma',
                    'login': 'Giriş Yapma',
                    'search': 'Arama Yapma',
                    'view_item': 'Ürün Görüntüleme',
                    'view_item_list': 'Liste Görüntüleme',
                    'scroll': 'Sayfa Kaydırma (Scroll)',
                    'click': 'Tıklama'
                  };
                  const label = labelMap[mc.event] || mc.event;
                  return (
                    <div key={mc.event} className="p-4 rounded-xl bg-[#F3F4F6] border border-slate-200">
                      <p className="text-xs text-slate-500 font-mono tracking-tight">{label}</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{formatNumber(mc.count)}</p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-1">%{mc.rate} (oturum başına)</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pages" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Giriş Sayfaları</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="pb-3 px-4 font-semibold">Sayfa</th>
                      <th className="pb-3 px-4 font-semibold text-right">Oturum</th>
                      <th className="pb-3 px-4 font-semibold text-right">Hemen Çıkma</th>
                      <th className="pb-3 px-4 font-semibold text-right">Dönüşüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {data.landingPages.map((lp, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium">{lp.title}</p>
                          <p className="text-[10px] text-slate-500">{lp.path}</p>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatNumber(lp.sessions)}</td>
                        <td className="py-3 px-4 text-right text-amber-400">%{lp.bounceRate}</td>
                        <td className="py-3 px-4 text-right text-emerald-400">%{lp.conversionRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Sayfa Yolları</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="pb-3 px-4 font-semibold">Sayfa</th>
                      <th className="pb-3 px-4 font-semibold text-right">Görüntüleme</th>
                      <th className="pb-3 px-4 font-semibold text-right">Çıkış Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {data.pagePaths.map((pp, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium">{pp.title}</p>
                          <p className="text-[10px] text-slate-500">{pp.path}</p>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatNumber(pp.views)}</td>
                        <td className="py-3 px-4 text-right text-rose-400">%{pp.exitRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audience" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Cihaz Dağılımı
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.deviceDetails} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="device" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} />
                      <Bar dataKey="sessions" fill="#10b981" radius={[0, 4, 4, 0]} name="Oturum" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tarayıcılar</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <tbody className="divide-y divide-slate-800/50">
                      {data.browserDetails.map((br, i) => (
                        <tr key={i}>
                          <td className="py-2 px-4 text-slate-800">{br.browser}</td>
                          <td className="py-2 px-4 text-right text-slate-700">{formatNumber(br.sessions)}</td>
                          <td className="py-2 px-4 text-right text-emerald-400">%{br.conversionRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Saatlik Oturumlar</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.hourlySessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} interval={2} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} />
                    <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={false} name="Oturum" />
                    <Line type="monotone" dataKey="conversions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Dönüşüm" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <th className="pb-3 px-4 font-semibold">Etkinlik</th>
                    <th className="pb-3 px-4 font-semibold text-right">Sayı</th>
                    <th className="pb-3 px-4 font-semibold text-right">Kullanıcı</th>
                    <th className="pb-3 px-4 font-semibold text-right">Değer / Etkinlik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.events.map((ev, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-slate-800 font-medium font-mono text-xs">{ev.eventName}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(ev.count)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(ev.users)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{ev.valuePerEvent > 0 ? formatCurrency(ev.valuePerEvent) : "—"}</td>
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
