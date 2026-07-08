import React, { useMemo, useRef, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { PlanActualRow, TotalRow } from "../types";
import { YEARS, MONTHS } from "../constants";
import { getDepartmentAbbr } from "../utils";
import { HierarchyDropdowns } from "./HierarchyDropdowns";

export function YearMonthControls(props: {
  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  hideMonth?: boolean;
  hideYear?: boolean;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      {!props.hideYear && (
        <Select value={props.year} onValueChange={props.onYear}>
          <SelectTrigger className="w-[110px] h-10 text-sm bg-muted/30 border-muted-foreground/10 hover:bg-muted/50 rounded-lg transition-colors font-semibold">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50">
            {YEARS.map((y) => (
              <SelectItem key={y} value={y} className="rounded-md">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!props.hideMonth && (
        <Select value={props.month} onValueChange={props.onMonth}>
          <SelectTrigger className="w-[110px] h-10 text-sm bg-muted/30 border-muted-foreground/10 hover:bg-muted/50 rounded-lg transition-colors font-semibold">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50">
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value} className="rounded-md">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function RotatedTick(props: { x?: number; y?: number; value?: any; color?: string; bold?: boolean }) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const fullText = String(props.value ?? "");
  const displayText = getDepartmentAbbr(fullText);

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{fullText}</title>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill={props.color ?? "currentColor"}
        fontSize={13}
        fontWeight={props.bold ? "bold" : "normal"}
        transform="rotate(-45)"
        style={{ cursor: "help" }}
      >
        {displayText}
      </text>
    </g>
  );
}

export function TooltipShell(props: {
  title: string;
  lines: Array<{ label: string; value: any; color: string }>;
  footer?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ color: "#1f2937", fontWeight: "bold", marginBottom: "8px" }}>{props.title}</p>
      {props.lines.map((l, idx) => (
        <p key={idx} style={{ color: l.color, margin: "4px 0", fontSize: "15px" }}>
          {l.label}: {l.value}
        </p>
      ))}
      {props.footer && (
        <p
          style={{
            color: "#DC2626",
            fontWeight: "bold",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid #fee2e2",
            fontSize: "14px",
          }}
        >
          {props.footer}
        </p>
      )}
    </div>
  );
}

export function TotalChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;
  summaryItems?: Array<{ label: string; value: number; color: string }>;
  data: TotalRow[];
  yDomain: [number, number];
  yTicks?: number[];
  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;
  divisions: string[];
  departments: string[];
  sections: string[];
  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;
  showPaging: boolean;
  pageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrev: boolean;
  canNext: boolean;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="mb-4">
          <div className="mb-4">
            <HierarchyDropdowns
              divisionValue={props.divisionValue}
              departmentValue={props.departmentValue}
              sectionValue={props.sectionValue}
              divisions={props.divisions}
              departments={props.departments}
              sections={props.sections}
              onDivision={props.onDivision}
              onDepartment={props.onDepartment}
              onSection={props.onSection}
              divisionAllLabel="All Divisions (Paged)"
            />
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-xl sm:text-2xl">{props.title}</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{props.subtitle}</p>
                {props.loading && <p className="text-sm text-muted-foreground mt-1">Loading...</p>}
              </div>
            </div>
            <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
          </div>

          {props.summaryItems && props.summaryItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {props.summaryItems.map((item) => (
                <div key={item.label} className="rounded-lg border px-3 py-2 text-sm bg-white/70" style={{ borderColor: item.color }}>
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[500px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 50, right: 40, left: 20, bottom: 140 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={(tp: any) => <RotatedTick x={tp.x} y={tp.y} value={tp.payload?.value} />}
                tickLine={{ stroke: "currentColor" }}
                height={130}
                interval={0}
              />
              <YAxis
                domain={props.yDomain}
                ticks={props.yTicks}
                tick={{ fill: "currentColor", fontSize: 14 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 14 },
                }}
              />
              <Tooltip
                content={(tip: any) => {
                  const { active, payload, label } = tip;
                  if (!(active && payload && payload.length)) return null;
                  const d = payload[0].payload as TotalRow;
                  return (
                    <TooltipShell
                      title={String(label ?? "")}
                      lines={[
                        { label: "Plan", value: d.plan, color: planColor },
                        { label: "Actual", value: d.actual, color: actualColor },
                      ]}
                    />
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />
              <Bar dataKey="plan" name="Plan" fill={planColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="plan"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text x={x + width / 2} y={y + 8} fill={planColor} textAnchor="middle" fontSize={10} fontWeight="bold">
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
              <Bar dataKey="actual" name="Actual" fill={actualColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text x={x + width / 2} y={y + 8} fill={actualColor} textAnchor="middle" fontSize={12} fontWeight="bold">
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <PagingControls
          show={props.showPaging}
          pageIndex={props.pageIndex}
          totalPages={props.totalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          canPrev={props.canPrev}
          canNext={props.canNext}
        />
      </CardContent>
    </Card>
  );
}

export function GrandTotalChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;
  plan: number;
  actual: number;
  loading?: boolean;
  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  hideHeader?: boolean;
}) {
  const data = useMemo(() => [
    { name: props.title, plan: props.plan, actual: props.actual }
  ], [props.title, props.plan, props.actual]);

  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      {!props.hideHeader && (
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="mb-4">
            <div className="flex justify-end mb-4">
              <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-xl sm:text-2xl">{props.title}</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{props.subtitle}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={props.hideHeader ? "p-4 sm:p-6" : "p-4 sm:p-6 pt-0"}>

        <div className="w-full h-[300px] sm:h-[400px]">
          {props.loading ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 14, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "currentColor", fontSize: 13 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                <Bar dataKey="plan" name="Plan" fill="#A5A5A5" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="plan" position="top" style={{ fill: "#A5A5A5", fontSize: 13, fontWeight: "bold" }} />
                </Bar>
                <Bar dataKey="actual" name="Actual" fill={props.accentColor} radius={[4, 4, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="actual" position="top" style={{ fill: props.accentColor, fontSize: 13, fontWeight: "bold" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PagingControls(props: {
  show: boolean;
  pageIndex: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  if (!props.show) return null;
  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button size="sm" variant="outline" onClick={props.onPrev} disabled={!props.canPrev}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
      </Button>
      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {props.pageIndex + 1} of {props.totalPages}
      </span>
      <Button size="sm" variant="outline" onClick={props.onNext} disabled={!props.canNext}>
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

export function PlanActualChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;
  data: PlanActualRow[];
  yDomain: [number, number];
  yTicks?: number[];
  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  divisionValue?: string | null;
  departmentValue?: string | null;
  sectionValue?: string | null;
  divisions?: string[];
  departments?: string[];
  sections?: string[];
  onDivision?: (v: string | null) => void;
  onDepartment?: (v: string | null) => void;
  onSection?: (v: string | null) => void;
  siteValue?: string | null;
  sites?: string[];
  onSite?: (v: string | null) => void;
  showPaging: boolean;
  pageIndex?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  planColor?: string;
  actualColor?: string;
  hideFilters?: boolean;
  divisionAllLabel?: string;
  hideNonSite?: boolean;
  hideHeader?: boolean;
  centeredTitle?: boolean;
  hideCardOutline?: boolean;
  loading?: boolean;
  hideYear?: boolean;
}) {
  const planColor = props.planColor || "#e88539";
  const actualColor = props.actualColor || props.accentColor || "#0a8291";

  return (
    <Card className={cn(
      "shadow-lg border-0 bg-card h-full transition-all duration-300",
      props.hideCardOutline ? "shadow-none border-0 bg-transparent" : "shadow-lg border border-border/10"
    )}>
      {!props.hideHeader && (
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="mb-4">
            {!props.hideFilters && (
              <div className="mb-4">
                <HierarchyDropdowns
                  siteValue={props.siteValue}
                  sites={props.sites}
                  onSite={props.onSite}
                  divisionValue={props.divisionValue ?? null}
                  departmentValue={props.departmentValue ?? null}
                  sectionValue={props.sectionValue ?? null}
                  divisions={props.divisions || []}
                  departments={props.departments || []}
                  sections={props.sections || []}
                  onDivision={props.onDivision || (() => {})}
                  onDepartment={props.onDepartment || (() => {})}
                  onSection={props.onSection || (() => {})}
                  divisionAllLabel={props.divisionAllLabel || "All Divisions (Paged)"}
                  hideNonSite={props.hideNonSite}
                />
              </div>
            )}

            <div className={cn(
              "flex items-center gap-2 mb-3",
              props.centeredTitle ? "flex-col text-center" : "flex-row"
            )}>
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">{props.title}</CardTitle>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">{props.subtitle}</p>
                  {!props.hideFilters && (
                    <div className="mt-2 sm:mt-0">
                      <YearMonthControls 
                        year={props.year} 
                        month={props.month} 
                        onYear={props.onYear} 
                        onMonth={props.onMonth} 
                        hideYear={props.hideYear}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={props.hideHeader ? "p-4 sm:p-6" : "p-4 sm:p-6 pt-0"}>

        <div className="w-full h-[600px] sm:h-[650px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 50, right: 40, left: 20, bottom: 140 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="department"
                tick={(tp: any) => {
                  const idx = tp.index as number;
                  const d = props.data[idx];
                  const isUnderTarget = !!d && d.Plan > 0 && d.Actual < d.Plan;
                  return (
                    <RotatedTick
                      x={tp.x}
                      y={tp.y}
                      value={tp.payload?.value}
                      color={isUnderTarget ? "#DC2626" : "currentColor"}
                      bold={isUnderTarget}
                    />
                  );
                }}
                tickLine={{ stroke: "currentColor" }}
                height={130}
                interval={0}
              />
              <YAxis
                domain={props.yDomain}
                ticks={props.yTicks}
                tick={{ fill: "currentColor", fontSize: 14 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 14 },
                }}
              />
              <Tooltip
                content={(tip: any) => {
                  const { active, payload, label } = tip;
                  if (!(active && payload && payload.length)) return null;
                  const d = payload[0].payload as PlanActualRow;
                  const isUnderTarget = d.Plan > 0 && d.Actual < d.Plan;
                  return (
                    <TooltipShell
                      title={String(label ?? "")}
                      lines={[
                        { label: "Plan", value: d.Plan, color: planColor },
                        { label: "Actual", value: d.Actual, color: actualColor },
                      ]}
                      footer={isUnderTarget ? "⚠️ Not Achieved" : undefined}
                    />
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />
              <Bar dataKey="Plan" name="Plan" fill={planColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Plan" position="top" offset={12} style={{ fill: planColor, fontSize: 12, fontWeight: "bold" }} />
              </Bar>
              <Bar dataKey="Actual" name="Actual" fill={actualColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="Actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value, index } = p;
                    const d = props.data[index];
                    if (!d) return null;
                    const isUnderTarget = d.Plan > 0 && d.Actual < d.Plan;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill={isUnderTarget ? "#DC2626" : actualColor}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <PagingControls
          show={props.showPaging}
          pageIndex={props.pageIndex}
          totalPages={props.totalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          canPrev={props.canPrev}
          canNext={props.canNext}
        />
      </CardContent>
    </Card>
  );
}
export function MonthlyTrendChartCard(props: {
  title: string;
  subtitle: string;
  data: any[];
  accentColor: string;
  hideHeader?: boolean;
}) {
  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      {!props.hideHeader && (
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
            <div>
              <CardTitle className="text-xl sm:text-2xl">{props.title}</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{props.subtitle}</p>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={props.hideHeader ? "p-4 sm:p-6" : "p-4 sm:p-6 pt-0"}>

        <div className="w-full h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis dataKey="monthName" tick={{ fill: "currentColor", fontSize: 13 }} />
              <YAxis tick={{ fill: "currentColor", fontSize: 13 }} />
              <Tooltip
                content={(tip: any) => {
                  const { active, payload, label } = tip;
                  if (!(active && payload && payload.length)) return null;
                  return (
                    <TooltipShell
                      title={String(label ?? "")}
                      lines={[
                        { label: "Target", value: payload[0].payload.target, color: "#94a3b8" },
                        { label: "Actual", value: payload[0].payload.actual, color: props.accentColor },
                      ]}
                    />
                  );
                }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={props.accentColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
