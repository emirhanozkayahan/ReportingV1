import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/sync/engine';

/**
 * Günlük/Periyodik Cron endpoint'i. Vercel cron-job veya dış servisler burayı tetikler.
 * İkas, Meta ve Google özetlerini çeker.
 */
export async function GET(request: Request) {
  try {
    // Güvenlik: Cron tetiklemelerinin sadece yetkili servislerden (örn. Vercel) geldiğinden emin ol
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;
    
    if (process.env.NODE_ENV === 'production' && authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const engine = new SyncEngine();
    const result = await engine.runDailySync();

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
