export class ShopifyService {
  /**
   * Shopify GraphQL üzerinden belirli bir tarih aralığındaki siparişlerin ciro ve adedini hesaplar.
   */
  async fetchDailySales(storeUrl: string, accessToken: string, startIso: string, endIso: string): Promise<{ revenue: number, orderCount: number }> {
    // URL düzeltme: Eğer kullanıcı başında https:// yazdıysa temizle
    const cleanStoreUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const endpoint = `https://${cleanStoreUrl}/admin/api/2024-01/graphql.json`;

    let allOrders: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    // Shopify query syntax: created_at:>=2026-03-01T00:00:00Z AND created_at:<2026-03-01T23:59:59Z
    const queryStr = `created_at:>='${startIso}' AND created_at:<='${endIso}'`;

    while (hasNextPage) {
      const graphqlQuery = `
        query getOrders($query: String!, $cursor: String) {
          orders(first: 250, query: $query, after: $cursor) {
            edges {
              node {
                id
                createdAt
                cancelledAt
                displayFinancialStatus
                totalPriceSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      try {
        const res: any = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
          },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: {
              query: queryStr,
              cursor: cursor
            }
          })
        });

        const result = await res.json();

        if (result.errors) {
          console.error('[ShopifyService] API Hatası:', result.errors);
          break;
        }

        const ordersConnection = result.data?.orders;
        if (!ordersConnection) {
          break;
        }

        const items = ordersConnection.edges.map((e: any) => e.node) || [];
        allOrders = allOrders.concat(items);

        hasNextPage = ordersConnection.pageInfo.hasNextPage;
        cursor = ordersConnection.pageInfo.endCursor;
        
      } catch(e) {
         console.error('[ShopifyService] Sorgulama hatası:', e);
         break;
      }
    }

    // İptal edilmemiş ve sadece ödenmiş siparişleri mi alalım?
    // Kullanıcı iadeler dahil, cancelled hariç demişti. (cancelledAt === null)
    // Voided veya Cancelled durumu iptaldir.
    const validOrders = allOrders.filter(o => o.cancelledAt === null);
    
    // Toplam Ciro Hesaplama
    const totalRevenue = validOrders.reduce((sum, order) => {
      const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount || "0");
      return sum + amount;
    }, 0);
    
    const orderCount = validOrders.length;

    return { revenue: Number(totalRevenue.toFixed(2)), orderCount };
  }
}
