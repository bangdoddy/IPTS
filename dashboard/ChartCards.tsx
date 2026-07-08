import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LabelList, ComposedChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PlanActualRow } from './types'; // We will create this

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
          <SelectValue placeholder="Select Year" />
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
          <SelectValue placeholder="Select Month" />
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

export function HierarchyDropdowns(props: {
  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;

  divisions: string[];
  departments: string[];
  sections: string[];

  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;

  divisionAllLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<null | "division" | "department" | "section">(null);
  useOutsideClick(wrapRef as any, () => setOpen(null));

  const divItems = useMemo(() => props.divisions.map((x) => ({ value: x, label: x })), [props.divisions]);
  const deptItems = useMemo(() => props.departments.map((x) => ({ value: x, label: x })), [props.departments]);
  const secItems = useMemo(() => props.sections.map((x) => ({ value: x, label: x })), [props.sections]);

  return (
    <div ref={wrapRef} className="mt-2 flex flex-wrap gap-2">
      <DropdownFilter
        open={open === "division"}
        onToggle={() => setOpen((v) => (v === "division" ? null : "division"))}
        onClose={() => setOpen(null)}
        allLabel={props.divisionAllLabel ?? "All Divisions (Paged)"}
        selectedValue={props.divisionValue}
        onSelect={props.onDivision}
        items={divItems}
        minWidthClass="min-w-[200px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "department"}
        onToggle={() => setOpen((v) => (v === "department" ? null : "department"))}
        onClose={() => setOpen(null)}
        allLabel="All Departments"
        selectedValue={props.departmentValue}
        onSelect={props.onDepartment}
        items={deptItems}
        minWidthClass="min-w-[240px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "section"}
        onToggle={() => setOpen((v) => (v === "section" ? null : "section"))}
        onClose={() => setOpen(null)}
        allLabel="All Sections"
        selectedValue={props.sectionValue}
        onSelect={props.onSection}
        items={secItems}
        minWidthClass="min-w-[260px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />
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
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ color: "#1f2937", fontWeight: "bold", marginBottom: "8px" }}>
        {props.title}
      </p>
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
        Previous
      </Button>
      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {props.pageIndex + 1} of {props.totalPages}
      </span>
      <Button size="sm" variant="outline" onClick={props.onNext} disabled={!props.canNext}>
        Next
      </Button>
    </div>
  );
}

/* =====================================================
   Chart Cards
   ===================================================== */
export function TotalChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;

  summaryItems?: Array<{
    label: string;
    value: number;
    color: string;
  }>;

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
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {props.subtitle}
                </p>
                {props.loading && (
                  <p className="text-xs text-muted-foreground mt-1">Loading...</p>
                )}
              </div>
            </div>

            <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
          </div>

          {props.summaryItems && props.summaryItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {props.summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border px-3 py-2 text-xs bg-white/70"
                  style={{ borderColor: item.color }}
                >
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
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

          <p className="text-xs text-muted-foreground mt-2 italic">
            Condition: Division empty → show Divisions (paged). Division chosen → show Departments. Department chosen → show Sections.
          </p>
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
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill="#006187"
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

              <Bar dataKey="actual" name="Actual" fill="#EE642E" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill="#EE642E"
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
              </div>
            </div>

            <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
          </div>

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

          <p className="text-xs text-muted-foreground mt-2 italic">
            Default view shows 5 divisions (pagination). Select division/department for detail.
          </p>
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
                        { label: "Plan", value: d.Plan, color: "#006187" },
                        { label: "Actual", value: d.Actual, color: "#EE642E" },
                      ]}
                      footer={isUnderTarget ? "⚠️ Not Achieved" : undefined}
                    />
                  );
                }}
              />

              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />

              <Bar dataKey="Plan" fill="#006187" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Plan" position="top" offset={12} style={{ fill: "#006187", fontSize: 10, fontWeight: "bold" }} />
              </Bar>

              <Bar dataKey="Actual" fill="#EE642E" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
                        fill={isUnderTarget ? "#DC2626" : "#EE642E"}
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
