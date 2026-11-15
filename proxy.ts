import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, canAccessBrand, verifySessionToken, type Session } from '@/lib/session';

/**
 * Access rules
 *
 * Pages
 *   /, /login                         public
 *   /dashboard, /admin/*              agency
 *   /dashboard/<slug>/*               agency, or the brand <slug>
 *
 * API
 *   /api/auth/login|client-login|logout   public
 *   /api/cron/*                           public here; route checks CRON_SECRET
 *   /api/brands/<slug>/*                  agency, or the brand <slug>
 *   /api/ads/google-live?slug=            agency, or the brand in ?slug
 *   /api/analytics/*?slug=                agency, or the brand in ?slug
 *   /api/chat                             any signed-in user
 *   everything else under /api            agency
 */

const PUBLIC_API = new Set(['/api/auth/login', '/api/auth/client-login', '/api/auth/logout']);

function deny(request: NextRequest, isApi: boolean) {
  if (isApi) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', request.url));
}

function isAllowed(pathname: string, request: NextRequest, session: Session | null): boolean {
  const parts = pathname.split('/').filter(Boolean); // e.g. ["dashboard", "acme", "meta"]

  if (parts[0] === 'api') {
    if (PUBLIC_API.has(pathname.replace(/\/$/, ''))) return true;
    if (parts[1] === 'cron') return true;
    if (parts[1] === 'brands' && parts[2]) return canAccessBrand(session, parts[2]);
    if ((parts[1] === 'ads' || parts[1] === 'analytics') && request.nextUrl.searchParams.get('slug')) {
      return canAccessBrand(session, request.nextUrl.searchParams.get('slug'));
    }
    if (parts[1] === 'chat') return !!session;
    return session?.role === 'agency';
  }

  if (parts[0] === 'admin') return session?.role === 'agency';
  if (parts[0] === 'dashboard') {
    if (!parts[1]) return session?.role === 'agency';
    return canAccessBrand(session, parts[1]);
  }
  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!isAllowed(pathname, request, session)) {
    return deny(request, pathname.startsWith('/api'));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|platforms/).*)'],
};
