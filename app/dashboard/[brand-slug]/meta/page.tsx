import MetaAdsClient from "./meta-client";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MetaAdsPage({
  params,
}: {
  params: Promise<{ "brand-slug": string }>;
}) {
  const { "brand-slug": slug } = await params;

  let brand: { id: string; name: string; slug: string } | null = null;
  let metaConfigured = false;

  try {
    if (supabaseAdmin) {
      const { data: dbBrand, error } = await supabaseAdmin
        .from("brands")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();

      if (dbBrand && !error) {
        brand = dbBrand;

        const { data: metaIntegrations } = await supabaseAdmin
          .from("integrations")
          .select("credentials")
          .eq("brand_id", dbBrand.id)
          .eq("platform", "meta")
          .limit(1);

        const creds = metaIntegrations?.[0]?.credentials as {
          adAccountId?: string;
          accessToken?: string;
        } | null;
        metaConfigured = Boolean(
          creds?.adAccountId?.trim() && creds?.accessToken?.trim()
        );
      }
    }
  } catch (err) {
    console.warn("Meta page Supabase hatası:", err);
  }

  if (!brand) {
    const mockBrands = [
      { id: "1", name: "Navira", slug: "navira" },
      { id: "2", name: "Banamio", slug: "banamio" },
      { id: "3", name: "Efotech", slug: "efotech" },
    ];
    brand = mockBrands.find((b) => b.slug === slug) ?? null;
    if (!brand) notFound();
  }

  return (
    <MetaAdsClient brand={brand} metaConfigured={metaConfigured} />
  );
}
