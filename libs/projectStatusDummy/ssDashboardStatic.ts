import dashboardData from "../../components/dashboard-demo/DashboardDemoData.json";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agst",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const SITE_ORDER = ["ADMO", "JAHO-NARO", "MACO", "SERA"] as const;

type SiteKey = "ADMO" | "MACO" | "SERA" | "JAHO";

type DashboardYear = 2024 | 2025 | 2026;

const SITE_DASHBOARD_KEYS_2026: Record<SiteKey, string> = {
  ADMO: "ssDashboardADMO",
  MACO: "ssDashboardMACO",
  SERA: "ssDashboardSERA",
  JAHO: "ssDashboardJAHO",
};

/** Setiap metrik tahun 2024 = tahun 2025 + 100 */
const OFFSET_2024_FROM_2025 = 100;

export type SsMonthlyRow = {
  month: number;
  monthName: string;
  plan: number;
  actual: number;
};

type SiteDashboard = {
  monthlyData?: Array<Record<string, unknown>>;
  breakdownData?: Array<Record<string, unknown>>;
  breakdownMonthly?: Record<string, Array<Record<string, unknown>>>;
};

type DemoJson = Record<string, unknown>;

const demo = dashboardData as DemoJson;

function getSiteKey(site: string): SiteKey | null {
  const raw = site.toUpperCase();
  if (raw.includes("ADMO")) return "ADMO";
  if (raw.includes("MACO")) return "MACO";
  if (raw.includes("SERA")) return "SERA";
  if (raw.includes("JAHO") || raw === "NARO") return "JAHO";
  return null;
}

function bumpRow(r: Record<string, unknown>, delta: number) {
  const plan = Number(r.plan ?? r.target ?? r.Plan ?? 0) + delta;
  const actual = Number(r.actual ?? r.Actual ?? 0) + delta;
  return {
    ...r,
    plan,
    actual,
    target: plan,
    Plan: plan,
    Actual: actual,
  };
}

function offsetSiteDashboard(dash: SiteDashboard, delta: number): SiteDashboard {
  const breakdownMonthly: Record<string, Array<Record<string, unknown>>> = {};
  for (const [k, rows] of Object.entries(dash.breakdownMonthly ?? {})) {
    breakdownMonthly[k] = rows.map((r) => bumpRow(r, delta));
  }
  return {
    monthlyData: (dash.monthlyData ?? []).map((r) => bumpRow(r, delta)),
    breakdownData: (dash.breakdownData ?? []).map((r) => bumpRow(r, delta)),
    breakdownMonthly,
  };
}

function scaleSiteDashboard(dash: SiteDashboard, factor: number): SiteDashboard {
  const scaleRow = (r: Record<string, unknown>) => {
    const plan = Math.round(Number(r.plan ?? r.target ?? 0) * factor);
    const actual = Math.round(Number(r.actual ?? r.Actual ?? 0) * factor);
    return {
      ...r,
      plan,
      actual,
      target: plan,
      Plan: plan,
      Actual: actual,
    };
  };

  const breakdownMonthly: Record<string, Array<Record<string, unknown>>> = {};
  for (const [k, rows] of Object.entries(dash.breakdownMonthly ?? {})) {
    breakdownMonthly[k] = rows.map(scaleRow);
  }

  return {
    monthlyData: (dash.monthlyData ?? []).map(scaleRow),
    breakdownData: (dash.breakdownData ?? []).map(scaleRow),
    breakdownMonthly,
  };
}

const SCALE_2025 = 298 / 646;

function getSiteDashboard2025(siteKey: SiteKey): SiteDashboard {
  const key2025 = `ssDashboard2025${siteKey}`;
  const explicit = demo[key2025] as SiteDashboard | undefined;
  if (explicit?.monthlyData) return explicit;
  const base = (demo[SITE_DASHBOARD_KEYS_2026[siteKey]] as SiteDashboard) ?? {};
  return scaleSiteDashboard(base, SCALE_2025);
}

function getStaticSiteDashboardRaw(year: DashboardYear, siteKey: SiteKey): SiteDashboard {
  if (year === 2026) {
    return (demo[SITE_DASHBOARD_KEYS_2026[siteKey]] as SiteDashboard) ?? {};
  }
  if (year === 2025) {
    return getSiteDashboard2025(siteKey);
  }
  return offsetSiteDashboard(getSiteDashboard2025(siteKey), OFFSET_2024_FROM_2025);
}

function resolveDashboardYear(year: number): DashboardYear {
  if (year === 2024) return 2024;
  if (year === 2025) return 2025;
  return 2026;
}

export function getStaticSsTotal(year: number) {
  if (year === 2025) {
    return (demo.ssTotal2025 as { totalTarget: number; totalActual: number }) ?? {
      totalTarget: 268,
      totalActual: 298,
    };
  }
  if (year === 2024) {
    return (demo.ssTotal2024 as { totalTarget: number; totalActual: number }) ?? {
      totalTarget: 368,
      totalActual: 398,
    };
  }
  return (
    (demo.ssTotal2026 as { totalTarget: number; totalActual: number }) ??
    (demo.ssTotal as { totalTarget: number; totalActual: number }) ?? {
      totalTarget: 576,
      totalActual: 646,
    }
  );
}

