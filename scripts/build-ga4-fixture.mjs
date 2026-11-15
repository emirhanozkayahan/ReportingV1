import { writeFileSync } from "fs";
import { resolve } from "path";
import rows from "./ga4-rows-data.mjs";

const report = {
  dimensionHeaders: [{ name: "sessionMedium" }, { name: "sessionSource" }],
  metricHeaders: [
    { name: "averageSessionDuration", type: "TYPE_SECONDS" },
    { name: "bounceRate", type: "TYPE_FLOAT" },
    { name: "engagementRate", type: "TYPE_FLOAT" },
    { name: "newUsers", type: "TYPE_INTEGER" },
    { name: "screenPageViews", type: "TYPE_INTEGER" },
    { name: "sessions", type: "TYPE_INTEGER" },
    { name: "totalUsers", type: "TYPE_INTEGER" },
    { name: "keyEvents:purchase", type: "TYPE_INTEGER" },
  ],
  rows,
  totals: [
    {
      dimensionValues: [{ value: "RESERVED_TOTAL" }, { value: "RESERVED_TOTAL" }],
      metricValues: [
        { value: "112.32351972371644" },
        { value: "0.46773875573830515" },
        { value: "0.53226124426169485" },
        { value: "52934" },
        { value: "344064" },
        { value: "71014" },
        { value: "57471" },
        { value: "209" },
      ],
    },
  ],
  rowCount: rows.length,
  metadata: { currencyCode: "TRY", timeZone: "Europe/Istanbul" },
  fixturePeriod: "30d",
  kind: "analyticsData#runReport",
};

writeFileSync(resolve("public/ga4-fixture.json"), JSON.stringify(report));
console.log("Wrote", rows.length, "rows to public/ga4-fixture.json");
