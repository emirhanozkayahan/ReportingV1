"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  PLATFORM_GROUPS,
  PLATFORM_TO_CATEGORY,
  type CategoryId,
} from "@/lib/admin-platforms";
import { EcommercePlatformIcon } from "@/components/ecommerce-platform-icon";

type AdminPlatformNavProps = {
  selectedPlatform: string;
  onSelectPlatform: (platformId: string) => void;
  brandSlug?: string;
};

function defaultOpenGroups(selectedPlatform: string): Record<CategoryId, boolean> {
  const activeCategory = PLATFORM_TO_CATEGORY[selectedPlatform];
  return {
    ecommerce: activeCategory === "ecommerce" || !activeCategory,
    ads: activeCategory === "ads",
    management: activeCategory === "management",
  };
}

export default function AdminPlatformNav({
  selectedPlatform,
  onSelectPlatform,
  brandSlug,
}: AdminPlatformNavProps) {
  const [openGroups, setOpenGroups] = useState<Record<CategoryId, boolean>>(() =>
    defaultOpenGroups(selectedPlatform)
  );

  useEffect(() => {
    const activeCategory = PLATFORM_TO_CATEGORY[selectedPlatform];
    if (activeCategory) {
      setOpenGroups((prev) => ({ ...prev, [activeCategory]: true }));
    }
  }, [selectedPlatform]);

  const toggleGroup = (groupId: CategoryId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <nav className="space-y-2">
      {PLATFORM_GROUPS.map((group) => {
        const isOpen = openGroups[group.id];
        const hasActiveItem = group.items.some((item) => item.id === selectedPlatform);

        return (
          <div
            key={group.id}
            className={`rounded-xl border transition-colors ${
              hasActiveItem ? "border-[#F5403F]/20 bg-[#F5403F]/[0.03]" : "border-slate-200/80 bg-slate-50/50"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  hasActiveItem ? "text-[#F5403F]" : "text-slate-600"
                }`}
              >
                {group.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-2 pb-2 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedPlatform === item.id;
                  const isEcommerce = group.id === "ecommerce";

                  if (item.type === "link") {
                    const href = brandSlug ? `/admin/seo-report/${brandSlug}` : "#";
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0 text-slate-500 group-hover:text-slate-700" />
                        <span className="flex-1 truncate">{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectPlatform(item.id)}
                      className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all border ${
                        isActive
                          ? "bg-[#F5403F]/12 text-[#F5403F] border-[#F5403F]/25 shadow-sm shadow-[#F5403F]/10"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white hover:border-slate-200 border-transparent"
                      }`}
                    >
                      {isEcommerce ? (
                        <EcommercePlatformIcon
                          platformId={item.id}
                          className="w-[18px] h-[18px] shrink-0"
                          bordered={isActive}
                        />
                      ) : (
                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isActive ? "text-[#F5403F]" : "text-slate-500 group-hover:text-slate-700"
                          }`}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
