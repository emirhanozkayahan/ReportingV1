'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyTrend { month: string; queries: number; pos1_3: number; pos4_10: number; }
interface Mover { queryOrPage: string; pos30: number; posBefore: number; delta: number; }
interface TopPageQuery { query: string; page: string; clicks: number; clicksDelta: number; imp: number; impDelta: number; pos: number; posDelta: number; }
interface RankingTime { query: string; mayPos: number; mayClicks: number; aprPos: number; aprClicks: number; marPos: number; marClicks: number; }

export default function SeoReportPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState('');

  // Mock Veriler
  const trends: MonthlyTrend[] = [
    { month: 'Şub 2026', queries: 10900, pos1_3: 1689, pos4_10: 3794 },
    { month: 'Mar 2026', queries: 13345, pos1_3: 2871, pos4_10: 4925 },
    { month: 'Nis 2026', queries: 12178, pos1_3: 2544, pos4_10: 4365 },
    { month: 'May 2026', queries: 12238, pos1_3: 2185, pos4_10: 4841 }
  ];

  const moversQueries: Mover[] = [
    { queryOrPage: 'füme renk pantolon', pos30: 9, posBefore: 50, delta: 41 },
    { queryOrPage: 'erkek tatil gömlek', pos30: 17, posBefore: 55, delta: 38 },
    { queryOrPage: 'gömlek keten', pos30: 9, posBefore: 46, delta: 37 },
    { queryOrPage: 'rahat kesim gömlek', pos30: 4, posBefore: 41, delta: 37 },
    { queryOrPage: 'keten gömlek erkek', pos30: 12, posBefore: 48, delta: 37 },
    { queryOrPage: 'keten erkek gömlek', pos30: 22, posBefore: 56, delta: 35 },
  ];

  const moversPages: Mover[] = [
    { queryOrPage: '/regular-fit-pasa-yaka-kirmizi...', pos30: 18, posBefore: 56, delta: 39 },
    { queryOrPage: '/t-shirt-50-indirim', pos30: 6, posBefore: 31, delta: 25 },
    { queryOrPage: '/outlet-takim-elbise', pos30: 20, posBefore: 40, delta: 20 },
    { queryOrPage: '/studio-polo-yaka-tshirt-bej', pos30: 4, posBefore: 20, delta: 16 },
    { queryOrPage: '/akrilik-yun-bisiklet-yaka-...', pos30: 6, posBefore: 17, delta: 10 },
    { queryOrPage: '/modern-fit-pasa-yaka-dugme...', pos30: 4, posBefore: 13, delta: 10 },
  ];

  const topPages: TopPageQuery[] = [
    { query: 'erkek gömlek modelleri', page: '/erkek-gomlek', clicks: 253, clicksDelta: 1104.8, imp: 13030, impDelta: 263.3, pos: 7, posDelta: -2 },
    { query: 'gömlek erkek', page: '/erkek-gomlek', clicks: 250, clicksDelta: 1090.5, imp: 9521, impDelta: 872.5, pos: 8, posDelta: -11 },
    { query: 'erkek pantolon', page: '/erkek-pantolon', clicks: 239, clicksDelta: 1738.5, imp: 16433, impDelta: 734.2, pos: 11, posDelta: -14 },
    { query: 'en iyi erkek gömlek markaları', page: '/erkek-gomlek', clicks: 234, clicksDelta: -6.0, imp: 5951, impDelta: -2.6, pos: 6, posDelta: 0 },
    { query: 'kadife pantolon', page: '/erkek-kadife-pantolon', clicks: 227, clicksDelta: 20.7, imp: 9863, impDelta: 43.6, pos: 6, posDelta: -2 },
    { query: 'bisse gömlek fiyatları', page: '/erkek-gomlek', clicks: 194, clicksDelta: 169.4, imp: 774, impDelta: 31.9, pos: 3, posDelta: 1 },
    { query: 'bisse', page: '/magazalarimiz', clicks: 187, clicksDelta: -22.7, imp: 27770, impDelta: -23.0, pos: 1, posDelta: 0 },
  ];

  const rankings: RankingTime[] = [
    { query: 'bisse', mayPos: 1.8, mayClicks: 510, aprPos: 2.03, aprClicks: 1887, marPos: 1.74, marClicks: 2211 },
    { query: 'bisse gömlek', mayPos: 2.0, mayClicks: 111, aprPos: 4.41, aprClicks: 435, marPos: 3.46, marClicks: 650 },
    { query: 'erkek gömlek', mayPos: 12.06, mayClicks: 34, aprPos: 9.87, aprClicks: 179, marPos: 8.36, marClicks: 239 },
    { query: 'gömlek', mayPos: 8.67, mayClicks: 15, aprPos: 6.77, aprClicks: 157, marPos: 7.06, marClicks: 225 },
    { query: 'bisse erkek gömlek', mayPos: 1.33, mayClicks: 31, aprPos: 3.05, aprClicks: 113, marPos: 1.08, marClicks: 92 },
    { query: 'gömlek erkek', mayPos: 5.86, mayClicks: 32, aprPos: 6.07, aprClicks: 135, marPos: 9.22, marClicks: 61 },
  ];

  useEffect(() => {
    fetch('/api/admin/brands')
      .then(res => res.json())
      .then(brands => {
        const brand = brands.find((b: any) => b.slug === params.slug);
        if (brand) setBrandName(brand.name);
      });
    setTimeout(() => setLoading(false), 800);
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Google Search Console verileri işleniyor...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('tr-TR').format(num);
  
  // Renklendirme Yardımcıları
  const getDeltaColor = (delta: number) => delta > 0 ? 'bg-pink-500 text-white' : delta < 0 ? 'bg-slate-200' : '';
  const getBgHeatmap = (val: number, max: number, color: string) => {
    const opacity = Math.min(Math.max(val / max, 0.1), 0.9);
    return { backgroundColor: `rgba(${color}, ${opacity})` };
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans print:bg-white text-slate-800 text-[13px]">
      {/* Üst Kısım (Yazdırırken Gizlenir) */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 print:hidden shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-2 bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#F5403F] text-white rounded-xl font-bold hover:bg-[#D93635] transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" /> Raporu PDF Yap / Yazdır
          </button>
        </div>
      </div>

      <div className="py-8 print:py-0">
        <div className="max-w-[1200px] mx-auto bg-white p-10 shadow-xl print:shadow-none print:p-4">
          
          {/* Rapor Başlığı */}
          <div className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-4">
              {/* Google Search Console stili başlık */}
              <div>
                <h1 className="text-2xl font-normal text-slate-600 flex items-center gap-2">
                  <span className="font-bold text-[#4285F4]">G</span>
                  <span className="font-bold text-[#EA4335]">o</span>
                  <span className="font-bold text-[#FBBC05]">o</span>
                  <span className="font-bold text-[#4285F4]">g</span>
                  <span className="font-bold text-[#34A853]">l</span>
                  <span className="font-bold text-[#EA4335]">e</span>
                  <span className="ml-1">Search Console <strong className="text-slate-900 ml-1 tracking-tight">Rankings</strong></span>
                </h1>
                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-wider">{brandName || 'Bisse'}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-300 px-4 py-2 rounded-md shadow-sm font-mono text-sm font-semibold">
              Son 30 Gün vs Önceki 30 Gün
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-2 gap-8 mb-10 break-inside-avoid">
            <div>
              <h2 className="text-xl font-black mb-4 tracking-tight">Total # of Queries</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}K`} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Legend iconType="square" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                    <Bar dataKey="queries" name="# Queries" fill="#1A73E8" maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black mb-4 tracking-tight">Total # of Top 10 Queries</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}K`} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Legend iconType="square" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                    <Bar dataKey="pos4_10" name="Pos. 4-10" fill="#1A73E8" stackId="a" maxBarSize={60} />
                    <Bar dataKey="pos1_3" name="Pos. 1-3" fill="#00BCD4" stackId="a" maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Biggest Movers */}
          <div className="mb-10 break-inside-avoid bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <h2 className="text-lg font-black mb-4 tracking-tight flex items-baseline gap-2">
              Biggest Movers <span className="text-xs font-normal text-slate-500">(Min. 1 Click last 30 days)</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <table className="w-full text-left border-collapse bg-white shadow-sm border border-slate-200">
                <thead>
                  <tr className="bg-slate-200/60 text-slate-700 text-xs">
                    <th className="p-2 border-b font-bold">Query</th>
                    <th className="p-2 border-b font-bold text-center">Ø Position Last 30 Days</th>
                    <th className="p-2 border-b font-bold text-center">Ø Position Before</th>
                    <th className="p-2 border-b font-bold text-center">Δ ▾</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moversQueries.map((m, i) => (
                    <tr key={i} className="text-xs">
                      <td className="p-2">{m.queryOrPage}</td>
                      <td className="p-2 text-center" style={getBgHeatmap(m.pos30, 30, '144, 202, 249')}>{m.pos30}</td>
                      <td className="p-2 text-center" style={getBgHeatmap(m.posBefore, 60, '0, 188, 212')}>{m.posBefore}</td>
                      <td className={`p-2 text-center font-bold ${getDeltaColor(m.delta)}`}>{m.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full text-left border-collapse bg-white shadow-sm border border-slate-200">
                <thead>
                  <tr className="bg-slate-200/60 text-slate-700 text-xs">
                    <th className="p-2 border-b font-bold">Landing Page</th>
                    <th className="p-2 border-b font-bold text-center">Ø Position Last 30 Days</th>
                    <th className="p-2 border-b font-bold text-center">Ø Position Before</th>
                    <th className="p-2 border-b font-bold text-center">Δ ▾</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moversPages.map((m, i) => (
                    <tr key={i} className="text-xs">
                      <td className="p-2 truncate max-w-[150px]" title={m.queryOrPage}>{m.queryOrPage}</td>
                      <td className="p-2 text-center" style={getBgHeatmap(m.pos30, 30, '144, 202, 249')}>{m.pos30}</td>
                      <td className="p-2 text-center" style={getBgHeatmap(m.posBefore, 60, '0, 188, 212')}>{m.posBefore}</td>
                      <td className={`p-2 text-center font-bold ${getDeltaColor(m.delta)}`}>{m.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Pages w/ Query */}
          <div className="mb-10 break-inside-avoid">
            <h2 className="text-lg font-black mb-4 tracking-tight">Top Pages w/ Query</h2>
            <table className="w-full text-left border-collapse bg-white shadow-sm border border-slate-200">
              <thead>
                <tr className="bg-slate-200/60 text-slate-700 text-xs">
                  <th className="p-2.5 border-b font-bold">Query</th>
                  <th className="p-2.5 border-b font-bold">Landing Page</th>
                  <th className="p-2.5 border-b font-bold text-right">Clicks ▾</th>
                  <th className="p-2.5 border-b font-bold text-right">% Δ</th>
                  <th className="p-2.5 border-b font-bold text-right">Impressions</th>
                  <th className="p-2.5 border-b font-bold text-right">% Δ</th>
                  <th className="p-2.5 border-b font-bold text-right">Average Position</th>
                  <th className="p-2.5 border-b font-bold text-right">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topPages.map((p, i) => (
                  <tr key={i} className="text-xs hover:bg-slate-50">
                    <td className="p-2.5">{p.query}</td>
                    <td className="p-2.5 truncate max-w-[150px]" title={p.page}>{p.page}</td>
                    <td className="p-2.5 text-right font-medium">{formatNumber(p.clicks)}</td>
                    <td className="p-2.5 text-right text-[11px]">
                      {p.clicksDelta > 0 ? <span className="text-green-600">↑ {p.clicksDelta}%</span> : <span className="text-red-600">↓ {Math.abs(p.clicksDelta)}%</span>}
                    </td>
                    <td className="p-2.5 text-right" style={getBgHeatmap(p.imp, 30000, '0, 188, 212')}>{formatNumber(p.imp)}</td>
                    <td className="p-2.5 text-right text-[11px]">
                      {p.impDelta > 0 ? <span className="text-green-600">↑ {p.impDelta}%</span> : <span className="text-red-600">↓ {Math.abs(p.impDelta)}%</span>}
                    </td>
                    <td className="p-2.5 text-right" style={getBgHeatmap(30 - p.pos, 30, '252, 228, 236')}>{p.pos}</td>
                    <td className="p-2.5 text-right text-[11px]">
                      {p.posDelta < 0 ? <span className="text-green-600">↓ {Math.abs(p.posDelta)}</span> : p.posDelta > 0 ? <span className="text-red-600">↑ {p.posDelta}</span> : <span>0 ↕</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ranking of Queries Over Time */}
          <div className="break-inside-avoid">
            <h2 className="text-lg font-black mb-4 tracking-tight">Ranking of Queries Over Time</h2>
            <table className="w-full text-left border-collapse bg-white shadow-sm border border-slate-200">
              <thead>
                <tr>
                  <th className="p-2 border-b border-r bg-slate-50"></th>
                  <th colSpan={2} className="p-2 border-b border-r text-center font-bold text-xs bg-slate-100">Haz 2026</th>
                  <th colSpan={2} className="p-2 border-b border-r text-center font-bold text-xs bg-slate-100">May 2026</th>
                  <th colSpan={2} className="p-2 border-b text-center font-bold text-xs bg-slate-100">Nis 2026</th>
                </tr>
                <tr className="bg-slate-200/60 text-slate-700 text-xs">
                  <th className="p-2 border-b font-bold border-r">Query</th>
                  <th className="p-2 border-b font-bold text-center">Average Position</th>
                  <th className="p-2 border-b font-bold text-center border-r">Clicks</th>
                  <th className="p-2 border-b font-bold text-center">Average Position</th>
                  <th className="p-2 border-b font-bold text-center border-r">Clicks</th>
                  <th className="p-2 border-b font-bold text-center">Average Position</th>
                  <th className="p-2 border-b font-bold text-center">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((r, i) => (
                  <tr key={i} className="text-xs">
                    <td className="p-2 border-r font-medium">{r.query}</td>
                    <td className="p-2 text-center" style={getBgHeatmap(30 - r.mayPos, 30, '227, 242, 253')}>{r.mayPos}</td>
                    <td className="p-2 text-center border-r" style={getBgHeatmap(r.mayClicks, 2000, '0, 188, 212')}>{r.mayClicks}</td>
                    <td className="p-2 text-center" style={getBgHeatmap(30 - r.aprPos, 30, '227, 242, 253')}>{r.aprPos}</td>
                    <td className="p-2 text-center border-r" style={getBgHeatmap(r.aprClicks, 2000, '0, 188, 212')}>{r.aprClicks}</td>
                    <td className="p-2 text-center" style={getBgHeatmap(30 - r.marPos, 30, '227, 242, 253')}>{r.marPos}</td>
                    <td className="p-2 text-center" style={getBgHeatmap(r.marClicks, 2000, '0, 188, 212')}>{r.marClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
