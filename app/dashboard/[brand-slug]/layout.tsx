import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardSidebar from "@/components/dashboard-sidebar";
import LastBrandTracker from "@/components/dashboard/last-brand-tracker";
import { isAgencySession } from "@/lib/auth";
import { ECOMMERCE_PLATFORM_IDS } from "@/lib/admin-platforms";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "brand-slug": string }>;
}) {
  const { "brand-slug": slug } = await params;

  let brand: any = null;
  let isMocked = false;
  let ecommercePlatforms: string[] = [];

  try {
    if (supabaseAdmin) {
      const { data: dbBrand, error: brandErr } = await supabaseAdmin
        .from("brands")
        .select("id, name, slug, logo_url")
        .eq("slug", slug)
        .single();

      if (dbBrand && !brandErr) {
        brand = dbBrand;

        const { data: integrations } = await supabaseAdmin
          .from("integrations")
          .select("platform")
          .eq("brand_id", dbBrand.id);

        ecommercePlatforms = (integrations ?? [])
          .map((row) => row.platform)
          .filter((platform): platform is string => ECOMMERCE_PLATFORM_IDS.has(platform));
      }
    }
  } catch (err) {
    console.warn("Layout Supabase hatası:", err);
  }

  if (!brand) {
    const mockBrands = [
      { id: "1", name: "Navira", slug: "navira" },
      { id: "2", name: "Banamio", slug: "banamio" },
      { id: "3", name: "Efotech", slug: "efotech" },
    ];
    brand = mockBrands.find((b) => b.slug === slug);
    if (!brand) notFound();
    isMocked = true;
  }

  const isAgency = await isAgencySession();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LastBrandTracker slug={slug} />
      <DashboardSidebar
        brandSlug={slug}
        brandName={brand.name}
        brandLogo={brand.logo_url}
        isMocked={isMocked}
        isAgency={isAgency}
        ecommercePlatforms={ecommercePlatforms}
      />
      {/* Main content area offset by sidebar width */}
      <div className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
