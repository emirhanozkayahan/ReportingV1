import { Store } from "lucide-react";
import { getEcommercePlatformIconSrc } from "@/lib/ecommerce-platform-icons";

type EcommercePlatformIconProps = {
  platformId: string;
  className?: string;
  colored?: boolean;
  bordered?: boolean;
};

export function EcommercePlatformIcon({
  platformId,
  className = "w-[18px] h-[18px]",
  bordered,
}: EcommercePlatformIconProps) {
  const src = getEcommercePlatformIconSrc(platformId);

  const img = src ? (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={bordered ? "w-[58%] h-[58%] object-contain" : `${className} object-contain`}
      draggable={false}
    />
  ) : (
    <Store className={className} aria-hidden="true" />
  );

  if (!bordered) return img;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {img}
    </span>
  );
}
