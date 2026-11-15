import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Dummy users as requested
const USERS = [
  { email: 'info@veritasdijital.com', password: 'password123' },
  { email: 'emirhan@veritasdijital.com', password: 'password123' },
  { email: 'ege@veritasdijital.com', password: 'password123' },
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Admin Kontrolü
    const adminUser = USERS.find(u => u.email === email && u.password === password);

    if (adminUser) {
      const cookieStore = await cookies();
      cookieStore.set('agency_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }

    // 2. Marka (Müşteri) Kontrolü
    if (supabase) {
      const { data: brand, error } = await supabase
        .from('brands')
        .select('slug')
        .eq('client_email', email)
        .eq('client_password', password)
        .single();

      if (brand && !error) {
        // Müşteri için farklı bir cookie set edelim
        const cookieStore = await cookies();
        cookieStore.set('brand_auth', brand.slug, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 1 ay
        });
        return NextResponse.json({ success: true, redirect: `/dashboard/${brand.slug}` });
      }
    }

    return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
