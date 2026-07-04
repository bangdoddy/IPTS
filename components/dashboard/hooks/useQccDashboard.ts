import { useMemo, useEffect } from "react";
import { usePostJson, useAuthToken } from "./useApiHooks";
import { API } from "../../../config";
import { sortByJobsiteOrder } from "../chartSiteOrder";

export interface QccDashboardSummary {
    site: string;
    target: number;
    active: number;
    finish: number;
}

export interface QccDashboardMonthly {
    month: number;
    monthName: string;
    target: number;
    finish: number;
}

export interface QccDashboardBreakdown {
    orgUnit: string;
    target: number;
    finish: number;
}

export interface QccDashboardResponse {
    summaryData: QccDashboardSummary[];
    monthlyData: QccDashboardMonthly[];
    breakdownData: QccDashboardBreakdown[];
}

export function useQccDashboard(params: {
    year: number;
    siteName?: string | null;
    enabled?: boolean;
}) {
    const token = useAuthToken();
    const body = useMemo(() => ({
        Year: params.year,
        SiteName: params.siteName
    }), [params.year, params.siteName]);

    const { data, loading } = usePostJson<any>({
        enabled: params.enabled ?? true,
        url: API.QCC_DASHBOARD,
        body,
        token,
        onError: (status, payload) => console.error("QCC Dashboard API error:", status, payload)
    });

    // Defensive mapping to handle potential casing differences or nesting
    const summary = useMemo(() => {
        const raw = data?.summaryData ?? data?.SummaryData;
        const rows = Array.isArray(raw)
            ? raw.map((item: any) => ({
                site: item.site ?? item.Site ?? "",
                target: item.target ?? item.Target ?? 0,
                active: item.active ?? item.Active ?? 0,
                finish: item.finish ?? item.Finish ?? 0,
            }))
            : [];
        return sortByJobsiteOrder(rows);
    }, [data]);

    const monthly = useMemo(() => {
        const raw = data?.monthlyData ?? data?.MonthlyData;
        return Array.isArray(raw) ? raw.map((item: any) => ({
            month: item.month ?? item.Month ?? 0,
            monthName: item.monthName ?? item.MonthName ?? "",
            target: item.target ?? item.Target ?? 0,
            finish: item.finish ?? item.Finish ?? 0
        })) : [];
    }, [data]);

    const breakdown = useMemo(() => {
        const raw = data?.breakdownData ?? data?.BreakdownData;
        return Array.isArray(raw) ? raw.map((item: any) => ({
            orgUnit: item.orgUnit ?? item.OrgUnit ?? "",
            target: item.target ?? item.Target ?? 0,
            finish: item.finish ?? item.Finish ?? 0
        })) : [];
    }, [data]);

    return {
        summary,
        monthly,
        breakdown,
        loading
    };
}
