import React, { useState, useEffect, useMemo } from "react";
import { getCookieJson } from "../../../libs/cookie";
import { ProjectChartApiRow } from "../types";
import demoData from "../DashboardDemoData.json";
import {
  buildSsCollectedChartFromDummy,
  buildSsSiteDashboardFromDummy,
  buildSsTotalFromDummy,
  computeSsDummyMonitoringTotals,
  fetchDummySsList,
  mapSsDemoToSuggestionRow,
} from "../../../libs/projectStatusDummy";

export function usePostJson<T>(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  mapData?: (raw: any) => T;
  onError?: (status: number, payload: any) => void;
}) {
  // In demo mode, we don't actually fetch anything.
  // This is kept for type compatibility if needed, but we won't use it in other hooks.
  return { data: null as T | null, loading: false };
}

export function useProjectChartApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  errorLabel: string;
}) {
  const rows = useMemo(() => {
    const url = (params.url || "").toUpperCase();
    const body = params.body ?? {};
    if (url.includes("SUGGESTION_DASHBOARDCHART_SITE")) {
      const site = String(body.siteName ?? "");
      if (!site || site === "all") {
        return buildSsCollectedChartFromDummy(body);
      }
      const dash = buildSsSiteDashboardFromDummy(site, body, null);
      return (dash.breakdownData ?? []) as ProjectChartApiRow[];
    }
    if (url.includes("SUGGESTION")) {
      return buildSsCollectedChartFromDummy(body) as ProjectChartApiRow[];
    }
    if (url.includes("QCC")) return demoData.qccChart;
    if (url.includes("QCP")) return demoData.qcpChart;
    return buildSsCollectedChartFromDummy(body) as ProjectChartApiRow[];
  }, [params.url, params.body]);

  return { rows: (rows || []) as ProjectChartApiRow[], loading: false };
}

export function useSsList(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const body = params.body ?? {};
  const pageSize = Math.max(1, Number(body.pageSize ?? 10));
  const pageNumberRaw = Number(body.pageNumber ?? 1);
  const pageNumber = pageNumberRaw >= 1 ? pageNumberRaw - 1 : 0;
  const { rows, totalRows, totalPages } = fetchDummySsList({
    pageNumber,
    pageSize,
    createdAtFrom: (body.createdAtFrom as string | null) ?? null,
    createdAtTo: (body.createdAtTo as string | null) ?? null,
    keyword: String(body.keyword ?? ""),
    status: String(body.status ?? ""),
  });
  const items = rows.map((row, i) => mapSsDemoToSuggestionRow(row as Record<string, unknown>, i));
  const totals = computeSsDummyMonitoringTotals({
    createdAtFrom: (body.createdAtFrom as string | null) ?? null,
    createdAtTo: (body.createdAtTo as string | null) ?? null,
    keyword: String(body.keyword ?? ""),
  });

  return {
    loading: false,
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
  return { rows: demoData.qccList as any[], loading: false };
}

export function useQcpListByNrp(params: {
  enabled: boolean;
  url: string;
  nrp: string;
  token?: string | null;
  refreshKey?: number;
}) {
  return { rows: demoData.qcpList as any[], loading: false };
}

export function useQccClassificationApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  return { rows: demoData.classification as any[], loading: false };
}

export function useAuthToken() {
  return "demo-token";
}

export function useLoginNrp() {
  return "DEMO001";
}

export function useSsTotalChart(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const body = params.body ?? {};
  const total = buildSsTotalFromDummy(body);
  const site = String(body.siteName ?? "");
  const dash =
    site && site !== "all"
      ? buildSsSiteDashboardFromDummy(site, body, null)
      : null;

  return {
    data: total,
    monthlyData: dash?.monthlyData ?? [],
    breakdownData: dash?.breakdownData ?? [],
    loading: false,
  };
}
