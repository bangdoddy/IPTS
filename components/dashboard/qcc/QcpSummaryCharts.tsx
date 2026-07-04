import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Trophy, Activity, Flame } from "lucide-react";
import { FinishOverviewBarChart } from "./FinishOverviewBarChart";
import { PlanActualGroupedBarChart } from "./PlanActualGroupedBarChart";
import { QCP_CHART_PALETTE } from "../chartPalette";
import { sortByJobsiteOrder } from "../chartSiteOrder";

interface Props {
    summary: any[];
    monthly: any[];
    loading: boolean;
    selectedSite: string | null;
}

export function QcpSummaryCharts({ summary, monthly, loading, selectedSite }: Props) {
    const COLORS = QCP_CHART_PALETTE;

    const sortedSummary = useMemo(() => sortByJobsiteOrder(summary), [summary]);

    const finishTotals = useMemo(() => {
        const totalActual = sortedSummary.reduce((s, r) => s + Number(r.finish ?? 0), 0);
        const totalTarget = sortedSummary.reduce((s, r) => s + Number(r.target ?? 0), 0);
        return { totalActual, totalTarget };
    }, [sortedSummary]);

    return (
        <div className="space-y-8">
            {!selectedSite && (
                <div className="space-y-8">
                    <FinishOverviewBarChart
                        title="QCP Total"
                        subtitle="Overall completed projects vs target across all sites"
                        actual={finishTotals.totalActual}
                        target={finishTotals.totalTarget}
                        actualColor={COLORS.actual}
                        targetColor={COLORS.plan}
                        iconAccentClass="bg-[#F59E0B]/15 text-[#F59E0B]"
                        loading={loading}
                    />

                    <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden min-w-0">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-bold">Target VS Actual QCP Finish</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">Performance distribution across all operative jobsites</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <PlanActualGroupedBarChart
                                data={sortedSummary}
                                xDataKey="site"
                                planDataKey="target"
                                actualDataKey="finish"
                                planColor={COLORS.plan}
                                actualColor={COLORS.actual}
                                layout="sites"
                                gradientKey="qcp_finish_sites"
                                formatXAsSite
                                loading={loading}
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden min-w-0">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-bold">QCP Active All Site</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">Ongoing projects compared to capacity/target</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <PlanActualGroupedBarChart
                                data={sortedSummary}
                                xDataKey="site"
                                planDataKey="target"
                                actualDataKey="active"
                                planColor={COLORS.plan}
                                actualColor={COLORS.actual}
                                layout="sites"
                                gradientKey="qcp_active_sites"
                                formatXAsSite
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden min-w-0">
                <CardHeader className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold">
                                QCP Active Monthly {selectedSite || "All Site"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {selectedSite || "All Sites"} — cumulative progress over time
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                    <PlanActualGroupedBarChart
                        data={monthly}
                        xDataKey="monthName"
                        planDataKey="target"
                        actualDataKey="active"
                        planColor={COLORS.plan}
                        actualColor={COLORS.actual}
                        layout="monthly"
                        gradientKey={`qcp_monthly_${selectedSite ?? "all"}`}
                        loading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
