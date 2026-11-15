import GoogleAdsClient from "./google-client";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GoogleAdsPage({ params }: { params: Promise<{ "brand-slug": string }> }) {
  const { "brand-slug": slug } = await params;

  let brand: { id: string; name: string; slug: string } | null = null;

  try {
    if (supabaseAdmin) {
      const { data: dbBrand, error } = await supabaseAdmin
        .from("brands")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();
      if (dbBrand && !error) brand = dbBrand;
    }
  } catch (err) {
    console.warn("Google page Supabase hatası:", err);
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
    <div className="p-4 md:p-8">
      <GoogleAdsClient brand={brand} />
    </div>
  );
}
