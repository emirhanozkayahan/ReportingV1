import {
  Store,
  Globe,
  Layers,
  Settings,
  ShoppingCart,
  ShoppingBag,
  Package,
  Box,
  LineChart,
  Search,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = "ecommerce" | "ads" | "management";

export type PlatformItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: "platform" | "link";
};

export const PLATFORM_GROUPS: {
  id: CategoryId;
  label: string;
  items: PlatformItem[];
}[] = [
  {
    id: "ecommerce",
    label: "E-ticaret",
    items: [
      { id: "ikas", label: "İkas", icon: Store },
      { id: "shopify", label: "Shopify", icon: ShoppingCart },
      { id: "tsoft", label: "T-Soft", icon: ShoppingBag },
      { id: "ticimax", label: "Ticimax", icon: Package },
      { id: "wordpress", label: "WordPress", icon: Globe },
      { id: "ideasoft", label: "İdeasoft", icon: Box },
      { id: "faprika", label: "Faprika", icon: Store },
    ],
  },
  {
    id: "ads",
    label: "Reklam",
    items: [
      { id: "google", label: "Google Ads", icon: Globe },
      { id: "google_analytics", label: "Analytics", icon: LineChart },
      { id: "meta", label: "Meta Ads", icon: Layers },
    ],
  },
  {
    id: "management",
    label: "Yönetim",
    items: [
      { id: "brand_settings", label: "Marka Ayarları", icon: Settings },
      { id: "seo_report", label: "SEO Raporu", icon: Search, type: "link" },
    ],
  },
];

export const PLATFORM_TO_CATEGORY: Record<string, CategoryId> = Object.fromEntries(
  PLATFORM_GROUPS.flatMap((group) => group.items.map((item) => [item.id, group.id]))
) as Record<string, CategoryId>;

export function getPlatformLabel(platformId: string): string {
  for (const group of PLATFORM_GROUPS) {
    const item = group.items.find((p) => p.id === platformId);
    if (item) return item.label;
  }
  return platformId;
}

export const ECOMMERCE_PLATFORM_IDS = new Set(
  PLATFORM_GROUPS.find((g) => g.id === "ecommerce")!.items.map((item) => item.id)
);

export function getEcommercePlatformItem(platformId: string): PlatformItem | undefined {
  return PLATFORM_GROUPS.find((g) => g.id === "ecommerce")?.items.find((p) => p.id === platformId);
}
