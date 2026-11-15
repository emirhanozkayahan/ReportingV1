import { IkasService } from '../ikas/service';
import { TSoftService } from '../tsoft/service';
import { GoogleAdsService } from '../google/service';
import { MetaService } from '../meta/service';
import { ShopifyService } from '../shopify/service';
import { sanitizeMetaAccessToken, sanitizeMetaAdAccountId } from '../meta/sanitize-credentials';
import { supabaseAdmin as supabase } from '../supabase';
import { toTurkeyDateString } from '../date-range';

/**
 * PocketBusiness Senkronizasyon Motoru (Sync Engine)
 * - Vercel Cron üzerinden otomatik tetiklenir.
 * - integrations tablosunu tarar ve İkas/Meta vb platform servislerine bağlanarak verileri otomatik Supabase'e alır.
 */
export class SyncEngine {
  private ikasService = new IkasService();
  private tsoftService = new TSoftService();
  private googleAdsService = new GoogleAdsService();

  /**
   * Sistemdeki tüm entegrasyonları çalıştırır. (Anlık/Günün Verisi)
   */
  async runDailySync(): Promise<any> {
    if (!supabase) {
      return { success: false, error: "Supabase istemcisi başlatılamadı (.env eksik)" };
    }

    console.log(`[SyncEngine] Senkronizasyon Başladı`);
    let successCount = 0;
    let failCount = 0;

    try {
      // 1. İkas vb. tüm entegrasyonları çek
      const { data: integrations, error: integrationErr } = await supabase
        .from('integrations')
        .select('*');

      if (integrationErr || !integrations) {
        throw new Error("Entegrasyonlar alınamadı: " + integrationErr?.message);
      }

      console.log(`[SyncEngine] Toplam ${integrations.length} entegrasyon işleme alınıyor.`);

      for (const integration of integrations) {
        try {
          if (integration.platform === 'ikas') {
            await this.syncIkasPlatform(integration, new Date());
          } else if (integration.platform === 'tsoft') {
            await this.syncTsoftPlatform(integration, new Date());
          } else if (integration.platform === 'google') {
            for (const dayOffset of [0, 1]) {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - dayOffset);
              await this.syncGoogleAdsPlatform(integration, targetDate);
            }
          } else if (integration.platform === 'meta') {
            for (const dayOffset of [0, 1]) {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - dayOffset);
              await this.syncMetaPlatform(integration, targetDate);
            }
          }
          
          successCount++;
        } catch (err) {
          console.error(`[SyncEngine] Hata (${integration.platform} ID: ${integration.id}):`, err);
          failCount++;
        }
      }

