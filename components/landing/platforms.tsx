import { MetaLogo, GoogleAdsLogo, GoogleAnalyticsLogo } from "@/components/platform-nav-icons";
import { EcommercePlatformIcon } from "@/components/ecommerce-platform-icon";

export type PlatformCategory = "Reklam" | "E-ticaret" | "Analitik";

export type Platform = {
  id: string;
  name: string;
  category: PlatformCategory;
};

export const PLATFORMS: Platform[] = [
  { id: "meta", name: "Meta Ads", category: "Reklam" },
  { id: "google-ads", name: "Google Ads", category: "Reklam" },
  { id: "ga4", name: "Google Analytics 4", category: "Analitik" },
  { id: "ikas", name: "ikas", category: "E-ticaret" },
  { id: "shopify", name: "Shopify", category: "E-ticaret" },
  { id: "tsoft", name: "T-Soft", category: "E-ticaret" },
  { id: "ticimax", name: "Ticimax", category: "E-ticaret" },
  { id: "ideasoft", name: "IdeaSoft", category: "E-ticaret" },
  { id: "wordpress", name: "WooCommerce", category: "E-ticaret" },
];

/** Decorative logo glyph; the platform name is always rendered as text next to it. */
export function PlatformIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  switch (id) {
    case "meta":
      return <MetaLogo colored className={className} />;
    case "google-ads":
      return <GoogleAdsLogo colored className={className} />;
    case "ga4":
      return <GoogleAnalyticsLogo colored className={className} />;
    default:
      return <EcommercePlatformIcon platformId={id} className={className} />;
  }
}
