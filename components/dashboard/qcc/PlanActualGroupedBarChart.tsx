import React from "react";
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
import { CHART_BAR_LAYOUT } from "./chartLayout";
import { GroupedBarTopLabel } from "./chartBarLabels";
import { formatSiteLabel } from "../chartSiteOrder";

type LayoutKey = keyof typeof CHART_BAR_LAYOUT;

type Props = {
  data: Record<string, unknown>[];
  xDataKey: string;
  planDataKey: string;
  actualDataKey: string;
  planColor: string;
  actualColor: string;
  layout: LayoutKey;
  gradientKey: string;
  formatXAsSite?: boolean;
  loading?: boolean;
};

export function PlanActualGroupedBarChart({
  data,
  xDataKey,
  planDataKey,
  actualDataKey,
  planColor,
  actualColor,
  layout,
  gradientKey,
  formatXAsSite = false,
  loading,
}: Props) {
  const cfg = CHART_BAR_LAYOUT[layout];
  const planGradId = `barGradientPlan_${gradientKey}`;
  const actualGradId = `barGradientActual_${gradientKey}`;

  if (loading) {
    return (
      <div
        className="w-full flex items-center justify-center text-muted-foreground italic"
        style={{ height: cfg.height }}
      >
        Loading...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center text-muted-foreground bg-slate-50/30 rounded-xl border border-dashed"
        style={{ height: cfg.height }}
      >
        <p className="text-sm font-medium">No Data Available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={cfg.height}>
      <BarChart
        data={data}
        margin={cfg.margin}
        barGap={cfg.barGap}
        barCategoryGap={cfg.barCategoryGap}
      >
        <defs>
          <linearGradient id={planGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={planColor} stopOpacity={1} />
            <stop offset="100%" stopColor={planColor} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id={actualGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={actualColor} stopOpacity={1} />
            <stop offset="100%" stopColor={actualColor} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
        <XAxis
          dataKey={xDataKey}
          tickLine={false}
          axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
          tick={{
            fill: "#64748b",
            fontSize: cfg.xTickFontSize,
            fontWeight: 600,
          }}
          tickFormatter={formatXAsSite ? (v) => formatSiteLabel(String(v)) : undefined}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
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
          dataKey={planDataKey}
          name="Plan"
          fill={`url(#${planGradId})`}
          radius={cfg.barRadius}
          maxBarSize={cfg.maxBarSize}
          animationDuration={1000}
        >
          <LabelList
            dataKey={planDataKey}
            position="top"
            content={(p) => (
              <GroupedBarTopLabel {...p} fill={planColor} offsetY={-2} fontSize={cfg.labelFontSize} />
            )}
          />
        </Bar>
        <Bar
          dataKey={actualDataKey}
          name="Actual"
          fill={`url(#${actualGradId})`}
          radius={cfg.barRadius}
          maxBarSize={cfg.maxBarSize}
          animationDuration={1200}
        >
          <LabelList
            dataKey={actualDataKey}
            position="top"
            content={(p) => (
              <GroupedBarTopLabel {...p} fill={actualColor} offsetY={2} fontSize={cfg.labelFontSize} />
            )}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
