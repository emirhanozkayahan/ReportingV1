import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { MetaService } from "@/lib/meta/service";
import { getMetaDateRange } from "@/lib/meta/date-range";
import { buildMetaReportFromApi } from "@/lib/meta/build-report";
import {
  sanitizeMetaAccessToken,
  sanitizeMetaAdAccountId,
} from "@/lib/meta/sanitize-credentials";

export const dynamic = "force-dynamic";

/**
 * GET /api/brands/[slug]/meta?dateRange=30d
 * Admin'de kayıtlı Meta entegrasyonu ile canlı rapor verisi.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase yapılandırılmamış", isLive: false },
        { status: 500 }
      );
    }

    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (brandErr || !brand) {
      return NextResponse.json({ error: "Marka bulunamadı", isLive: false }, { status: 404 });
    }

    const { data: integrations, error: intErr } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("platform", "meta");

    if (intErr) {
      return NextResponse.json({ error: intErr.message, isLive: false }, { status: 500 });
    }

    const integration = integrations?.[0];
    const creds = integration?.credentials as {
      adAccountId?: string;
      accessToken?: string;
    } | null;

    const adAccountId = sanitizeMetaAdAccountId(creds?.adAccountId);
    const accessToken = sanitizeMetaAccessToken(creds?.accessToken);

    if (!adAccountId || !accessToken) {
      return NextResponse.json(
        {
          error: "Meta entegrasyonu yok. Admin panelden Ad Account ID ve token kaydedin.",
          isLive: false,
        },
        { status: 404 }
      );
    }

    const { since, until } = getMetaDateRange(dateRange);
    const meta = new MetaService(accessToken);

    const [campaigns, daily, adsets, ads, placements, hourly, gender] = await Promise.all([
      meta.getCampaignStatsForRange(adAccountId, since, until),
      meta.getDailyAccountInsights(adAccountId, since, until),
      meta.getAdSetStatsForRange(adAccountId, since, until),
      meta.getAdStatsForRange(adAccountId, since, until),
      meta.getPlacementStatsForRange(adAccountId, since, until),
      meta.getHourlyStatsForRange(adAccountId, since, until),
      meta.getGenderStatsForRange(adAccountId, since, until),
    ]);

    const report = buildMetaReportFromApi(campaigns, daily, adsets, ads, placements, hourly, gender);

    return NextResponse.json({
      isLive: true,
      dateRange,
      since,
      until,
      adAccountId: creds?.adAccountId,
      ...report,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Meta verisi alınamadı";
    console.error("[Meta API]", message);
    return NextResponse.json({ error: message, isLive: false }, { status: 500 });
  }
}
