import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken, type Session } from '@/lib/session';

/** Reads and verifies the signed session cookie in a server component or route handler. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function isAgencySession(): Promise<boolean> {
  return (await getSession())?.role === 'agency';
}
