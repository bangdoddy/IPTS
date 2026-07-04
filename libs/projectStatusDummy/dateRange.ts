/** Rentang ISO untuk filter SS — tahun kalender (UTC) */
export function getYearIsoRange(year: number) {
  return {
    createdAtFrom: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)).toISOString(),
    createdAtTo: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString(),
  };
}

/** Tahun berjalan (mis. 2026 → 2026-01-01 … 2026-12-31) */
export function getCurrentYearIsoRange(refDate = new Date()) {
  return getYearIsoRange(refDate.getFullYear());
}
