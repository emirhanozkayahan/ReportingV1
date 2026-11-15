export const GOOGLE_ADS_API_VERSION = "v24";

export function googleAdsSearchUrl(customerId: string): string {
  const id = customerId.replace(/-/g, "");
  return `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${id}/googleAds:search`;
}

export async function parseGoogleAdsResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("<")) {
    throw new Error(
      `Google Ads API HTML yanıt döndü (HTTP ${res.status}). API sürümü veya yetki kontrol edin.`
    );
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new Error(`Google Ads API geçersiz yanıt: ${trimmed.slice(0, 200)}`);
  }
}
