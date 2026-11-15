import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyBrandUser } from '@/lib/brand-login';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir' }, { status: 400 });
    }

    const slug = await verifyBrandUser(email, password.trim());
    if (!slug) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }

    // Tek oturum çerezi: müşteri girişi olası admin oturumunun yerine geçer,
    // böylece admin hesabıyla test eden kişi kendini tam olarak müşteri gibi görür.
    const cookieStore = await cookies();
    const { token, maxAge } = createSessionToken({ role: 'brand', slug });
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));

    return NextResponse.json({ success: true, redirect: `/dashboard/${slug}` });
  } catch (err) {
    console.error('Client login error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
