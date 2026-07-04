import {
  applyBreakdownMonth,
  getStaticSsCollected,
  getStaticSsMonthlyAllSites,
  getStaticSsTotal,
  getStaticSiteDashboard,
  type SsMonthlyRow,
} from "./ssDashboardStatic";

export type { SsMonthlyRow };

export type SsDashboardChartBody = {
  year?: number | string;
  month?: number | string;
  siteName?: string;
  division?: string;
  department?: string;
  section?: string;
};

export type SsBreakdownRow = {
  orgUnit: string;
  label: string;
  target: number;
  actual: number;
  plan: number;
  Plan: number;
  Actual: number;
};

export function normalizeSsSite(site: unknown): string | null {
  const raw = String(site ?? "")
    .trim()
    .toUpperCase();
  if (!raw) return null;
  if (raw.includes("ADMO")) return "ADMO";
  if (raw.includes("MACO")) return "MACO";
  if (raw.includes("SERA")) return "SERA";
  if (raw.includes("JAHO") || raw === "NARO") return "JAHO-NARO";
  return null;
}

export function resolveYear(body: SsDashboardChartBody): number {
  const y = Number(body.year);
  return Number.isFinite(y) && y > 2000 ? y : 2026;
}

/** 0 / "all" = tanpa filter bulan */
export function resolveMonthNum(raw: unknown): number | null {
  if (raw === "all" || raw === "" || raw == null) return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return n === 0 ? null : n;
  const labels = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "mei",
    "jun",
    "jul",
    "aug",
    "agst",
    "sep",
    "oct",
    "okt",
    "nov",
    "dec",
    "des",
  ];
  const s = String(raw).toLowerCase().trim();
  const idx = labels.findIndex((l) => s.startsWith(l.slice(0, 3)) || s === l);
  if (idx >= 0 && idx < 12) return idx + 1;
  return null;
}

/** SS Total — JSON statis per tahun (ssTotal2025 / ssTotal2026) */
export function buildSsTotalFromDummy(body: SsDashboardChartBody) {
  const total = getStaticSsTotal(resolveYear(body));
  return {
    totalTarget: total.totalTarget,
    totalActual: total.totalActual,
  };
}

/** SS Collected — JSON statis ssChart per tahun (+ filter bulan dari monthlyData site) */
export function buildSsCollectedChartFromDummy(body: SsDashboardChartBody) {
  const year = resolveYear(body);
  const month = resolveMonthNum(body.month);
  return getStaticSsCollected(year, month);
}

/** Grafik bulanan all sites — JSON statis ssMonthlyAllSites20xx */
export function buildSsMonthlyAllSitesFromDummy(body: SsDashboardChartBody): SsMonthlyRow[] {
  return getStaticSsMonthlyAllSites(resolveYear(body));
}

export function buildSsSiteDashboardFromDummy(
  siteName: string,
  body: SsDashboardChartBody,
  breakdownMonth?: number | null
) {
  const year = resolveYear(body);
  let dash = getStaticSiteDashboard(siteName, year);
  const monthForBreakdown =
    breakdownMonth != null && breakdownMonth > 0
      ? breakdownMonth
      : resolveMonthNum(body.month);
  dash = applyBreakdownMonth(dash, monthForBreakdown);
  return dash;
}

/** Resolver mock API SUGGESTION_DASHBOARDCHART* */
export function resolveSsDashboardMock(
  endpoint: "total" | "collected" | "site",
  body: SsDashboardChartBody
) {
  const year = resolveYear(body);
  const withYear = { ...body, year };

  if (endpoint === "total") {
    return buildSsTotalFromDummy(withYear);
  }

  if (endpoint === "collected") {
    return buildSsCollectedChartFromDummy(withYear);
  }

  const site = String(body.siteName ?? "").trim();
  if (!site || site === "all") {
    return buildSsCollectedChartFromDummy(withYear);
  }

  return buildSsSiteDashboardFromDummy(
    site,
    { ...withYear, month: undefined },
    resolveMonthNum(body.month)
  );
}
