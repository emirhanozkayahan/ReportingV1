import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/sync/engine';

export async function POST() {
  try {
    const engine = new SyncEngine();
    // Son 7 günü geriye dönük tarayıp günceller ki veriler eksik kalmasın
    const result = await engine.runHistorySync(7);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
