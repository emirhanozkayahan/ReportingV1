// d:\pocketbusiness\lib\mock-data-meta.ts
// Meta Ads detaylı mock veri üretici

export type MetaCampaign = {
  id: string;
  name: string;
  objective: string;
  status: 'Aktif' | 'Duraklatıldı' | 'Tamamlandı';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  revenue: number;
  roas: number;
  frequency: number;
  reach: number;
};

export type MetaAdSet = {
  id: string;
  campaignId: string;
  campaignName: string;
  name: string;
  status: 'Aktif' | 'Duraklatıldı';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  revenue: number;
  roas: number;
  reach: number;
  frequency: number;
  audience: string;
  placement: string;
};

export type MetaAdCreative = {
  id: string;
  adSetId: string;
  adSetName: string;
  campaignName: string;
  name: string;
  status: 'Aktif' | 'Duraklatıldı';
  format: 'Görsel' | 'Video' | 'Carousel' | 'Collection';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  revenue: number;
  roas: number;
  reach: number;
  frequency: number;
  thumbStopRatio: number;
  hookRate: number;
};

export type MetaOverview = {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  overallRoas: number;
  totalReach: number;
  avgFrequency: number;
  costPerResult: number;
  prevPeriod: {
    spendChange: number;
    revenueChange: number;
    roasChange: number;
    convChange: number;
  };
  dailyTrend: { date: string; spend: number; revenue: number; roas: number; impressions: number }[];
  spendByObjective: { objective: string; spend: number; conversions: number }[];
  placementBreakdown: { placement: string; spend: number; clicks: number; conversions: number }[];
  hourlyClicks: { hour: string; clicks: number }[];
  genderClicks: { gender: string; clicks: number }[];
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

export function generateMetaMockData(slug: string, period: string = 'today'): {
  overview: MetaOverview;
  campaigns: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAdCreative[];
} {
  const s = seed(slug);
  let m = period === 'yesterday' ? 1 : period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 1;

  const campaignNames = [
    'Katalog Satış - Geniş Kitle',
    'Conversions - Lookalike %1',
    'Retargeting - Sepeti Terk Eden',
    'Marka Bilinirliği - Video',
    'DPA - Tüm Ürünler',
    'Engagement - Yeni Sezon',
  ];

  const objectives = ['Satış', 'Dönüşüm', 'Yeniden Hedefleme', 'Marka Bilinirliği', 'Katalog Satış', 'Etkileşim'];
  const audiences = ['Lookalike 1%', 'Geniş Kitle', 'Sepet Terk', 'Site Ziyaretçileri', 'Müşteri Listesi', 'Benzer Kitle 3%'];
  const placements = ['Facebook Feed', 'Instagram Feed', 'Instagram Stories', 'Audience Network', 'Reels', 'Facebook Marketplace'];
  const adFormats: MetaAdCreative['format'][] = ['Görsel', 'Video', 'Carousel', 'Collection'];

  const campaigns: MetaCampaign[] = campaignNames.map((name, i) => {
    const spend = Math.round(rand(s + i * 7, 500, 8000) * m);
    const impressions = Math.round(rand(s + i * 11, 10000, 200000) * m);
    const clicks = Math.round(impressions * rand(s + i * 13, 0.01, 0.04));
    const conversions = Math.round(clicks * rand(s + i * 17, 0.02, 0.08));
    const revenue = Math.round(conversions * rand(s + i * 19, 150, 600));
    const reach = Math.round(impressions * rand(s + i * 23, 0.5, 0.85));
    return {
      id: `mc-${i}`,
      name,
      objective: objectives[i],
      status: i < 4 ? 'Aktif' as const : i === 4 ? 'Duraklatıldı' as const : 'Tamamlandı' as const,
      spend,
      impressions,
      clicks,
      ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
      cpc: parseFloat((spend / clicks).toFixed(2)),
      cpm: parseFloat((spend / impressions * 1000).toFixed(2)),
      conversions,
      revenue,
      roas: parseFloat((revenue / spend).toFixed(2)),
      frequency: parseFloat((impressions / reach).toFixed(1)),
      reach,
    };
  });

  const adSets: MetaAdSet[] = [];
  campaigns.forEach((camp, ci) => {
    const setCount = 2 + (ci % 3);
    for (let j = 0; j < setCount; j++) {
      const spend = Math.round(camp.spend / setCount * rand(s + ci * 31 + j, 0.7, 1.3));
      const impressions = Math.round(camp.impressions / setCount * rand(s + ci * 37 + j, 0.6, 1.4));
      const clicks = Math.round(impressions * rand(s + ci * 41 + j, 0.01, 0.04));
      const conversions = Math.round(clicks * rand(s + ci * 43 + j, 0.02, 0.09));
      const revenue = Math.round(conversions * rand(s + ci * 47 + j, 150, 600));
      adSets.push({
        id: `mas-${ci}-${j}`,
        campaignId: camp.id,
        campaignName: camp.name,
        name: `${audiences[j % audiences.length]} - ${j < 2 ? '18-45' : '25-55'} ${j % 2 === 0 ? 'Kadın' : 'Tüm'}`,
        status: j === 0 ? 'Aktif' : (j < 2 ? 'Aktif' : 'Duraklatıldı'),
        spend,
        impressions,
        clicks,
        ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
        cpc: parseFloat((spend / Math.max(clicks, 1)).toFixed(2)),
        cpm: parseFloat((spend / impressions * 1000).toFixed(2)),
        conversions,
        revenue,
        roas: parseFloat((revenue / Math.max(spend, 1)).toFixed(2)),
        reach: Math.round(impressions * rand(s + ci * 48 + j, 0.5, 0.9)),
        frequency: parseFloat((impressions / Math.max(Math.round(impressions * rand(s + ci * 48 + j, 0.5, 0.9)), 1)).toFixed(1)),
        audience: audiences[j % audiences.length],
        placement: placements[(ci + j) % placements.length],
      });
    }
  });

  const ads: MetaAdCreative[] = [];
  adSets.forEach((adSet, asi) => {
    const adCount = 2 + (asi % 2);
    for (let k = 0; k < adCount; k++) {
      const spend = Math.round(adSet.spend / adCount * rand(s + asi * 53 + k, 0.7, 1.3));
      const impressions = Math.round(adSet.impressions / adCount * rand(s + asi * 59 + k, 0.6, 1.4));
      const clicks = Math.round(impressions * rand(s + asi * 61 + k, 0.01, 0.045));
      const conversions = Math.round(clicks * rand(s + asi * 67 + k, 0.02, 0.1));
      const revenue = Math.round(conversions * rand(s + asi * 71 + k, 150, 600));
      const fmt = adFormats[(asi + k) % adFormats.length];
      ads.push({
        id: `mad-${asi}-${k}`,
        adSetId: adSet.id,
        adSetName: adSet.name,
        campaignName: adSet.campaignName,
        name: `${fmt === 'Video' ? '🎬' : fmt === 'Carousel' ? '🔄' : fmt === 'Collection' ? '🛍️' : '🖼️'} Kreatif ${asi * 3 + k + 1} - ${fmt}`,
        status: k === 0 ? 'Aktif' : 'Duraklatıldı',
        format: fmt,
        spend,
        impressions,
        clicks,
        ctr: parseFloat((clicks / Math.max(impressions, 1) * 100).toFixed(2)),
        cpc: parseFloat((spend / Math.max(clicks, 1)).toFixed(2)),
        conversions,
        revenue,
        roas: parseFloat((revenue / Math.max(spend, 1)).toFixed(2)),
        reach: Math.round(impressions * rand(s + asi * 72 + k, 0.5, 0.9)),
        frequency: parseFloat((impressions / Math.max(Math.round(impressions * rand(s + asi * 72 + k, 0.5, 0.9)), 1)).toFixed(1)),
        thumbStopRatio: parseFloat(rand(s + asi * 73 + k, 15, 45).toFixed(1)),
        hookRate: parseFloat(rand(s + asi * 79 + k, 20, 55).toFixed(1)),
      });
    }
  });

  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  const totalImpressions = campaigns.reduce((a, c) => a + c.impressions, 0);
  const totalClicks = campaigns.reduce((a, c) => a + c.clicks, 0);
  const totalConversions = campaigns.reduce((a, c) => a + c.conversions, 0);
  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
  const totalReach = campaigns.reduce((a, c) => a + c.reach, 0);

  // Daily trend
  const days = m === 1 ? 1 : m;
  const dailyTrend = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      spend: Math.round(totalSpend / days * rand(s + i * 83, 0.6, 1.4)),
      revenue: Math.round(totalRevenue / days * rand(s + i * 89, 0.5, 1.5)),
      roas: parseFloat(rand(s + i * 97, 1.5, 5.5).toFixed(2)),
      impressions: Math.round(totalImpressions / days * rand(s + i * 101, 0.7, 1.3)),
    };
  });

  const overview: MetaOverview = {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalRevenue,
    avgCtr: parseFloat((totalClicks / totalImpressions * 100).toFixed(2)),
    avgCpc: parseFloat((totalSpend / totalClicks).toFixed(2)),
    avgCpm: parseFloat((totalSpend / totalImpressions * 1000).toFixed(2)),
    overallRoas: parseFloat((totalRevenue / totalSpend).toFixed(2)),
    totalReach,
    avgFrequency: parseFloat((totalImpressions / totalReach).toFixed(1)),
    costPerResult: parseFloat((totalSpend / totalConversions).toFixed(2)),
    prevPeriod: {
      spendChange: parseFloat(rand(s + 201, -15, 20).toFixed(1)),
      revenueChange: parseFloat(rand(s + 203, -10, 25).toFixed(1)),
      roasChange: parseFloat(rand(s + 207, -8, 12).toFixed(1)),
      convChange: parseFloat(rand(s + 211, -12, 18).toFixed(1)),
    },
    dailyTrend,
    spendByObjective: objectives.slice(0, 4).map((obj, i) => ({
      objective: obj,
      spend: Math.round(totalSpend * rand(s + i * 113, 0.1, 0.4)),
      conversions: Math.round(totalConversions * rand(s + i * 119, 0.05, 0.35)),
    })),
    placementBreakdown: placements.map((p, i) => ({
      placement: p,
      spend: Math.round(totalSpend * rand(s + i * 127, 0.05, 0.3)),
      clicks: Math.round(totalClicks * rand(s + i * 131, 0.05, 0.3)),
      conversions: Math.round(totalConversions * rand(s + i * 137, 0.05, 0.3)),
    })),
    hourlyClicks: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      clicks: Math.round((totalClicks / 24) * rand(s + i * 149, 0.2, 2.5)),
    })),
    genderClicks: [
      { gender: 'Kadın', clicks: Math.round(totalClicks * rand(s + 151, 0.5, 0.7)) },
      { gender: 'Erkek', clicks: Math.round(totalClicks * rand(s + 157, 0.2, 0.4)) },
      { gender: 'Bilinmiyor', clicks: Math.round(totalClicks * rand(s + 163, 0.05, 0.1)) },
    ],
  };

  return { overview, campaigns, adSets, ads };
}
