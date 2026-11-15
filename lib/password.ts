import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Stored format: "scrypt:<saltHex>:<hashHex>" */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  const [algo, saltHex, hashHex] = (stored || '').split(':');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

export const MIN_PASSWORD_LENGTH = 8;
