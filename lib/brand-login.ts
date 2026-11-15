import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';

/**
 * Checks a client (brand user) login. Returns the brand slug on success.
 * The password is never sent to the database: the stored scrypt hash is
 * fetched by e-mail and compared here.
 */
export async function verifyBrandUser(email: string, password: string): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data: user } = await supabaseAdmin
    .from('brand_users')
    .select('brand_id, password_hash')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (!user || !verifyPassword(password, user.password_hash)) return null;

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('slug')
    .eq('id', user.brand_id)
    .maybeSingle();

  return brand?.slug ?? null;
}
