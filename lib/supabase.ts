import { createClient } from '@supabase/supabase-js';

// Accept the project URL with or without a trailing "/rest/v1/" (as copied from
// the Supabase dashboard); supabase-js appends that path itself.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side işlemler için service role key (RLS bypass)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Client-side ve genel okuma işlemleri için anon key'li client
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Server-side yazma işlemleri için service role key'li client (RLS bypass)
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    })
  : null;
