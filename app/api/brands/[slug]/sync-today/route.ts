import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SyncEngine } from "@/lib/sync/engine";
import { getGa4DateRange } from "@/lib/date-range";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") === "yesterday" ? "yesterday" : "today";

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Veritabanı bağlantısı yok" },
        { status: 500 }
      );
    }

    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .single();

    if (brandErr || !brand) {
      return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });
    }

    const syncDateStr = getGa4DateRange(period).startDate;

    const engine = new SyncEngine();
    const result = await engine.runHistorySyncForBrand(brand.id, 3);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { data: sales } = await supabaseAdmin
      .from("daily_sales")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("date", syncDateStr);

    const { data: ads } = await supabaseAdmin
      .from("daily_ad_stats")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("date", syncDateStr);

    return NextResponse.json({
      success: true,
      period,
      syncDate: syncDateStr,
      sales: sales || [],
      ads: ads || [],
    });
  } catch (error: any) {
    console.error("Sync Today Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
