"use client";

import { RefreshCw } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description?: string;
  loadingBrandSync?: boolean;
  onTriggerBrandSync?: () => void;
  showBrandSync?: boolean;
};

export default function AdminHeader({
  title,
  description,
  loadingBrandSync = false,
  onTriggerBrandSync,
  showBrandSync = false,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-xl">{description}</p>
        )}
      </div>

      {showBrandSync && onTriggerBrandSync && (
        <button
          type="button"
          onClick={onTriggerBrandSync}
          disabled={loadingBrandSync}
          title="Bu markanın son 30 günlük verilerini eşitle"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-[#F5403F] shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50 shrink-0 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loadingBrandSync ? "animate-spin" : ""}`} />
          {loadingBrandSync ? "Eşitleniyor..." : "Markayı Eşitle"}
        </button>
      )}
    </div>
  );
}
