import { notFound } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { supabaseAdmin } from "@/lib/supabase";
import { generateMockData } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DashboardPage({ params }: { params: Promise<{ "brand-slug": string }> }) {
  const { "brand-slug": slug } = await params;
  
  let brand: any = null;
  let salesData: any[] = [];
  let adData: any[] = [];
  let isMocked = false;

  try {
    if (supabaseAdmin) {
      // 1. Markayı bul
      const { data: dbBrand, error: brandErr } = await supabaseAdmin
        .from('brands')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

      if (dbBrand && !brandErr) {
        brand = dbBrand;

        // 2. Son 365 günlük satış verileri
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 365);
        const startDate = daysAgo.toISOString().split('T')[0];

        const { data: sales } = await supabaseAdmin
          .from('daily_sales')
          .select('*')
          .eq('brand_id', brand.id)
          .gte('date', startDate)
          .order('date', { ascending: true });

        salesData = sales || [];

        // 3. Son 365 günlük reklam verileri
        const { data: ads } = await supabaseAdmin
          .from('daily_ad_stats')
          .select('*')
          .eq('brand_id', brand.id)
          .gte('date', startDate)
          .order('date', { ascending: true });

        adData = ads || [];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch hatası, mock'a düşülüyor:", err);
  }

  // Mock fallback
  if (!brand) {
    // Mock brands'den bul
    const mockBrands = [
      { id: '1', name: 'Navira', slug: 'navira' },
      { id: '2', name: 'Banamio', slug: 'banamio' },
      { id: '3', name: 'Efotech', slug: 'efotech' },
    ];
    brand = mockBrands.find(b => b.slug === slug);
    if (!brand) notFound();
    isMocked = true;
  }

  // Ham veride eleman yoksa Mock olarak işaretle (Client render sırasında mock veriyi üretecek)
  if (salesData.length === 0 && adData.length === 0) {
    isMocked = true;
  }

  return (
    <DashboardClient brand={brand} salesData={salesData} adData={adData} isMocked={isMocked} />
  );
}


