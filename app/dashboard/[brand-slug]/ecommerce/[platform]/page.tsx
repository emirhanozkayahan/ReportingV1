import { notFound } from "next/navigation";
import EcommerceClient from "./ecommerce-client";
import { supabaseAdmin } from "@/lib/supabase";
import { ECOMMERCE_PLATFORM_IDS } from "@/lib/admin-platforms";
import type { DailyProductSaleRow, DailySaleRow } from "@/lib/ecommerce-builder";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EcommercePage({
  params,
}: {
  params: Promise<{ "brand-slug": string; platform: string }>;
}) {
  const { "brand-slug": slug, platform } = await params;

  if (!ECOMMERCE_PLATFORM_IDS.has(platform)) {
    notFound();
  }

  let brand: { id: string; name: string; slug: string } | null = null;
  let salesData: DailySaleRow[] = [];
  let productSalesData: DailyProductSaleRow[] = [];
  let isMocked = false;

  try {
    if (supabaseAdmin) {
      const { data: dbBrand, error: brandErr } = await supabaseAdmin
        .from("brands")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();

      if (dbBrand && !brandErr) {
        const { data: integration } = await supabaseAdmin
          .from("integrations")
          .select("platform")
          .eq("brand_id", dbBrand.id)
          .eq("platform", platform)
          .maybeSingle();

        if (!integration) {
          notFound();
        }

        brand = dbBrand;

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 365);
        const startDate = daysAgo.toISOString().split("T")[0];

        const { data: sales } = await supabaseAdmin
          .from("daily_sales")
          .select("*")
          .eq("brand_id", brand.id)
          .eq("platform", platform)
          .gte("date", startDate)
          .order("date", { ascending: true });

        salesData = (sales ?? []) as DailySaleRow[];

        const { data: products } = await supabaseAdmin
          .from("daily_product_sales")
          .select("*")
          .eq("brand_id", brand.id)
          .eq("platform", platform)
          .gte("date", startDate)
          .order("date", { ascending: true });

        productSalesData = (products ?? []) as DailyProductSaleRow[];
      }
    }
  } catch (err) {
    console.warn("E-commerce page Supabase hatası:", err);
  }

  if (!brand) {
    const mockBrands = [
      { id: "1", name: "Navira", slug: "navira" },
      { id: "2", name: "Banamio", slug: "banamio" },
      { id: "3", name: "Efotech", slug: "efotech" },
    ];
    brand = mockBrands.find((b) => b.slug === slug) ?? null;
    if (!brand) notFound();
    isMocked = true;
  }

  if (!isMocked && salesData.length === 0) {
    isMocked = true;
  }

  return (
    <EcommerceClient
      brand={brand}
      platform={platform}
      salesData={salesData}
      productSalesData={productSalesData}
      isMocked={isMocked}
    />
  );
}
