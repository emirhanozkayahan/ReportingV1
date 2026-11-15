import { NextResponse } from 'next/server';
import { generateAnalyticsMockData } from '@/lib/mock-data-analytics';
import {
  getGa4Cached,
  getGa4StaleCached,
  isGa4QuotaError,
  setGa4Cached,
} from '@/lib/ga4-live-cache';
import { supabaseAdmin } from '@/lib/supabase';
import { getGa4DateRangeFromParams } from '@/lib/date-range';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const range = searchParams.get('range') || '30d';
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');
  const cacheRangeKey =
    range === 'custom' && startParam && endParam
      ? `custom:${startParam}:${endParam}`
      : range;

  try {
    if (!slug) {
      return NextResponse.json({ error: 'Marka slug parametresi gerekli' }, { status: 400 });
    }

    const cached = getGa4Cached(slug, cacheRangeKey);
    if (cached) {
      return NextResponse.json({ ...cached.body, ga4FromCache: true });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // 1. Markanın Property ID'sini al
    const { data: brand } = await supabaseAdmin
      .from('brands')
      .select('ga4_property_id')
      .eq('slug', slug)
      .single();

    if (!brand || !brand.ga4_property_id) {
      return NextResponse.json({ error: 'Bu marka için GA4 Mülk ID bulunamadı' }, { status: 404 });
    }

    const propertyId = brand.ga4_property_id;

    // 2. Agency Refresh Token'ı al
    const { data: settings } = await supabaseAdmin
      .from('agency_settings')
      .select('value')
      .eq('key', 'google_refresh_token')
      .single();

    const refreshToken = settings?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Ajans Google Analytics hesabı bağlı değil' }, { status: 403 });
    }

    // 3. Yeni Access Token al
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Sistem Google API ayarları eksik' }, { status: 500 });
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error('Google Access Token alınamadı: ' + JSON.stringify(tokenData));
    }

    const accessToken = tokenData.access_token;

    // 4. GA4 API'ye İstek At (batchRunReports)
    const { startDate, endDate } = getGa4DateRangeFromParams(range, startParam, endParam);

    const batchBody1 = {
      requests: [
        // 0. Overview & Traffic Sources
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionMedium' }, { name: 'sessionSource' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'newUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
            { name: 'conversions' }
          ],
          metricAggregations: ['TOTAL'],
          keepEmptyRows: false,
        },
        // 1. Landing Pages
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'landingPagePlusQueryString' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'conversions' }
          ],
          keepEmptyRows: false,
          limit: 20
        },
        // 2. Page Paths
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' }
          ],
          keepEmptyRows: false,
          limit: 20
        },
        // 3. Devices
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'conversions' }
          ],
          keepEmptyRows: false,
        },
        // 4. Browsers
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'browser' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'conversions' }
          ],
          keepEmptyRows: false,
          limit: 10
        },
        // 5. Cities
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'city' }],
          metrics: [
            { name: 'sessions' },
            { name: 'conversions' }
          ],
          keepEmptyRows: false,
          limit: 15
        },
        // 6. Genders
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'userGender' }],
          metrics: [
            { name: 'sessions' },
            { name: 'conversions' }
          ],
          keepEmptyRows: false
        }
      ]
    };

    const batchBody2 = {
      requests: [
        ...batchBody1.requests.splice(5),
        {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
          keepEmptyRows: false,
          limit: 15,
        },
      ],
    };

    const reportResPromise1 = fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchBody1),
    });

    const reportResPromise2 = fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchBody2),
    });

    const realtimeBody = {
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }]
    };

    const realtimeResPromise = fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(realtimeBody),
    });

    const [reportRes1, reportRes2, realtimeRes] = await Promise.all([
      reportResPromise1,
      reportResPromise2,
      realtimeResPromise,
    ]);

    const batchData1 = await reportRes1.json();
    const batchData2 = await reportRes2.json();
    const realtimeData = await realtimeRes.json();

    const quotaHit =
      isGa4QuotaError(batchData1.error) ||
      isGa4QuotaError(batchData2.error) ||
      isGa4QuotaError(realtimeData.error);

    if (quotaHit) {
      const stale = getGa4StaleCached(slug, cacheRangeKey);
      if (stale) {
        return NextResponse.json({
          ...stale.body,
          ga4FromCache: true,
          ga4QuotaExceeded: true,
          ga4CacheWarning:
            'GA4 API kotası dolu. Önbellekteki son veriler gösteriliyor (yaklaşık 1 saat içinde yenilenecek).',
        });
      }
      return NextResponse.json(
        {
          error:
            'GA4 API kotası geçici olarak doldu. Lütfen yaklaşık 1 saat sonra tekrar deneyin.',
          code: 429,
        },
        { status: 429 }
      );
    }

    if (batchData1.error) {
      throw new Error('GA4 Rapor Hatası 1: ' + JSON.stringify(batchData1.error));
    }
    if (batchData2.error) {
      throw new Error('GA4 Rapor Hatası 2: ' + JSON.stringify(batchData2.error));
    }

    const reports = [...(batchData1.reports || []), ...(batchData2.reports || [])];

    // --- Parse Realtime Data ---
    let activeUsers = 0;
    const activeCountries: { country: string, users: number }[] = [];

    if (realtimeData.rows) {
      realtimeData.rows.forEach((r: any) => {
        const users = parseInt(r.metricValues[0]?.value || '0', 10);
        activeUsers += users;
        const country = r.dimensionValues[0]?.value;
        const existing = activeCountries.find(c => c.country === country);
        if (existing) {
          existing.users += users;
        } else {
          activeCountries.push({ country, users });
        }
      });
      activeCountries.sort((a, b) => b.users - a.users);
    }

    // --- Parse Report 0: Traffic & Overview ---
    const trafficReport = reports[0];
    const tTotals = trafficReport.totals?.[0]?.metricValues || [];
    
    const num = (v: any) => parseFloat(v || '0') || 0;
    const int = (v: any) => Math.round(num(v));

    const totalSessions = int(tTotals[0]?.value);
    const totalUsers = int(tTotals[1]?.value);
    const totalNewUsers = int(tTotals[2]?.value);
    const totalPageViews = int(tTotals[3]?.value);
    const avgSessionDur = num(tTotals[6]?.value);
    const totalConversions = int(tTotals[7]?.value);

    const mMin = Math.floor(avgSessionDur / 60);
    const mSec = Math.round(avgSessionDur % 60);

    const overview = {
      sessions: totalSessions,
      users: totalUsers,
      newUsers: totalNewUsers,
      returningUsers: Math.max(0, totalUsers - totalNewUsers),
      pageViews: totalPageViews,
      avgSessionDuration: `${mMin}dk ${mSec}sn`,
      bounceRate: parseFloat((num(tTotals[4]?.value) * 100).toFixed(1)),
      engagementRate: parseFloat((num(tTotals[5]?.value) * 100).toFixed(1)),
      pagesPerSession: totalSessions > 0 ? parseFloat((totalPageViews / totalSessions).toFixed(1)) : 0,
      eventsPerSession: 0,
      prevPeriod: { sessionsChange: 0, usersChange: 0, bounceRateChange: 0, engagementChange: 0 },
      dailyTrend: [{
        date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        sessions: totalSessions,
        users: totalUsers,
        bounceRate: parseFloat((num(tTotals[4]?.value) * 100).toFixed(1)),
        pageViews: totalPageViews
      }]
    };

    const trafficSources = (trafficReport.rows || []).map((r: any) => {
      const medium = r.dimensionValues[0]?.value;
      const source = r.dimensionValues[1]?.value;
      const s = int(r.metricValues[0]?.value);
      const u = int(r.metricValues[1]?.value);
      const pv = int(r.metricValues[3]?.value);
      const conv = int(r.metricValues[7]?.value);
      return {
        source, medium,
        sessions: s, users: u,
        bounceRate: parseFloat((num(r.metricValues[4]?.value) * 100).toFixed(1)),
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0,
        revenue: 0,
        pagesPerSession: s > 0 ? parseFloat((pv / s).toFixed(1)) : 0,
        purchases: conv
      };
    }).filter((r: any) => !r.medium.includes('RESERVED')).sort((a: any, b: any) => b.sessions - a.sessions);

    // --- Parse Report 1: Landing Pages ---
    const landingPages = (reports[1]?.rows || []).map((r: any) => {
      const s = int(r.metricValues[0]?.value);
      const conv = int(r.metricValues[3]?.value);
      const dur = num(r.metricValues[2]?.value);
      return {
        path: r.dimensionValues[0]?.value,
        title: r.dimensionValues[0]?.value,
        sessions: s,
        bounceRate: parseFloat((num(r.metricValues[1]?.value) * 100).toFixed(1)),
        avgSessionDuration: `${Math.floor(dur / 60)}dk ${Math.round(dur % 60)}sn`,
        conversions: conv,
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0
      };
    });

    // --- Parse Report 2: Page Paths ---
    const pagePaths = (reports[2]?.rows || []).map((r: any) => {
      return {
        path: r.dimensionValues[0]?.value,
        title: r.dimensionValues[1]?.value,
        views: int(r.metricValues[0]?.value),
        uniqueViews: int(r.metricValues[1]?.value),
        avgTimeOnPage: '0sn',
        exitRate: 0
      };
    });

    // --- Parse Report 3: Devices ---
    const deviceDetails = (reports[3]?.rows || []).map((r: any) => {
      const s = int(r.metricValues[0]?.value);
      const conv = int(r.metricValues[2]?.value);
      return {
        device: r.dimensionValues[0]?.value,
        sessions: s,
        bounceRate: parseFloat((num(r.metricValues[1]?.value) * 100).toFixed(1)),
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0,
        revenue: 0, avgSessionDuration: '0', pagesPerSession: 0
      };
    });

    // --- Parse Report 4: Browsers ---
    const browserDetails = (reports[4]?.rows || []).map((r: any) => {
      const s = int(r.metricValues[0]?.value);
      const conv = int(r.metricValues[2]?.value);
      return {
        browser: r.dimensionValues[0]?.value,
        sessions: s,
        bounceRate: parseFloat((num(r.metricValues[1]?.value) * 100).toFixed(1)),
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0
      };
    });

    // --- Parse Events (batch 2, son rapor) ---
    const eventsReport = reports[7] || {};
    const events = (eventsReport.rows || []).map((r: any) => {
      return {
        eventName: r.dimensionValues[0]?.value,
        count: int(r.metricValues[0]?.value),
        users: int(r.metricValues[1]?.value),
        valuePerEvent: 0
      };
    }).sort((a: any, b: any) => b.count - a.count);

    // --- Parse Report 5: Cities ---
    const cityData = reports[5] || {};
    const cities = (cityData.rows || []).map((r: any) => {
      const s = int(r.metricValues[0]?.value);
      const conv = int(r.metricValues[1]?.value);
      return {
        city: r.dimensionValues[0]?.value || '(not set)',
        sessions: s,
        conversions: conv,
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0
      };
    }).sort((a: any, b: any) => b.sessions - a.sessions);

    // --- Parse Report 6: Genders ---
    const genderData = reports[6] || {};
    const genders = (genderData.rows || []).map((r: any) => {
      const s = int(r.metricValues[0]?.value);
      const conv = int(r.metricValues[1]?.value);
      return {
        gender: r.dimensionValues[0]?.value || 'Bilinmiyor',
        sessions: s,
        conversions: conv,
        conversionRate: s > 0 ? parseFloat(((conv / s) * 100).toFixed(2)) : 0
      };
    }).sort((a: any, b: any) => b.sessions - a.sessions);

    // Purchase Journey Mock Mixin (since true journey requires funnel exploration API which is not available in v1beta)
    const getEventUsers = (name: string) => events.find((e: any) => e.eventName === name)?.users || 0;
    
    const step1 = getEventUsers('session_start') || totalSessions;
    const step2 = getEventUsers('view_item');
    const step3 = getEventUsers('add_to_cart');
    const step4 = getEventUsers('begin_checkout');
    const step5 = getEventUsers('purchase') || totalConversions;

    const convRate = step1 > 0 ? parseFloat(((step5 / step1) * 100).toFixed(2)) : 0;
    
    const purchaseJourney = {
      steps: [
        { step: 'Oturum Başlatma', users: step1, percentage: 100, dropOff: step2 ? parseFloat(((step1 - step2) / step1 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Ürünü Görüntüleme', users: step2, percentage: step1 ? parseFloat((step2 / step1 * 100).toFixed(1)) : 0, dropOff: step3 ? parseFloat(((step2 - step3) / step2 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Sepete Ekleme', users: step3, percentage: step1 ? parseFloat((step3 / step1 * 100).toFixed(1)) : 0, dropOff: step4 ? parseFloat(((step3 - step4) / step3 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Ödeme Başlatma', users: step4, percentage: step1 ? parseFloat((step4 / step1 * 100).toFixed(1)) : 0, dropOff: step5 ? parseFloat(((step4 - step5) / step4 * 100).toFixed(1)) : 0, avgTime: '-' },
        { step: 'Satın Alma', users: step5, percentage: step1 ? parseFloat((step5 / step1 * 100).toFixed(1)) : 0, dropOff: 0, avgTime: '-' }
      ],
      conversionRate: convRate,
      avgTimeToConversion: 'Bilinmiyor',
      microConversions: events
        .filter((e: any) => ['add_to_cart', 'begin_checkout', 'add_to_wishlist', 'sign_up', 'login'].includes(e.eventName))
        .map((e: any) => ({
          event: e.eventName,
          count: e.count,
          rate: step1 > 0 ? parseFloat(((e.users / step1) * 100).toFixed(2)) : 0
        }))
    };

    const mockData = generateAnalyticsMockData(slug, range);

    const payload = {
      isGa4Live: true,
      ga4Meta: { fixturePeriod: range, rowCount: trafficSources.length },
      overview,
      trafficSources,
      landingPages,
      pagePaths,
      deviceDetails,
      browserDetails,
      events,
      purchaseJourney,
      cities,
      genders,
      ageGender: mockData.ageGender,
      hourlySessions: mockData.hourlySessions,
      dayOfWeek: mockData.dayOfWeek,
      realtime: {
        activeUsers,
        activeCountries,
      },
    };

    setGa4Cached(slug, cacheRangeKey, payload);
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('GA4 Live Error:', error);
    const msg = error?.message ?? 'Bilinmeyen hata';
    if (slug && (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED'))) {
      const stale = getGa4StaleCached(slug, cacheRangeKey);
      if (stale) {
        return NextResponse.json({
          ...stale.body,
          ga4FromCache: true,
          ga4QuotaExceeded: true,
          ga4CacheWarning:
            'GA4 API kotası dolu. Önbellekteki son veriler gösteriliyor (yaklaşık 1 saat içinde yenilenecek).',
        });
      }
      return NextResponse.json(
        { error: 'GA4 API kotası geçici olarak doldu. Lütfen yaklaşık 1 saat sonra tekrar deneyin.', code: 429 },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

