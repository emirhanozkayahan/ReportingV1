const fs = require('fs');
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k,v] = l.split('=');
  if(k && v) process.env[k.trim()] = v.trim();
});
const {createClient} = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('agency_settings').select('*').then(r => console.log(r.data));
