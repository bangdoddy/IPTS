import { useState, useMemo, useEffect, useCallback } from "react";
import { Project, ModuleConfig, ModuleId, MemberOptions, ProjectType, SSStatus, PlanActualRow, SsChartApiRow } from "../types";
import { SS_STATUS, MODULE_TYPE_MAP } from "../constants";
import { normalizeSSStatus, normalizeQStatusKey, pickNumber, uniqueSorted, buildMaxMap, normKey, uniqueLabelsFromRows, calcAchievement, mapProjectChartRowsToPlanActual } from "../utils";
import { ssStatusEquals } from "../../../libs/projectStatusDummy";

function normalizeProjectStatus(p: Project): Project {
  if (p.type === "SS") {
    const s = String(p.status ?? "");
    const isNew =
      s === SS_STATUS.REVIEW_LEADER ||
      s === SS_STATUS.REVIEW_BPI ||
      s === SS_STATUS.COMPLETE;
    return { ...p, status: isNew ? (p.status as SSStatus) : normalizeSSStatus(s) };
  }
  return p;
}

export function useMonitoring(params: {
  projects: Project[];
  modules: ModuleConfig[];
  ssRows: Project[];
}) {
  const { projects, modules, ssRows } = params;

  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const resetAllFilters = useCallback(() => {
    setSelectedStatus(null);
    setSelectedStep(null);
    setSelectedSite(null);
    setSelectedDivision(null);
    setSelectedDepartment(null);
    setSelectedSection(null);
  }, []);

  const getBaseList = useCallback(
    (moduleId: ModuleId) => {
      if (moduleId === "ss") return ssRows.map(normalizeProjectStatus);

      const type = MODULE_TYPE_MAP[moduleId];
      return projects.filter((p) => p.type === type).map(normalizeProjectStatus);
    },
    [projects, ssRows]
  );

  const isQFamily = (mid: ModuleId | null) => mid === "qcc" || mid === "qcp" || mid === "tebp";

  const filteredProjects = useMemo(() => {
    if (!selectedModule) return [];

    let list = getBaseList(selectedModule);

    if (selectedStatus) {
      if (isQFamily(selectedModule)) {
        const wanted = normalizeQStatusKey(selectedStatus);
        if (wanted === "registered") {
          list = list.filter((p) => {
            const s = normalizeQStatusKey(p.status);
            return s === "registered" || s === "submitted";
          });
        } else if (wanted === "in-progress" || wanted === "finished") {
          list = list.filter((p) => normalizeQStatusKey(p.status) === wanted);
        } else {
          list = list.filter((p) => String(p.status) === selectedStatus);
        }
      } else {
        list = list.filter((p) => ssStatusEquals(p.status, selectedStatus));
      }
    }

    if (isQFamily(selectedModule) && selectedStatus === "in-progress" && selectedStep) {
      list = list.filter((p) => pickNumber((p as any).step, 0) === selectedStep);
    }

    if (selectedSite) list = list.filter((p) => (p.members || []).some((m) => m.site === selectedSite));
    if (selectedDivision) list = list.filter((p) => (p.members || []).some((m) => m.division === selectedDivision));
    if (selectedDepartment) list = list.filter((p) => (p.members || []).some((m) => m.department === selectedDepartment));
    if (selectedSection) list = list.filter((p) => (p.members || []).some((m) => m.section === selectedSection));

    return list;
  }, [
    getBaseList,
    selectedModule,
    selectedStatus,
    selectedStep,
    selectedSite,
    selectedDivision,
    selectedDepartment,
    selectedSection,
  ]);

  useEffect(() => {
    if (!selectedModule) return;
    if (!isQFamily(selectedModule)) return;
    if (normalizeQStatusKey(selectedStatus) !== "in-progress") return;
    if (selectedStep != null) return;
    setSelectedStep(1);
  }, [selectedModule, selectedStatus, selectedStep]);

  const memberOptions = useMemo<MemberOptions>(() => {
    if (!selectedModule) return { sites: [], divisions: [], departments: [], sections: [] };
    const targetProjects = getBaseList(selectedModule);

    const sites: string[] = [];
    const divisions: string[] = [];
    const departments: string[] = [];
    const sections: string[] = [];

    for (const p of targetProjects) {
      for (const m of p.members || []) {
        if (m.site) sites.push(m.site);
        if (m.division) divisions.push(m.division);
        if (m.department) departments.push(m.department);
        if (m.section) sections.push(m.section);
      }
    }

    return {
      sites: uniqueSorted(sites),
      divisions: uniqueSorted(divisions),
      departments: uniqueSorted(departments),
      sections: uniqueSorted(sections),
    };
  }, [getBaseList, selectedModule]);

  const getModuleStats = useCallback(
    (moduleId: ModuleId) => {
      const list = getBaseList(moduleId);
      const byStatusExact = (s: string) =>
        list.filter((p) => ssStatusEquals(p.status, s)).length;
      const byStatusNorm = (s: string) => list.filter((p) => normalizeQStatusKey(p.status) === s).length;

      return {
        registered: isQFamily(moduleId) ? byStatusNorm("registered") + byStatusNorm("submitted") : byStatusExact("registered"),
        inProgress: isQFamily(moduleId) ? byStatusNorm("in-progress") : byStatusExact("in-progress"),
        finished: isQFamily(moduleId) ? byStatusNorm("finished") : byStatusExact("finished"),
        reviewByLeader: byStatusExact(SS_STATUS.REVIEW_LEADER),
        reviewByBPI: byStatusExact(SS_STATUS.REVIEW_BPI),
        completed: byStatusExact(SS_STATUS.COMPLETE),
      };
    },
    [getBaseList]
  );

  const getTypeColor = useCallback(
    (type: ProjectType) => {
      const m = modules.find((x) => x.type === type);
      const bg = m?.iconColor || "#0f766e";
      return { bg, text: "#fff" };
    },
    [modules]
  );

  const getStatusBadgeLabel = (status: string, step: any) => {
      const stepObj = step && typeof step === "object" ? step : null;
      const stepVal = stepObj ? (stepObj.step ?? stepObj.Step) : step;
      const stepStatusRaw = stepObj ? (stepObj.stepStatus ?? stepObj.StepStatus) : undefined;
      const stepStatusKey = normalizeQStatusKey(stepStatusRaw);
      const stepStatusLabel =
        stepStatusKey === "approved"
          ? "Approved"
          : stepStatusKey === "submitted"
          ? "Submitted"
          : stepStatusKey === "rejected"
          ? "Rejected"
          : stepStatusRaw
          ? String(stepStatusRaw)
          : "";

      const key = normalizeQStatusKey(status);
      const statusTrim = String(status ?? "").trim();
      
      if (key === "in-progress") {
          return `In Progress${stepVal ? ` (Step ${stepVal}${stepStatusLabel ? ` - ${stepStatusLabel}` : ""})` : ""}`;
      }
      
      const map: Record<string, string> = {
          [SS_STATUS.REVIEW_LEADER]: SS_STATUS.REVIEW_LEADER,
          [SS_STATUS.REJECT_LEADER]: SS_STATUS.REJECT_LEADER,
          [SS_STATUS.REVIEW_BPI]: SS_STATUS.REVIEW_BPI,
          [SS_STATUS.COMPLETE]: SS_STATUS.COMPLETE,
          "registered": "Registered",
          "submitted": "Submitted",
          "finished": "Finished",
      };
      
      return map[key] || map[statusTrim] || map[statusTrim.toLowerCase()] || statusTrim || status;
  };

  return {
    selectedModule,
    setSelectedModule,

    selectedStatus,
    setSelectedStatus,
    selectedStep,
    setSelectedStep,

    selectedSite,
    setSelectedSite,
    selectedDivision,
    setSelectedDivision,
    selectedDepartment,
    setSelectedDepartment,
    selectedSection,
    setSelectedSection,

    resetAllFilters,
    memberOptions,
    filteredProjects,

    getModuleStats,
    getTypeColor,
    getStatusBadgeLabel,
  };
}

