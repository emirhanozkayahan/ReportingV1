"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import BrandPickerCard from "@/components/dashboard/brand-picker-card";
import AgencySidebar, { type AgencySidebarBrand } from "@/components/dashboard/agency-sidebar";
import type { AgencyOverview } from "@/lib/agency-overview";
import { buildMockAgencyOverview } from "@/lib/agency-overview";

const LAST_BRAND_KEY = "agency_last_brand_slug";

function formatMoney(n: number) {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
  return `₺${n.toLocaleString("tr-TR")}`;
}

type AgencyDashboardClientProps = {
  initialBrands: AgencySidebarBrand[];
  isMocked?: boolean;
  isEmpty?: boolean;
};

export default function AgencyDashboardClient({
  initialBrands,
  isMocked = false,
  isEmpty = false,
}: AgencyDashboardClientProps) {
  const [overview, setOverview] = useState<AgencyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState<"yesterday" | "7d">("yesterday");
  const [search, setSearch] = useState("");
  const [lastBrandSlug, setLastBrandSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agency/overview?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      } else if (isMocked) {
        setOverview(buildMockAgencyOverview());
      }
    } catch {
      if (isMocked) setOverview(buildMockAgencyOverview());
    } finally {
      setLoading(false);
    }
  }, [period, isMocked]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const slug = localStorage.getItem(LAST_BRAND_KEY);
    if (slug) setLastBrandSlug(slug);
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    setToast("Tüm markalar eşitleniyor...");
    try {
      const res = await fetch("/api/admin/sync?history=30");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync başarısız");
      setToast(`Eşitleme tamamlandı. Başarılı: ${data.details?.successCount ?? 0}`);
      fetchOverview();
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSyncing(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const displayedBrands = useMemo(() => {
    if (!overview) return [];
    if (!search.trim()) return overview.brands;

    const q = search.toLowerCase();
    return overview.brands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
    );
  }, [overview, search]);

  const lastBrand = overview?.brands.find((b) => b.slug === lastBrandSlug);

  if (isEmpty) {
    return (
      <>
        <AgencySidebar brands={[]} onSyncAll={handleSyncAll} loadingSync={syncing} />
        <div className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Henüz marka yok</h2>
            <p className="text-sm text-slate-500 mb-6">
              İlk markanızı admin panelinden ekleyerek başlayın.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5403F] text-white text-sm font-semibold hover:bg-[#D93635]"
            >
              <Settings className="w-4 h-4" />
              Admin Paneline Git
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AgencySidebar
        brands={initialBrands}
        onSyncAll={handleSyncAll}
        loadingSync={syncing}
      />

      <div className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen w-full overflow-x-hidden">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-xl max-w-sm">
            {toast}
          </div>
        )}

        <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {/* Başlık */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Ajans Paneli
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Tüm markaların performans özeti — {overview?.period.label ?? "yükleniyor"}
              </p>
              {isMocked && (
                <span className="inline-flex mt-2 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                  Demo veri
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                {(["yesterday", "7d"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {p === "yesterday" ? "Dün" : "7 gün"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={fetchOverview}
                disabled={loading}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Son açılan marka */}
          {lastBrand && (
            <Link
              href={`/dashboard/${lastBrand.slug}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#F5403F]/20 bg-[#F5403F]/5 hover:bg-[#F5403F]/8 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {lastBrand.logo_url ? (
                  <img src={lastBrand.logo_url} alt="" className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#F5403F] text-white flex items-center justify-center font-bold">
                    {lastBrand.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-[#F5403F] font-semibold">Son açılan marka</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{lastBrand.name}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#F5403F] shrink-0" />
            </Link>
          )}

          {/* Özet kartlar */}
          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-semibold">Toplam Ciro</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatMoney(overview.summary.totalRevenue)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold">Toplam Harcama</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatMoney(overview.summary.totalSpend)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-xs font-semibold">Blended ROAS</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {overview.summary.blendedRoas > 0 ? `${overview.summary.blendedRoas}x` : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Arama */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Marka ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#F5403F]/40"
            />
          </div>

          {/* Marka grid */}
          {loading && !overview ? (
            <div className="py-20 flex justify-center">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : displayedBrands.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              {search.trim() ? "Aramanızla eşleşen marka bulunamadı." : "Marka bulunamadı."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedBrands.map((brand, index) => (
                <BrandPickerCard
                  key={brand.id}
                  brand={brand}
                  index={index}
                  periodLabel={overview?.period.label ?? "Dönem"}
                />
              ))}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 pt-4">Veritas Dijital</p>
        </main>
      </div>
    </>
  );
}
