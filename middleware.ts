import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoot = pathname === '/dashboard' || pathname === '/dashboard/';
  const isAdminPath = pathname.startsWith('/admin');
  const isBrandDashboard = pathname.startsWith('/dashboard/') && pathname.length > 11;

  const agencyAuth = request.cookies.get('agency_auth');
  const hasAgencyAuth = agencyAuth && agencyAuth.value === 'true';

  // 1. Ana Dashboard ve Admin Kısımlarını Sadece Ajans Görebilir
  if (isDashboardRoot || isAdminPath) {
    if (!hasAgencyAuth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Marka Panellerini (örn: /dashboard/navira) Ajans VEYA İlgili Marka Görebilir
  if (isBrandDashboard && !hasAgencyAuth) {
    // /dashboard/navira/analytics -> parçalara ayır -> ["", "dashboard", "navira", "analytics"]
    const pathParts = pathname.split('/');
    const brandSlug = pathParts[2]; // index 2 is the slug
    
    const brandAuth = request.cookies.get('brand_auth');
    const hasBrandAuth = brandAuth && brandAuth.value === brandSlug;

    if (!hasBrandAuth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
