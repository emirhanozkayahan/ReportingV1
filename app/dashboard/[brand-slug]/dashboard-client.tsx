"use client";

import { useState, useMemo, useEffect } from "react";
import { generateMockData } from "@/lib/mock-data";
import { 
  Line, LineChart, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  Area, AreaChart, PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { 
  TrendingUp, DollarSign, ShoppingBag, 
  MousePointerClick, MonitorSmartphone, Target, Layers, MapPin, 
  Users, AlertTriangle, Info, Zap, BarChart3, Globe, LayoutDashboard
} from "lucide-react";
import { useAnalyticsData } from "@/lib/hooks/use-ga4-analytics";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import MetricCard, { type MetricAccent } from "@/components/dashboard/metric-card";
import ReportCard, { SectionHeading } from "@/components/dashboard/report-card";
import StatItem from "@/components/dashboard/stat-item";
import { GoogleAdsLogo, MetaLogo } from "@/components/platform-nav-icons";

import { buildRealDashboardData } from "@/lib/dashboard-builder";
import { buildAlerts } from "@/lib/build-alerts";
import { filterDataByDateRange, getGa4DateRange } from "@/lib/date-range";

const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

export default function DashboardClient({
  brand,
  salesData = [],
  adData = [],
  isMocked,
  pageTitle,
  pageSubtitle = "Yönetici Özeti ve Dönüşüm Analizleri",
}: {
  brand: any;
  salesData?: any[];
  adData?: any[];
  isMocked?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}) {
  const [dateRange, setDateRange] = useState("yesterday");
  const [localSales, setLocalSales] = useState(salesData);
  const [localAds, setLocalAds] = useState(adData);
  const [isTodaySyncing, setIsTodaySyncing] = useState(false);

  // Prop güncellemelerini local state'e yansıt (Özellikle client-side routing veya fetch sonrası için)
  useEffect(() => {
    setLocalSales(salesData);
    setLocalAds(adData);
  }, [salesData, adData]);

  const formatLocal = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  });

  const { data: ga4Data, prevData: prevGa4Data, loading: ga4Loading } = useAnalyticsData(
    brand.slug,
    dateRange,
    {
      customStart,
      customEnd,
      fetchPrevPeriod: !isMocked,
    }
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch(`/api/brands/${brand.slug}/sync-today`, { method: 'POST' });
      // Reload page to fetch new data
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isMocked || (dateRange !== 'today' && dateRange !== 'yesterday')) return;

    setIsTodaySyncing(true);
    fetch(`/api/brands/${brand.slug}/sync-today?period=${dateRange}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const dateStr = data.syncDate || getGa4DateRange(dateRange).startDate;
          setLocalSales(prev => {
            const filtered = prev.filter(s => s.date !== dateStr);
            return [...filtered, ...(data.sales || [])];
          });
          setLocalAds(prev => {
            const filtered = prev.filter(a => a.date !== dateStr);
            return [...filtered, ...(data.ads || [])];
          });
        }
      })
      .finally(() => setIsTodaySyncing(false));
  }, [dateRange, brand.slug, isMocked]);

  const rangeLabels: { [key: string]: string } = {
    today: "Bugün",
    yesterday: "Dün",
    "7d": "Son 7 Gün",
    "14d": "Son 14 Gün",
    "30d": "Son 30 Gün",
    custom: "Özel"
  };

  const filteredPeriod = useMemo(() => {
    if (isMocked) return null;
    return filterDataByDateRange(dateRange, localSales, localAds, customStart, customEnd);
  }, [dateRange, customStart, customEnd, localSales, localAds, isMocked]);

  const data = useMemo(() => {
    if (!isMocked && filteredPeriod) {
      return buildRealDashboardData(
        filteredPeriod.filteredSales as any[],
        filteredPeriod.filteredAds as any[],
        filteredPeriod.prevFilteredSales as any[],
        filteredPeriod.prevFilteredAds as any[]
      );
    }

    return generateMockData(brand.slug, dateRange === 'custom' ? '30d' : dateRange);
  }, [brand.slug, dateRange, filteredPeriod, isMocked]);

  const displayAlerts = useMemo(() => {
    if (isMocked) {
      return [
        {
          id: 'mock-info',
          message: 'Örnek veri — entegrasyon bağlandığında gerçek uyarılar görünür.',
          type: 'info' as const,
        },
      ];
    }
    if (!filteredPeriod) return [];
    return buildAlerts({
      sales: filteredPeriod.filteredSales as any[],
      ads: filteredPeriod.filteredAds as any[],
      prevSales: filteredPeriod.prevFilteredSales as any[],
      prevAds: filteredPeriod.prevFilteredAds as any[],
      ga4: ga4Data.isGa4Live ? ga4Data : undefined,
      prevGa4: prevGa4Data?.isGa4Live ? prevGa4Data : undefined,
    });
  }, [isMocked, filteredPeriod, ga4Data, prevGa4Data]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-8 text-slate-700 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        <DashboardPageHeader
          title={pageTitle ?? `${brand.name} Performans Raporu`}
          subtitle={pageSubtitle}
          icon={LayoutDashboard}
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
        />

        {/* ALERTS */}
        {displayAlerts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex gap-3 ${
                  alert.type === 'danger' ? 'bg-rose-50 border-rose-200' :
                  alert.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
                  alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="pt-0.5">
                  {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                  {alert.type === 'success' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                  {alert.type === 'warning' && <Zap className="w-5 h-5 text-amber-500" />}
                  {alert.type === 'info' && <Info className="w-5 h-5 text-[#F5403F]" />}
                </div>
                <p className="text-sm font-medium text-slate-700">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* ÖZET METRİKLER */}
        <SectionHeading title="Özet Metrikler" description="Seçili dönemin ana performans göstergeleri" icon={Layers} accent="brand" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          {([
            { label: 'Toplam Ciro', value: formatCurrency(data.stats.revenue), score: data.stats.prevPeriod.revenueScore, accent: 'emerald' as MetricAccent, icon: TrendingUp },
            { label: 'Toplam Harcama', value: formatCurrency(data.stats.totalSpend), score: data.stats.prevPeriod.spendScore, accent: 'rose' as MetricAccent, icon: Target, invertTrend: true },
            { label: 'Genel ROI', value: `${data.stats.roi}x`, score: data.stats.prevPeriod.roasScore, accent: 'brand' as MetricAccent, icon: Zap },
            { label: 'Toplam Sipariş', value: data.stats.orderCount, score: data.stats.prevPeriod.orderScore, accent: 'blue' as MetricAccent, icon: ShoppingBag },
            { label: 'Dönüşüm Oranı', value: `%${data.stats.convRate}`, score: data.stats.prevPeriod.convScore, accent: 'violet' as MetricAccent, icon: MousePointerClick },
            { label: 'Ortalama Sepet (AOV)', value: formatCurrency(data.stats.aov), score: data.stats.prevPeriod.aovScore, accent: 'amber' as MetricAccent, icon: DollarSign },
          ]).map((kpi, i) => (
            <MetricCard
              key={i}
              label={kpi.label}
              value={kpi.value}
              score={kpi.score}
              accent={kpi.accent}
              icon={kpi.icon}
              invertTrend={kpi.invertTrend}
            />
          ))}
        </div>

        {/* TREND VE KANALLAR */}
        <SectionHeading title="Trend ve Kanallar" icon={BarChart3} accent="emerald" />
        <div className="grid gap-6 lg:grid-cols-12">
          <ReportCard
            className="lg:col-span-8"
            label="Grafik"
            title="Performans Eğilimi"
            description="Ciro, harcama ve ROAS zaman içinde"
            icon={BarChart3}
            accent="emerald"
            headerExtra={
              <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ciro</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Harcama</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> ROAS</div>
              </div>
            }
          >
             <div className="h-[320px] w-full -mt-2">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#ffffff', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#gradientRev)" />
                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="4 4"/>
                    <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#6366f1" strokeWidth={2} dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </ReportCard>

          <ReportCard
            className="lg:col-span-4"
            label="Kanal"
            title="Kanal Verimliliği"
            description="Meta ve Google Ads karşılaştırması"
            icon={Target}
            accent="brand"
          >
            <div className="space-y-4 -mt-2">
              <div className="p-4 rounded-xl bg-[#0866FF]/5 border border-[#0866FF]/20">
                <div className="flex items-center gap-2 mb-4">
                  <MetaLogo className="w-5 h-5" colored bordered />
                  <span className="font-bold text-slate-900 text-sm">Meta Ads</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatItem label="Harcama" value={formatCurrency(data.stats.metaSpend)} />
                  <StatItem label="Ciro" value={formatCurrency(data.stats.metaDetails.revenue)} />
                  <StatItem label="ROAS" value={`${data.stats.metaDetails.roas}x`} valueClassName="text-[#0866FF]" />
                  <StatItem label="TBM (CPC)" value={`₺${data.stats.metaDetails.cpc}`} valueClassName="text-slate-600 text-xs" />
                  <StatItem label="CTR" value={`%${data.stats.metaDetails.ctr}`} valueClassName="text-slate-600 text-xs" />
                  <StatItem label="Satışlar" value={data.stats.metaDetails.purchases} valueClassName="text-emerald-600" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#4285F4]/5 border border-[#4285F4]/20">
                <div className="flex items-center gap-2 mb-4">
                  <GoogleAdsLogo className="w-5 h-5" colored bordered />
                  <span className="font-bold text-slate-900 text-sm">Google Ads</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatItem label="Harcama" value={formatCurrency(data.stats.googleSpend)} />
                  <StatItem label="Ciro" value={formatCurrency(data.stats.googleDetails.revenue)} />
                  <StatItem label="ROAS" value={`${data.stats.googleDetails.roas}x`} valueClassName="text-[#1a73e8]" />
                  <StatItem label="TBM (CPC)" value={`₺${data.stats.googleDetails.cpc}`} valueClassName="text-slate-600 text-xs" />
                  <StatItem label="CTR" value={`%${data.stats.googleDetails.ctr}`} valueClassName="text-slate-600 text-xs" />
                  <StatItem label="Satışlar" value={data.stats.googleDetails.purchases} valueClassName="text-emerald-600" />
                </div>
              </div>
            </div>
          </ReportCard>
        </div>

        {/* E-TİCARET VE KULLANICI DAVRANIŞI */}
        <SectionHeading title="E-Ticaret ve Kullanıcı Davranışı" icon={ShoppingBag} accent="blue" />
        <div className="grid gap-6 lg:grid-cols-3">
          <ReportCard
            label="E-Ticaret"
            title="E-Ticaret Nabzı"
            icon={ShoppingBag}
            accent="emerald"
          >
             <div className="grid grid-cols-2 gap-y-5 gap-x-4 -mt-2">
                <StatItem label="Ürün Görüntüleme" value={ga4Data.purchaseJourney?.steps[1]?.users?.toLocaleString() || 0} valueClassName="text-xl font-bold text-slate-900" />
                <StatItem label="Sepete Ekleme" value={ga4Data.purchaseJourney?.steps[2]?.users?.toLocaleString() || 0} valueClassName="text-xl font-bold text-slate-900" />
                <StatItem label="Sepeti Terk Etme" value={`%${ga4Data.purchaseJourney?.steps[2]?.dropOff || 0}`} valueClassName="text-xl font-bold text-rose-500" />
                <StatItem label="Ziyaretçi Başına Ciro" value={`₺${ga4Data.overview?.users > 0 ? (data.stats.revenue / ga4Data.overview.users).toFixed(2) : 0}`} valueClassName="text-xl font-bold text-emerald-600" />
                <StatItem label="Ort. Sipariş Değeri" value={`₺${data.stats.aov}`} valueClassName="text-xl font-bold text-slate-800" />
                <StatItem label="Etkileşim Oranı" value={`%${ga4Data.overview?.engagementRate || 0}`} valueClassName="text-xl font-bold text-slate-800" />
             </div>
          </ReportCard>

          <ReportCard
            label="Huni"
            title="Kullanıcı Yolculuğu Hunisi"
            icon={Layers}
            accent="indigo"
          >
             <div className="space-y-4 -mt-2">
                {ga4Data.purchaseJourney?.steps?.map((f: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>{f.step}</span>
                      <div className="flex items-center gap-2">
                        {f.dropOff > 0 && <span className="text-[9px] px-1 bg-red-500/10 text-red-400 rounded">↓ %{f.dropOff} kayıp</span>}
                        <span>%{f.percentage}</span>
                      </div>
                    </div>
                    <div className="h-6 w-full bg-[#e2e8f0] rounded overflow-hidden">
                      <div 
                        className="h-full bg-[#F5403F] transition-all rounded-r"
                        style={{ width: `${f.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
             </div>
          </ReportCard>

          <ReportCard
            label="Analytics"
            title="GA4 Kullanıcı Analitiği"
            icon={Users}
            accent="amber"
            headerExtra={ga4Loading ? <span className="text-[10px] text-slate-400">Yükleniyor...</span> : undefined}
          >
             <div className="grid grid-cols-2 gap-3 mb-5 -mt-2">
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 text-center">
                   <p className="text-[10px] uppercase text-amber-700/80 tracking-wider font-semibold">Yeni Kullanıcılar</p>
                   <p className="text-xl font-bold text-amber-600 mt-1 tabular-nums">{ga4Data.overview.newUsers.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-100 text-center">
                   <p className="text-[10px] uppercase text-indigo-700/80 tracking-wider font-semibold">Toplam Kullanıcı</p>
                   <p className="text-xl font-bold text-indigo-600 mt-1 tabular-nums">{ga4Data.overview.users.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 text-center">
                   <p className="text-[10px] uppercase text-emerald-700/80 tracking-wider font-semibold">Oturum</p>
                   <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">{ga4Data.overview.sessions.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                   <p className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Geri Gelenler</p>
                   <p className="text-xl font-bold text-slate-700 mt-1 tabular-nums">{Math.max(0, ga4Data.overview.users - ga4Data.overview.newUsers).toLocaleString()}</p>
                </div>
             </div>
             
             <div className="space-y-3">
                {ga4Data.trafficSources && ga4Data.trafficSources.length > 0 ? ga4Data.trafficSources.slice(0, 4).map((ss: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${ss.source.includes('google') ? 'bg-orange-500' : ss.source.includes('direct') ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      <span className="text-slate-700 truncate">{ss.source} <span className="text-slate-400 font-normal">/ {ss.medium}</span></span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0 ml-2">{ss.users.toLocaleString()}</span>
                  </div>
                )) : null}
              </div>
          </ReportCard>
        </div>

        {/* COĞRAFYA VE İÇERİK */}
        <SectionHeading title="Coğrafya ve İçerik" icon={Globe} accent="violet" />
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportCard
            label="Coğrafya"
            title="Coğrafi Performans"
            icon={MapPin}
            accent="rose"
            className="min-w-0"
          >
             <div className="overflow-x-auto -mt-2">
               <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                     <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                       <th className="pb-2 px-4 font-semibold">Şehir</th>
                       <th className="pb-2 px-4 font-semibold">Oturum</th>
                       <th className="pb-2 px-4 font-semibold text-right">Dönüşüm Oranı (CVR)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {ga4Data.cities && ga4Data.cities.length > 0 ? ga4Data.cities.slice(0, 5).map((city: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 text-slate-700">{city.city}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-600 tabular-nums">{city.sessions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-slate-500 tabular-nums">%{city.conversionRate}</td>
                        </tr>
                     )) : <tr><td colSpan={3} className="py-4 text-center text-slate-500 italic">Veri henüz yok</td></tr>}
                  </tbody>
               </table>
             </div>
          </ReportCard>

          <ReportCard
            label="İçerik"
            title="En Çok Görüntülenen Sayfalar"
            icon={Globe}
            accent="blue"
          >
             <div className="space-y-4 -mt-2">
                {ga4Data.pagePaths?.slice(0, 5).map((page: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                     <div className="flex justify-between text-sm">
                       <span className="font-medium text-slate-700 truncate w-3/4" title={page.title}>{page.title}</span>
                       <span className="font-bold text-slate-900">{page.views.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-500">
                       <span className="truncate w-3/4">{page.path}</span>
                     </div>
                  </div>
                ))}
             </div>
          </ReportCard>
        </div>

        {/* CİHAZ VE KİTLE */}
        <SectionHeading title="Cihaz ve Kitle" icon={MonitorSmartphone} accent="amber" />
        <div className="grid gap-6 lg:grid-cols-3">
          <ReportCard
            label="Cihaz"
            title="Cihaz ve İşletim Sistemi"
            icon={MonitorSmartphone}
            accent="emerald"
            className="flex flex-col"
          >
             <div className="h-[180px] w-full flex relative -mt-2">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={ga4Data.devices && ga4Data.devices.length > 0 ? ga4Data.devices : data.devices} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                      {(ga4Data.devices && ga4Data.devices.length > 0 ? ga4Data.devices : data.devices).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0'}} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-700 mt-3">
                {(ga4Data.devices && ga4Data.devices.length > 0 ? ga4Data.devices : data.devices).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>
                    {d.name === 'Mobile' ? 'Mobil' : d.name === 'Desktop' ? 'Masaüstü' : d.name} (%{d.value})
                  </div>
                ))}
             </div>
          </ReportCard>

          <ReportCard
            label="Demografi"
            title="Demografik Yaş Dağılımı"
            icon={Users}
            accent="violet"
          >
             <div className="space-y-4 -mt-2">
                {(ga4Data.demographicsAges && ga4Data.demographicsAges.length > 0 ? ga4Data.demographicsAges : data.demographicAges).map((age: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>{age.range} Yaş</span>
                      <span>%{age.value}</span>
                    </div>
                    <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${age.value}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </ReportCard>

          <ReportCard
            label="Kitle"
            title="Hedef Kitle Eşleşmesi"
            icon={Target}
            accent="indigo"
            className="relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-transparent pointer-events-none" />
             <div className="relative flex flex-col items-center text-center py-4 -mt-2">
               <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 mb-4">
                 <Target className="w-8 h-8 text-indigo-500" />
               </div>
               <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                 iOS cihazlarda 25-34 yaş arası ana kadın demografik hedef kitlesine{' '}
                 <span className="text-emerald-600 font-bold">%92</span> oranında ulaşılıyor.
               </p>
             </div>
          </ReportCard>
        </div>

      </div>
    </div>
  );
}
