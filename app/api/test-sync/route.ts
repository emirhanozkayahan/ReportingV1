import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/sync/engine';

export async function GET() {
  try {
    const engine = new SyncEngine();
    // Bisse brand ID is 'e9d575b5-35e9-4c86-b24e-16504c72316a'
    const result = await engine.runHistorySyncForBrand('e9d575b5-35e9-4c86-b24e-16504c72316a', 3);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
