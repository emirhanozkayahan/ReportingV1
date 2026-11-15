import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminCredentials,
} from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir' }, { status: 400 });
    }

    const cookieStore = await cookies();

    // 1. Ajans (admin) girişi — ADMIN_EMAILS + ADMIN_PASSWORD_HASH
    if (verifyAdminCredentials(email, password)) {
      const { token, maxAge } = createSessionToken({ role: 'agency', email: email.trim().toLowerCase() });
      cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }

    // 2. Marka (müşteri) girişi — brands.client_email / client_password
    if (supabase) {
      const { data: brand, error } = await supabase
        .from('brands')
        .select('slug')
        .eq('client_email', email)
        .eq('client_password', password)
        .single();

      if (brand && !error) {
        const { token, maxAge } = createSessionToken({ role: 'brand', slug: brand.slug });
        cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
        return NextResponse.json({ success: true, redirect: `/dashboard/${brand.slug}` });
      }
    }

    return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
