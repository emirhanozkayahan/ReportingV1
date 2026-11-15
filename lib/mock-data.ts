// d:\pocketbusiness\lib\mock-data.ts
export type Brand = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  active: boolean;
};

export type CampaignStat = {
  id: string;
  name: string;
  platform: 'Meta' | 'Google';
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  impressions: number;
  conversions: number;
  cpa: number;
  ctr: number; // Added
};

export type DailyTrend = {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
};

export type CityStat = {
  name: string;
  purchases: number;
  revenue: number; // Added
  conversionRate: string; // Added
};

export type GenderStat = {
  name: string;
  value: number;
  color: string;
  platform?: string;
};

export type AgeStat = {
  range: string;
  value: number;
};

export type FunnelStat = {
  step: string;
  code: string;
  percentage: number;
  dropOff: string; // Added
};

export type BrowserStat = {
  name: string;
  views: number;
};

export type DeviceStat = {
  name: string;
  value: number;
  color: string;
};

export type PageStat = {
  title: string;
  views: number;
  revenue: number;
};

export type CategoryStat = {
  category: string;
  views: number;
  revenueShare: string;
  trend: string;
};

export type KeywordStat = {
  keyword: string;
  clicks: number;
};

export type SessionSource = {
  source: string;
  users: number;
  type: 'Direct' | 'Organic' | 'Paid' | 'Social';
};

export type MetaAd = {
  adName: string;
  clicks: number;
  ctr: string;
  cpc: string;
  conversions: number;
};

export type HourlyStat = {
  hour: string;
  sales: number;
};

export type AlertInsight = {
  id: string;
  message: string;
  type: 'danger' | 'success' | 'warning' | 'info';
};

export const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Emsale', slug: 'emsale', industry: 'E-Ticaret Tesettür', active: true },
  { id: '2', name: 'Roman', slug: 'roman', industry: 'E-Ticaret Kadın Giyim', active: true },
  { id: '3', name: 'Bisse', slug: 'bisse', industry: 'E-Ticaret', active: true },
];

