const { createClient } = require('@supabase/supabase-js');
// Run with: node --env-file=.env.local check_db.js
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
const supabase = createClient(url, key);

async function run() {
  const { data: brand } = await supabase.from('brands').select('*').eq('slug', 'bisse').single();
  console.log('Brand:', brand);
  if (!brand) return;

  const { data: integrations } = await supabase.from('integrations').select('*').eq('brand_id', brand.id);
  console.log('Integrations:', JSON.stringify(integrations, null, 2));

  const { data: ads } = await supabase.from('daily_ad_stats').select('*').eq('brand_id', brand.id);
  console.log('Daily Ad Stats:', ads);
}

run();
