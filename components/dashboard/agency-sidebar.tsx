"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutGrid,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

export type AgencySidebarBrand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
};

type AgencySidebarProps = {
  brands: AgencySidebarBrand[];
  loadingSync?: boolean;
  onSyncAll?: () => void;
};

export default function AgencySidebar({
  brands,
  loadingSync = false,
  onSyncAll,
}: AgencySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/dashboard" || pathname === "/dashboard/";

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/favicon.png" alt="Veritas Report" width={28} height={28} className="rounded-lg shrink-0" />
          <span className="text-slate-900 font-semibold text-sm truncate">Ajans Paneli</span>
        </div>
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-500 p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeMobile} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] bg-[#FFFFFF] border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <Image src="/favicon.png" alt="Veritas Report" width={40} height={40} className="rounded-xl shrink-0" />
            <div className="min-w-0">
              <h2 className="text-slate-900 font-bold text-sm truncate">Ajans Paneli</h2>
              <p className="text-slate-500 text-[11px] font-medium">Veritas Report</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className={`flex items-center gap-2.5 px-3 py-2.5 mb-3 rounded-xl text-sm font-semibold border transition-all ${
              isHome
                ? "bg-[#F5403F]/12 text-[#F5403F] border-[#F5403F]/25"
                : "text-slate-600 border-transparent hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Tüm Markalar
          </Link>

          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] uppercase text-slate-600 font-bold tracking-widest">Markalar</p>
            <span className="text-[10px] font-bold text-slate-400">{brands.length}</span>
          </div>

          <div className="space-y-0.5">
            {brands.map((brand) => {
              const href = `/dashboard/${brand.slug}`;
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={brand.id}
                  href={href}
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all border ${
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
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F5403F]" : "text-slate-400"}`} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-3 py-4 border-t border-slate-200/60 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-[#F5403F]" />
            <span>Admin Paneli</span>
          </Link>

          {onSyncAll && (
            <button
              type="button"
              onClick={onSyncAll}
              disabled={loadingSync}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#F5403F] hover:bg-[#F5403F]/8 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSync ? "animate-spin" : ""}`} />
              <span>{loadingSync ? "Eşitleniyor..." : "Tümünü Eşitle"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
