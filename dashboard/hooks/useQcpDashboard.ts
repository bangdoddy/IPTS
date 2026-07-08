import { useMemo } from "react";
import demoData from "../DashboardDemoData.json";
import { sortByJobsiteOrder } from "../../dashboard/chartSiteOrder";

export function useQcpDashboard(params: {
    year: number;
    siteName?: string | null;
    enabled?: boolean;
}) {
    const siteKey = params.siteName ? `qcpDashboard${params.siteName}` : "qcpDashboard";
    const data = (demoData as any)[siteKey] || demoData.qcpDashboard;

    const summary = useMemo(() => {
        const rows = data.summaryData.map((item: any) => ({
            site: item.site,
            target: item.target,
            active: item.active,
            finish: item.finish,
        }));
        return sortByJobsiteOrder(rows);
    }, [data]);

    const monthly = useMemo(() => {
        return data.monthlyData.map((item: any) => ({
            month: item.month,
            monthName: item.monthName,
            target: item.target,
            active: item.active ?? item.finish,
            finish: item.finish ?? item.active
        }));
    }, [data]);

    const breakdown = useMemo(() => {
        return data.breakdownData.map((item: any) => ({
            orgUnit: item.orgUnit,
            target: item.target,
            finish: item.finish
        }));
    }, [data]);

    return {
        summary,
        monthly,
        breakdown,
        loading: false
    };
}
