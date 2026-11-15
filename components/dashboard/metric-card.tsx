import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export type MetricAccent =
  | "emerald"
  | "rose"
  | "brand"
  | "blue"
  | "violet"
  | "amber";

const accentStyles: Record<
  MetricAccent,
  { iconWrap: string; label: string; hover: string }
> = {
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-100",
    label: "text-emerald-700",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/30",
  },
  rose: {
    iconWrap: "bg-rose-50 text-rose-600 border-rose-100",
    label: "text-rose-700",
    hover: "hover:border-rose-200 hover:bg-rose-50/30",
  },
  brand: {
    iconWrap: "bg-[#F5403F]/8 text-[#F5403F] border-[#F5403F]/15",
    label: "text-[#D93635]",
    hover: "hover:border-[#F5403F]/25 hover:bg-[#F5403F]/[0.02]",
  },
  blue: {
    iconWrap: "bg-blue-50 text-blue-600 border-blue-100",
    label: "text-blue-700",
    hover: "hover:border-blue-200 hover:bg-blue-50/30",
  },
  violet: {
    iconWrap: "bg-violet-50 text-violet-600 border-violet-100",
    label: "text-violet-700",
    hover: "hover:border-violet-200 hover:bg-violet-50/30",
  },
  amber: {
    iconWrap: "bg-amber-50 text-amber-600 border-amber-100",
    label: "text-amber-700",
    hover: "hover:border-amber-200 hover:bg-amber-50/30",
  },
};

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  score?: number | null;
  accent: MetricAccent;
  icon: LucideIcon;
  invertTrend?: boolean;
  hideTrend?: boolean;
  compact?: boolean;
};

export default function MetricCard({
  label,
  value,
  score,
  accent,
  icon: Icon,
  invertTrend = false,
  hideTrend = false,
  compact = false,
}: MetricCardProps) {
  const styles = accentStyles[accent];
  const showTrend = !hideTrend && score != null;
  const isPos = (score ?? 0) > 0;
  const isZero = (score ?? 0) === 0;
  const Arrow = isZero ? Minus : (isPos ? ArrowUpRight : ArrowDownRight);
  const trendPositive = invertTrend ? !isPos : isPos;
  
  let trendClass = "text-slate-600 bg-slate-50 border-slate-200"; // Neutral
  if (!isZero) {
    trendClass = trendPositive
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-rose-700 bg-rose-50 border-rose-200";
  }

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl transition-colors duration-200 ${compact ? "p-4" : "p-5"} ${styles.hover}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${styles.label}`}>
          {label}
        </p>
        <div className={`p-2 rounded-xl shrink-0 border ${styles.iconWrap}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={compact ? "mt-2" : "mt-3"}>
        <h3 className={`font-bold text-slate-900 tabular-nums ${compact ? "text-lg" : "text-2xl"}`}>
          {value}
        </h3>
        {showTrend && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${trendClass}`}
            >
              <Arrow className="w-3 h-3" /> {Math.abs(score!)}%
            </span>
            <span className="text-slate-500 text-[10px]">önceki döneme göre</span>
          </div>
        )}
      </div>
    </div>
  );
}