export const generateMockData = (slug: string, period: string = 'today') => {
  let periodMultiplier = 1;
  if (period === 'yesterday') periodMultiplier = 1;
  if (period === '7d') periodMultiplier = 7;
  if (period === '14d') periodMultiplier = 14;
  if (period === '30d') periodMultiplier = 30;

  let baseRev = 0;
  let baseMetaSpend = 0;
  let baseGoogleSpend = 0;
  let orderBase = 0;

  if (slug === 'roman') {
    baseRev = 450000; 
    baseMetaSpend = 43300;
    baseGoogleSpend = 6500;
    orderBase = 44;
  } else {
    baseRev = 15300;
    baseMetaSpend = 7227;
    baseGoogleSpend = 614;
    orderBase = 6;
  }

  // Apply Period Multipliers
  const revenue = baseRev * periodMultiplier * (1 + (Math.random() * 0.1 - 0.05));
  const metaSpend = baseMetaSpend * periodMultiplier * (1 + (Math.random() * 0.05));
  const googleSpend = baseGoogleSpend * periodMultiplier * (1 + (Math.random() * 0.05));
  const totalSpend = metaSpend + googleSpend;
  const orderCount = Math.round(orderBase * periodMultiplier * (1 + (Math.random() * 0.1)));
  const roi = Number((revenue / totalSpend).toFixed(2));
  
  const aov = Number((revenue / orderCount).toFixed(2));
  const convRate = Number(((orderCount / (orderCount * 85)) * 100).toFixed(2)); 

  const stats = {
    metaSpend,
    googleSpend,
    totalSpend,
    orderCount,
    revenue,
    roi,
    aov,
    convRate,
    metaDetails: {
      revenue: revenue * 0.55,
      roas: Number(((revenue * 0.55) / metaSpend).toFixed(2)),
      cpc: 2.15,
      ctr: 1.8,
      purchases: Math.ceil(orderCount * 0.55)
    },
    googleDetails: {
      revenue: revenue * 0.40,
      roas: Number(((revenue * 0.40) / googleSpend).toFixed(2)),
      cpc: 4.30,
      ctr: 4.5,
      purchases: Math.ceil(orderCount * 0.40)
    },
    ecommerce: {
      viewItems: Math.round(11000 * periodMultiplier),
      addToCart: Math.round(300 * periodMultiplier),
      checkoutInit: Math.round(120 * periodMultiplier),
      cartAbandonment: "68.5%",
      avgBasketSize: "1.8",
      revPerVisitor: Number((revenue / (11000 * periodMultiplier)).toFixed(2)),
      newUsers: Math.round(1340 * periodMultiplier),
      returningUsers: Math.round(300 * periodMultiplier),
      bounceRate: "42.8%", 
      avgSessionDuration: "02:14",
      engagementRate: "58.2%",
    },
    prevPeriod: {
      revenueScore: +12.4,
      spendScore: +5.2,
      roasScore: +8.1,
      orderScore: +14.2,
      convScore: -1.5,
      aovScore: +2.1
    }
  };

  const trends: DailyTrend[] = Array.from({ length: periodMultiplier === 1 ? 7 : Math.min(periodMultiplier, 30) }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (Math.min(periodMultiplier, 30) - 1 - i));
    const dayRev = (revenue / periodMultiplier) * (0.7 + (Math.random() * 0.6));
    const spend = dayRev / (roi * (0.8 + (Math.random() * 0.4)));
    
    return {
      date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      spend: Math.round(spend),
      revenue: Math.round(dayRev),
      roas: Number((dayRev / spend).toFixed(2)),
    };
  });

  const campaigns: CampaignStat[] = [
    { id: 'c1', name: 'Veritas - Brand Search', platform: 'Google', spend: googleSpend * 0.4, revenue: revenue * 0.25, roas: 15.0, clicks: 17813, impressions: 440100, conversions: Math.round(orderCount*0.25), cpa: 120.03, ctr: 4.0 },
    { id: 'c2', name: 'V_MP_Etek_PMAX', platform: 'Google', spend: googleSpend * 0.4, revenue: revenue * 0.15, roas: 8.0, clicks: 8580, impressions: 80000, conversions: Math.round(orderCount*0.1), cpa: 200.0, ctr: 10.7 },
    { id: 'c3', name: 'V_Tüm Ürünler_KATALOG', platform: 'Meta', spend: metaSpend * 0.5, revenue: revenue * 0.4, roas: 18.0, clicks: 45000, impressions: 900000, conversions: Math.round(orderCount*0.4), cpa: 95.0, ctr: 5.0 },
    { id: 'c4', name: 'V_Retargeting_30Gün', platform: 'Meta', spend: metaSpend * 0.2, revenue: revenue * 0.15, roas: 22.0, clicks: 12000, impressions: 150000, conversions: Math.round(orderCount*0.15), cpa: 45.0, ctr: 8.0 },
  ];

  const funnel: FunnelStat[] = [
    { step: 'Session Start', code: 'session', percentage: 100, dropOff: '-' },
    { step: 'Product View', code: 'view_item', percentage: 75.46, dropOff: '24.5%' },
    { step: 'Add to Cart', code: 'add_to_cart', percentage: 12.34, dropOff: '83.6%' },
    { step: 'Checkout Init', code: 'checkout', percentage: 6.87, dropOff: '44.3%' },
    { step: 'Purchase', code: 'purchase', percentage: 2.15, dropOff: '68.7%' },
  ];

  const cities: CityStat[] = [
    { name: 'Istanbul', purchases: Math.round(orderCount * 0.35), revenue: revenue * 0.35, conversionRate: '2.8%' },
    { name: 'Izmir', purchases: Math.round(orderCount * 0.25), revenue: revenue * 0.25, conversionRate: '3.1%' },
    { name: 'Ankara', purchases: Math.round(orderCount * 0.15), revenue: revenue * 0.15, conversionRate: '2.2%' },
    { name: 'Bursa', purchases: Math.round(orderCount * 0.08), revenue: revenue * 0.08, conversionRate: '1.9%' },
    { name: 'Antalya', purchases: Math.round(orderCount * 0.05), revenue: revenue * 0.05, conversionRate: '2.5%' },
  ];

  const pages: PageStat[] = [
    { title: 'Yeni Sezon Elbiseler', views: 25000 * periodMultiplier, revenue: revenue * 0.2 },
    { title: 'Outlet & İndirimli Ürünler', views: 18000 * periodMultiplier, revenue: revenue * 0.15 },
    { title: 'Abiye Modelleri', views: 15000 * periodMultiplier, revenue: revenue * 0.35 },
    { title: 'Dış Giyim Kampanyası', views: 8000 * periodMultiplier, revenue: revenue * 0.1 },
  ];

  const categories: CategoryStat[] = [
    { category: 'ELBİSE', views: 49000 * periodMultiplier, revenueShare: '45%', trend: '+12%' },
    { category: 'ALT GİYİM', views: 21000 * periodMultiplier, revenueShare: '20%', trend: '+5%' },
    { category: 'DIŞ GİYİM', views: 14000 * periodMultiplier, revenueShare: '15%', trend: '-2%' },
    { category: 'AKSESUAR', views: 8000 * periodMultiplier, revenueShare: '8%', trend: '+18%' },
  ];

  const metaAds: MetaAd[] = [
    { adName: 'V_Tüm Ürünler_Katalog_01', clicks: 11369, ctr: '2.4%', cpc: '₺1.12', conversions: 45 },
    { adName: 'V_K26_Yeni_Sezon_Video', clicks: 8614, ctr: '1.8%', cpc: '₺1.45', conversions: 32 },
    { adName: 'V_İndirimEtek_Carousel', clicks: 5448, ctr: '1.5%', cpc: '₺1.05', conversions: 18 },
  ];

  const sessionSources: SessionSource[] = [
    { source: 'google / cpc', users: 20411 * periodMultiplier, type: 'Paid' },
    { source: '(direct) / (none)', users: 18698 * periodMultiplier, type: 'Direct' },
    { source: 'google / organic', users: 15176 * periodMultiplier, type: 'Organic' },
    { source: 'ig / social', users: 12169 * periodMultiplier, type: 'Social' },
    { source: 'facebook / paid', users: 8900 * periodMultiplier, type: 'Paid' },
  ];

  const devices: DeviceStat[] = [
    { name: 'Mobile', value: 78, color: '#3b82f6' },
    { name: 'Desktop', value: 20, color: '#f43f5e' },
    { name: 'Tablet', value: 2, color: '#10b981' },
  ];

  const osData: DeviceStat[] = [
    { name: 'iOS', value: 55, color: '#6366f1' },
    { name: 'Android', value: 35, color: '#14b8a6' },
    { name: 'Windows', value: 8, color: '#f59e0b' },
    { name: 'macOS', value: 2, color: '#8b5cf6' },
  ];

  const hourlySales: HourlyStat[] = Array.from({ length: 24 }).map((_, i) => {
     let traffic = 10;
     if (i > 8 && i < 12) traffic = 40;
     if (i >= 12 && i < 18) traffic = 60;
     if (i >= 18 && i < 22) traffic = 90; // peak hours
     if (i >= 22) traffic = 30;
     
     return {
       hour: `${i.toString().padStart(2, '0')}:00`,
       sales: Math.round(traffic * (Math.random() * 0.5 + 0.8) * periodMultiplier)
     };
  });

  const demographicAges: AgeStat[] = [
    { range: '18-24', value: 15 },
    { range: '25-34', value: 45 },
    { range: '35-44', value: 25 },
    { range: '45-54', value: 10 },
    { range: '55+', value: 5 },
  ];

  const alerts: AlertInsight[] = [
    { id: '1', message: 'Son 3 günde Meta ROAS değeri, kataloglardaki CPM artışı sebebiyle %18 azaldı.', type: 'danger' },
    { id: '2', message: 'En popüler ürün olan "Abiye Modelleri" bu dönemde toplam cironun %35\'ini oluşturdu.', type: 'success' },
    { id: '3', message: 'Sepeti terk etme oranı bugün mobil cihazlarda %5 artış gösterdi.', type: 'warning' },
    { id: '4', message: 'Google Arama Ağı reklamlarının dönüşüm oranı %4.0 seviyesinde sabit kalmaya devam ediyor.', type: 'info' }
  ];

  return { 
    stats, campaigns, trends, cities, 
    funnel, pages, categories, 
    metaAds, sessionSources,
    devices, osData, hourlySales, demographicAges, alerts
  };
};
