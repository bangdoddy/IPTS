import { useState, useMemo } from "react";
import { CURRENT_YEAR, CURRENT_MONTH, MONTH_ORDER } from "../constants";
import { normKey, uniqueSorted } from "../utils";

export function useChartFilter() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [site, setSite] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  return {
    year,
    setYear,
    month,
    setMonth,
    site,
    setSite: (v: string | null) => {
      setSite(v);
      setDivision(null);
      setDepartment(null);
      setSection(null);
      setPageIndex(0);
    },
    division,
    setDivision: (v: string | null) => {
      setDivision(v);
      setDepartment(null);
      setSection(null);
      setPageIndex(0);
    },
    department,
    setDepartment: (v: string | null) => {
      setDepartment(v);
      setSection(null);
      setPageIndex(0);
    },
    section,
    setSection: (v: string | null) => {
      setSection(v);
      setPageIndex(0);
    },
    pageIndex,
    setPageIndex,
  };
}

export function useOrgOptionsFromStructure(master: any, fallback: any) {
  const allSites = useMemo(() => {
    const list = master.siteRows
      .map((r: any) => String(r.siteName ?? "").trim())
      .filter(Boolean);
    return list.length ? uniqueSorted(list) : fallback.sites;
  }, [master.siteRows, fallback.sites]);

  const allDivisions = useMemo(() => {
    const list = master.divRows
      .map((r: any) => String(r.divisionName ?? "").trim())
      .filter(Boolean);
    return list.length ? uniqueSorted(list) : fallback.divisions;
  }, [master.divRows, fallback.divisions]);

  const allDepartments = useMemo(() => {
    const list = master.deptRows
      .map((r: any) => String(r.departmentName ?? "").trim())
      .filter(Boolean);
    return list.length ? uniqueSorted(list) : fallback.departments;
  }, [master.deptRows, fallback.departments]);

  const departmentsByDivision = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of master.deptRows) {
      const div = String(r.divisionName ?? "").trim();
      const dept = String(r.departmentName ?? "").trim();
      if (!div || !dept) continue;
      if (!map[div]) map[div] = [];
      map[div].push(dept);
    }
    for (const k of Object.keys(map)) map[k] = uniqueSorted(map[k]);
    return map;
  }, [master.deptRows]);

  const sectionsByDepartment = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of master.secRows) {
      const dept = String(r.departmentName ?? "").trim();
      const sec = String(r.sectionName ?? "").trim();
      if (!dept || !sec) continue;
      if (!map[dept]) map[dept] = [];
      map[dept].push(sec);
    }
    for (const k of Object.keys(map)) map[k] = uniqueSorted(map[k]);
    return map;
  }, [master.secRows]);

  return { allSites, allDivisions, allDepartments, departmentsByDivision, sectionsByDepartment };
}

export function useOrgFilterOptions(master: any, selectedDivisionName: string | null, selectedDepartmentName: string | null, fallback: any) {
  const divKey = normKey(selectedDivisionName);
  const deptKey = normKey(selectedDepartmentName);

  const divisions = useMemo(() => {
    const list = master.divRows
      .map((r: any) => String(r.divisionName ?? "").trim())
      .filter(Boolean);
    return list.length ? uniqueSorted(list) : fallback.divisions;
  }, [master.divRows, fallback.divisions]);

  const departments = useMemo(() => {
    const list = master.deptRows
      .filter((r: any) => {
        const name = String(r.departmentName ?? "").trim();
        if (!name) return false;
        if (selectedDivisionName && normKey(r.divisionName) !== divKey) return false;
        return true;
      })
      .map((r: any) => String(r.departmentName ?? "").trim())
      .filter(Boolean);
    return uniqueSorted(list);
  }, [master.deptRows, selectedDivisionName, fallback.departments]);

  const sections = useMemo(() => {
    const list = master.secRows
      .filter((r: any) => {
        const name = String(r.sectionName ?? "").trim();
        if (!name) return false;
        if (selectedDivisionName && normKey(r.divisionName) !== divKey) return false;
        if (selectedDepartmentName && normKey(r.departmentName) !== deptKey) return false;
        return true;
      })
      .map((r: any) => String(r.sectionName ?? "").trim())
      .filter(Boolean);
    return uniqueSorted(list);
  }, [master.secRows, selectedDivisionName, selectedDepartmentName, fallback.sections]);

  const sites = useMemo(() => {
    const list = master.siteRows
      .map((r: any) => String(r.siteName ?? "").trim())
      .filter(Boolean);
    return list.length ? uniqueSorted(list) : fallback.sites;
  }, [master.siteRows, fallback.sites]);

  return { sites, divisions, departments, sections };
}
