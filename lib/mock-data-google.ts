// d:\pocketbusiness\lib\mock-data-google.ts
// Google Ads detaylı mock veri üretici

export type GoogleCampaign = {
  id: string;
  name: string;
  type: 'Arama' | 'Alışveriş' | 'PMax' | 'Display' | 'Video';
  status: 'Aktif' | 'Duraklatıldı' | 'Tamamlandı';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  convValue: number;
  roas: number;
  impressionShare: number;
  qualityScore: number;
};

export type GoogleAdGroup = {
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
  conversions: number;
  convValue: number;
  roas: number;
};

export type GoogleKeyword = {
  id: string;
  adGroupId: string;
  adGroupName: string;
  campaignName: string;
  keyword: string;
  matchType: 'Geniş' | 'İfade' | 'Tam';
  status: 'Aktif' | 'Duraklatıldı';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  convValue: number;
  qualityScore: number;
  position: number;
};

export type GoogleSearchTerm = {
  id: string;
  searchTerm: string;
  matchedKeyword: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
  convValue: number;
};

export type GooglePMaxPlacement = {
  id: string;
  campaignName: string;
  placement: string;
  channel: 'Arama' | 'Alışveriş' | 'YouTube' | 'Display' | 'Discover' | 'Gmail';
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  convValue: number;
};

