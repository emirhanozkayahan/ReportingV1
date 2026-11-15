const GRAPHQL_URL = "https://api.myikas.com/api/v1/admin/graphql";

export const TOP_PRODUCTS_LIMIT = 10;

export type IkasProductAggregate = {
  productId: string;
  productName: string;
  sku: string | null;
  categoryName: string | null;
  quantity: number;
  revenue: number;
};

export type IkasDailyOrderData = {
  revenue: number;
  orderCount: number;
  products: IkasProductAggregate[];
};

type IkasOrder = {
  orderPackageStatus?: string;
  totalFinalPrice?: number;
  orderLineItems?: Array<{
    quantity?: number;
    finalPrice?: number;
    status?: string;
    variant?: {
      productId?: string;
      name?: string;
      sku?: string;
      categories?: Array<{ name?: string }>;
    };
  }>;
};

const ORDER_FIELDS = `
  orderNumber
  orderedAt
  orderPackageStatus
  totalFinalPrice
  orderLineItems {
    quantity
    finalPrice
    status
    variant {
      productId
      name
      sku
      categories { name }
    }
  }
`;

export class IkasService {
  async getAccessToken(storeName: string, clientId: string, clientSecret: string): Promise<string | null> {
    const tokenUrl = `https://${storeName}.myikas.com/api/admin/oauth/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error(`[IkasService] Token alınamadı, Status: ${response.status}`);
        return null;
      }

      const result = await response.json();
      if (!result.access_token) {
        console.error(`[IkasService] Token bilgisi boş döndü:`, result);
        return null;
      }

      return result.access_token;
    } catch (e) {
      console.error(`[IkasService] Token alırken hata oluştu:`, e);
      return null;
    }
  }

  private async fetchOrders(accessToken: string, startTs: number, endTs: number): Promise<IkasOrder[]> {
    let allOrders: IkasOrder[] = [];
    let page = 1;

    while (true) {
      const queryPayload = JSON.stringify({
        query: `{
          listOrder(
            pagination: { limit: 200, page: ${page} }
            orderedAt: { gte: ${startTs}, lte: ${endTs} }
          ) {
            data {
              ${ORDER_FIELDS}
            }
          }
        }`,
      });

      try {
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: queryPayload,
        });

        const result = await response.json();

        if (result.errors) {
          console.error("[IkasService] API Hatası:", result.errors);
          break;
        }

        const items: IkasOrder[] = result.data?.listOrder?.data || [];
        allOrders = allOrders.concat(items);

        if (items.length < 200) break;
        page++;
      } catch (e) {
        console.error("[IkasService] Sorgulama hatası:", e);
        break;
      }
    }

    return allOrders;
  }

  private aggregateProducts(orders: IkasOrder[]): IkasProductAggregate[] {
    const productMap = new Map<string, IkasProductAggregate>();

    for (const order of orders) {
      for (const line of order.orderLineItems ?? []) {
        if (line.status === "CANCELLED") continue;

        const productId = line.variant?.productId;
        const productName = line.variant?.name?.trim();
        if (!productId || !productName) continue;

        const quantity = Number(line.quantity) || 0;
        const revenue = Number(line.finalPrice) || 0;
        if (quantity <= 0 && revenue <= 0) continue;

        const existing = productMap.get(productId) ?? {
          productId,
          productName,
          sku: line.variant?.sku ?? null,
          categoryName: line.variant?.categories?.[0]?.name ?? null,
          quantity: 0,
          revenue: 0,
        };

        existing.quantity += quantity;
        existing.revenue += revenue;
        if (!existing.sku && line.variant?.sku) existing.sku = line.variant.sku;
        if (!existing.categoryName && line.variant?.categories?.[0]?.name) {
          existing.categoryName = line.variant.categories[0].name ?? null;
        }

        productMap.set(productId, existing);
      }
    }

    return Array.from(productMap.values())
      .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity)
      .slice(0, TOP_PRODUCTS_LIMIT);
  }

  async fetchDailySales(accessToken: string, startTs: number, endTs: number): Promise<{ revenue: number; orderCount: number }> {
    const data = await this.fetchDailyOrderData(accessToken, startTs, endTs);
    return { revenue: data.revenue, orderCount: data.orderCount };
  }

  async fetchDailyOrderData(accessToken: string, startTs: number, endTs: number): Promise<IkasDailyOrderData> {
    const allOrders = await this.fetchOrders(accessToken, startTs, endTs);
    const validOrders = allOrders.filter((o) => o.orderPackageStatus !== "CANCELLED");

    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalFinalPrice || 0), 0);
    const products = this.aggregateProducts(validOrders);

    return {
      revenue: Number(totalRevenue.toFixed(2)),
      orderCount: validOrders.length,
      products,
    };
  }
}
