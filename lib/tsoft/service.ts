export class TSoftService {
  /**
   * T-Soft API'den Access Token alır.
   */
  async getAccessToken(domain: string, username: string, password: string): Promise<string | null> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `https://${cleanDomain}/rest1/auth/login/${encodeURIComponent(username)}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `pass=${encodeURIComponent(password)}`,
      });
      
      const result = await response.json();
      
      if (!result.data || !result.data[0] || !result.data[0].token) {
        console.error('[TSoftService] Token alınamadı:', result);
        return null;
      }
      
      return result.data[0].token;
    } catch (e) {
      console.error('[TSoftService] Token hatası:', e);
      return null;
    }
  }

  /**
   * Belirli bir tarih aralığındaki sipariş sayısını ve ciroyu getirir.
   */
  async fetchDailySales(domain: string, token: string, startDateStr: string, endDateStr: string): Promise<{ orderCount: number; revenue: number }> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `https://${cleanDomain}/rest1/order2/getOrders`;
    const ALLOWED_PLATFORMS = ['', 'mobile_site', 'mobile_app', 'ios', 'android', 'rest1'];
    
    let allOrders: any[] = [];
    let start = 0;
    const limit = 100;
    
    while (true) {
      const payload = new URLSearchParams();
      payload.append('token', token);
      payload.append('OrderDateTimeStart', startDateStr);
      payload.append('OrderDateTimeEnd', endDateStr);
      payload.append('start', start.toString());
      payload.append('limit', limit.toString());

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': `token=${token}; rest1SupportUser=1`
          },
          body: payload.toString()
        });

        const result = await response.json();

        if (!result.success) {
          console.error('[TSoftService] API İsteği Başarısız:', result);
          break;
        }

        const orderList = Array.isArray(result.data) ? result.data : [];
        const filtered = orderList.filter((o: any) => {
          const ALLOWED_STATUSES = [
            'Ürün Hazırlanıyor',
            'Kapıda Ödeme Teyit Bekleniyor',
            'Kapıda Ödeme Onaylandı',
            'Kargo Hazır',
            'Kargoya Verildi',
            'Ödeme Yapıldı',
            'Teslim Edildi',
            'İade Edildi',
            'Kısmi İade Edildi',
            'Onaylandı',
            'Sipariş Devam Ediyor'
          ];
          
          // 'admin', 'panel' Yönetim Paneli için; 'web', 'website' Website için
          const ALLOWED_PLATFORMS_EXTENDED = ['', 'web', 'website', 'mobile_site', 'admin', 'panel', 'mobile_app', 'ios', 'android', 'rest1'];
          
          const isAllowedPlatform = ALLOWED_PLATFORMS_EXTENDED.includes(o.Application);
          const isStatusValid = ALLOWED_STATUSES.includes(o.OrderStatus);

          return isAllowedPlatform && isStatusValid;
        });

        allOrders = allOrders.concat(filtered);

        if (orderList.length < limit) break;
        start += limit;
      } catch (e) {
        console.error('[TSoftService] Sipariş çekme hatası:', e);
        break;
      }
    }

    let totalRevenue = 0;
    allOrders.forEach((o) => {
      totalRevenue += parseFloat(o.OrderTotalPrice || '0');
    });

    return {
      orderCount: allOrders.length,
      revenue: parseFloat(totalRevenue.toFixed(2))
    };
  }
}
