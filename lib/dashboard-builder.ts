export function buildRealDashboardData(salesData: any[], adData: any[], prevSalesData: any[] = [], prevAdData: any[] = []) {
  // Toplam satış metrikleri
  const totalRevenue = salesData.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
  const totalOrders = salesData.reduce((sum, s) => sum + (s.order_count || 0), 0);

  const metaAds = adData.filter(a => a.platform === 'Meta');
  const googleAds = adData.filter(a => a.platform === 'Google');

  const totalMetaSpend = metaAds.reduce((sum, a) => sum + (Number(a.spend) || 0), 0);
  const totalMetaRev = metaAds.reduce((sum, a) => sum + (Number(a.revenue) || 0), 0);
  const totalMetaClicks = metaAds.reduce((sum, a) => sum + (Number(a.clicks) || 0), 0);
  const totalMetaImpressions = metaAds.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0);
  const totalMetaConversions = metaAds.reduce((sum, a) => sum + (Number(a.conversions) || 0), 0);

  const totalGoogleSpend = googleAds.reduce((sum, a) => sum + (Number(a.spend) || 0), 0);
  const totalGoogleRev = googleAds.reduce((sum, a) => sum + (Number(a.revenue) || 0), 0);
  const totalGoogleClicks = googleAds.reduce((sum, a) => sum + (Number(a.clicks) || 0), 0);
  const totalGoogleImpressions = googleAds.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0);
  const totalGoogleConversions = googleAds.reduce((sum, a) => sum + (Number(a.conversions) || 0), 0);

  const totalSpend = totalMetaSpend + totalGoogleSpend;
  const roi = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
  const aov = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;
  
  const totalClicks = totalMetaClicks + totalGoogleClicks;
  const convRate = totalClicks > 0 ? Number(((totalOrders / totalClicks) * 100).toFixed(2)) : 0;

  // Önceki dönem metrikleri
  const prevTotalRevenue = prevSalesData.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
  const prevTotalOrders = prevSalesData.reduce((sum, s) => sum + (s.order_count || 0), 0);
  const prevMetaAds = prevAdData.filter(a => a.platform === 'Meta');
  const prevGoogleAds = prevAdData.filter(a => a.platform === 'Google');
  const prevTotalMetaSpend = prevMetaAds.reduce((sum, a) => sum + (Number(a.spend) || 0), 0);
  const prevTotalGoogleSpend = prevGoogleAds.reduce((sum, a) => sum + (Number(a.spend) || 0), 0);
  const prevTotalSpend = prevTotalMetaSpend + prevTotalGoogleSpend;
  const prevRoi = prevTotalSpend > 0 ? Number((prevTotalRevenue / prevTotalSpend).toFixed(2)) : 0;
  const prevAov = prevTotalOrders > 0 ? Number((prevTotalRevenue / prevTotalOrders).toFixed(2)) : 0;
  
  const prevTotalMetaClicks = prevMetaAds.reduce((sum, a) => sum + (Number(a.clicks) || 0), 0);
  const prevTotalGoogleClicks = prevGoogleAds.reduce((sum, a) => sum + (Number(a.clicks) || 0), 0);
  const prevTotalClicks = prevTotalMetaClicks + prevTotalGoogleClicks;
  const prevConvRate = prevTotalClicks > 0 ? Number(((prevTotalOrders / prevTotalClicks) * 100).toFixed(2)) : 0;

  const calcChange = (current: number, prev: number) => {
    if (prev === 0 && current === 0) return 0;
    if (prev === 0) return 100; // veya anlamlı bir maksimum artış
    return Math.round(((current - prev) / prev) * 100);
  };

  // Trend verileri (günlük)
  const trendMap = new Map<string, { revenue: number; spend: number }>();

  salesData.forEach(s => {
    const key = s.date;
    const entry = trendMap.get(key) || { revenue: 0, spend: 0 };
    entry.revenue += Number(s.revenue) || 0;
    trendMap.set(key, entry);
  });

  adData.forEach(a => {
    const key = a.date;
    const entry = trendMap.get(key) || { revenue: 0, spend: 0 };
    entry.spend += Number(a.spend) || 0;
    trendMap.set(key, entry);
  });

  const trends = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      revenue: Math.round(vals.revenue),
      spend: Math.round(vals.spend),
      roas: vals.spend > 0 ? Number((vals.revenue / vals.spend).toFixed(2)) : 0,
    }));

  const stats = {
    metaSpend: totalMetaSpend,
    googleSpend: totalGoogleSpend,
    totalSpend,
    orderCount: totalOrders,
    revenue: totalRevenue,
    roi,
    aov,
    convRate,
    metaDetails: {
      revenue: totalMetaRev,
      roas: totalMetaSpend > 0 ? Number((totalMetaRev / totalMetaSpend).toFixed(2)) : 0,
      cpc: totalMetaClicks > 0 ? Number((totalMetaSpend / totalMetaClicks).toFixed(2)) : 0,
      ctr: totalMetaImpressions > 0 ? Number(((totalMetaClicks / totalMetaImpressions) * 100).toFixed(2)) : 0,
      purchases: totalMetaConversions,
    },
    googleDetails: {
      revenue: totalGoogleRev,
      roas: totalGoogleSpend > 0 ? Number((totalGoogleRev / totalGoogleSpend).toFixed(2)) : 0,
      cpc: totalGoogleClicks > 0 ? Number((totalGoogleSpend / totalGoogleClicks).toFixed(2)) : 0,
      ctr: totalGoogleImpressions > 0 ? Number(((totalGoogleClicks / totalGoogleImpressions) * 100).toFixed(2)) : 0,
      purchases: totalGoogleConversions,
    },
    ecommerce: {
      viewItems: 0, addToCart: 0, checkoutInit: 0,
      cartAbandonment: "—", avgBasketSize: "—",
      revPerVisitor: 0, newUsers: 0, returningUsers: 0,
      bounceRate: "—", avgSessionDuration: "—", engagementRate: "—",
    },
    prevPeriod: {
      revenueScore: calcChange(totalRevenue, prevTotalRevenue),
      spendScore: calcChange(totalSpend, prevTotalSpend), 
      roasScore: calcChange(roi, prevRoi),
      orderScore: calcChange(totalOrders, prevTotalOrders),
      convScore: calcChange(convRate, prevConvRate),
      aovScore: calcChange(aov, prevAov),
    },
  };

  // Kampanya verisi (reklam entegrasyonu geldiğinde doldurulacak)
  const campaigns: any[] = [];
  const funnel = [
    { step: 'Session Start', code: 'session', percentage: 100, dropOff: '-' },
    { step: 'Product View', code: 'view_item', percentage: 0, dropOff: '—' },
    { step: 'Add to Cart', code: 'add_to_cart', percentage: 0, dropOff: '—' },
    { step: 'Checkout Init', code: 'checkout', percentage: 0, dropOff: '—' },
    { step: 'Purchase', code: 'purchase', percentage: 0, dropOff: '—' },
  ];
  const cities: any[] = [];
  const pages: any[] = [];
  const categories: any[] = [];
  const metaAdsList: any[] = [];
  const sessionSources: any[] = [];
  const devices = [
    { name: 'Mobile', value: 78, color: '#3b82f6' },
    { name: 'Desktop', value: 20, color: '#f43f5e' },
    { name: 'Tablet', value: 2, color: '#10b981' },
  ];
  const osData = [
    { name: 'iOS', value: 55, color: '#6366f1' },
    { name: 'Android', value: 35, color: '#14b8a6' },
  ];
  const hourlySales: any[] = [];
  const demographicAges = [
    { range: '18-24', value: 15 },
    { range: '25-34', value: 45 },
    { range: '35-44', value: 25 },
    { range: '45-54', value: 10 },
    { range: '55+', value: 5 },
  ];
  return {
    stats, campaigns, trends, cities,
    funnel, pages, categories,
    metaAds: metaAdsList, sessionSources,
    devices, osData, hourlySales, demographicAges,
  };
}
