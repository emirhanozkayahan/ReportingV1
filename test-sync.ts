import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { SyncEngine } from './lib/sync/engine';
import { supabaseAdmin } from './lib/supabase';

async function test() {
  const engine = new SyncEngine();
  console.log("Starting sync for Bisse");
  const result = await engine.runHistorySyncForBrand('e9d575b5-35e9-4c86-b24e-16504c72316a', 3);
  console.log("Result:", result);
}
test();
