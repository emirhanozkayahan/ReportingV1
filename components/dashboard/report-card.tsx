import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ReportAccent =
  | "brand"
  | "emerald"
  | "blue"
  | "orange"
  | "violet"
  | "amber"
  | "rose"
  | "indigo";

const accentStyles: Record<
  ReportAccent,
  { label: string; iconWrap: string; hover: string }
> = {
  brand: {
    label: "text-[#D93635]",
    iconWrap: "bg-[#F5403F]/8 text-[#F5403F] border-[#F5403F]/15",
    hover: "hover:border-[#F5403F]/25 hover:bg-[#F5403F]/[0.02]",
  },
  emerald: {
    label: "text-emerald-700",
    iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/30",
  },
  blue: {
    label: "text-blue-700",
    iconWrap: "bg-blue-50 text-blue-600 border-blue-100",
    hover: "hover:border-blue-200 hover:bg-blue-50/30",
  },
  orange: {
    label: "text-orange-700",
    iconWrap: "bg-orange-50 text-orange-600 border-orange-100",
    hover: "hover:border-orange-200 hover:bg-orange-50/30",
  },
  violet: {
    label: "text-violet-700",
    iconWrap: "bg-violet-50 text-violet-600 border-violet-100",
    hover: "hover:border-violet-200 hover:bg-violet-50/30",
  },
  amber: {
    label: "text-amber-700",
    iconWrap: "bg-amber-50 text-amber-600 border-amber-100",
    hover: "hover:border-amber-200 hover:bg-amber-50/30",
  },
  rose: {
    label: "text-rose-700",
    iconWrap: "bg-rose-50 text-rose-600 border-rose-100",
    hover: "hover:border-rose-200 hover:bg-rose-50/30",
  },
  indigo: {
    label: "text-indigo-700",
    iconWrap: "bg-indigo-50 text-indigo-600 border-indigo-100",
    hover: "hover:border-indigo-200 hover:bg-indigo-50/30",
  },
};

type ReportCardProps = {
  label: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  accent?: ReportAccent;
  className?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function SectionHeading({
  title,
  description,
  icon: Icon,
  accent = "brand",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  accent?: ReportAccent;
}) {
  const styles = accentStyles[accent];

  return (
    <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-900/[0.03]">
      <div className={`p-2.5 rounded-xl border shrink-0 ${styles.iconWrap}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function ReportCard({
  label,
  title,
  description,
  icon: Icon,
  accent = "brand",
  className = "",
  headerExtra,
  children,
}: ReportCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl transition-colors duration-200 ${styles.hover} ${className}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${styles.label}`}>
              {label}
            </p>
            <div className="flex items-center gap-2.5 mt-2">
              <div className={`p-2 rounded-xl border shrink-0 ${styles.iconWrap}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
              </div>
            </div>
          </div>
          {headerExtra}
        </div>
        {children}
      </div>
    </div>
  );
}
