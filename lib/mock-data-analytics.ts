// d:\pocketbusiness\lib\mock-data-analytics.ts
// GA4 / Analytics detaylı mock veri üretici

export type AnalyticsOverview = {
  sessions: number;
  users: number;
  newUsers: number;
  returningUsers: number;
  pageViews: number;
  avgSessionDuration: string;
  bounceRate: number;
  engagementRate: number;
  pagesPerSession: number;
  eventsPerSession: number;
  prevPeriod: {
    sessionsChange: number;
    usersChange: number;
    bounceRateChange: number;
    engagementChange: number;
  };
  dailyTrend: { date: string; sessions: number; users: number; bounceRate: number; pageViews: number }[];
};

export type PurchaseJourney = {
  steps: {
    step: string;
    users: number;
    percentage: number;
    dropOff: number;
    avgTime: string;
  }[];
  conversionRate: number;
  avgTimeToConversion: string;
  microConversions: {
    event: string;
    count: number;
    rate: number;
  }[];
};

export type TrafficSource = {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  pagesPerSession: number;
};

export type LandingPage = {
  path: string;
  title: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: string;
  conversions: number;
  conversionRate: number;
};

export type DeviceDetail = {
  device: string;
  sessions: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  avgSessionDuration: string;
  pagesPerSession: number;
};

export type BrowserDetail = {
  browser: string;
  sessions: number;
  bounceRate: number;
  conversionRate: number;
};

export type PagePath = {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: string;
  exitRate: number;
};

export type EventTracking = {
  eventName: string;
  count: number;
  users: number;
  valuePerEvent: number;
};

export type AgeGenderBreakdown = {
  ageRange: string;
  male: number;
  female: number;
  total: number;
  conversionRate: number;
};

export type HourlySession = {
  hour: string;
  sessions: number;
  conversions: number;
};

export type DayOfWeekStat = {
  day: string;
  sessions: number;
  conversions: number;
  revenue: number;
};

const seed = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const rand = (s: number, min: number, max: number) => {
  const x = Math.sin(s) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
};

