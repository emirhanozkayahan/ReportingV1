import type { ReactNode } from "react";

type StatItemProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
};

export default function StatItem({
  label,
  value,
  valueClassName = "text-slate-900",
  className = "",
}: StatItemProps) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`text-sm font-semibold mt-1 tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
