import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

/**
 * GET /api/admin/brands
 * Tüm markaları listeler.
 */
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı (.env eksik)' }, { status: 500 });
    }

    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url, ga4_property_id, created_at')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userCountByBrand: Record<string, number> = {};
    const { data: brandUsers } = await supabase.from('brand_users').select('brand_id');

    (brandUsers || []).forEach((row) => {
      userCountByBrand[row.brand_id] = (userCountByBrand[row.brand_id] || 0) + 1;
    });

    const safeBrands = (brands || []).map((brand) => ({
      ...brand,
      user_count: userCountByBrand[brand.id] || 0,
    }));

    return NextResponse.json(safeBrands);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/brands
 * Yeni marka ekler.
 */
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });
    }

    const body = await request.json();
    const { name, slug, client_email, client_password, logo_url, ga4_property_id } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Marka ismi ve slug alanları zorunludur.' }, { status: 400 });
    }

    // Markayı veritabanına ekle
    const { data, error } = await supabase
      .from('brands')
      .insert([{ name, slug, client_email, client_password, logo_url, ga4_property_id }])
      .select()
      .single();

    if (error) {
      // Benzersiz alan hatası kontrolü (Unique constraint)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu marka adı veya slug değeri zaten kullanımda.' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, brand: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/brands
 * Markayı günceller (Örn: şifre değiştirme).
 */
export async function PATCH(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });

    const body = await request.json();
    const { id, logo_url, ga4_property_id } = body;

    if (!id) return NextResponse.json({ error: 'Marka ID gerekli.' }, { status: 400 });

    const { data, error } = await supabase
      .from('brands')
      .update({ logo_url, ga4_property_id })
      .eq('id', id)
      .select('id, name, slug, logo_url, ga4_property_id, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, brand: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/brands
 * Markayı siler.
 */
export async function DELETE(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Marka ID gerekli.' }, { status: 400 });

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
