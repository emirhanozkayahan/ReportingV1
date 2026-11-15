import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { isAgencySession as checkAuth } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const brand_id = searchParams.get('brand_id');
  const id = searchParams.get('id');

  if (supabase) {
    if (id) {
      const { data, error } = await supabase
        .from('brand_users')
        .select('id, email, password')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    if (!brand_id) {
      return NextResponse.json({ error: 'Marka ID gerekli' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('brand_users')
      .select('id, email, brand_id, created_at')
      .eq('brand_id', brand_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  try {
    const { brand_id, email, password } = await request.json();

    if (!brand_id || !email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi girdiniz' }, { status: 400 });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('brand_users')
        .insert([{ brand_id, email, password }])
        .select('id, email, brand_id, created_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'Kullanıcı ID ve yeni şifre gerekli' }, { status: 400 });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('brand_users')
        .update({ password })
        .eq('id', id)
        .select('id, email, brand_id, created_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
  }

  if (supabase) {
    const { error } = await supabase
      .from('brand_users')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
}
