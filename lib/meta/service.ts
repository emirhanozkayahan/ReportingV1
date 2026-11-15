export interface MetaCampaignResult {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  reach?: number;
  frequency?: number;
  date: string;
}

export interface MetaAdSetResult {
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  reach?: number;
  frequency?: number;
  date: string;
}

export interface MetaAdResult {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  reach?: number;
  frequency?: number;
  isVideo: boolean;
  video_3_sec_views: number;
  date: string;
}

export interface MetaDailyAccountInsight {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface MetaPlacementResult {
  placement: string;
  spend: number;
  clicks: number;
  conversions: number;
}

import {
  sanitizeMetaAccessToken,
  validateMetaAccessToken,
} from "./sanitize-credentials";

/**
 * Meta Marketing API — admin panelden gelen System User token ile çalışır.
 */
export class MetaService {
  private accessToken: string;
  private apiVersion = "v19.0";
  private baseUrl: string;

  constructor(accessToken: string) {
    const token = sanitizeMetaAccessToken(accessToken);
    if (!token) {
      throw new Error("Meta access token eksik.");
    }
    const validationError = validateMetaAccessToken(token);
    if (validationError) {
      throw new Error(validationError);
    }
    this.accessToken = token;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  private formatAccountId(adAccountId: string): string {
    return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
  }

  private async graphGet(path: string, params: Record<string, string>): Promise<any> {
    const qs = new URLSearchParams({ ...params, access_token: this.accessToken });
    const url = `${this.baseUrl}${path}?${qs.toString()}`;
    const response = await fetch(url, { next: { revalidate: 0 } });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        `${json.error?.message || response.statusText} (kod: ${json.error?.code ?? response.status})`
      );
    }
    return json;
  }

  /** Tek gün — sync motoru için */
  async getDailyCampaignStats(
    adAccountId: string,
    targetDate: string
  ): Promise<MetaCampaignResult[]> {
    return this.getCampaignStatsForRange(adAccountId, targetDate, targetDate);
  }

  /** Tarih aralığı — kampanya seviyesi toplamlar */
  async getCampaignStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<MetaCampaignResult[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields =
      "campaign_id,campaign_name,spend,actions,action_values,clicks,impressions,reach,frequency";

    const data = await this.graphGet(`/${accountId}/insights`, {
      time_range: timeRange,
      fields,
      level: "campaign",
      limit: "500",
    });

    return this.parseMetaInsights(data.data || [], until);
  }

