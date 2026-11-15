import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase';

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
          
          // Müşteri girişi yapıldığında, olası eski Admin yetkisini browser'dan sil.
          // Böylece admin hesabıyla test eden kişi de kendini tam olarak bir müşteri gibi görür.
          cookieStore.delete('agency_auth');

          cookieStore.set('brand_auth', brand.slug, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 gün boyunca hatırla
          });

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
