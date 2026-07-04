import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getCookieJson } from "../../../libs/cookie";
import { ProjectChartApiRow } from "../types";

/* =====================================================
   ✅ Unified POST JSON hook (abort + stable deps)
   ===================================================== */
export function usePostJson<T>(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  mapData?: (raw: any) => T;
  onError?: (status: number, payload: any) => void;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const bodyJson = useMemo(
    () => JSON.stringify(params.body ?? {}),
    [params.body]
  );

  useEffect(() => {
    if (!params.enabled || !params.url) return;

    const ctrl = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(params.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(params.token ? { Authorization: `Bearer ${params.token}` } : {}),
          },
          body: bodyJson,
          signal: ctrl.signal,
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (!res.ok) {
          params.onError?.(res.status, json);
          if (alive) setData(null);
          return;
        }

        const raw = json?.data;
        const mapped = params.mapData ? params.mapData(raw) : (raw as T);
        if (alive) setData(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("POST fetch error:", e);
          if (alive) setData(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [params.enabled, params.url, params.token, bodyJson]);

  return { data, loading };
}

export function useProjectChartApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  errorLabel: string;
}) {
  const r = usePostJson<ProjectChartApiRow[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error(`${params.errorLabel} http error:`, status, payload),
  });
  return { rows: r.data ?? [], loading: r.loading };
}

export function useSsList(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const r = usePostJson<any[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("SS list http error:", status, payload),
  });

  const items = r.data ?? [];
  const first = (items[0] ?? {}) as any;

  const totalRows = Number(first.totalRows ?? 0);
  const totalPages = Math.max(1, Number(first.totalPages ?? (totalRows > 0 ? 1 : 1)));

  const totals = {
    reviewByLeader: Number(first.totalReviewByLeader ?? 0),
    reviewByBPI: Number(first.totalReviewByBpi ?? 0),
    completed: Number(first.totalComplete ?? 0),
  };

  return {
    loading: r.loading,
    totalRows,
    totalPages,
    rows: items,
    totals,
  };
}

export function useQccListByNrp(params: {
  enabled: boolean;
  url: string;
  nrp: string;
  token?: string | null;
  refreshKey?: number;
}) {
  const body = useMemo(() => ({ 
    CreatedBy: params.nrp,
    RefreshKey: params.refreshKey ?? 0 
  }), [params.nrp, params.refreshKey]);
  const r = usePostJson<any[]>({
    enabled: params.enabled,
    url: params.url,
    body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("QCC list http error:", status, payload),
  });

  return { rows: r.data ?? [], loading: r.loading };
}

export function useQcpListByNrp(params: {
  enabled: boolean;
  url: string;
  nrp: string;
  token?: string | null;
  refreshKey?: number;
}) {
  const body = useMemo(() => ({ 
    CreatedBy: params.nrp,
    RefreshKey: params.refreshKey ?? 0 
  }), [params.nrp, params.refreshKey]);
  const r = usePostJson<any[]>({
    enabled: params.enabled,
    url: params.url,
    body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("QCP list http error:", status, payload),
  });

  return { rows: r.data ?? [], loading: r.loading };
}

export function useQccClassificationApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const r = usePostJson<any[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("Classification api http error:", status, payload),
  });
  return { rows: r.data ?? [], loading: r.loading };
}

export function useAuthToken() {
  return useMemo(() => {
    try {
      const c = getCookieJson<any>("inovasis_auth");
      return (c?.token ?? c?.accessToken ?? null) as string | null;
    } catch {
      return null;
    }
  }, []);
}

export function useLoginNrp() {
  return React.useMemo(() => {
    try {
      const c = getCookieJson<any>("inovasis_auth");
      return c?.nrp ?? c?.NRP ?? c?.username ?? null;
    } catch {
      return null;
    }
  }, []);
}
export function useSsTotalChart(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const r = usePostJson<{ totalActual: number; totalTarget: number }>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw: any) => ({
      totalActual: raw?.totalActual ?? raw?.TotalActual ?? 0,
      totalTarget: raw?.totalTarget ?? raw?.TotalTarget ?? 0,
    }),
    onError: (s, p) => console.error("SS Total Chart err", s, p),
  });
  return { data: r.data, loading: r.loading };
}
