import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Signed session cookies.
 *
 * Cookie value: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, AUTH_SECRET)).
 * A cookie that was not issued by this server (e.g. typed by hand) fails verification.
 */

export const SESSION_COOKIE = 'session';

export type Session =
  | { role: 'agency'; email: string; exp: number }
  | { role: 'brand'; slug: string; exp: number };

const AGENCY_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const BRAND_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createSessionToken(
  session: { role: 'agency'; email: string } | { role: 'brand'; slug: string },
): { token: string; maxAge: number } {
  const secret = getSecret();
  if (!secret) throw new Error('AUTH_SECRET is not set (min. 32 characters)');
  const maxAge = session.role === 'agency' ? AGENCY_MAX_AGE : BRAND_MAX_AGE;
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + maxAge }),
  ).toString('base64url');
  return { token: `${payload}.${sign(payload, secret)}`, maxAge };
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    if (data.role === 'agency' && typeof data.email === 'string') return data;
    if (data.role === 'brand' && typeof data.slug === 'string') return data;
    return null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/** True when the session may see data for the given brand slug. */
export function canAccessBrand(session: Session | null, slug: string | null | undefined): boolean {
  if (!session) return false;
  if (session.role === 'agency') return true;
  return !!slug && session.slug === slug;
}

/**
 * Admin login: ADMIN_EMAILS (comma-separated) share one password whose hash is
 * ADMIN_PASSWORD_HASH, formatted "scrypt:<saltHex>:<hashHex>".
 * Generate it with: node scripts/set-admin-password.mjs
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  if (!emails.includes(email.trim().toLowerCase())) return false;

  const [algo, saltHex, hashHex] = stored.split(':');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}
