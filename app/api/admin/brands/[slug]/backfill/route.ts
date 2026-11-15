import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SyncEngine } from "@/lib/sync/engine";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const daysToLookBack = body.days || 365;
    const startOffset = body.startOffset || 0;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Veritabanı bağlantısı yok" },
        { status: 500 }
      );
    }

    // 1. Markayı bul
    const { data: brand, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .single();

    if (brandErr || !brand) {
      return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });
    }

    // 2. Senkronizasyon Motorunu Çalıştır
    const engine = new SyncEngine();
    
    // Background execution since 365 days takes a long time
    // We don't await it so we don't timeout the immediate response
    // Vercel might kill the process after response on Hobby plan, but it's the best we can do without a task queue
    // To make it safer on Vercel, we should actually await it but rely on maxDuration
    
    const result = await engine.runHistorySyncForBrand(brand.id, daysToLookBack, startOffset);

    if (!result.success) {
       return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${daysToLookBack} günlük geçmiş başarıyla aktarıldı.` });
  } catch (error: any) {
    console.error("Backfill Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