      return { 
        success: true, 
        message: 'Sync completed', 
        details: { totalProcessed: integrations.length, success: successCount, failed: failCount } 
      };

    } catch (e: any) {
       console.error(`[SyncEngine] Genel Görev Çökmesi:`, e);
       return { success: false, error: e.message };
    }
  }

  /**
   * Belirli bir marka ve tarih için senkronizasyon çalıştırır.
   */
  async runBrandSync(brandId: string, targetDate: Date = new Date()): Promise<any> {
    if (!supabase) return { success: false, error: "Supabase istemcisi başlatılamadı" };

    try {
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('brand_id', brandId);

      if (error || !integrations || integrations.length === 0) {
        throw new Error("Bu marka için entegrasyon bulunamadı.");
      }

      for (const integration of integrations) {
        try {
          if (integration.platform === 'ikas') {
            await this.syncIkasPlatform(integration, targetDate);
          } else if (integration.platform === 'tsoft') {
            await this.syncTsoftPlatform(integration, targetDate);
          } else if (integration.platform === 'google') {
            await this.syncGoogleAdsPlatform(integration, targetDate);
          } else if (integration.platform === 'meta') {
            await this.syncMetaPlatform(integration, targetDate);
          } else if (integration.platform === 'shopify') {
            await this.syncShopifyPlatform(integration, targetDate);
          }
        } catch (err) {
          console.error(`[SyncEngine] Brand Sync Hata (${integration.platform}):`, err);
        }
      }
      
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Geçmişe dönük verileri senkronize eder (Dışarıdan veya manuel tetiklenir)
   */
  async runHistorySync(daysToLookBack: number = 30): Promise<any> {
    if (!supabase) return { success: false, error: "Supabase istemcisi başlatılamadı" };
    console.log(`[SyncEngine] Geçmiş ${daysToLookBack} günün Senkronizasyonu Başladı`);
    
    let successCount = 0;
    let failCount = 0;

    try {
      const { data: integrations } = await supabase.from('integrations').select('*');
      if (!integrations) throw new Error("Entegrasyon bulunamadı");

      for (const integration of integrations) {
        if (integration.platform === 'ikas') {
          // Gün gün geriye sar
          for (let i = 0; i <= daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncIkasPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (${integration.platform} Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'tsoft') {
          for (let i = 0; i <= daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncTsoftPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (T-Soft Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'google') {
          // Gün gün geriye sar
          for (let i = 0; i <= daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncGoogleAdsPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Google Ads Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'meta') {
          for (let i = 0; i <= daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncMetaPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Meta Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'shopify') {
          for (let i = 0; i <= daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncShopifyPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Shopify Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        }
      }
      return { success: true, message: 'History Sync completed', details: { successCount, failCount } };
    } catch (e: any) {
       return { success: false, error: e.message };
    }
  }

  /**
   * Belirli bir markanın geçmişe dönük verilerini senkronize eder
   */
  async runHistorySyncForBrand(brandId: string, daysToLookBack: number = 30, startOffset: number = 0): Promise<any> {
    if (!supabase) return { success: false, error: "Supabase istemcisi başlatılamadı" };
    console.log(`[SyncEngine] Marka (${brandId}) için Geçmiş ${daysToLookBack} günün Senkronizasyonu Başladı (Offset: ${startOffset})`);
    
    let successCount = 0;
    let failCount = 0;

    try {
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('brand_id', brandId);

      if (error || !integrations || integrations.length === 0) {
        throw new Error("Bu marka için entegrasyon bulunamadı.");
      }

      for (const integration of integrations) {
        if (integration.platform === 'ikas') {
          for (let i = startOffset; i <= startOffset + daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncIkasPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (${integration.platform} Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'tsoft') {
          for (let i = startOffset; i <= startOffset + daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncTsoftPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (T-Soft Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'google') {
          for (let i = startOffset; i <= startOffset + daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncGoogleAdsPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Google Ads Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'meta') {
          for (let i = startOffset; i <= startOffset + daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncMetaPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Meta Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        } else if (integration.platform === 'shopify') {
          for (let i = startOffset; i <= startOffset + daysToLookBack; i++) {
            try {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - i);
              await this.syncShopifyPlatform(integration, targetDate);
              successCount++;
            } catch (err) {
              console.error(`[SyncEngine] History Hata (Shopify Geriye ${i}. Gün):`, err);
              failCount++;
            }
          }
        }
      }
      return { success: true, message: 'Brand History Sync completed', details: { successCount, failCount } };
    } catch (e: any) {
       return { success: false, error: e.message };
    }
  }

  /**
   * İkas'tan verileri çeken ve veritabanına atan birim servis (Belirli bir gün için)
   */
  private async syncIkasPlatform(integration: any, targetDate: Date) {
    const creds = integration.credentials;
    const storeName = creds.storeName;
    const clientId = creds.clientId;
    const clientSecret = creds.clientSecret;

    if (!storeName || !clientId || !clientSecret) {
      throw new Error('İkas kimlik bilgileri JSON (credentials) içinde eksik.');
    }

    // 1. Session Token al
    const token = await this.ikasService.getAccessToken(storeName, clientId, clientSecret);
    if (!token) throw new Error('İkas Token başarısız oldu. API limitlerine takılmış veya şifre yanlış olabilir.');

    // Türkiye saati ile (UTC+3) hedef tarihi hesapla
    const trTime = targetDate.getTime() + (3 * 60 * 60 * 1000);
    const trDate = new Date(trTime);
    
    // 2. Zaman aralığı belirle (İstenilen günün başından sonuna, Türkiye saatine göre)
    const startTs = Date.UTC(trDate.getUTCFullYear(), trDate.getUTCMonth(), trDate.getUTCDate(), 0, 0, 0, 0) - (3 * 60 * 60 * 1000);
    const endTs   = startTs + (24 * 60 * 60 * 1000) - 1;

    // ISO format YYYY-MM-DD
    const isoDate = trDate.toISOString().split('T')[0];

    // 3. İkas datasını Getir
    const { revenue, orderCount, products } = await this.ikasService.fetchDailyOrderData(token, startTs, endTs);

    // 4. Veritabanına (daily_sales) Kaydet/Güncelle
    const payload = {
      brand_id: integration.brand_id,
      date: isoDate,
      platform: 'ikas',
      order_count: orderCount,
      revenue: revenue,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase!.from('daily_sales').upsert([payload], {
      onConflict: 'brand_id,date,platform'
    });

    if (error) {
       throw new Error(`daily_sales yazma hatası: ${error.message}`);
    }

    // 5. Günlük top 10 ürün
    await supabase!
      .from("daily_product_sales")
      .delete()
      .eq("brand_id", integration.brand_id)
      .eq("date", isoDate)
      .eq("platform", "ikas");

    if (products.length > 0) {
      const productRows = products.map((product, index) => ({
        brand_id: integration.brand_id,
        date: isoDate,
        platform: "ikas",
        rank: index + 1,
        product_id: product.productId,
        product_name: product.productName,
        sku: product.sku,
        category_name: product.categoryName,
        quantity: product.quantity,
        revenue: product.revenue,
        updated_at: new Date().toISOString(),
      }));

      const { error: productError } = await supabase!
        .from("daily_product_sales")
        .upsert(productRows, { onConflict: "brand_id,date,platform,rank" });

      if (productError) {
        throw new Error(`daily_product_sales yazma hatası: ${productError.message}`);
      }
    }

    console.log(`✓ İkas Sync Başarılı [Brand ID: ${integration.brand_id}] ${isoDate} Ciro: ${revenue} TL, Ürün: ${products.length}`);
  }

  /**
   * T-Soft'tan verileri çeken ve veritabanına atan birim servis (Belirli bir gün için)
   */
  private async syncTsoftPlatform(integration: any, targetDate: Date) {
    const creds = integration.credentials;
    const apiUrl = creds.apiUrl;
    const username = creds.username;
    const password = creds.password;

    if (!apiUrl || !username || !password) {
      throw new Error('T-Soft kimlik bilgileri JSON (credentials) içinde eksik.');
    }

    // 1. Session Token al
    const token = await this.tsoftService.getAccessToken(apiUrl, username, password);
    if (!token) throw new Error('T-Soft Token başarısız oldu. Şifre yanlış olabilir.');

    // Türkiye saati ile (UTC+3) hedef tarihi hesapla
    const trTime = targetDate.getTime() + (3 * 60 * 60 * 1000);
    const trDate = new Date(trTime);
    
    // T-Soft için zaman formatı: YYYY-MM-DDTHH:mm:ss
    const datePart = trDate.toISOString().split('T')[0];
    const startStr = `${datePart}T00:00:00`;
    const endStr = `${datePart}T23:59:59`;

    // 2. T-Soft datasını Getir
    const { revenue, orderCount } = await this.tsoftService.fetchDailySales(apiUrl, token, startStr, endStr);

    // 3. Veritabanına (daily_sales) Kaydet/Güncelle
    const payload = {
      brand_id: integration.brand_id,
      date: datePart,
      platform: 'tsoft',
      order_count: orderCount,
      revenue: revenue,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase!.from('daily_sales').upsert([payload], {
      onConflict: 'brand_id,date,platform'
    });

    if (error) {
       throw new Error(`daily_sales yazma hatası: ${error.message}`);
    }

    console.log(`✓ T-Soft Sync Başarılı [Brand ID: ${integration.brand_id}] ${datePart} Ciro: ${revenue} TL`);
  }

  /**
   * Google Ads'ten verileri çeken ve veritabanına (daily_ad_stats) kaydeden birim servis
   */
  private async syncGoogleAdsPlatform(integration: any, targetDate: Date) {
    const creds = integration.credentials;
    const customerId = creds?.customerId;

    if (!customerId) {
      throw new Error('Google Ads customerId (credentials) içinde eksik.');
    }

    const isoDate = toTurkeyDateString(targetDate);

    // 1. Kampanya istatistiklerini çek
    const campaignStats = await this.googleAdsService.getDailyCampaignStats(customerId, isoDate);

    // 2. Kampanya verilerini topla (Aggregation)
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    for (const campaign of campaignStats) {
      totalSpend += campaign.spend;
      totalImpressions += campaign.impressions;
      totalClicks += campaign.clicks;
      totalConversions += campaign.conversions;
      totalRevenue += campaign.revenue;
    }

    // 3. daily_ad_stats tablosuna Kaydet/Güncelle
    const payload = {
      brand_id: integration.brand_id,
      date: isoDate,
      platform: 'Google', // Dashboard 'Google' olarak filtreliyor
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      revenue: totalRevenue,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase!.from('daily_ad_stats').upsert([payload], {
      onConflict: 'brand_id,date,platform'
    });

    if (error) {
       throw new Error(`daily_ad_stats yazma hatası: ${error.message}`);
    }

    console.log(`✓ Google Ads Sync Başarılı [Brand ID: ${integration.brand_id}] ${isoDate} Harcama: ${totalSpend} TL, Gelir: ${totalRevenue} TL`);
  }

  /**
   * Meta Ads — kampanya insights → daily_ad_stats (platform: Meta)
   */
  private async syncMetaPlatform(integration: any, targetDate: Date) {
    const creds = integration.credentials ?? {};
    const adAccountId = sanitizeMetaAdAccountId(creds.adAccountId as string);
    const accessToken = sanitizeMetaAccessToken(creds.accessToken as string);

    if (!adAccountId) {
      throw new Error("Meta adAccountId (credentials) eksik.");
    }
    if (!accessToken) {
      throw new Error("Meta accessToken (credentials) eksik.");
    }

    const isoDate = toTurkeyDateString(targetDate);
    const meta = new MetaService(accessToken);
    const campaignStats = await meta.getDailyCampaignStats(adAccountId, isoDate);

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    for (const campaign of campaignStats) {
      totalSpend += campaign.spend;
      totalImpressions += campaign.impressions;
      totalClicks += campaign.clicks;
      totalConversions += campaign.conversions;
      totalRevenue += campaign.revenue;
    }

    const payload = {
      brand_id: integration.brand_id,
      date: isoDate,
      platform: "Meta",
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      revenue: totalRevenue,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase!.from("daily_ad_stats").upsert([payload], {
      onConflict: "brand_id,date,platform",
    });

    if (error) {
      throw new Error(`daily_ad_stats (Meta) yazma hatası: ${error.message}`);
    }

    console.log(
      `✓ Meta Sync Başarılı [Brand ID: ${integration.brand_id}] ${isoDate} Harcama: ${totalSpend} TL, Gelir: ${totalRevenue} TL`
    );
  }

  /**
   * Shopify'dan Günlük Ciro/Sipariş Adedi Verisini Çeker -> daily_sales
   */
  private async syncShopifyPlatform(integration: any, targetDate: Date) {
    const creds = integration.credentials ?? {};
    if (!creds.storeUrl || !creds.accessToken) {
      throw new Error("Shopify credentials eksik (storeUrl veya accessToken).");
    }

    // Hedef günün başlangıcı (00:00:00 UTC, veya lokal)
    // Shopify GraphQL ISO-8601 UTC bekler. Türkiye saatiyle senkronize etmek için:
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const startIso = `${targetDateStr}T00:00:00Z`;
    const endIso = `${targetDateStr}T23:59:59Z`;

    const shopifyService = new ShopifyService();
    const result = await shopifyService.fetchDailySales(
      creds.storeUrl as string,
      creds.accessToken as string,
      startIso,
      endIso
    );

    const payload = {
      brand_id: integration.brand_id,
      date: targetDateStr,
      platform: 'shopify',
      revenue: result.revenue,
      order_count: result.orderCount,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase!.from('daily_sales').upsert([payload], {
      onConflict: 'brand_id,date,platform'
    });

    if (error) {
       throw new Error(`daily_sales (Shopify) yazma hatası: ${error.message}`);
    }

    console.log(`✓ Shopify Sync Başarılı [Brand ID: ${integration.brand_id}] ${targetDateStr} Ciro: ${result.revenue} TL, Sipariş: ${result.orderCount}`);
  }
}