  /** Günlük hesap trendi */
  async getDailyAccountInsights(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<MetaDailyAccountInsight[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields =
      "date_start,spend,impressions,clicks,actions,action_values";

    const data = await this.graphGet(`/${accountId}/insights`, {
      time_range: timeRange,
      fields,
      time_increment: "1",
      limit: "500",
    });

    return (data.data || []).map((row: Record<string, unknown>) =>
      this.parseDailyRow(row)
    );
  }

  private parseDailyRow(item: Record<string, unknown>): MetaDailyAccountInsight {
    const actions = item.actions as { action_type: string; value: string }[] | undefined;
    const actionValues = item.action_values as
      | { action_type: string; value: string }[]
      | undefined;
    const purchase = actions?.find((a) => a.action_type === "purchase");
    const purchaseVal = actionValues?.find((a) => a.action_type === "purchase");

    return {
      date: String(item.date_start ?? ""),
      spend: parseFloat(String(item.spend ?? "0")),
      impressions: parseInt(String(item.impressions ?? "0"), 10),
      clicks: parseInt(String(item.clicks ?? "0"), 10),
      conversions: purchase ? parseInt(purchase.value, 10) || 0 : 0,
      revenue: purchaseVal ? parseFloat(purchaseVal.value) || 0 : 0,
    };
  }

  private parseMetaInsights(insightsData: any[], date: string): MetaCampaignResult[] {
    return insightsData.map((item) => {
      const purchaseAction = item.actions?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );
      const purchaseValue = item.action_values?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );

      return {
        campaign_id: String(item.campaign_id ?? ""),
        campaign_name: item.campaign_name ?? "—",
        spend: parseFloat(item.spend || "0"),
        revenue: parseFloat(purchaseValue?.value || "0"),
        clicks: parseInt(item.clicks || "0", 10),
        impressions: parseInt(item.impressions || "0", 10),
        reach: parseInt(item.reach || "0", 10),
        frequency: parseFloat(item.frequency || "0"),
        conversions: parseInt(purchaseAction?.value || "0", 10),
        date,
      };
    });
  }

  async getAdSetStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<MetaAdSetResult[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields =
      "adset_id,adset_name,campaign_id,campaign_name,spend,actions,action_values,clicks,impressions,reach,frequency";

    const data = await this.graphGet(`/${accountId}/insights`, {
      time_range: timeRange,
      fields,
      level: "adset",
      limit: "500",
    });

    return this.parseMetaAdSetInsights(data.data || [], until);
  }

  async getAdStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<MetaAdResult[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields =
      "ad_id,ad_name,adset_id,adset_name,campaign_name,spend,actions,action_values,clicks,impressions,reach,frequency";

    const data = await this.graphGet(`/${accountId}/insights`, {
      time_range: timeRange,
      fields,
      level: "ad",
      limit: "500",
    });

    return this.parseMetaAdInsights(data.data || [], until);
  }

  private parseMetaAdSetInsights(insightsData: any[], date: string): MetaAdSetResult[] {
    return insightsData.map((item) => {
      const purchaseAction = item.actions?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );
      const purchaseValue = item.action_values?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );

      return {
        adset_id: String(item.adset_id ?? ""),
        adset_name: item.adset_name ?? "—",
        campaign_id: String(item.campaign_id ?? ""),
        campaign_name: item.campaign_name ?? "—",
        spend: parseFloat(item.spend || "0"),
        revenue: parseFloat(purchaseValue?.value || "0"),
        clicks: parseInt(item.clicks || "0", 10),
        impressions: parseInt(item.impressions || "0", 10),
        reach: parseInt(item.reach || "0", 10),
        frequency: parseFloat(item.frequency || "0"),
        conversions: parseInt(purchaseAction?.value || "0", 10),
        date,
      };
    });
  }

  private parseMetaAdInsights(insightsData: any[], date: string): MetaAdResult[] {
    return insightsData.map((item) => {
      const purchaseAction = item.actions?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );
      const purchaseValue = item.action_values?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );

      const isVideo = item.actions?.some(
        (a: { action_type: string }) => a.action_type.includes("video")
      ) || item.ad_name?.toLowerCase().includes("video");

      const video3Sec = item.actions?.find(
        (a: { action_type: string }) => a.action_type === "video_3_sec_video_play"
      );
      const video_3_sec_views = video3Sec ? parseInt(video3Sec.value, 10) || 0 : 0;

      return {
        ad_id: String(item.ad_id ?? ""),
        ad_name: item.ad_name ?? "—",
        adset_id: String(item.adset_id ?? ""),
        adset_name: item.adset_name ?? "—",
        campaign_name: item.campaign_name ?? "—",
        spend: parseFloat(item.spend || "0"),
        revenue: parseFloat(purchaseValue?.value || "0"),
        clicks: parseInt(item.clicks || "0", 10),
        impressions: parseInt(item.impressions || "0", 10),
        reach: parseInt(item.reach || "0", 10),
        frequency: parseFloat(item.frequency || "0"),
        conversions: parseInt(purchaseAction?.value || "0", 10),
        isVideo: !!isVideo,
        video_3_sec_views,
        date,
      };
    });
  }

  async getPlacementStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<MetaPlacementResult[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields = "spend,clicks,actions";

    const data = await this.graphGet(`/${accountId}/insights`, {
      time_range: timeRange,
      fields,
      breakdowns: "publisher_platform,platform_position",
      limit: "150",
    });

    return this.parseMetaPlacementInsights(data.data || []);
  }

  private parseMetaPlacementInsights(insightsData: any[]): MetaPlacementResult[] {
    return insightsData.map((item) => {
      const purchaseAction = item.actions?.find(
        (a: { action_type: string }) => a.action_type === "purchase"
      );

      const platform = String(item.publisher_platform ?? "").toLowerCase();
      const position = String(item.platform_position ?? "").toLowerCase();

      let placement = "Meta (Diğer)";
      if (platform === "facebook") {
        if (position.includes("feed")) placement = "Facebook Feed";
        else if (position.includes("story")) placement = "Facebook Stories";
        else if (position.includes("reels")) placement = "Facebook Reels";
        else if (position.includes("marketplace")) placement = "Facebook Marketplace";
        else placement = "Facebook Yerleşimleri";
      } else if (platform === "instagram") {
        if (position.includes("feed")) placement = "Instagram Feed";
        else if (position.includes("story")) placement = "Instagram Stories";
        else if (position.includes("reels")) placement = "Instagram Reels";
        else placement = "Instagram Yerleşimleri";
      } else if (platform === "audience_network") {
        placement = "Audience Network";
      } else if (platform === "messenger") {
        placement = "Messenger";
      } else if (platform) {
        placement = platform.charAt(0).toUpperCase() + platform.slice(1);
      }

      return {
        placement,
        spend: parseFloat(item.spend || "0"),
        clicks: parseInt(item.clicks || "0", 10),
        conversions: purchaseAction ? parseInt(purchaseAction.value, 10) || 0 : 0,
      };
    });
  }

  async getHourlyStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<{ hour: string; clicks: number }[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields = "clicks";

    try {
      const data = await this.graphGet(`/${accountId}/insights`, {
        time_range: timeRange,
        fields,
        breakdowns: "hourly_stats_aggregated_by_advertiser_time_zone",
        limit: "150",
      });

      return (data.data || []).map((item: any) => ({
        hour: String(item.hourly_stats_aggregated_by_advertiser_time_zone || "00:00:00 - 00:59:59").split(" - ")[0].substring(0, 5),
        clicks: parseInt(item.clicks || "0", 10),
      }));
    } catch (e) {
      console.warn("Saatlik veri alınamadı:", e);
      return [];
    }
  }

  async getGenderStatsForRange(
    adAccountId: string,
    since: string,
    until: string
  ): Promise<{ gender: string; clicks: number }[]> {
    const accountId = this.formatAccountId(adAccountId);
    const timeRange = JSON.stringify({ since, until });
    const fields = "clicks";

    try {
      const data = await this.graphGet(`/${accountId}/insights`, {
        time_range: timeRange,
        fields,
        breakdowns: "gender",
        limit: "50",
      });

      return (data.data || []).map((item: any) => {
        let gender = String(item.gender || "unknown").toLowerCase();
        if (gender === "male") gender = "Erkek";
        else if (gender === "female") gender = "Kadın";
        else gender = "Bilinmiyor";

        return {
          gender,
          clicks: parseInt(item.clicks || "0", 10),
        };
      });
    } catch (e) {
      console.warn("Cinsiyet verisi alınamadı:", e);
      return [];
    }
  }
}
