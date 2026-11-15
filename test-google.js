const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k,v] = l.split('=');
  if(k && v) process.env[k.trim()] = v.trim();
});

const fetch = global.fetch;

async function run() {
  const params = new URLSearchParams();
  params.append('client_id', process.env.GOOGLE_ADS_CLIENT_ID);
  params.append('client_secret', process.env.GOOGLE_ADS_CLIENT_SECRET);
  params.append('refresh_token', process.env.GOOGLE_ADS_REFRESH_TOKEN);
  params.append('grant_type', 'refresh_token');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await res.json();
  const token = data.access_token;
  console.log("Token length:", token?.length);

  const url = `https://googleads.googleapis.com/v16/customers/4379624152/googleAds:search`;
  const query = `
      SELECT 
        campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, 
        metrics.conversions, metrics.search_absolute_top_impression_share 
      FROM campaign 
      WHERE segments.date = '2026-06-12' 
      AND metrics.impressions > 0
    `;
    const r2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'login-customer-id': process.env.GOOGLE_ADS_MANAGER_ID.replace(/-/g, ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    console.log("R2 Status:", r2.status);
    const d2 = await r2.json();
    console.log(JSON.stringify(d2, null, 2));
}
run();
