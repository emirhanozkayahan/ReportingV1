/**
 * GA4 ham JSON'u public/ga4-fixture.json'a yazar.
 * Kullanım: node scripts/import-ga4-fixture.mjs path/to/ga4-response.json
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const input = process.argv[2];
if (!input) {
  console.error("Kullanım: node scripts/import-ga4-fixture.mjs <ga4-response.json>");
  process.exit(1);
}

const raw = readFileSync(resolve(input), "utf-8").replace(/^\uFEFF/, "");
const report = JSON.parse(raw);
writeFileSync(resolve("public/ga4-fixture.json"), JSON.stringify(report));
console.log(`OK: ${report.rows?.length ?? 0} satır → public/ga4-fixture.json`);
