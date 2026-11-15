const { createClient } = require('@supabase/supabase-js');
const url = 'https://ddxbemcjfkvslccxtget.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeGJlbWNqZmt2c2xjY3h0Z2V0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3MzkzOSwiZXhwIjoyMDkyMzQ5OTM5fQ.WteFSklL_IsK7wAGnnsaO_OYm95Z0G_wI9cKuYsWZxM';
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
