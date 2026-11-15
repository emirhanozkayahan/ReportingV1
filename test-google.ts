import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleAdsService } from './lib/google/service';

async function test() {
  try {
    const s = new GoogleAdsService();
    const customerId = '4379624152'; // Removed dashes
    const res = await s.getDailyCampaignStats(customerId, '2026-06-12');
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
