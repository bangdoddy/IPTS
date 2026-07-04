import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { BarChart3, AlertCircle } from "lucide-react";
import { QcpDashboardBreakdown } from "../hooks/useQcpDashboard";
import { GroupedBarTopLabel } from "./chartBarLabels";
import { QCP_CHART_PALETTE } from "../chartPalette";
import { CHART_BAR_LAYOUT } from "./chartLayout";

const COLORS = QCP_CHART_PALETTE;
const cfg = CHART_BAR_LAYOUT.monthly;
const gradientKey = "qcp_breakdown";

interface Props {
  breakdown: QcpDashboardBreakdown[];
  loading: boolean;
  selectedSite: string | null;
}

export function QcpSiteDetailsCharts({ breakdown, loading, selectedSite }: Props) {
  if (!selectedSite) return null;

  return (
    <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden mt-6">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Pencapaian QCP {selectedSite} per{" "}
              {["SERA", "MACO"].includes(selectedSite || "") ? "Section" : "Departemen"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        {loading ? (
          <div
            className="w-full flex items-center justify-center text-muted-foreground italic"
            style={{ height: cfg.height }}
          >
            Loading breakdown...
          </div>
        ) : breakdown.length === 0 ? (
          <div
            className="w-full flex flex-col items-center justify-center text-muted-foreground bg-slate-50/30 rounded-xl border border-dashed p-10"
            style={{ height: cfg.height }}
          >
            <AlertCircle className="w-10 h-10 mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">No Breakdown Data Available</p>
            <p className="text-xs mt-1 text-slate-400">Try selecting a different site or year</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={cfg.height}>
            <BarChart
              data={breakdown}
              margin={{ ...cfg.margin, bottom: 100 }}
              barGap={cfg.barGap}
              barCategoryGap={cfg.barCategoryGap}
            >
              <defs>
                <linearGradient id={`barGradientPlan_${gradientKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.plan} stopOpacity={1} />
                  <stop offset="100%" stopColor={COLORS.plan} stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id={`barGradientActual_${gradientKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.actual} stopOpacity={1} />
                  <stop offset="100%" stopColor={COLORS.actual} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="orgUnit"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
                tick={{ fill: "#64748b", fontSize: cfg.xTickFontSize, fontWeight: 500 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: cfg.yTickFontSize, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: 24, fontSize: 13, fontWeight: 600 }}
              />
              <Bar
                dataKey="target"
                name="Plan"
                fill={`url(#barGradientPlan_${gradientKey})`}
                radius={cfg.barRadius}
                maxBarSize={cfg.maxBarSize}
              >
                <LabelList
                  dataKey="target"
                  position="top"
                  content={(p) => (
                    <GroupedBarTopLabel {...p} fill={COLORS.plan} offsetY={-2} fontSize={cfg.labelFontSize} />
                  )}
                />
              </Bar>
              <Bar
                dataKey="finish"
                name="Actual"
                fill={`url(#barGradientActual_${gradientKey})`}
                radius={cfg.barRadius}
                maxBarSize={cfg.maxBarSize}
              >
                <LabelList
                  dataKey="finish"
                  position="top"
                  content={(p) => (
                    <GroupedBarTopLabel {...p} fill={COLORS.actual} offsetY={2} fontSize={cfg.labelFontSize} />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
