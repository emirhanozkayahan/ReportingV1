import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin?google_error=true', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/admin?google_error=missing_keys', request.url));
  }

  try {
    // Kodu refresh token ile değiştir
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      console.error('Google token error:', data);
      return NextResponse.redirect(new URL('/admin?google_error=token_failed', request.url));
    }

    // Refresh token geldi mi?
    if (data.refresh_token) {
      // Supabase'e kaydet
      if (supabaseAdmin) {
        // Önce var mı diye kontrol et, varsa güncelle
        const { data: existing } = await supabaseAdmin
          .from('agency_settings')
          .select('id')
          .eq('key', 'google_refresh_token')
          .single();

        if (existing) {
          await supabaseAdmin
            .from('agency_settings')
            .update({ value: data.refresh_token })
            .eq('id', existing.id);
        } else {
          await supabaseAdmin
            .from('agency_settings')
            .insert([{ key: 'google_refresh_token', value: data.refresh_token }]);
        }
      }
      return NextResponse.redirect(new URL('/admin?google_success=true', request.url));
    } else {
      // Kullanıcı consent ekranını daha önce onayladığı için refresh token gelmemiş olabilir
      // Bu durumda prompt=consent kullandığımız için genelde gelir ama gelmezse hata ver.
      return NextResponse.redirect(new URL('/admin?google_error=no_refresh_token', request.url));
    }
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/admin?google_error=exception', request.url));
  }
}
