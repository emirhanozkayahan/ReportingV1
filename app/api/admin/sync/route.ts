import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/sync/engine';
import { cookies } from 'next/headers';

/**
 * Admin sync endpoint'i. Geçmiş tarihleri de çekebilmek için.
 * GET /api/admin/sync?history=30
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const historyDays = searchParams.get('history');
    const brandId = searchParams.get('brand_id');

    const engine = new SyncEngine();
    
    if (historyDays) {
      const days = parseInt(historyDays, 10);
      if (brandId) {
        const result = await engine.runHistorySyncForBrand(brandId, days);
        return NextResponse.json(result);
      } else {
        const result = await engine.runHistorySync(days);
        return NextResponse.json(result);
      }
    } else {
       // Normal çalışma
       if (brandId) {
         const result = await engine.runBrandSync(brandId, new Date());
         return NextResponse.json(result);
       } else {
         const result = await engine.runDailySync();
         return NextResponse.json(result);
       }
    }
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
