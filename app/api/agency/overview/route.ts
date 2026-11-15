import { NextResponse } from "next/server";
import {
  buildAgencyOverview,
  buildMockAgencyOverview,
} from "@/lib/agency-overview";
import { isAgencySession as checkAgencyAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await checkAgencyAuth())) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") === "7d" ? "7d" : "yesterday";

  try {
    const overview = await buildAgencyOverview(period);
    if (overview) {
      return NextResponse.json(overview);
    }
    return NextResponse.json(buildMockAgencyOverview());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Overview yüklenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
