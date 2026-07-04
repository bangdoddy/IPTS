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
}) {
  return (
    <div className="flex flex-col gap-2">
      <Select value={props.year} onValueChange={props.onYear}>
        <SelectTrigger className="w-[120px] border-2 font-semibold">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={props.month} onValueChange={props.onMonth}>
        <SelectTrigger className="w-[120px] border-2 font-semibold">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        fontSize={11}
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
        <p key={idx} style={{ color: l.color, margin: "4px 0", fontSize: "13px" }}>
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
            fontSize: "12px",
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
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-lg sm:text-xl">{props.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{props.subtitle}</p>
                {props.loading && <p className="text-xs text-muted-foreground mt-1">Loading...</p>}
              </div>
            </div>
            <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
          </div>

          {props.summaryItems && props.summaryItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {props.summaryItems.map((item) => (
                <div key={item.label} className="rounded-lg border px-3 py-2 text-xs bg-white/70" style={{ borderColor: item.color }}>
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

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
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 12 },
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
                        { label: "Plan", value: d.plan, color: "#006187" },
                        { label: "Actual", value: d.actual, color: "#EE642E" },
                      ]}
                    />
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />
              <Bar dataKey="plan" name="Plan" fill="#006187" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="plan"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text x={x + width / 2} y={y + 8} fill="#006187" textAnchor="middle" fontSize={10} fontWeight="bold">
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
              <Bar dataKey="actual" name="Actual" fill="#EE642E" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text x={x + width / 2} y={y + 8} fill="#EE642E" textAnchor="middle" fontSize={10} fontWeight="bold">
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
}) {
  const data = useMemo(() => [
    { name: props.title, plan: props.plan, actual: props.actual }
  ], [props.title, props.plan, props.actual]);

  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
            <div>
              <CardTitle className="text-lg sm:text-xl">{props.title}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{props.subtitle}</p>
            </div>
          </div>
          <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[300px] sm:h-[400px]">
          {props.loading ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "currentColor", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                <Bar dataKey="plan" name="Target" fill="#A5A5A5" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="plan" position="top" style={{ fill: "#A5A5A5", fontSize: 11, fontWeight: "bold" }} />
                </Bar>
                <Bar dataKey="actual" name="Actual" fill={props.accentColor} radius={[4, 4, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="actual" position="top" style={{ fill: props.accentColor, fontSize: 11, fontWeight: "bold" }} />
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
  planColor?: string;
  actualColor?: string;
  hideFilters?: boolean;
}) {
  const planColor = props.planColor || "#e88539";
  const actualColor = props.actualColor || props.accentColor || "#0a8291";

  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-lg sm:text-xl">{props.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{props.subtitle}</p>
              </div>
            </div>
            {!props.hideFilters && (
              <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
            )}
          </div>
          {/* HierarchyDropdowns would go here if needed, but it's complex to extract with all its sub-deps */}
          {!props.hideFilters && (
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
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[500px] sm:h-[550px]">
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
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 12 },
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
              <Bar dataKey="Plan" fill={planColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Plan" position="top" offset={12} style={{ fill: planColor, fontSize: 10, fontWeight: "bold" }} />
              </Bar>
              <Bar dataKey="Actual" fill={actualColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
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
                        fontSize={10}
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
