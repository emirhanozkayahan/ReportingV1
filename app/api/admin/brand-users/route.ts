import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { isAgencySession as checkAuth } from '@/lib/auth';
import { MIN_PASSWORD_LENGTH, hashPassword } from '@/lib/password';

// Şifreler hash'li saklanır; hiçbir uç nokta şifre ya da hash döndürmez.
const PUBLIC_COLUMNS = 'id, email, brand_id, created_at';

function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.trim().length < MIN_PASSWORD_LENGTH) {
    return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
  }
  return null;
}

export async function GET(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const brand_id = searchParams.get('brand_id');

  if (!supabase) return NextResponse.json([]);
  if (!brand_id) {
    return NextResponse.json({ error: 'Marka ID gerekli' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('brand_users')
    .select(PUBLIC_COLUMNS)
    .eq('brand_id', brand_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  try {
    const { brand_id, email, password } = await request.json();

    if (!brand_id || !email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi girdiniz' }, { status: 400 });
    }
    const pwError = passwordError(password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('brand_users')
      .insert([{
        brand_id,
        email: String(email).trim().toLowerCase(),
        password_hash: hashPassword(password.trim()),
      }])
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch {
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
    const pwError = passwordError(password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('brand_users')
      .update({ password_hash: hashPassword(password.trim()) })
      .eq('id', id)
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
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

  if (!supabase) {
    return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
  }

  const { error } = await supabase.from('brand_users').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
