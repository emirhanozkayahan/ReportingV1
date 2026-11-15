import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAdsService } from '@/lib/google/service';
import { getGa4DateRange } from '@/lib/date-range';
import { googleAdsSearchUrl, parseGoogleAdsResponse } from '@/lib/google/api';


// Micros'u makro değere (TL) çevirir
const formatMicros = (micros: any) => (parseInt(micros || '0', 10) / 1000000);
const num = (v: any) => parseFloat(v || '0') || 0;
const int = (v: any) => parseInt(v || '0', 10);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    let range = searchParams.get('range') || '30d';

    if (!slug) {
      return NextResponse.json({ error: 'Marka slug parametresi gerekli' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // 1. Markayı bul
    const { data: brand } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!brand) return NextResponse.json({ error: 'Marka bulunamadı' }, { status: 404 });

    // 2. Google Ads Entegrasyonunu bul
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('credentials')
      .eq('brand_id', brand.id)
      .eq('platform', 'google')
      .single();

    if (!integration || !integration.credentials?.customerId) {
      // Entegrasyon yoksa mock data dönmeyi Dashboard tarafı halledebilir veya boş döneriz.
      return NextResponse.json({ error: 'Bu marka için Google Ads Customer ID bulunamadı' }, { status: 404 });
    }

    const customerId = integration.credentials.customerId.replace(/-/g, '');
    const managerId = (process.env.GOOGLE_ADS_MANAGER_ID || '').replace(/-/g, '');
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';

    // 3. Access Token Al (GoogleAdsService üzerinden)
    const googleService = new GoogleAdsService();
    const accessToken = await googleService.getAccessToken();

    const { startDate, endDate } = getGa4DateRange(range);

    // 4. API İsteği İçin Yardımcı Fonksiyon
    const fetchGaql = async (query: string) => {
      const url = googleAdsSearchUrl(customerId);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': devToken,
          'login-customer-id': managerId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      const data = await parseGoogleAdsResponse(res);
      if (!res.ok) throw new Error(JSON.stringify(data));
      return (data.results as unknown[]) || [];
    };

    // --- SORGULAR ---
    
    // Kampanyalar
    const campaignQuery = `
      SELECT 
        campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, 
        metrics.conversions, metrics.search_absolute_top_impression_share 
      FROM campaign 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' 
      AND metrics.impressions > 0
    `;

    // Öğe Grupları (Ad Groups ve PMax Asset Groups)
    const adGroupQuery = `
      SELECT 
        ad_group.id, ad_group.name, ad_group.status, campaign.id, campaign.name, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, metrics.conversions 
      FROM ad_group 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.impressions > 0
    `;

    const assetGroupQuery = `
      SELECT 
        asset_group.id, asset_group.name, asset_group.status, campaign.id, campaign.name, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, metrics.conversions 
      FROM asset_group 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.impressions > 0
    `;

    // Anahtar Kelimeler (Keywords)
    const keywordQuery = `
      SELECT 
        ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, 
        ad_group_criterion.quality_info.quality_score, campaign.name, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, metrics.conversions 
      FROM keyword_view 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.impressions > 0
    `;

    // Arama Terimleri (Search Terms)
    const searchTermQuery = `
      SELECT 
        search_term_view.search_term, search_term_view.status, campaign.name, 
        metrics.cost_micros, metrics.conversions_value, metrics.clicks, metrics.impressions, metrics.conversions 
      FROM search_term_view 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.impressions > 0
    `;

    // PMax Yerleşimleri (Performance Max Placement View)
    const pmaxQuery = `
      SELECT 
        performance_max_placement_view.placement, 
        performance_max_placement_view.placement_type,
        campaign.name, 
        metrics.impressions 
      FROM performance_max_placement_view 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.impressions > 0
    `;

    // Günlük Trend
    const trendQuery = `
      SELECT 
        segments.date, metrics.cost_micros, metrics.conversions_value 
      FROM campaign 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;

    // 5. Paralel Olarak Verileri Çek
    const [campaignsRaw, adGroupsRawResult, assetGroupsRawResult, keywordsRaw, searchTermsRaw, pmaxRaw, trendRaw] = await Promise.all([
      fetchGaql(campaignQuery).catch(() => []),
      fetchGaql(adGroupQuery).catch(() => []),
      fetchGaql(assetGroupQuery).catch(() => []),
      fetchGaql(keywordQuery).catch(() => []),
      fetchGaql(searchTermQuery).catch(() => []),
      fetchGaql(pmaxQuery).catch(() => []),
      fetchGaql(trendQuery).catch(() => [])
    ]);

    const adGroupsRaw = [...(adGroupsRawResult || []), ...(assetGroupsRawResult || [])];

    // 6. Verileri Formatla
    
    let totalSpend = 0;
    let totalConvValue = 0;
    let totalConversions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    
    // Kampanyalar
    const campaigns = campaignsRaw.map((row: any) => {
      const spend = formatMicros(row.metrics?.costMicros);
      const convValue = num(row.metrics?.conversionsValue);
      const clicks = int(row.metrics?.clicks);
      const impressions = int(row.metrics?.impressions);
      const convs = num(row.metrics?.conversions);
      
      totalSpend += spend;
      totalConvValue += convValue;
      totalConversions += convs;
      totalClicks += clicks;
      totalImpressions += impressions;

      return {
        id: row.campaign?.id,
        name: row.campaign?.name,
        type: row.campaign?.advertisingChannelType || 'Arama',
        status: row.campaign?.status === 'ENABLED' ? 'Aktif' : row.campaign?.status === 'PAUSED' ? 'Duraklatıldı' : 'Diğer',
        spend,
        impressions,
        clicks,
        ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
        cpc: clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0,
        conversions: convs,
        convValue,
        roas: spend > 0 ? parseFloat((convValue / spend).toFixed(2)) : 0,
        impressionShare: parseFloat((num(row.metrics?.searchAbsoluteTopImpressionShare) * 100).toFixed(1)) || 0
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // Ad Groups / Asset Groups
    const adGroups = adGroupsRaw.map((row: any) => {
      const spend = formatMicros(row.metrics?.costMicros);
      const convValue = num(row.metrics?.conversionsValue);
      const clicks = int(row.metrics?.clicks);
      const impressions = int(row.metrics?.impressions);
      
      const id = row.adGroup?.id || row.assetGroup?.id;
      const name = row.adGroup?.name || row.assetGroup?.name;
      const statusObj = row.adGroup?.status || row.assetGroup?.status;
      const status = statusObj === 'ENABLED' ? 'Aktif' : 'Pasif';

      return {
        id,
        name,
        campaignId: row.campaign?.id,
        campaignName: row.campaign?.name,
        status,
        spend, impressions, clicks,
        ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
        cpc: clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0,
        conversions: num(row.metrics?.conversions),
        convValue,
        roas: spend > 0 ? parseFloat((convValue / spend).toFixed(2)) : 0
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // Keywords
    const keywords = keywordsRaw.map((row: any) => {
      const spend = formatMicros(row.metrics?.costMicros);
      const convValue = num(row.metrics?.conversionsValue);
      const clicks = int(row.metrics?.clicks);
      const impressions = int(row.metrics?.impressions);
      return {
        id: row.adGroupCriterion?.criterionId,
        keyword: row.adGroupCriterion?.keyword?.text,
        matchType: row.adGroupCriterion?.keyword?.matchType === 'EXACT' ? '[Tam]' : row.adGroupCriterion?.keyword?.matchType === 'PHRASE' ? '"Sıralı"' : 'Geniş',
        campaignName: row.campaign?.name,
        spend, impressions, clicks,
        ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
        cpc: clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0,
        conversions: num(row.metrics?.conversions),
        convValue,
        qualityScore: int(row.adGroupCriterion?.qualityInfo?.qualityScore) || 5,
        position: '-'
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // Search Terms
    const searchTerms = searchTermsRaw.map((row: any) => {
      const spend = formatMicros(row.metrics?.costMicros);
      const convValue = num(row.metrics?.conversionsValue);
      const clicks = int(row.metrics?.clicks);
      const impressions = int(row.metrics?.impressions);
      return {
        id: Math.random().toString(36).substring(7),
        searchTerm: row.searchTermView?.searchTerm,
        matchedKeyword: row.searchTermView?.status || 'Bilinmiyor',
        campaignName: row.campaign?.name,
        impressions, clicks, spend,
        ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
        conversions: num(row.metrics?.conversions),
        convValue
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // PMax Placements
    const pmaxPlacements = pmaxRaw.map((row: any) => {
      const impressions = int(row.metrics?.impressions);
      return {
        id: Math.random().toString(36).substring(7),
        placement: row.performanceMaxPlacementView?.placement,
        type: row.performanceMaxPlacementView?.placementType,
        campaignName: row.campaign?.name,
        impressions,
        clicks: 0,
        spend: 0,
        conversions: 0,
        convValue: 0
      };
    }).sort((a: any, b: any) => b.impressions - a.impressions);

    // Daily Trend
    const trendMap = new Map<string, { spend: number; convValue: number }>();
    trendRaw.forEach((row: any) => {
      const date = row.segments?.date;
      if (!date) return;
      const spend = formatMicros(row.metrics?.costMicros);
      const convValue = num(row.metrics?.conversionsValue);
      
      if (trendMap.has(date)) {
        const existing = trendMap.get(date)!;
        existing.spend += spend;
        existing.convValue += convValue;
      } else {
        trendMap.set(date, { spend, convValue });
      }
    });

    const dailyTrend = Array.from(trendMap.entries()).map(([date, data]) => {
      const dateParts = date.split('-');
      return {
        dateOriginal: date,
        date: dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : date,
        spend: data.spend,
        convValue: data.convValue
      };
    }).sort((a: any, b: any) => a.dateOriginal.localeCompare(b.dateOriginal));

    // Overview
    const overview = {
      totalSpend,
      totalConvValue,
      overallRoas: totalSpend > 0 ? parseFloat((totalConvValue / totalSpend).toFixed(2)) : 0,
      totalConversions,
      totalClicks,
      avgCtr: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
      avgCpc: totalClicks > 0 ? parseFloat((totalSpend / totalClicks).toFixed(2)) : 0,
      avgQualityScore: 7, // Mock average
      prevPeriod: { spendChange: 0, convValueChange: 0, roasChange: 0, convChange: 0 },
      dailyTrend,
      spendByType: campaigns.map((c: any) => ({ type: c.name, spend: c.spend })).slice(0, 5) // Top 5 campaigns for pie chart
    };

    return NextResponse.json({
      overview,
      campaigns,
      adGroups,
      keywords,
      searchTerms,
      pmaxPlacements,
      isLive: true
    });

  } catch (error: any) {
    console.error('Google Ads Live API Hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