export type GoogleOverview = {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalConvValue: number;
  avgCtr: number;
  avgCpc: number;
  overallRoas: number;
  avgQualityScore: number;
  avgImpressionShare: number;
  prevPeriod: {
    spendChange: number;
    convValueChange: number;
    roasChange: number;
    convChange: number;
  };
  dailyTrend: { date: string; spend: number; convValue: number; roas: number; clicks: number }[];
  spendByType: { type: string; spend: number; conversions: number; roas: number }[];
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

export function generateGoogleMockData(slug: string, period: string = 'today'): {
  overview: GoogleOverview;
  campaigns: GoogleCampaign[];
  adGroups: GoogleAdGroup[];
  keywords: GoogleKeyword[];
  searchTerms: GoogleSearchTerm[];
  pmaxPlacements: GooglePMaxPlacement[];
} {
  const s = seed(slug) + 500;
  const m = period === 'yesterday' ? 1 : period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 1;

  const campaignDefs = [
    { name: 'Marka Arama - Brand', type: 'Arama' as const },
    { name: 'Genel Arama - Non-Brand', type: 'Arama' as const },
    { name: 'Alışveriş - Tüm Ürünler', type: 'Alışveriş' as const },
    { name: 'PMax - Ana Kampanya', type: 'PMax' as const },
    { name: 'PMax - Yeni Sezon', type: 'PMax' as const },
    { name: 'Display - Remarketing', type: 'Display' as const },
    { name: 'YouTube - Marka Bilinirliği', type: 'Video' as const },
  ];

  const campaigns: GoogleCampaign[] = campaignDefs.map((cd, i) => {
    const spend = Math.round(rand(s + i * 7, 300, 12000) * m);
    const impressions = Math.round(rand(s + i * 11, 5000, 300000) * m);
    const clicks = Math.round(impressions * rand(s + i * 13, 0.008, 0.06));
    const conversions = Math.round(clicks * rand(s + i * 17, 0.01, 0.1));
    const convValue = Math.round(conversions * rand(s + i * 19, 120, 700));
    return {
      id: `gc-${i}`,
      name: cd.name,
      type: cd.type,
      status: i < 5 ? 'Aktif' as const : i === 5 ? 'Duraklatıldı' as const : 'Tamamlandı' as const,
      spend,
      impressions,
      clicks,
      ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
      cpc: parseFloat((spend / Math.max(clicks, 1)).toFixed(2)),
      conversions,
      convValue,
      roas: parseFloat((convValue / Math.max(spend, 1)).toFixed(2)),
      impressionShare: parseFloat(rand(s + i * 23, 30, 85).toFixed(1)),
      qualityScore: Math.round(rand(s + i * 29, 5, 10)),
    };
  });

  const adGroups: GoogleAdGroup[] = [];
  campaigns.forEach((camp, ci) => {
    const groupCount = 2 + (ci % 3);
    const agNames: Record<string, string[]> = {
      'Arama': ['Elbise', 'Ayakkabı', 'Çanta', 'Aksesuar'],
      'Alışveriş': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk', 'Ev & Yaşam'],
      'PMax': ['Varlık Grubu 1', 'Varlık Grubu 2', 'Varlık Grubu 3', 'Performans En İyi'],
      'Display': ['Remarketing 7 Gün', 'Remarketing 30 Gün', 'Benzer Kitle'],
      'Video': ['In-Stream', 'Shorts', 'Discovery'],
    };
    const names = agNames[camp.type] || ['Grup 1', 'Grup 2', 'Grup 3'];
    for (let j = 0; j < groupCount; j++) {
      const spend = Math.round(camp.spend / groupCount * rand(s + ci * 31 + j, 0.6, 1.4));
      const impressions = Math.round(camp.impressions / groupCount * rand(s + ci * 37 + j, 0.5, 1.5));
      const clicks = Math.round(impressions * rand(s + ci * 41 + j, 0.008, 0.06));
      const conversions = Math.round(clicks * rand(s + ci * 43 + j, 0.01, 0.12));
      const convValue = Math.round(conversions * rand(s + ci * 47 + j, 120, 700));
      adGroups.push({
        id: `gag-${ci}-${j}`,
        campaignId: camp.id,
        campaignName: camp.name,
        name: names[j % names.length],
        status: j < 2 ? 'Aktif' : 'Duraklatıldı',
        spend,
        impressions,
        clicks,
        ctr: parseFloat((clicks / Math.max(impressions, 1) * 100).toFixed(2)),
        cpc: parseFloat((spend / Math.max(clicks, 1)).toFixed(2)),
        conversions,
        convValue,
        roas: parseFloat((convValue / Math.max(spend, 1)).toFixed(2)),
      });
    }
  });

  const keywordPool = [
    'elbise', 'abiye elbise', 'günlük elbise', 'yazlık elbise fiyat',
    'kadın ayakkabı', 'topuklu ayakkabı', 'spor ayakkabı indirim',
    'kadın çanta', 'deri çanta', 'online alışveriş',
    'tesettür giyim', 'büyük beden elbise', 'düğün kıyafeti',
    'erkek takım elbise', 'yaz modası 2026', 'sezon sonu indirim',
  ];
  const matchTypes: GoogleKeyword['matchType'][] = ['Geniş', 'İfade', 'Tam'];

  const keywords: GoogleKeyword[] = [];
  const searchAdGroups = adGroups.filter(ag => {
    const camp = campaigns.find(c => c.id === ag.campaignId);
    return camp?.type === 'Arama';
  });
  searchAdGroups.forEach((ag, agi) => {
    const kwCount = 3 + (agi % 3);
    for (let k = 0; k < kwCount; k++) {
      const kw = keywordPool[(agi * 3 + k) % keywordPool.length];
      const spend = Math.round(rand(s + agi * 53 + k, 50, 2000) * m);
      const impressions = Math.round(rand(s + agi * 59 + k, 500, 30000) * m);
      const clicks = Math.round(impressions * rand(s + agi * 61 + k, 0.01, 0.08));
      const conversions = Math.round(clicks * rand(s + agi * 67 + k, 0.01, 0.12));
      const convValue = Math.round(conversions * rand(s + agi * 71 + k, 120, 600));
      keywords.push({
        id: `gkw-${agi}-${k}`,
        adGroupId: ag.id,
        adGroupName: ag.name,
        campaignName: ag.campaignName,
        keyword: kw,
        matchType: matchTypes[k % 3],
        status: k < 2 ? 'Aktif' : 'Duraklatıldı',
        spend,
        impressions,
        clicks,
        ctr: parseFloat((clicks / Math.max(impressions, 1) * 100).toFixed(2)),
        cpc: parseFloat((spend / Math.max(clicks, 1)).toFixed(2)),
        conversions,
        convValue,
        qualityScore: Math.round(rand(s + agi * 73 + k, 4, 10)),
        position: parseFloat(rand(s + agi * 79 + k, 1.0, 4.5).toFixed(1)),
      });
    }
  });

  const searchTermPool = [
    'siyah abiye elbise', 'kırmızı topuklu ayakkabı', 'tesettür elbise modelleri',
    'ucuz kadın çanta', 'yazlık elbise online', 'büyük beden abiye',
    'düğün için elbise', 'indirimli ayakkabı', 'deri çanta fiyatları',
    'spor ayakkabı erkek', 'kadın giyim mağazası', 'online alışveriş siteleri',
    'sezon sonu indirim ne zaman', 'elbise kombinleri', 'şık günlük elbise',
    'marka ayakkabı outlet', 'çanta modelleri 2026', 'tesettür modası',
  ];

  const searchTerms: GoogleSearchTerm[] = searchTermPool.slice(0, 15).map((term, i) => {
    const impressions = Math.round(rand(s + i * 83, 100, 8000) * m);
    const clicks = Math.round(impressions * rand(s + i * 89, 0.01, 0.08));
    const spend = Math.round(clicks * rand(s + i * 97, 1, 8));
    const conversions = Math.round(clicks * rand(s + i * 101, 0.01, 0.1));
    const convValue = Math.round(conversions * rand(s + i * 103, 120, 500));
    return {
      id: `gst-${i}`,
      searchTerm: term,
      matchedKeyword: keywordPool[i % keywordPool.length],
      campaignName: campaigns[i % 2 === 0 ? 0 : 1].name,
      impressions,
      clicks,
      ctr: parseFloat((clicks / Math.max(impressions, 1) * 100).toFixed(2)),
      spend,
      conversions,
      convValue,
    };
  });

  const pmaxChannels: GooglePMaxPlacement['channel'][] = ['Arama', 'Alışveriş', 'YouTube', 'Display', 'Discover', 'Gmail'];
  const pmaxCampaigns = campaigns.filter(c => c.type === 'PMax');
  const pmaxPlacements: GooglePMaxPlacement[] = [];
  pmaxCampaigns.forEach((camp, ci) => {
    pmaxChannels.forEach((ch, chi) => {
      const impressions = Math.round(rand(s + ci * 107 + chi, 1000, 50000) * m);
      const clicks = Math.round(impressions * rand(s + ci * 109 + chi, 0.005, 0.04));
      const spend = Math.round(clicks * rand(s + ci * 113 + chi, 1, 10));
      const conversions = Math.round(clicks * rand(s + ci * 127 + chi, 0.01, 0.08));
      const convValue = Math.round(conversions * rand(s + ci * 131 + chi, 120, 600));
      pmaxPlacements.push({
        id: `gpm-${ci}-${chi}`,
        campaignName: camp.name,
        placement: `${ch} - ${camp.name.split(' - ')[1] || 'Genel'}`,
        channel: ch,
        impressions,
        clicks,
        spend,
        conversions,
        convValue,
      });
    });
  });

  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  const totalImpressions = campaigns.reduce((a, c) => a + c.impressions, 0);
  const totalClicks = campaigns.reduce((a, c) => a + c.clicks, 0);
  const totalConversions = campaigns.reduce((a, c) => a + c.conversions, 0);
  const totalConvValue = campaigns.reduce((a, c) => a + c.convValue, 0);

  const days = m === 1 ? 1 : m;
  const dailyTrend = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      spend: Math.round(totalSpend / days * rand(s + i * 139, 0.6, 1.4)),
      convValue: Math.round(totalConvValue / days * rand(s + i * 149, 0.5, 1.5)),
      roas: parseFloat(rand(s + i * 151, 1.2, 6.0).toFixed(2)),
      clicks: Math.round(totalClicks / days * rand(s + i * 157, 0.7, 1.3)),
    };
  });

  const typeSpend = ['Arama', 'Alışveriş', 'PMax', 'Display', 'Video'];
  const overview: GoogleOverview = {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalConvValue,
    avgCtr: parseFloat((totalClicks / totalImpressions * 100).toFixed(2)),
    avgCpc: parseFloat((totalSpend / totalClicks).toFixed(2)),
    overallRoas: parseFloat((totalConvValue / totalSpend).toFixed(2)),
    avgQualityScore: parseFloat((campaigns.reduce((a, c) => a + c.qualityScore, 0) / campaigns.length).toFixed(1)),
    avgImpressionShare: parseFloat((campaigns.reduce((a, c) => a + c.impressionShare, 0) / campaigns.length).toFixed(1)),
    prevPeriod: {
      spendChange: parseFloat(rand(s + 301, -15, 20).toFixed(1)),
      convValueChange: parseFloat(rand(s + 303, -10, 25).toFixed(1)),
      roasChange: parseFloat(rand(s + 307, -8, 12).toFixed(1)),
      convChange: parseFloat(rand(s + 311, -12, 18).toFixed(1)),
    },
    dailyTrend,
    spendByType: typeSpend.map((t, i) => {
      const typeCamps = campaigns.filter(c => c.type === t);
      return {
        type: t,
        spend: typeCamps.reduce((a, c) => a + c.spend, 0),
        conversions: typeCamps.reduce((a, c) => a + c.conversions, 0),
        roas: typeCamps.length > 0
          ? parseFloat((typeCamps.reduce((a, c) => a + c.convValue, 0) / Math.max(typeCamps.reduce((a, c) => a + c.spend, 0), 1)).toFixed(2))
          : 0,
      };
    }),
  };

  return { overview, campaigns, adGroups, keywords, searchTerms, pmaxPlacements };
}
