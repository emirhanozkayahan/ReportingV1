import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildAgencyOverview,
  buildMockAgencyOverview,
} from "@/lib/agency-overview";

async function checkAgencyAuth() {
  const cookieStore = await cookies();
  const agencyAuth = cookieStore.get("agency_auth");
  return agencyAuth?.value === "true";
}

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
