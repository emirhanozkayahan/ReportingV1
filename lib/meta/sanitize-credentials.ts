/**
 * Admin panelinden gelen Meta kimlik bilgilerini temizler.
 * Kod 190 "Cannot parse access token" çoğunlukla boşluk, tırnak veya yanlış yapıştırmadan olur.
 */
export function sanitizeMetaAccessToken(raw: string | undefined | null): string {
  if (!raw) return "";

  let token = String(raw).trim();

  // Tırnak ve Bearer öneki
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }

  // Satır sonları / gizli boşluklar
  token = token.replace(/\s+/g, "");

  // Yanlışlıkla JSON yapıştırıldıysa access_token alanını çıkar
  if (token.startsWith("{") && token.includes("access_token")) {
    try {
      const parsed = JSON.parse(token.replace(/\s+/g, " ").replace(/'/g, '"')) as {
        access_token?: string;
      };
      if (parsed.access_token) {
        token = String(parsed.access_token).replace(/\s+/g, "");
      }
    } catch {
      const match = token.match(/access_token["']?\s*[:=]\s*["']?([A-Za-z0-9]+)/i);
      if (match?.[1]) token = match[1];
    }
  }

  return token;
}

export function sanitizeMetaAdAccountId(raw: string | undefined | null): string {
  if (!raw) return "";
  let id = String(raw).trim().replace(/\s+/g, "");
  if (id.startsWith("act_")) return id;
  return id.replace(/^act_/, "");
}

export function validateMetaAccessToken(token: string): string | null {
  if (!token) return "Access token boş.";
  if (token.length < 50) {
    return "Token çok kısa görünüyor. System User token'ın tamamını yapıştırın.";
  }
  if (!/^[A-Za-z0-9]+$/.test(token)) {
    return "Token geçersiz karakter içeriyor. Sadece harf/rakam olmalı (başında/sonunda boşluk veya tırnak olmamalı).";
  }
  if (!token.startsWith("EAA")) {
    return "Token genelde 'EAA' ile başlar. App Secret veya App ID yapıştırmadığınızdan emin olun.";
  }
  return null;
}
