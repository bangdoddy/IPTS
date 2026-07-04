import { useState, useEffect, useMemo } from "react";
import { OrgStructure, OrgMaster, OrgApiRow } from "../types";
import { uniqueSorted, normKey } from "../utils";

async function postOrg<T>(
  url: string,
  body: Record<string, any>,
  token?: string | null,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) throw new Error(`ORG HTTP ${res.status} ${JSON.stringify(json)}`);
  return (json?.data ?? null) as T;
}

export function useOrgMasterOnce(params: {
  enabled: boolean;
  url: string;
  token?: string | null;
}) {
  const [master, setMaster] = useState<OrgMaster>({
    ready: false,
    loading: false,
    divRows: [],
    deptRows: [],
    secRows: [],
  });

  useEffect(() => {
    if (!params.enabled || !params.url) {
      setMaster((s) => ({ ...s, ready: true, loading: false }));
      return;
    }

    const ctrl = new AbortController();
    let alive = true;

    (async () => {
      setMaster({
        ready: false,
        loading: true,
        divRows: [],
        deptRows: [],
        secRows: [],
      });

      try {
        const base = {
          action: 1,
          divisionCode: "",
          departmentCode: "",
          sectionCode: "",
          name: "",
          keyword: "",
        };

        const [divRows, deptRows, secRows] = await Promise.all([
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 1 }, params.token, ctrl.signal),
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 2 }, params.token, ctrl.signal),
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 3 }, params.token, ctrl.signal),
        ]);

        if (!alive) return;

        setMaster({
          ready: true,
          loading: false,
          divRows: Array.isArray(divRows) ? divRows : [],
          deptRows: Array.isArray(deptRows) ? deptRows : [],
          secRows: Array.isArray(secRows) ? secRows : [],
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        console.error("ORG master error:", e);
        setMaster({ ready: true, loading: false, divRows: [], deptRows: [], secRows: [] });
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [params.enabled, params.url, params.token]);

  return master;
}

export function useOrgDerivedFromMaster(params: {
  master: OrgMaster;
  selectedDivisionName: string | null;
  selectedDepartmentName: string | null;
}) {
  const divisions = useMemo(() => {
    if (!params.master.divRows.length) return [];
    return uniqueSorted(
      params.master.divRows
        .map((r) => String(r.divisionName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.divRows]);

  const departments = useMemo(() => {
    if (!params.master.deptRows.length) return [];
    const divKey = normKey(params.selectedDivisionName);

    return uniqueSorted(
      params.master.deptRows
        .filter((r) => {
          const name = String(r.departmentName ?? "").trim();
          if (!name) return false;
          if (params.selectedDivisionName) return normKey(r.divisionName) === divKey;
          return true;
        })
        .map((r) => String(r.departmentName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.deptRows, params.selectedDivisionName]);

  const sections = useMemo(() => {
    if (!params.master.secRows.length) return [];
    const divKey = normKey(params.selectedDivisionName);
    const deptKey = normKey(params.selectedDepartmentName);

    return uniqueSorted(
      params.master.secRows
        .filter((r) => {
          const name = String(r.sectionName ?? "").trim();
          if (!name) return false;
          if (params.selectedDivisionName && normKey(r.divisionName) !== divKey) return false;
          if (params.selectedDepartmentName && normKey(r.departmentName) !== deptKey) return false;
          return true;
        })
        .map((r) => String(r.sectionName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.secRows, params.selectedDivisionName, params.selectedDepartmentName]);

  return { divisions, departments, sections };
}
