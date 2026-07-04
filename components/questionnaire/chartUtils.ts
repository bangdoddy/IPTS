// src/components/questionnaire/chartUtils.ts

import { MONTH_ORDER, type MonthKey, type MonthlyPlanActual, type YearMonthMap } from "./dummy";

export type HierarchySelection = {
  division: string | null;
  department: string | null;
  section: string | null;
};

export type CumulativeOptions = {
  year: string;
  month: MonthKey;
  pageIndex: number; // pagination
  itemsPerPage: number;
  // daftar item untuk ditampilkan saat "All"
  allItems: string[];
  // kalau mau prioritas + sorting
  priorityItems?: string[];
  sortByActualDescWhenAll?: boolean;
};

// helper: cumulatif Jan..bulan
export function buildCumulativeFromYearMonth(
  dataByYearMonth: YearMonthMap,
  { year, month }: Pick<CumulativeOptions, "year" | "month">,
  displayItems: string[],
  monthlyRowCountHint?: number
): MonthlyPlanActual[] {
  const targetIdx = MONTH_ORDER.indexOf(month);
  const base: MonthlyPlanActual[] = displayItems.map((name) => ({ department: name, Plan: 0, Actual: 0 }));

  for (let i = 0; i <= targetIdx; i++) {
    const m = MONTH_ORDER[i];
    const monthData = dataByYearMonth[year]?.[m] ?? [];

    // Distribusi demo (mengikuti kode kamu sebelumnya):
    // monthData[0] masuk ke base[0], dst.
    // Kalau kamu nanti pakai data real (match by name), tinggal ubah logic ini.
    const limit = Math.min(base.length, monthData.length || (monthlyRowCountHint ?? base.length));
    for (let idx = 0; idx < limit; idx++) {
      const src = monthData[idx];
      if (!src) continue;
      base[idx].Plan += src.Plan;
      base[idx].Actual += src.Actual;
    }
  }

  return base;
}

export function applyAllModeSortingAndPagination(
  rows: MonthlyPlanActual[],
  opts: CumulativeOptions
): MonthlyPlanActual[] {
  const { pageIndex, itemsPerPage, priorityItems, sortByActualDescWhenAll } = opts;

  let result = [...rows];

  if (sortByActualDescWhenAll && priorityItems?.length) {
    const pri = result.filter((x) => priorityItems.includes(x.department)).sort((a, b) => b.Actual - a.Actual);
    const other = result.filter((x) => !priorityItems.includes(x.department)).sort((a, b) => b.Actual - a.Actual);
    result = [...pri, ...other];
  }

  const start = pageIndex * itemsPerPage;
  return result.slice(start, start + itemsPerPage);
}

export function hasNextPage(totalItems: number, pageIndex: number, itemsPerPage: number) {
  return (pageIndex + 1) * itemsPerPage < totalItems;
}
