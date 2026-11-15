import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (supabase) {
      // Önce brand_users tablosunda kullanıcıyı ara
      const { data: user, error: userError } = await supabase
        .from('brand_users')
        .select('brand_id')
        .eq('email', cleanEmail)
        .eq('password', cleanPassword)
        .single();

      if (user && !userError) {
        // Kullanıcının ait olduğu markayı bul
        const { data: brand, error: brandError } = await supabase
          .from('brands')
          .select('slug')
          .eq('id', user.brand_id)
          .single();

        if (brand && !brandError) {
          const cookieStore = await cookies();

          // Tek oturum çerezi: müşteri girişi olası admin oturumunun yerine geçer,
          // böylece admin hesabıyla test eden kişi kendini tam olarak müşteri gibi görür.
          const { token, maxAge } = createSessionToken({ role: 'brand', slug: brand.slug });
          cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));

          return NextResponse.json({ success: true, redirect: `/dashboard/${brand.slug}` });
        }
      }
    }

    return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
  } catch (err) {
    console.error('Client login error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
