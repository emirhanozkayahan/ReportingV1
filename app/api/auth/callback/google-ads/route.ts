import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin?google_ads_error=true', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback/google-ads`;

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/admin?google_ads_error=missing_keys', request.url));
  }

  try {
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
      console.error('Google Ads token error:', data);
      return NextResponse.redirect(new URL('/admin?google_ads_error=token_failed', request.url));
    }

    if (data.refresh_token) {
      if (supabaseAdmin) {
        const { data: existing } = await supabaseAdmin
          .from('agency_settings')
          .select('id')
          .eq('key', 'google_ads_refresh_token')
          .single();

        if (existing) {
          await supabaseAdmin
            .from('agency_settings')
            .update({ value: data.refresh_token })
            .eq('id', existing.id);
        } else {
          await supabaseAdmin
            .from('agency_settings')
            .insert([{ key: 'google_ads_refresh_token', value: data.refresh_token }]);
        }
      }
      return NextResponse.redirect(new URL('/admin?google_ads_success=true', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin?google_ads_error=no_refresh_token', request.url));
    }
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/admin?google_ads_error=exception', request.url));
  }
}
