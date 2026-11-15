import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import AgencyDashboardClient from "@/components/dashboard/agency-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AgencyDashboard() {
  let brands: { id: string; name: string; slug: string; logo_url?: string }[] = [];
  let isMocked = false;

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("brands")
        .select("id, name, slug, logo_url")
        .order("name");

      if (!error && data) {
        brands = data;
      }
    }
  } catch (err) {
    console.error("Supabase'e ulaşılamadı:", err);
  }

  const hasRealData = brands.length > 0;

  if (!hasRealData) {
    return (
      <AgencyDashboardClient
        initialBrands={[]}
        isEmpty
      />
    );
  }

  if (brands.length === 1) {
    redirect(`/dashboard/${brands[0].slug}`);
  }

  return (
    <AgencyDashboardClient
      initialBrands={brands}
      isMocked={isMocked}
    />
  );
}
