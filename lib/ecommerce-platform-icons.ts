export const ECOMMERCE_PLATFORM_ICON_SRC: Record<string, string> = {
  ikas: "/platforms/ikas.png",
  shopify: "/platforms/shopify.ico",
  tsoft: "/platforms/tsoft.ico",
  ticimax: "/platforms/ticimax.png",
  wordpress: "/platforms/wordpress.ico",
  ideasoft: "/platforms/ideasoft.svg",
  faprika: "/platforms/faprika.svg",
};

export function getEcommercePlatformIconSrc(platformId: string): string | undefined {
  return ECOMMERCE_PLATFORM_ICON_SRC[platformId];
}

export function hasEcommercePlatformIcon(platformId: string): boolean {
  return platformId in ECOMMERCE_PLATFORM_ICON_SRC;
}
