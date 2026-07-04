import { useMemo } from "react";
import { ChartDataByYearMonth, PlanActualRow, ProjectChartApiRow } from "../types";
import { MONTH_ORDER } from "../constants";
import { calcAchievement, uniqueSorted, mapProjectChartRowsToPlanActual } from "../utils";

export function sumCumulativeForDepartments(params: {
  dataByYearMonth: ChartDataByYearMonth;
  year: string;
  month: string;
  departments: string[];
}): { Plan: number; Actual: number } {
  const { dataByYearMonth, year, month, departments } = params;
  const deptSet = new Set(departments);

  const targetMonthIndex = MONTH_ORDER.indexOf(month as (typeof MONTH_ORDER)[number]);
  if (targetMonthIndex < 0) return { Plan: 0, Actual: 0 };

  let plan = 0;
  let actual = 0;

  for (let i = 0; i <= targetMonthIndex; i++) {
    const mk = MONTH_ORDER[i];
    const monthData = dataByYearMonth?.[year]?.[mk] || [];
    for (const row of monthData) {
      if (deptSet.has(row.department)) {
        plan += Number(row.Plan || 0);
        actual += Number(row.Actual || 0);
      }
    }
  }

  return { Plan: plan, Actual: actual };
}

export function cumulativeRowsForDepartmentList(params: {
  dataByYearMonth: ChartDataByYearMonth;
  year: string;
  month: string;
  departments: string[];
}): PlanActualRow[] {
  const { dataByYearMonth, year, month, departments } = params;

  return departments.map((dept) => {
    const totals = sumCumulativeForDepartments({
      dataByYearMonth,
      year,
      month,
      departments: [dept],
    });
    return {
      department: dept,
      Plan: totals.Plan,
      Actual: totals.Actual,
      Achievement: calcAchievement(totals.Plan, totals.Actual),
    };
  });
}

export function useApiPlanActualChartBound(params: {
  rows: ProjectChartApiRow[];
  filter: any;
  org: any;
  pageSize?: number;
}) {
  const { rows, filter, org } = params;
  const pageSize = params.pageSize ?? 5;

  return useMemo(() => {
    const hasApiRows = rows.length > 0;
    const divSel = String(filter.division ?? "").trim();
    const deptSel = String(filter.department ?? "").trim();
    const secSel = String(filter.section ?? "").trim();

    const pagedDivisions = org.allDivisions.slice(filter.pageIndex * pageSize, filter.pageIndex * pageSize + pageSize);
    const hasPrevPage = filter.pageIndex > 0;
    const hasNextPage = (filter.pageIndex + 1) * pageSize < org.allDivisions.length;
    const totalPages = Math.max(1, Math.ceil(org.allDivisions.length / pageSize));

    const filteredDepartments = divSel ? org.departmentsByDivision[divSel] || [] : org.allDepartments;
    const filteredSections = deptSel
      ? org.sectionsByDepartment[deptSel] || []
      : uniqueSorted(filteredDepartments.flatMap((d: string) => org.sectionsByDepartment[d] || []));

    if (hasApiRows) {
      return {
        data: mapProjectChartRowsToPlanActual(rows),
        filteredDepartments,
        filteredSections,
        hasPrevPage,
        hasNextPage,
        showPaging: !divSel && !deptSel && !secSel,
        totalPages,
      };
    }

    let labels: string[] = [];
    if (!divSel) {
      labels = pagedDivisions;
    } else if (!deptSel) {
      labels = filteredDepartments;
    } else if (!secSel) {
      labels = filteredSections;
    } else {
      labels = [secSel];
    }

    return {
      data: labels.map((label) => ({
        department: label,
        Plan: 0,
        Actual: 0,
        Achievement: 0,
      })),
      filteredDepartments,
      filteredSections,
      hasPrevPage,
      hasNextPage,
      showPaging: !divSel && !deptSel && !secSel,
      totalPages,
    };
  }, [
    rows,
    filter.division,
    filter.department,
    filter.section,
    filter.pageIndex,
    org.allDivisions,
    org.allDepartments,
    org.departmentsByDivision,
    org.sectionsByDepartment,
    pageSize,
  ]);
}
