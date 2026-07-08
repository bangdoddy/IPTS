import React, { useMemo } from "react";
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
  Cell,
} from "recharts";
import { CHART_BAR_LAYOUT } from "./chartLayout";
import { GroupedBarTopLabel } from "./chartBarLabels";

type Props = {
  plan: number;
  actual: number;
  planColor: string;
  actualColor: string;
  gradientKey: string;
  loading?: boolean;
};

/** Dua bar terpisah — label sumbu X: Plan & Actual (bukan "QCC Total" dll.) */
export function PlanActualPairBarChart({
  plan,
  actual,
  planColor,
  actualColor,
  gradientKey,
  loading,
}: Props) {
  const cfg = CHART_BAR_LAYOUT.total;
  const planGradId = `barGradientPlan_${gradientKey}`;
  const actualGradId = `barGradientActual_${gradientKey}`;

  const chartData = useMemo(
    () => [
      { label: "Plan", value: plan, color: planColor },
      { label: "Actual", value: actual, color: actualColor },
    ],
    [plan, actual, planColor, actualColor]
  );

  const yMax = Math.max(plan, actual, 10);
  const yDomainMax = Math.ceil(yMax / 10) * 10;

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

  return (
    <ResponsiveContainer width="100%" height={cfg.height}>
      <BarChart
        data={chartData}
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
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
          tick={{ fill: "#64748b", fontSize: cfg.xTickFontSize, fontWeight: 600 }}
          interval={0}
        />
        <YAxis
          domain={[0, yDomainMax]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: cfg.yTickFontSize, fontWeight: 600 }}
        />
        <Tooltip
          formatter={(v: number) => [v, ""]}
          labelFormatter={(label) => String(label)}
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
          payload={[
            { value: "Plan", type: "circle", color: planColor },
            { value: "Actual", type: "circle", color: actualColor },
          ]}
        />
        <Bar
          dataKey="value"
          radius={cfg.barRadius}
          maxBarSize={cfg.maxBarSize}
          animationDuration={1000}
        >
          {chartData.map((row) => (
            <Cell
              key={row.label}
              fill={
                row.label === "Plan"
                  ? `url(#${planGradId})`
                  : `url(#${actualGradId})`
              }
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            content={(p: { x?: number; y?: number; width?: number; value?: number; index?: number }) => {
              const fill = p.index === 0 ? planColor : actualColor;
              return (
                <GroupedBarTopLabel
                  x={p.x}
                  y={p.y}
                  width={p.width}
                  value={p.value}
                  fill={fill}
                  fontSize={cfg.labelFontSize}
                />
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
