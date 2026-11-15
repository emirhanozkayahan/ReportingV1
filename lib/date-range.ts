/** GA4 API ve dashboard için ortak tarih aralığı hesapları (GMT+3). */

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Sync ve filtreler için TR takvim günü (YYYY-MM-DD). */
export function toTurkeyDateString(date: Date = new Date()): string {
  const tr = new Date(date);
  tr.setHours(tr.getHours() + 3);
  return tr.toISOString().split("T")[0];
}

function turkeyToday(): Date {
  const today = new Date();
  today.setHours(today.getHours() + 3);
  return today;
}

export function getGa4DateRange(rangeString: string): { startDate: string; endDate: string } {
  const today = turkeyToday();

  if (rangeString === "today") {
    return { startDate: formatDate(today), endDate: formatDate(today) };
  }
  if (rangeString === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { startDate: formatDate(y), endDate: formatDate(y) };
  }
  if (rangeString === "prev_yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 2);
    return { startDate: formatDate(y), endDate: formatDate(y) };
  }
  if (rangeString === "7d") {
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }
  if (rangeString === "14d") {
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 13);
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }
  if (rangeString === "30d") {
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }
  if (rangeString === "prev7d" || rangeString === "prev14d" || rangeString === "prev30d") {
    const days = rangeString === "prev7d" ? 7 : rangeString === "prev14d" ? 14 : 30;
    const currentKey = rangeString.replace("prev", "") as "7d" | "14d" | "30d";
    const current = getGa4DateRange(currentKey);
    const currentStart = new Date(current.startDate);
    const prevEnd = new Date(currentStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (days - 1));
    return { startDate: formatDate(prevStart), endDate: formatDate(prevEnd) };
  }

  const end = new Date(today);
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

export function getGa4DateRangeFromParams(
  rangeString: string,
  startParam?: string | null,
  endParam?: string | null
): { startDate: string; endDate: string } {
  if (rangeString === "custom" && startParam && endParam) {
    return { startDate: startParam, endDate: endParam };
  }
  return getGa4DateRange(rangeString);
}

/** Mevcut dashboard dateRange için GA4 önceki dönem range anahtarı veya custom tarihler. */
export function getPrevGa4RangeSpec(
  dateRange: string,
  customStart?: string,
  customEnd?: string
): { range: string; start?: string; end?: string } | null {
  if (dateRange === "today") return { range: "yesterday" };
  if (dateRange === "yesterday") return { range: "prev_yesterday" };
  if (dateRange === "7d") return { range: "prev7d" };
  if (dateRange === "14d") return { range: "prev14d" };
  if (dateRange === "30d") return { range: "prev30d" };
  if (dateRange === "custom" && customStart && customEnd) {
    const cStart = new Date(customStart);
    const cEnd = new Date(customEnd);
    const diffMs = cEnd.getTime() - cStart.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const pEnd = new Date(cStart);
    pEnd.setDate(pEnd.getDate() - 1);
    const pStart = new Date(pEnd);
    pStart.setDate(pStart.getDate() - (diffDays - 1));
    const formatLocal = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split("T")[0];
    };
    return { range: "custom", start: formatLocal(pStart), end: formatLocal(pEnd) };
  }
  return null;
}

export type FilteredPeriodData = {
  filteredSales: unknown[];
  filteredAds: unknown[];
  prevFilteredSales: unknown[];
  prevFilteredAds: unknown[];
};

const PREV_RANGE_MAP: Record<string, string> = {
  today: "yesterday",
  yesterday: "prev_yesterday",
  "7d": "prev7d",
  "14d": "prev14d",
  "30d": "prev30d",
};

/** Dashboard filtreleri — Google/GA4 ile aynı TR tarih mantığı. */
export function filterDataByDateRange(
  dateRange: string,
  localSales: { date: string }[],
  localAds: { date: string }[],
  customStart?: string,
  customEnd?: string
): FilteredPeriodData {
  let limitStr = "";
  let todayStr = "";
  let prevLimitStr = "";
  let prevTodayStr = "";
  const singleDay = dateRange === "today" || dateRange === "yesterday";

  if (dateRange === "custom") {
    const formatLocal = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split("T")[0];
    };
    const cStart = new Date(customStart || Date.now());
    const cEnd = new Date(customEnd || Date.now());
    const diffMs = cEnd.getTime() - cStart.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    limitStr = customStart || formatLocal(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    todayStr = customEnd || formatLocal(new Date());

    const pStart = new Date(cStart.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const pEnd = new Date(cStart.getTime() - 1 * 24 * 60 * 60 * 1000);
    prevLimitStr = formatLocal(pStart);
    prevTodayStr = formatLocal(pEnd);
  } else {
    const key =
      dateRange === "today" ||
      dateRange === "yesterday" ||
      dateRange === "7d" ||
      dateRange === "14d" ||
      dateRange === "30d"
        ? dateRange
        : "30d";
    const current = getGa4DateRange(key);
    limitStr = current.startDate;
    todayStr = current.endDate;

    const prevKey = PREV_RANGE_MAP[key];
    const prev = getGa4DateRange(prevKey);
    prevLimitStr = prev.startDate;
    prevTodayStr = prev.endDate;
  }

  const inRange = (date: string, start: string, end: string, single: boolean) => {
    if (single) return date === end;
    return date >= start && date <= end;
  };

  const filteredSales = localSales.filter((s) => {
    if (singleDay) return s.date === todayStr;
    return s.date >= limitStr && s.date <= todayStr;
  });

  const filteredAds = localAds.filter((a) => {
    if (singleDay) return a.date === todayStr;
    return a.date >= limitStr && a.date <= todayStr;
  });

  const prevFilteredSales = localSales.filter((s) =>
    inRange(s.date, prevLimitStr, prevTodayStr, singleDay)
  );

  const prevFilteredAds = localAds.filter((a) =>
    inRange(a.date, prevLimitStr, prevTodayStr, singleDay)
  );

  return { filteredSales, filteredAds, prevFilteredSales, prevFilteredAds };
}
