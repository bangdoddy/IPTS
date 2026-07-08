import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { PlanActualGroupedBarChart } from "../qcc/PlanActualGroupedBarChart";
import { SS_CHART_PALETTE } from "../chartPalette";
import { buildSsMonthlyAllSitesFromDemo } from "./buildSsMonthlyAllSites";

type Props = {
  year: number;
  loading?: boolean;
};

export function SsMonthlyAllSitesChart({ year, loading }: Props) {
  const monthly = useMemo(() => buildSsMonthlyAllSitesFromDemo(year), [year]);

  return (
    <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden min-w-0">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0a8291]/10 text-[#0a8291]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              SS Total per Bulan (All Sites)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Plan vs Actual semua jobsite — Jan hingga Des ({year})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <PlanActualGroupedBarChart
          data={monthly}
          xDataKey="monthName"
          planDataKey="plan"
          actualDataKey="actual"
          planColor={SS_CHART_PALETTE.plan}
          actualColor={SS_CHART_PALETTE.actual}
          layout="monthly"
          gradientKey={`ss_monthly_all_${year}`}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
