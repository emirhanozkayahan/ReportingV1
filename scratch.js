const SUPABASE_URL = 'https://ddxbemcjfkvslccxtget.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeGJlbWNqZmt2c2xjY3h0Z2V0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3MzkzOSwiZXhwIjoyMDkyMzQ5OTM5fQ.WteFSklL_IsK7wAGnnsaO_OYm95Z0G_wI9cKuYsWZxM';

async function test() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/integrations?platform=eq.ikas`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  
  for (const integration of data) {
    if(!['babokah', 'efotech'].includes(integration.credentials.storeName)) continue;
    
    const creds = integration.credentials;
    const tokenUrl = `https://${creds.storeName}.myikas.com/api/admin/oauth/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', creds.clientId);
    params.append('client_secret', creds.clientSecret);

    const tokenRes = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    for (let dayOffset = 0; dayOffset <= 0; dayOffset++) {
      const trDate = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
      trDate.setDate(trDate.getDate() - dayOffset);
      const startTs = Date.UTC(trDate.getUTCFullYear(), trDate.getUTCMonth(), trDate.getUTCDate(), 0, 0, 0, 0) - (3 * 60 * 60 * 1000);
      const endTs   = startTs + (24 * 60 * 60 * 1000) - 1;

      let allOrders = [];
      let page = 1;
      while(true) {
        const queryPayload = JSON.stringify({
          query: `{
            listOrder(pagination: { limit: 200, page: ${page} }, orderedAt: { gte: ${startTs}, lte: ${endTs} }) {
              data { orderNumber orderedAt status orderPaymentStatus orderPackageStatus totalFinalPrice salesChannel { name } }
            }
          }`
        });
        const orderRes = await fetch('https://api.myikas.com/api/v1/admin/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: queryPayload });
        const orderData = await orderRes.json();
        const items = orderData.data?.listOrder?.data || [];
        allOrders = allOrders.concat(items);
        if(items.length < 200) break;
        page++;
      }

      if (creds.storeName === 'babokah' && dayOffset === 1) {
        console.log(JSON.stringify(allOrders.slice(0, 5), null, 2));
      }

      const validOrders = allOrders.filter(o => o.orderPackageStatus !== 'CANCELLED');
      const paidOrders = validOrders.filter(o => o.orderPaymentStatus === 'PAID');
      const totalRev = validOrders.reduce((acc, o) => acc + o.totalFinalPrice, 0);

      const dateStr = trDate.toISOString().split('T')[0];
      console.log(`[${creds.storeName}] ${dateStr} -> Valid: ${validOrders.length} (₺${totalRev})`);
    }
  }
}

test().catch(console.error);
