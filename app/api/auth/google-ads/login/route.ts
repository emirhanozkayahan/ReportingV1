import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback/google-ads`;

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_ADS_CLIENT_ID tanımlı değil.' }, { status: 500 });
  }

  // Google OAuth URL oluştur
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  // Sadece Google Ads yetkisi
  const scopes = [
    'https://www.googleapis.com/auth/adwords'
  ].join(' ');
  
  authUrl.searchParams.append('scope', scopes);

  return NextResponse.redirect(authUrl.toString());
}
