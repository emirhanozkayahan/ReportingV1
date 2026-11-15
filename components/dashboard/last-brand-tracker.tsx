"use client";

import { useEffect } from "react";

const LAST_BRAND_KEY = "agency_last_brand_slug";

export default function LastBrandTracker({ slug }: { slug: string }) {
  useEffect(() => {
    localStorage.setItem(LAST_BRAND_KEY, slug);
  }, [slug]);

  return null;
}
