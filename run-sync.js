const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k) acc[k.trim()] = v.join('=').trim();
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');


// Mock next/server and other env deps if needed
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: settings } = await supabaseAdmin.from('agency_settings').select('*');
  console.log('Agency Settings:', settings);
  const currentRefreshToken = settings.find(s => s.key === 'google_refresh_token')?.value;
  console.log('Using token:', currentRefreshToken);

  const params = new URLSearchParams();
  params.append('client_id', env.GOOGLE_CLIENT_ID);
  params.append('client_secret', env.GOOGLE_CLIENT_SECRET);
  params.append('refresh_token', currentRefreshToken);
  params.append('grant_type', 'refresh_token');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: params
  });
  if (!res.ok) {
    console.log('Token error:', await res.text());
  } else {
    console.log('Token success:', await res.json());
  }
}
run();
