import { supabaseAdmin } from '@/lib/supabase';
import { googleAdsSearchUrl, parseGoogleAdsResponse } from './api';

export interface GoogleCampaignResult {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  date: string;
}

/**
 * Google Ads API Service
 * 
 * Ajans MCC hesabı (Manager Account) ile Google Ads API üzerinden verilere erişim sağlar.
 */
export class GoogleAdsService {
  private developerToken: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private managerCustomerId: string;
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    this.clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
    this.managerCustomerId = process.env.GOOGLE_ADS_MANAGER_ID || '';
  }

  /**
   * Spesifik bir müşteri hesabından (Customer ID) ilgili tarih için performansı çeker.
   */
  async getDailyCampaignStats(customerId: string, targetDate: string): Promise<GoogleCampaignResult[]> {
    try {
      // Mock / Simülasyon
      if (!this.developerToken || this.developerToken === 'mock') {
         return this.mockGoogleApiCall(customerId, targetDate);
      }

      // 1. Yeni bir Access Token Al
      const accessToken = await this.getAccessToken();

      // 2. GAQL (Google Ads Query Language) ile veri sorgula
      const query = `
        SELECT 
          campaign.id, 
          campaign.name, 
          metrics.cost_micros, 
          metrics.conversions_value, 
          metrics.clicks, 
          metrics.impressions, 
          metrics.conversions 
        FROM campaign 
        WHERE segments.date = '${targetDate}'
      `;

      // 3. API Isteği
      const url = googleAdsSearchUrl(customerId);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.developerToken,
          'login-customer-id': this.managerCustomerId.replace(/-/g, ''),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      const data = await parseGoogleAdsResponse(response);
      if (!response.ok) {
        throw new Error(`Google Ads API Hatası: ${JSON.stringify(data)}`);
      }
      return this.parseGoogleResults(((data.results as any[]) || []), targetDate);

    } catch (error) {
      console.error(`[GoogleAdsService] ${customerId} hatası:`, error);
      throw error;
    }
  }

  public async getAccessToken(): Promise<string> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    // Supabase üzerinden global önbellek kontrolü
    if (supabaseAdmin) {
      const { data: cached } = await supabaseAdmin
        .from('agency_settings')
        .select('key, value')
        .in('key', ['google_ads_access_token', 'google_ads_token_expires_at']);
        
      let dbToken = null;
      let dbExpiresAt = 0;
      
      cached?.forEach(c => {
        if (c.key === 'google_ads_access_token') dbToken = c.value;
        if (c.key === 'google_ads_token_expires_at') dbExpiresAt = parseInt(c.value, 10);
      });

      if (dbToken && Date.now() < dbExpiresAt) {
        this.cachedAccessToken = dbToken;
        this.tokenExpiresAt = dbExpiresAt;
        return dbToken;
      }
    }

    // Veritabanından refresh token çek (eğer env'da yoksa)
    let currentRefreshToken = this.refreshToken;
    if (!currentRefreshToken && supabaseAdmin) {
      const { data: adsSettings } = await supabaseAdmin
        .from('agency_settings')
        .select('value')
        .eq('key', 'google_ads_refresh_token')
        .single();
        
      if (adsSettings && adsSettings.value) {
        currentRefreshToken = adsSettings.value;
      } else {
        const { data: settings } = await supabaseAdmin
          .from('agency_settings')
          .select('value')
          .eq('key', 'google_refresh_token')
          .single();
          
        if (settings && settings.value) {
          currentRefreshToken = settings.value;
        }
      }
    }

    if (!currentRefreshToken) {
      throw new Error('Google OAuth Refresh Token bulunamadı');
    }

    // OAuth2 Refresh Token kullanarak yeni Access Token alır
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', currentRefreshToken);
    params.append('grant_type', 'refresh_token');

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Google OAuth error:", errorData);
      throw new Error('Google OAuth Token yenilenemedi');
    }
    const data = await res.json();
    
    this.cachedAccessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // Buffer 60 seconds

    // Supabase global önbelleğe kaydet
    if (supabaseAdmin) {
      const expiresAtStr = this.tokenExpiresAt.toString();
      
      const { data: existingToken } = await supabaseAdmin.from('agency_settings').select('id').eq('key', 'google_ads_access_token').single();
      if (existingToken) {
        await supabaseAdmin.from('agency_settings').update({ value: this.cachedAccessToken }).eq('id', existingToken.id);
      } else {
        await supabaseAdmin.from('agency_settings').insert([{ key: 'google_ads_access_token', value: this.cachedAccessToken }]);
      }
      
      const { data: existingExpire } = await supabaseAdmin.from('agency_settings').select('id').eq('key', 'google_ads_token_expires_at').single();
      if (existingExpire) {
        await supabaseAdmin.from('agency_settings').update({ value: expiresAtStr }).eq('id', existingExpire.id);
      } else {
        await supabaseAdmin.from('agency_settings').insert([{ key: 'google_ads_token_expires_at', value: expiresAtStr }]);
      }
    }

    return data.access_token;
  }

  private parseGoogleResults(results: any[], date: string): GoogleCampaignResult[] {
    return results.map(row => {
      // Google Ads fiyat verilerini micros formatında döner (1 TL = 1,000,000 micros)
      const spendMicros = row.metrics?.costMicros || 0;
      const revenue = row.metrics?.conversionsValue || 0;

      return {
        campaign_id: row.campaign?.id,
        campaign_name: row.campaign?.name,
        spend: spendMicros / 1000000,
        revenue: parseFloat(revenue),
        clicks: parseInt(row.metrics?.clicks || '0', 10),
        impressions: parseInt(row.metrics?.impressions || '0', 10),
        conversions: parseFloat(row.metrics?.conversions || '0'),
        date: date
      };
    });
  }

  private mockGoogleApiCall(customerId: string, date: string): GoogleCampaignResult[] {
    return [
      {
        campaign_id: 'mock_g1',
        campaign_name: 'Google_Arama_Ağı_Jenerik',
        spend: 250,
        revenue: 1200,
        clicks: 45,
        impressions: 1200,
        conversions: 1,
        date: date
      }
    ];
  }
}

