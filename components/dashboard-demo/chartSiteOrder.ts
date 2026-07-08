/** Urutan jobsite — selaras tab SS (All Sites) */
export const JOBSITE_DISPLAY_ORDER = ["ADMO", "JAHO-NARO", "MACO", "SERA"] as const;

export type JobsiteKey = (typeof JOBSITE_DISPLAY_ORDER)[number];

export function normalizeSiteKey(site: string | null | undefined): string {
  const s = (site ?? "").trim().toUpperCase();
  if (s === "JAHO" || s === "NARO") return "JAHO-NARO";
  return s;
}

export function formatSiteLabel(site: string): string {
  const key = normalizeSiteKey(site);
  if (key === "JAHO-NARO") return "JAHO-NARO";
  return site;
}

export function sortByJobsiteOrder<T extends { site?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ia = JOBSITE_DISPLAY_ORDER.indexOf(normalizeSiteKey(a.site) as JobsiteKey);
    const ib = JOBSITE_DISPLAY_ORDER.indexOf(normalizeSiteKey(b.site) as JobsiteKey);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

export const JOBSITE_FILTER_OPTIONS = JOBSITE_DISPLAY_ORDER.map((id) => ({
  id,
  label: id,
}));