export function getStaticSsMonthlyAllSites(year: number): SsMonthlyRow[] {
  if (year === 2025) {
    const rows = demo.ssMonthlyAllSites2025 as SsMonthlyRow[] | undefined;
    if (rows?.length) return rows;
  }
  if (year === 2024) {
    const rows = demo.ssMonthlyAllSites2024 as SsMonthlyRow[] | undefined;
    if (rows?.length) return rows;
  }
  if (year === 2026) {
    const rows = demo.ssMonthlyAllSites2026 as SsMonthlyRow[] | undefined;
    if (rows?.length) return rows;
  }
  const y = resolveDashboardYear(year);
  const buckets = MONTH_NAMES.map((monthName, idx) => ({
    month: idx + 1,
    monthName,
    plan: 0,
    actual: 0,
  }));
  for (const site of Object.keys(SITE_DASHBOARD_KEYS_2026) as SiteKey[]) {
    const dash = getStaticSiteDashboardRaw(y, site);
    for (const row of dash.monthlyData ?? []) {
      const monthIdx = Number(row.month ?? 0) - 1;
      if (monthIdx < 0 || monthIdx >= 12) continue;
      buckets[monthIdx].plan += Number(row.plan ?? 0);
      buckets[monthIdx].actual += Number(row.actual ?? 0);
    }
  }
  return buckets;
}

function mapChartRows(chart: Array<{ site: string; target: number; actual: number }>) {
  return chart.map((r) => ({
    site: r.site,
    label: r.site,
    plan: r.target,
    actual: r.actual,
    Plan: r.target,
    Actual: r.actual,
  }));
}

export function getStaticSsChart(year: number) {
  if (year === 2025) {
    const chart = demo.ssChart2025 as Array<{ site: string; target: number; actual: number }>;
    if (chart?.length) return mapChartRows(chart);
  }
  if (year === 2024) {
    const chart = demo.ssChart2024 as Array<{ site: string; target: number; actual: number }>;
    if (chart?.length) return mapChartRows(chart);
  }
  const chart =
    (demo.ssChart2026 as Array<{ site: string; target: number; actual: number }>) ??
    (demo.ssChart as Array<{ site: string; target: number; actual: number }>);
  if (chart?.length) return mapChartRows(chart);

  const y = resolveDashboardYear(year);
  return SITE_ORDER.map((site) => {
    const dash = getStaticSiteDashboardRaw(y, getSiteKey(site)!);
    const plan = (dash.monthlyData ?? []).reduce((s, m) => s + Number(m.plan ?? 0), 0);
    const actual = (dash.monthlyData ?? []).reduce((s, m) => s + Number(m.actual ?? 0), 0);
    return { site, label: site, plan, actual, Plan: plan, Actual: actual };
  });
}

export function getStaticSiteDashboard(siteName: string, year: number) {
  const siteKey = getSiteKey(siteName);
  if (!siteKey) {
    return { monthlyData: [], breakdownData: [], breakdownMonthly: {} };
  }
  const y = resolveDashboardYear(year);
  const dash = getStaticSiteDashboardRaw(y, siteKey);
  const breakdownData = (dash.breakdownData ?? []).map((r) => ({
    orgUnit: r.orgUnit ?? r.label,
    label: r.orgUnit ?? r.label,
    target: Number(r.target ?? r.plan ?? 0),
    actual: Number(r.actual ?? r.Actual ?? 0),
    plan: Number(r.target ?? r.plan ?? 0),
    Plan: Number(r.target ?? r.plan ?? 0),
    Actual: Number(r.actual ?? r.Actual ?? 0),
  }));
  const monthlyData = (dash.monthlyData ?? []).map((r) => ({
    month: Number(r.month ?? 0),
    monthName: String(r.monthName ?? ""),
    plan: Number(r.plan ?? 0),
    actual: Number(r.actual ?? 0),
    label: String(r.monthName ?? r.label ?? ""),
    Plan: Number(r.plan ?? 0),
    Actual: Number(r.actual ?? 0),
  }));
  return {
    monthlyData,
    breakdownData,
    breakdownMonthly: dash.breakdownMonthly ?? {},
  };
}

export function getStaticSsCollected(year: number, monthNum: number | null) {
  if (monthNum != null && monthNum > 0) {
    return SITE_ORDER.map((site) => {
      const dash = getStaticSiteDashboard(site, year);
      const row = dash.monthlyData.find((m) => m.month === monthNum);
      const plan = row?.plan ?? 0;
      const actual = row?.actual ?? 0;
      return { site, label: site, plan, actual, Plan: plan, Actual: actual };
    });
  }
  return getStaticSsChart(year);
}

export function applyBreakdownMonth(
  dashboard: ReturnType<typeof getStaticSiteDashboard>,
  monthNum: number | null
) {
  if (monthNum == null || monthNum <= 0) return dashboard;
  const monthly = dashboard.breakdownMonthly[String(monthNum)];
  if (monthly?.length) {
    const breakdownData = monthly.map((r) => ({
      orgUnit: r.orgUnit ?? r.label,
      label: r.orgUnit ?? r.label,
      target: Number(r.target ?? r.plan ?? 0),
      actual: Number(r.actual ?? r.Actual ?? 0),
      plan: Number(r.target ?? r.plan ?? 0),
      Plan: Number(r.target ?? r.plan ?? 0),
      Actual: Number(r.actual ?? r.Actual ?? 0),
    }));
    return { ...dashboard, breakdownData };
  }
  return dashboard;
}
