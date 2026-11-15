import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ slug: string }>
}

/**
 * Belirli bir markanın günlük satış ve reklam verilerini döner.
 * GET /api/brands/[slug]/stats?days=30
 */
export async function GET(request: Request, { params }: Props) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase bağlantısı yapılandırılmamış' }, { status: 500 });
  }

  const { slug } = await params;
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  // 1. Markayı bul
  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (brandErr || !brand) {
    return NextResponse.json({ error: 'Marka bulunamadı' }, { status: 404 });
  }

  // 2. Tarih aralığı
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  // 3. Satış verileri
  const { data: sales, error: salesErr } = await supabase
    .from('daily_sales')
    .select('*')
    .eq('brand_id', brand.id)
    .gte('date', startStr)
    .order('date', { ascending: true });

  // 4. Reklam verileri
  const { data: ads, error: adsErr } = await supabase
    .from('daily_ad_stats')
    .select('*')
    .eq('brand_id', brand.id)
    .gte('date', startStr)
    .order('date', { ascending: true });

  if (salesErr || adsErr) {
    return NextResponse.json({ error: 'Veri çekilemedi' }, { status: 500 });
  }

  return NextResponse.json({
    brand,
    sales: sales || [],
    ads: ads || [],
  });
}
