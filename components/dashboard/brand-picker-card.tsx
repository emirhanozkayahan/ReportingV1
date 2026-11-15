"use client";

import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { EcommercePlatformIcon } from "@/components/ecommerce-platform-icon";
import { hasEcommercePlatformIcon } from "@/lib/ecommerce-platform-icons";
import type { AgencyBrandOverview, BrandCardStatus } from "@/lib/agency-overview";

const accents = [
  {
    iconWrap: "bg-[#F5403F]/8 text-[#F5403F] border-[#F5403F]/15",
    hover: "hover:border-[#F5403F]/25 hover:bg-[#F5403F]/[0.02]",
  },
  {
    iconWrap: "bg-blue-50 text-blue-600 border-blue-100",
    hover: "hover:border-blue-200 hover:bg-blue-50/30",
  },
  {
    iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/30",
  },
  {
    iconWrap: "bg-violet-50 text-violet-600 border-violet-100",
    hover: "hover:border-violet-200 hover:bg-violet-50/30",
  },
];

const STATUS_CONFIG: Record<
  BrandCardStatus,
  { label: string; dot: string; text: string }
> = {
  ok: { label: "Güncel", dot: "bg-emerald-500", text: "text-emerald-700" },
  stale: { label: "Eski veri", dot: "bg-amber-500", text: "text-amber-700" },
  partial: { label: "Kısmi", dot: "bg-amber-500", text: "text-amber-700" },
  missing: { label: "Entegrasyon yok", dot: "bg-slate-400", text: "text-slate-500" },
};

const INTEGRATION_LABELS: Record<string, string> = {
  ikas: "İkas",
  shopify: "Shopify",
  meta: "Meta",
  google: "Google",
  google_analytics: "GA4",
  tsoft: "T-Soft",
};

function formatMoney(n: number) {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
  return `₺${n.toLocaleString("tr-TR")}`;
}

type BrandPickerCardProps = {
  brand: AgencyBrandOverview;
  index: number;
  periodLabel: string;
};

export default function BrandPickerCard({ brand, index, periodLabel }: BrandPickerCardProps) {
  const style = accents[index % accents.length];
  const statusCfg = STATUS_CONFIG[brand.status];

  return (
    <Link href={`/dashboard/${brand.slug}`} className="group block h-full">
      <div
        className={`h-full bg-white border border-slate-200/80 rounded-2xl p-5 transition-colors duration-200 ${style.hover}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-100 shrink-0"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-lg shrink-0 ${style.iconWrap}`}
              >
                {brand.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marka</p>
              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#D93635] transition-colors">
                {brand.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                /{brand.slug}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-[#F5403F] group-hover:border-[#F5403F] group-hover:text-white transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Metrikler */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] text-slate-500 font-medium">{periodLabel} ciro</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatMoney(brand.metrics.revenue)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] text-slate-500 font-medium">Harcama</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{formatMoney(brand.metrics.spend)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <p className="text-[10px] text-slate-500 font-medium">ROAS</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {brand.metrics.roas > 0 ? `${brand.metrics.roas}x` : "—"}
            </p>
          </div>
        </div>

        {/* Entegrasyonlar */}
        {brand.integrations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {brand.integrations.slice(0, 4).map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                {hasEcommercePlatformIcon(p) && (
                  <EcommercePlatformIcon platformId={p} className="w-3.5 h-3.5" />
                )}
                {INTEGRATION_LABELS[p] || p}
              </span>
            ))}
            {brand.integrations.length > 4 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                +{brand.integrations.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${statusCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          {brand.status === "ok" && (
            <span className="text-[10px] font-semibold text-emerald-700">
              Veriler çalışıyor
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
