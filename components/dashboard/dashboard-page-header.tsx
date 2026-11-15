import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

export type HeaderAccent = "brand" | "meta" | "google" | "analytics" | "ecommerce";

const accentStyles: Record<
  HeaderAccent,
  {
    ring: string;
    activeTab: string;
    hint: string;
    inputFocus: string;
  }
> = {
  brand: {
    ring: "ring-[#F5403F]/20",
    activeTab: "bg-[#F5403F] text-white",
    hint: "text-[#D93635]",
    inputFocus: "focus:border-[#F5403F]/40",
  },
  meta: {
    ring: "ring-[#0866FF]/20",
    activeTab: "bg-[#0866FF] text-white",
    hint: "text-[#0866FF]",
    inputFocus: "focus:border-[#0866FF]/40",
  },
  google: {
    ring: "ring-[#4285F4]/25",
    activeTab: "bg-[#1a73e8] text-white",
    hint: "text-[#1a73e8]",
    inputFocus: "focus:border-[#4285F4]/40",
  },
  analytics: {
    ring: "ring-[#E37400]/25",
    activeTab: "bg-[#E37400] text-white",
    hint: "text-[#E37400]",
    inputFocus: "focus:border-[#E37400]/40",
  },
  ecommerce: {
    ring: "ring-emerald-500/25",
    activeTab: "bg-emerald-600 text-white",
    hint: "text-emerald-700",
    inputFocus: "focus:border-emerald-500/40",
  },
};

type DashboardPageHeaderProps = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  iconNode?: ReactNode;
  accent?: HeaderAccent;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  rangeLabels: Record<string, string>;
  dateRangeOptions?: string[];
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (value: string) => void;
  onCustomEndChange?: (value: string) => void;
  isTodayLoading?: boolean;
  onPeriodClick?: () => void;
  periodLabel?: string;
  showPeriodBadge?: boolean;
  badges?: ReactNode;
  sync?: {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    label?: string;
    loadingLabel?: string;
  };
  getDateButtonProps?: (val: string) => { className?: string; title?: string };
};

export default function DashboardPageHeader({
  title,
  subtitle,
  icon: Icon,
  iconNode,
  accent = "brand",
  dateRange,
  onDateRangeChange,
  rangeLabels,
  dateRangeOptions = ["today", "yesterday", "7d", "14d", "30d", "custom"],
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  isTodayLoading,
  periodLabel,
  showPeriodBadge = false,
  badges,
  sync,
  getDateButtonProps,
}: DashboardPageHeaderProps) {
  const styles = accentStyles[accent];
  const resolvedPeriodLabel = periodLabel ?? rangeLabels[dateRange];
  const iconContent = iconNode ?? (Icon ? <Icon className="w-5 h-5" /> : null);

  return (
    <div className="pb-1">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {iconContent && (
            <div className="mb-3 opacity-80 [&_svg]:w-5 [&_svg]:h-5 [&_img]:w-5 [&_img]:h-5">{iconContent}</div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 max-w-2xl">{subtitle}</p>
          {badges && (
            <div className="flex flex-wrap items-center gap-2 mt-4">{badges}</div>
          )}
        </div>

        <div className="flex flex-col items-stretch lg:items-end gap-2.5 shrink-0 w-full lg:w-auto lg:max-w-[min(100%,42rem)]">
          {(showPeriodBadge || periodLabel) && (
            <p className="text-xs font-medium text-slate-400 lg:text-right">
              Gösterilen dönem:{" "}
              <span className={`font-semibold ${styles.hint}`}>{resolvedPeriodLabel}</span>
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <div
              className={`inline-flex w-full sm:w-auto items-center p-1 rounded-full bg-white border border-slate-200 shadow-sm ring-1 ${styles.ring} overflow-x-auto no-scrollbar`}
            >
              {dateRangeOptions.map((val) => {
                const extra = getDateButtonProps?.(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onDateRangeChange(val)}
                    title={extra?.title}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      dateRange === val
                        ? styles.activeTab
                        : "text-slate-500 hover:text-slate-800"
                    } ${extra?.className ?? ""}`}
                  >
                    {val === "today" && isTodayLoading ? "…" : rangeLabels[val]}
                  </button>
                );
              })}
            </div>

            {dateRange === "custom" && customStart && customEnd && (
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => onCustomStartChange?.(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`bg-white border border-slate-200 rounded-full px-3 py-2 text-xs text-slate-700 shadow-sm focus:outline-none cursor-pointer ${styles.inputFocus}`}
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => onCustomEndChange?.(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`bg-white border border-slate-200 rounded-full px-3 py-2 text-xs text-slate-700 shadow-sm focus:outline-none cursor-pointer ${styles.inputFocus}`}
                />
              </div>
            )}

            {sync && (
              <button
                type="button"
                onClick={sync.onClick}
                disabled={sync.disabled || sync.loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:shadow hover:border-slate-300 transition-all disabled:opacity-50 shrink-0 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-600 ${sync.loading ? "animate-spin" : ""}`} />
                {sync.loading
                  ? sync.loadingLabel ?? "Güncelleniyor..."
                  : sync.label ?? "Verileri Güncelle"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