export function generateAnalyticsMockData(slug: string, period: string = 'today') {
  const s = seed(slug) + 1000;
  const m = period === 'yesterday' ? 1 : period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 1;

  const sessions = Math.round(rand(s, 1200, 8000) * m);
  const users = Math.round(sessions * rand(s + 1, 0.65, 0.85));
  const newUsers = Math.round(users * rand(s + 2, 0.55, 0.75));
  const returningUsers = users - newUsers;
  const pageViews = Math.round(sessions * rand(s + 3, 2.5, 5.5));
  const avgDurMin = Math.round(rand(s + 5, 1, 5));
  const avgDurSec = Math.round(rand(s + 7, 10, 55));

  const overview: AnalyticsOverview = {
    sessions,
    users,
    newUsers,
    returningUsers,
    pageViews,
    avgSessionDuration: `${avgDurMin}dk ${avgDurSec}sn`,
    bounceRate: parseFloat(rand(s + 11, 30, 65).toFixed(1)),
    engagementRate: parseFloat(rand(s + 13, 45, 75).toFixed(1)),
    pagesPerSession: parseFloat(rand(s + 17, 2.0, 5.5).toFixed(1)),
    eventsPerSession: parseFloat(rand(s + 19, 3, 12).toFixed(1)),
    prevPeriod: {
      sessionsChange: parseFloat(rand(s + 23, -12, 20).toFixed(1)),
      usersChange: parseFloat(rand(s + 29, -10, 22).toFixed(1)),
      bounceRateChange: parseFloat(rand(s + 31, -8, 6).toFixed(1)),
      engagementChange: parseFloat(rand(s + 37, -5, 15).toFixed(1)),
    },
    dailyTrend: Array.from({ length: Math.min(m === 1 ? 1 : m, 30) }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - ((m === 1 ? 1 : m) - 1 - i));
      return {
        date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        sessions: Math.round(sessions / (m === 1 ? 1 : m) * rand(s + i * 41, 0.6, 1.4)),
        users: Math.round(users / (m === 1 ? 1 : m) * rand(s + i * 43, 0.6, 1.4)),
        bounceRate: parseFloat(rand(s + i * 47, 28, 68).toFixed(1)),
        pageViews: Math.round(pageViews / (m === 1 ? 1 : m) * rand(s + i * 53, 0.5, 1.5)),
      };
    }),
  };

  // Satın Alma Yolculuğu
  const journeySteps = [
    'Site Ziyareti',
    'Ürün Görüntüleme',
    'Sepete Ekleme',
    'Ödemeye Geçme',
    'Adres Bilgileri',
    'Ödeme Bilgileri',
    'Sipariş Tamamlama',
  ];
  let remaining = sessions;
  const steps = journeySteps.map((step, i) => {
    if (i > 0) {
      remaining = Math.round(remaining * rand(s + i * 59, 0.35, 0.75));
    }
    const prev = i > 0 ? Math.round(remaining / rand(s + i * 61, 0.35, 0.75)) : sessions;
    const dropOff = i > 0 ? parseFloat(((1 - remaining / prev) * 100).toFixed(1)) : 0;
    return {
      step,
      users: remaining,
      percentage: parseFloat((remaining / sessions * 100).toFixed(1)),
      dropOff,
      avgTime: `${Math.round(rand(s + i * 67, 10, 180))}sn`,
    };
  });

  const purchaseJourney: PurchaseJourney = {
    steps,
    conversionRate: parseFloat((remaining / sessions * 100).toFixed(2)),
    avgTimeToConversion: `${Math.round(rand(s + 71, 3, 15))}dk ${Math.round(rand(s + 73, 10, 55))}sn`,
    microConversions: [
      { event: 'add_to_cart', count: Math.round(rand(s + 79, 50, 500) * m), rate: parseFloat(rand(s + 83, 0.5, 3).toFixed(1)) },
      { event: 'view_item', count: Math.round(rand(s + 89, 100, 800) * m), rate: parseFloat(rand(s + 97, 1, 5).toFixed(1)) },
      { event: 'begin_checkout', count: Math.round(rand(s + 101, 30, 300) * m), rate: parseFloat(rand(s + 103, 0.3, 2).toFixed(1)) },
      { event: 'scroll', count: Math.round(rand(s + 107, 200, 2000) * m), rate: parseFloat(rand(s + 109, 10, 30).toFixed(1)) },
      { event: 'click', count: Math.round(rand(s + 113, 200, 1500) * m), rate: parseFloat(rand(s + 119, 3, 15).toFixed(1)) },
    ],
  };

  // Trafik Kaynakları
  const trafficSources: TrafficSource[] = [
    { source: 'google', medium: 'cpc' },
    { source: 'facebook', medium: 'cpc' },
    { source: 'instagram', medium: 'cpc' },
    { source: 'google', medium: 'organic' },
    { source: '(direct)', medium: '(none)' },
    { source: 'trendyol', medium: 'referral' },
    { source: 'newsletter', medium: 'email' },
    { source: 'youtube', medium: 'cpc' },
    { source: 'tiktok', medium: 'cpc' },
    { source: 'bing', medium: 'organic' },
  ].map((ts, i) => ({
    ...ts,
    sessions: Math.round(rand(s + i * 127, 50, 2000) * m),
    users: Math.round(rand(s + i * 131, 40, 1800) * m),
    bounceRate: parseFloat(rand(s + i * 137, 25, 70).toFixed(1)),
    conversionRate: parseFloat(rand(s + i * 139, 0.5, 5.5).toFixed(2)),
    revenue: Math.round(rand(s + i * 149, 500, 25000) * m),
    pagesPerSession: parseFloat(rand(s + i * 151, 1.5, 6).toFixed(1)),
  }));

  // Sayfa Performansları
  const landingPages: LandingPage[] = [
    { path: '/', title: 'Ana Sayfa' },
    { path: '/urunler', title: 'Tüm Ürünler' },
    { path: '/kategori/elbise', title: 'Elbise Kategorisi' },
    { path: '/kategori/ayakkabi', title: 'Ayakkabı Kategorisi' },
    { path: '/yeni-sezon', title: 'Yeni Sezon Koleksiyonu' },
    { path: '/indirim', title: 'İndirimli Ürünler' },
    { path: '/blog', title: 'Blog' },
    { path: '/hakkimizda', title: 'Hakkımızda' },
  ].map((lp, i) => ({
    ...lp,
    sessions: Math.round(rand(s + i * 157, 30, 2500) * m),
    bounceRate: parseFloat(rand(s + i * 163, 20, 75).toFixed(1)),
    avgSessionDuration: `${Math.round(rand(s + i * 167, 0, 4))}dk ${Math.round(rand(s + i * 173, 10, 55))}sn`,
    conversions: Math.round(rand(s + i * 179, 0, 120) * m),
    conversionRate: parseFloat(rand(s + i * 181, 0.2, 6).toFixed(2)),
  }));

  // Cihaz Detayları
  const deviceDetails: DeviceDetail[] = [
    { device: 'Mobil (iOS)' },
    { device: 'Mobil (Android)' },
    { device: 'Masaüstü' },
    { device: 'Tablet' },
  ].map((dd, i) => ({
    ...dd,
    sessions: Math.round(rand(s + i * 191, 100, 4000) * m),
    bounceRate: parseFloat(rand(s + i * 193, 25, 65).toFixed(1)),
    conversionRate: parseFloat(rand(s + i * 197, 0.5, 4.5).toFixed(2)),
    revenue: Math.round(rand(s + i * 199, 500, 30000) * m),
    avgSessionDuration: `${Math.round(rand(s + i * 211, 1, 5))}dk ${Math.round(rand(s + i * 223, 10, 55))}sn`,
    pagesPerSession: parseFloat(rand(s + i * 227, 1.5, 6).toFixed(1)),
  }));

  // Tarayıcı Detayları
  const browserDetails: BrowserDetail[] = [
    'Chrome', 'Safari', 'Samsung Internet', 'Firefox', 'Edge', 'Opera'
  ].map((br, i) => ({
    browser: br,
    sessions: Math.round(rand(s + i * 229, 50, 3000) * m),
    bounceRate: parseFloat(rand(s + i * 233, 25, 65).toFixed(1)),
    conversionRate: parseFloat(rand(s + i * 239, 0.3, 4).toFixed(2)),
  }));

  // Sayfa Yolları
  const pagePaths: PagePath[] = [
    { path: '/', title: 'Ana Sayfa' },
    { path: '/urunler', title: 'Tüm Ürünler' },
    { path: '/urun/siyah-abiye-elbise', title: 'Siyah Abiye Elbise' },
    { path: '/urun/kirmizi-topuklu', title: 'Kırmızı Topuklu Ayakkabı' },
    { path: '/kategori/elbise', title: 'Elbise Kategorisi' },
    { path: '/sepet', title: 'Alışveriş Sepeti' },
    { path: '/odeme', title: 'Ödeme Sayfası' },
    { path: '/siparisler', title: 'Siparişlerim' },
    { path: '/indirim', title: 'İndirimli Ürünler' },
    { path: '/yeni-sezon', title: 'Yeni Sezon' },
  ].map((pp, i) => ({
    ...pp,
    views: Math.round(rand(s + i * 241, 50, 5000) * m),
    uniqueViews: Math.round(rand(s + i * 251, 30, 4000) * m),
    avgTimeOnPage: `${Math.round(rand(s + i * 257, 10, 240))}sn`,
    exitRate: parseFloat(rand(s + i * 263, 10, 60).toFixed(1)),
  }));

  // Etkinlik Takibi
  const events: EventTracking[] = [
    'page_view', 'view_item', 'add_to_cart', 'begin_checkout',
    'purchase', 'scroll', 'click', 'search', 'add_to_wishlist',
    'share', 'sign_up', 'login',
  ].map((ev, i) => ({
    eventName: ev,
    count: Math.round(rand(s + i * 269, 50, 15000) * m),
    users: Math.round(rand(s + i * 271, 20, 5000) * m),
    valuePerEvent: parseFloat(rand(s + i * 277, 0, 150).toFixed(2)),
  }));

  // Yaş-Cinsiyet
  const ageGender: AgeGenderBreakdown[] = [
    '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
  ].map((age, i) => {
    const male = Math.round(rand(s + i * 281, 50, 800) * m);
    const female = Math.round(rand(s + i * 283, 80, 1200) * m);
    return {
      ageRange: age,
      male,
      female,
      total: male + female,
      conversionRate: parseFloat(rand(s + i * 289, 0.5, 5).toFixed(2)),
    };
  });

  // Saatlik oturumlar
  const hourlySessions: HourlySession[] = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    sessions: Math.round(rand(s + i * 293, 5, 350) * m),
    conversions: Math.round(rand(s + i * 307, 0, 15) * m),
  }));

  // Gün bazlı
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const dayOfWeek: DayOfWeekStat[] = dayNames.map((day, i) => ({
    day,
    sessions: Math.round(rand(s + i * 311, 200, 1500) * m),
    conversions: Math.round(rand(s + i * 313, 5, 60) * m),
    revenue: Math.round(rand(s + i * 317, 1000, 15000) * m),
  }));

  // Şehirler (Coğrafi)
  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Kocaeli', 'Kayseri'
  ].map((city, i) => ({
    city,
    sessions: Math.round(rand(s + i * 330, 500, 15000) * m),
    conversions: Math.round(rand(s + i * 331, 10, 500) * m),
  })).map(c => ({ ...c, conversionRate: c.sessions > 0 ? parseFloat((c.conversions / c.sessions * 100).toFixed(2)) : 0 }))
    .sort((a, b) => b.sessions - a.sessions);

  // Cinsiyet Dağılımı
  const genders = [
    { gender: 'female', sessions: Math.round(sessions * rand(s + 341, 0.55, 0.70)), conversions: Math.round(purchaseJourney.steps[4].users * rand(s + 342, 0.60, 0.80)) },
    { gender: 'male', sessions: Math.round(sessions * rand(s + 343, 0.30, 0.45)), conversions: Math.round(purchaseJourney.steps[4].users * rand(s + 344, 0.20, 0.40)) },
  ].map(g => ({ ...g, conversionRate: g.sessions > 0 ? parseFloat((g.conversions / g.sessions * 100).toFixed(2)) : 0 }));

  return {
    overview,
    purchaseJourney,
    trafficSources,
    landingPages,
    deviceDetails,
    browserDetails,
    pagePaths,
    events,
    ageGender,
    hourlySessions,
    dayOfWeek,
    cities,
    genders,
  };
}
