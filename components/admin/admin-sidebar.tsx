"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  LineChart,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  RotateCw,
  X,
} from "lucide-react";
import { useState } from "react";

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  user_count?: number;
};

type AdminSidebarProps = {
  brands: AdminBrand[];
  selectedBrandId: string;
  onSelectBrand: (id: string) => void;
  showNewBrandForm: boolean;
  onShowNewBrand: () => void;
  loadingBrands: boolean;
  loadingSync: boolean;
  onTriggerSync: () => void;
};

export default function AdminSidebar({
  brands,
  selectedBrandId,
  onSelectBrand,
  showNewBrandForm,
  onShowNewBrand,
  loadingBrands,
  loadingSync,
  onTriggerSync,
}: AdminSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/favicon.png"
            alt="Veritas Report"
            width={28}
            height={28}
            className="rounded-lg shrink-0"
          />
          <span className="text-slate-900 font-semibold text-sm truncate">Admin Paneli</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-500 hover:text-slate-900 transition-colors p-1"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] bg-[#FFFFFF] border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <Image
              src="/favicon.png"
              alt="Veritas Report"
              width={40}
              height={40}
              className="rounded-xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-slate-900 font-bold text-sm truncate">Admin Paneli</h2>
              <p className="text-slate-500 text-[11px] font-medium">Veritas Report</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Brands */}
          <div className="px-3 pt-4 pb-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] uppercase text-slate-600 font-bold tracking-widest">
                Markalar
              </p>
              <span className="text-[10px] font-bold text-slate-400">{brands.length}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onShowNewBrand();
                closeMobile();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl text-sm font-semibold border transition-all ${
                showNewBrandForm
                  ? "bg-[#F5403F]/12 text-[#F5403F] border-[#F5403F]/25"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              Yeni Marka
            </button>

            {loadingBrands ? (
              <div className="py-8 flex justify-center">
                <RotateCw className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : brands.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-500 text-center">Henüz marka yok.</p>
            ) : (
              <div className="space-y-0.5">
                {brands.map((brand) => {
                  const isActive = !showNewBrandForm && selectedBrandId === brand.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => {
                        onSelectBrand(brand.id);
                        closeMobile();
                      }}
                      className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-left transition-all border ${
                        isActive
                          ? "bg-[#F5403F]/8 border-[#F5403F]/15 text-[#D93635]"
                          : "border-transparent text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5403F] to-[#E83837] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {brand.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{brand.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">/{brand.slug}</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F5403F]" : "text-slate-400"}`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-200/60 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <a
            href="/api/auth/google/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LineChart className="w-4 h-4 text-[#E37400]" />
            <span>GA4 Bağla</span>
          </a>

          <a
            href="/api/auth/google-ads/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-[#1a73e8]" />
            <span>Google Ads Bağla</span>
          </a>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={loadingSync}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#F5403F] hover:bg-[#F5403F]/8 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSync ? "animate-spin" : ""}`} />
            <span>{loadingSync ? "Eşitleniyor..." : "Verileri Eşitle"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