export function useSsChartBound(params: {
  rows: SsChartApiRow[];
  filter: any;
  mergedDivisions: string[];
  mergedDepartments: string[];
  mergedSections: string[];
  orgFallback: any;
}) {
  const { rows, filter, mergedDivisions, mergedDepartments, mergedSections, orgFallback } = params;

  return useMemo(() => {
    const divisionSel = String(filter.division ?? "").trim();
    const deptSel = String(filter.department ?? "").trim();
    const secSel = String(filter.section ?? "").trim();

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(mergedDivisions.length / pageSize));
    const hasPrevPage = filter.pageIndex > 0;
    const hasNextPage = (filter.pageIndex + 1) * pageSize < mergedDivisions.length;

    const level: "division" | "department" | "section" =
      !divisionSel ? "division" : !deptSel ? "department" : "section";

    const divKey = normKey(divisionSel);
    const deptKey = normKey(deptSel);

    const apiDivisions = uniqueLabelsFromRows(rows, "division");
    const apiDepartments = uniqueSorted(
      rows
        .filter((r) => !divisionSel || normKey(r.division) === divKey)
        .map((r) => String(r.department ?? "").trim())
        .filter(Boolean)
    );

    const apiSections = uniqueSorted(
      rows
        .filter((r) => !divisionSel || normKey(r.division) === divKey)
        .filter((r) => !deptSel || normKey(r.department) === deptKey)
        .map((r) => String(r.section ?? "").trim())
        .filter(Boolean)
    );

    const fallbackDepartments = divisionSel
      ? orgFallback.departmentsByDivision[divisionSel] || []
      : orgFallback.allDepartments;

    const fallbackSections = deptSel
      ? orgFallback.sectionsByDepartment[deptSel] || []
      : uniqueSorted(fallbackDepartments.flatMap((d: string) => orgFallback.sectionsByDepartment[d] || []));

    let labels: string[] = [];
    if (level === "division") {
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.division;
        if (key) actualMap[key] = Number(r.totalSSPerDivision ?? 0);
      }
      const source = (mergedDivisions.length ? mergedDivisions : apiDivisions)
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    } else if (level === "department") {
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.department;
        if (key) actualMap[key] = Number(r.totalSSPerDepartment ?? 0);
      }
      const source = (apiDepartments.length ? apiDepartments : (orgFallback.departmentsByDivision[divisionSel] || mergedDepartments || []))
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    } else {
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.section;
        if (key) actualMap[key] = Number(r.totalSSPerSection ?? 0);
      }
      const source = (secSel
        ? [secSel]
        : apiSections.length
        ? apiSections
        : (orgFallback.sectionsByDepartment[deptSel] || (fallbackSections.length ? fallbackSections : mergedSections)))
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    }

    const data: PlanActualRow[] = labels.map((label) => {
      const found = rows.find(
        (r) =>
          (level === "division" && r.division === label) ||
          (level === "department" && r.department === label) ||
          (level === "section" && r.section === label)
      );
      const actual =
        found?.actual !== undefined
          ? Number(found.actual ?? 0)
          : level === "division"
          ? Number(found?.totalSSPerDivision ?? 0)
          : level === "department"
          ? Number(found?.totalSSPerDepartment ?? 0)
          : Number(found?.totalSSPerSection ?? 0);

      return {
        department: label,
        Plan: found ? Number(found.planSS ?? found.plan ?? 0) : 0,
        Actual: actual,
        Achievement: 0,
      };
    });

    return {
      level,
      data,
      filteredDepartments:
        level === "division"
          ? (apiDepartments.length ? apiDepartments : mergedDepartments)
          : fallbackDepartments,
      filteredSections: level !== "section" ? fallbackSections : labels,
      hasPrevPage,
      hasNextPage,
      showPaging: level === "division",
      totalPages,
      pageSize,
    };
  }, [
    rows,
    filter.division,
    filter.department,
    filter.section,
    filter.pageIndex,
    mergedDivisions,
    mergedDepartments,
    mergedSections,
    orgFallback.allDepartments,
    orgFallback.departmentsByDivision,
    orgFallback.sectionsByDepartment,
  ]);
}
