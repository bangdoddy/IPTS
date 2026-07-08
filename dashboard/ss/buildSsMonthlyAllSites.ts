import {
  buildSsMonthlyAllSitesFromDummy,
  type SsMonthlyRow,
} from "../../../libs/projectStatusDummy/buildSsDashboardCharts";

export type SsMonthlyAllSitesRow = SsMonthlyRow;

/** Agregasi Plan/Actual semua jobsite per bulan dari data dummy SS (filter tahun). */
export function buildSsMonthlyAllSitesFromDemo(year: number): SsMonthlyAllSitesRow[] {
  return buildSsMonthlyAllSitesFromDummy({ year });
}
