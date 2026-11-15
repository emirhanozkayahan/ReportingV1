/** Dashboard tarih filtresi → Meta API time_range (YYYY-MM-DD, yerel takvim). */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getMetaDateRange(period: string): { since: string; until: string } {
  if (period && period.includes("_")) {
    const [sinceStr, untilStr] = period.split("_");
    if (sinceStr && untilStr) {
      return { since: sinceStr, until: untilStr };
    }
  }

  const today = new Date();
  today.setHours(today.getHours() + 3); // GMT+3 (Türkiye)

  const until = new Date(today);
  const since = new Date(today);

  if (period === "today") {
    // since = until = bugün
  } else if (period === "yesterday") {
    since.setDate(since.getDate() - 1);
    until.setDate(until.getDate() - 1);
  } else if (period === "7d") {
    until.setDate(today.getDate() - 1); // Dün
    since.setDate(until.getDate() - 6);
  } else if (period === "14d") {
    until.setDate(today.getDate() - 1);
    since.setDate(until.getDate() - 13);
  } else if (period === "30d") {
    until.setDate(today.getDate() - 1);
    since.setDate(until.getDate() - 29);
  }

  return { since: formatLocalDate(since), until: formatLocalDate(until) };
}
