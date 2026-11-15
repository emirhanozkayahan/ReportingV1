import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/** Geçici: public/ga4-fixture.json dosyasını sunar (GA4 API ham yanıtı). */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "ga4-fixture.json");
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Fixture okunamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
