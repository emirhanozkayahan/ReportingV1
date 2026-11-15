"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ChevronLeft,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { GoogleAdsLogo, GoogleAnalyticsLogo, MetaLogo } from "@/components/platform-nav-icons";
import { EcommercePlatformIcon } from "@/components/ecommerce-platform-icon";
import { getPlatformLabel } from "@/lib/admin-platforms";

type NavTheme = {
  activeBg: string;
  activeText: string;
  activeBorder: string;
  activeShadow: string;
  activeDesc: string;
  iconClass: string;
};

type NavIconProps = { className?: string; colored?: boolean; bordered?: boolean };

type NavItem = {
  label: string;
  href: string;
  description: string;
  Icon: ComponentType<NavIconProps>;
  theme: NavTheme;
};

const overviewItem: NavItem = {
  label: "Genel Bakış",
  href: "",
  Icon: ({ className, colored }) => (
    <LayoutDashboard className={`${className} ${colored ? "text-[#F5403F]" : ""}`} />
  ),
  description: "Ana performans raporu",
  theme: {
    activeBg: "bg-[#F5403F]/12",
    activeText: "text-[#F5403F]",
    activeBorder: "border-[#F5403F]/25",
    activeShadow: "shadow-sm shadow-[#F5403F]/10",
    activeDesc: "text-[#F5403F]/65",
    iconClass: "text-[#F5403F]",
  },
};

const ppcItems: NavItem[] = [
  {
    label: "Meta Ads",
    href: "/meta",
    Icon: ({ className, colored }) => (
      <MetaLogo
        className={colored ? "w-7 h-7" : className}
        colored={colored}
        bordered={colored}
      />
    ),
    description: "Kampanya, reklam seti, reklam",
    theme: {
      activeBg: "bg-[#0866FF]/10",
      activeText: "text-[#0866FF]",
      activeBorder: "border-[#0866FF]/25",
      activeShadow: "shadow-sm shadow-[#0866FF]/10",
      activeDesc: "text-[#0866FF]/65",
      iconClass: "text-[#0866FF]",
    },
  },
  {
    label: "Google Ads",
    href: "/google",
    Icon: ({ className, colored }) => (
      <GoogleAdsLogo
        className={colored ? "w-7 h-7" : className}
        colored={colored}
        bordered={colored}
      />
    ),
    description: "Kampanya, anahtar kelime, PMax",
    theme: {
      activeBg: "bg-[#4285F4]/10",
      activeText: "text-[#1a73e8]",
      activeBorder: "border-[#4285F4]/25",
      activeShadow: "shadow-sm shadow-[#4285F4]/10",
      activeDesc: "text-[#1a73e8]/65",
      iconClass: "text-[#4285F4]",
    },
  },
];

const analyticsItems: NavItem[] = [
  {
    label: "Google Analytics",
    href: "/analytics",
    Icon: ({ className, colored }) => (
      <GoogleAnalyticsLogo
        className={colored ? "w-7 h-7" : className}
        colored={colored}
        bordered={colored}
      />
    ),
    description: "GA4, trafik, kullanıcı yolculuğu",
    theme: {
      activeBg: "bg-[#E37400]/10",
      activeText: "text-[#E37400]",
      activeBorder: "border-[#E37400]/25",
      activeShadow: "shadow-sm shadow-[#E37400]/10",
      activeDesc: "text-[#E37400]/65",
      iconClass: "text-[#E37400]",
    },
  },
];

const ecommerceTheme: NavTheme = {
  activeBg: "bg-emerald-500/10",
  activeText: "text-emerald-700",
  activeBorder: "border-emerald-500/25",
  activeShadow: "shadow-sm shadow-emerald-500/10",
  activeDesc: "text-emerald-600/75",
  iconClass: "text-emerald-600",
};

function buildEcommerceItems(platformIds: string[]): NavItem[] {
  return platformIds.map((platformId) => ({
    label: getPlatformLabel(platformId),
    href: `/ecommerce/${platformId}`,
    Icon: ({ className, colored }) => (
      <EcommercePlatformIcon
        platformId={platformId}
        className={colored ? "w-7 h-7" : className}
        bordered={colored}
        colored={colored}
      />
    ),
    description: "Sipariş, ciro ve satış raporu",
    theme: ecommerceTheme,
  }));
}

function NavLink({
  item,
  basePath,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  basePath: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const fullHref = basePath + item.href;
  const isActive =
    item.href === ""
      ? pathname === basePath
      : pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  const { theme } = item;

  return (
    <Link
      href={fullHref}
      onClick={onNavigate}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
      ${
        isActive
          ? `${theme.activeBg} ${theme.activeText} ${theme.activeBorder} ${theme.activeShadow}`
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent"
      }`}
    >
      <item.Icon
        className={`w-[18px] h-[18px] shrink-0 ${
          isActive ? theme.iconClass : "text-slate-500 group-hover:text-slate-700"
        }`}
        colored={isActive}
      />
      <div className="flex-1 min-w-0">
        <span className="block truncate">{item.label}</span>
        <span
          className={`block text-[10px] truncate mt-0.5 ${
            isActive ? theme.activeDesc : "text-slate-600"
          }`}
        >
          {item.description}
        </span>
      </div>
    </Link>
  );
}

function NavGroup({
  label,
  items,
  basePath,
  pathname,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  basePath: string;
  pathname: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-5 first:mt-3">
      <div className="flex items-center gap-2.5 px-2 mb-2.5">
        <span className="text-[11px] uppercase text-slate-700 font-semibold tracking-[0.1em]">
          {label}
        </span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            basePath={basePath}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardSidebar({
  brandSlug,
  brandName,
  brandLogo,
  isMocked,
  isAgency,
  ecommercePlatforms = [],
}: {
  brandSlug: string;
  brandName: string;
  brandLogo?: string;
  isMocked: boolean;
  isAgency?: boolean;
  ecommercePlatforms?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/dashboard/${brandSlug}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const ecommerceItems = buildEcommerceItems(ecommercePlatforms);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brandLogo ? (
            <img src={brandLogo} alt={brandName} className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5403F] to-[#E83837] text-white flex items-center justify-center font-bold text-sm">
              {brandName.charAt(0)}
            </div>
          )}
          <span className="text-slate-900 font-semibold text-sm">{brandName}</span>
          {isMocked && (
            <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
              DEMO
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-500 hover:text-slate-900 transition-colors p-1"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] bg-[#FFFFFF] border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand header */}
        <div className="px-5 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-10 h-10 rounded-xl object-contain bg-white shadow-lg border border-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5403F] to-[#E83837] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#F5403F]/20">
                {brandName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-slate-900 font-bold text-sm truncate">{brandName}</h2>
              <p className="text-slate-500 text-[11px] font-medium">Veritas Report</p>
            </div>
            {isMocked && (
              <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                DEMO
              </span>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <NavLink
            item={overviewItem}
            basePath={basePath}
            pathname={pathname}
            onNavigate={closeMobile}
          />

          <NavGroup
            label="PPC"
            items={ppcItems}
            basePath={basePath}
            pathname={pathname}
            onNavigate={closeMobile}
          />

          <NavGroup
            label="Analytics"
            items={analyticsItems}
            basePath={basePath}
            pathname={pathname}
            onNavigate={closeMobile}
          />

          {ecommerceItems.length > 0 && (
            <NavGroup
              label="E-Commerce"
              items={ecommerceItems}
              basePath={basePath}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-200/60">
          {isAgency ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Tüm Markalar</span>
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
