// src/components/questionnaire/ProjectTypeSelector.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";

import { useTheme } from "../theme/ThemeProvider";
import { ThemeToggle } from "../theme/ThemeToggle";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { CalendarView } from "../calendar/CalendarView";
import { HistoricalProjects } from "../historical/HistoricalProjects";
import { Approval } from "../approval";

// ✅ Dashboard main
import DashboardAnalyticsAndMonitoring from "../dashboard/DashboardAnalyticsAndMonitoring";

import { getCookieJson } from "../../libs/cookie";

import {
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Home as HomeIcon,
  Lightbulb,
  TrendingUp,
  DollarSign,
  ClipboardCheck,
  Users,
  User,
  CheckCircle2,
  LogOut,
} from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LabelList,
} from "recharts";

import imageLogo from "figma:asset/61a2558e1c35ada4e51acfac6fd341f0b4d33ce0.png";
import bgPattern from "figma:asset/5196d977f06817f07707778e03629c906a4b28fe.png";
import ssFlowchart from "figma:asset/428fcee08a5be71d02cd5b59d22c0f368629be94.png";
import qccFlowchart from "figma:asset/8f4d781fa1e80449ba83006df1e6f92881713d92.png";

// =====================================================
// Types
// =====================================================
type ViewKey = "home" | "create" | "dashboard" | "historical" | "calendar" | "approval";
type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

type SSStatus = "review-by-leader" | "review-by-bpi" | "completed";
type QStatus = "registered" | "in-progress" | "finished";
type AnyStatus = SSStatus | QStatus;

type ModuleConfig = {
  id: ModuleId;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  bgColor: string;
  iconColor: string;
  type: ProjectType;
};

export type Project = {
  id?: number | string;
  type: ProjectType;
  judulSS: string;
  pembuatSS: string;
  status: AnyStatus;
  submittedDate: Date | string;
  step?: number;
};

type ChartRow = { department: string; Plan: number; Actual: number; Achievement: number };
type ChartDataByYearMonth = Record<string, Record<string, ChartRow[]>>;

type OrgStructure = Record<string, Record<string, string[]>>;

type AuthCookie = {
  actorType?: string;
  actortype?: string;
  name?: string;
  nama?: string;
  [k: string]: any;
};

interface ProjectTypeSelectorProps {
  user: any;

  /** derived from URL in AppRoutes layout */
  selectedModule?: string | null;

  onSelectSS: () => void;
  onSelectQCC: () => void;
  onSelectQCP: () => void;
  onSelectTEBP: () => void;
  onSelectCRP: () => void;

  projects: Project[];
  onBackToHome: () => void;
  onUpdateProject: (p: Project) => void;

  /**
   * Optional: if you want AppRoutes to pass currentView as a prop
   * (otherwise we derive from location here).
   */
  currentView?: ViewKey;
}

// =====================================================
// Utils
// =====================================================
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const VIEW_PATHS: Record<ViewKey, string> = {
  home: "/home",
  create: "/create",
  dashboard: "/dashboard",
  historical: "/historical",
  calendar: "/calendar",
  approval: "/approval",
};

function normalizePath(pathname: string) {
  return (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
}

/**
 * Supports both browser router and hash router.
 * - /dashboard
 * - /dashboard/anything
 * - /#/dashboard
 */
function getViewFromLocation(loc: { pathname: string; hash?: string }): ViewKey {
  let path = (loc.pathname || "").toLowerCase();
  const hash = (loc.hash || "").toLowerCase();

  if ((path === "/" || !path) && hash.startsWith("#/")) {
    path = hash.slice(1); // "#/dashboard" -> "/dashboard"
  }

  path = path.split("?")[0].split("#")[0];
  const segs = normalizePath(path).split("/").filter(Boolean);

  const hit = segs.find((s) =>
    ["home", "create", "dashboard", "historical", "calendar", "approval"].includes(s)
  ) as ViewKey | undefined;

  return hit ?? "home";
}

/**
 * Best-effort cookie destroy.
 * If cookie is HttpOnly => JS can't delete (backend logout required).
 */
function destroyCookie(name: string) {
  const host = window.location.hostname;
  const parts = host.split(".");
  const rootDomain = parts.length >= 2 ? `.${parts.slice(-2).join(".")}` : host;

  const domains = [undefined, host, rootDomain];
  const paths = ["/", window.location.pathname];

  for (const path of paths) {
    document.cookie = `${name}=; Max-Age=0; path=${path}; samesite=lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; samesite=lax`;

    for (const d of domains) {
      if (!d) continue;
      document.cookie = `${name}=; Max-Age=0; path=${path}; domain=${d}; samesite=lax`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${d}; samesite=lax`;
    }
  }
}

// =====================================================
// Constants
// =====================================================
const MONTHS = [
  { value: "Jan", label: "January" },
  { value: "Feb", label: "February" },
  { value: "Mar", label: "March" },
  { value: "Apr", label: "April" },
  { value: "May", label: "May" },
  { value: "Jun", label: "June" },
  { value: "Jul", label: "July" },
  { value: "Aug", label: "August" },
  { value: "Sep", label: "September" },
  { value: "Oct", label: "October" },
  { value: "Nov", label: "November" },
  { value: "Dec", label: "December" },
] as const;

const YEARS = ["2023", "2024", "2025"] as const;
const MONTH_ORDER = MONTHS.map((m) => m.value);

function getDepartmentAbbr(fullName: string) {
  const abbrevMap: Record<string, string> = {
    "RECRUITMENT DEPARTMENT": "RECRUITMENT",
    "REMUNERATION DEPARTMENT": "REMUNERATION",
    "SHE OPERATION DEPARTMENT": "SHE OPERATION",
    "IT & OT DEVELOPMENT DEPARTMENT": "IT & OT DEV",
    "TECHNICAL SUPPORT DEPARTMENT": "TECH SUPPORT",
    "MAINTENANCE WCC DEPARTMENT": "MAINT WCC",
  };
  return abbrevMap[fullName] || fullName;
}

function calcAchievement(plan: number, actual: number) {
  return plan > 0 ? Math.round((actual / plan) * 100) : 0;
}

function cumulativeByMonth(
  dataByYearMonth: ChartDataByYearMonth,
  year: string,
  month: string,
  displayItems: string[]
): ChartRow[] {
  const targetMonthIndex = MONTH_ORDER.indexOf(month);
  const base: ChartRow[] = displayItems.map((d) => ({
    department: d,
    Plan: 0,
    Actual: 0,
    Achievement: 0,
  }));

  for (let i = 0; i <= targetMonthIndex; i++) {
    const mk = MONTH_ORDER[i];
    const monthData = dataByYearMonth[year]?.[mk] || [];
    monthData.forEach((row, idx) => {
      if (idx < base.length) {
        base[idx].Plan += row.Plan;
        base[idx].Actual += row.Actual;
      }
    });
  }

  base.forEach((r) => (r.Achievement = calcAchievement(r.Plan, r.Actual)));
  return base;
}

// =====================================================
// Hooks
// =====================================================
function useAuthCookie() {
  return useMemo(() => {
    const key = "inovasis_auth";
    const val = getCookieJson<AuthCookie>(key);

    const actorTypeRaw = (val?.actorType ?? val?.actortype ?? "").toString();

    return {
      key,
      raw: val || null,
      name: val?.name ?? val?.nama,
      actorType: actorTypeRaw.toUpperCase(),
    };
  }, []);
}

function useOrgHierarchy(params: {
  directorateOptions: string[];
  directorateMapping: Record<string, string[]>;
  organizationStructure: OrgStructure;
}) {
  const { directorateOptions, directorateMapping, organizationStructure } = params;

  const [directorate, setDirectorateRaw] = useState<string | null>(null);
  const [division, setDivisionRaw] = useState<string | null>(null);
  const [department, setDepartmentRaw] = useState<string | null>(null);
  const [section, setSectionRaw] = useState<string | null>(null);

  const allDivisions = useMemo(() => Object.keys(organizationStructure), [organizationStructure]);

  const allDepartments = useMemo(() => {
    const list: string[] = [];
    allDivisions.forEach((div) => list.push(...Object.keys(organizationStructure[div] || {})));
    return Array.from(new Set(list)).sort();
  }, [allDivisions, organizationStructure]);

  const divisionOptions = useMemo(() => {
    if (!directorate) return directorateOptions;
    return directorateMapping[directorate] || [];
  }, [directorate, directorateMapping, directorateOptions]);

  const departmentOptions = useMemo(() => {
    if (!division) {
      if (!directorate) return allDepartments;

      const list: string[] = [];
      divisionOptions.forEach((div) => list.push(...Object.keys(organizationStructure[div] || {})));
      return Array.from(new Set(list)).sort();
    }
    return Object.keys(organizationStructure[division] || {}).sort();
  }, [allDepartments, directorate, division, divisionOptions, organizationStructure]);

  const sectionOptions = useMemo(() => {
    if (!department) {
      const list: string[] = [];
      departmentOptions.forEach((dept) => {
        for (const div of allDivisions) {
          if (organizationStructure[div]?.[dept]) list.push(...organizationStructure[div][dept]);
        }
      });
      return Array.from(new Set(list)).sort();
    }

    for (const div of allDivisions) {
      if (organizationStructure[div]?.[department]) return organizationStructure[div][department];
    }
    return [];
  }, [allDivisions, department, departmentOptions, organizationStructure]);

  const displayItems = useMemo(() => {
    if (section) return [section];
    if (department) return sectionOptions;
    if (division) return departmentOptions;
    if (directorate) return divisionOptions;
    return directorateOptions;
  }, [
    department,
    departmentOptions,
    directorate,
    directorateOptions,
    division,
    divisionOptions,
    section,
    sectionOptions,
  ]);

  const setDirectorate = useCallback((v: string | null) => {
    setDirectorateRaw(v);
    setDivisionRaw(null);
    setDepartmentRaw(null);
    setSectionRaw(null);
  }, []);

  const setDivision = useCallback((v: string | null) => {
    setDivisionRaw(v);
    setDepartmentRaw(null);
    setSectionRaw(null);
  }, []);

  const setDepartment = useCallback((v: string | null) => {
    setDepartmentRaw(v);
    setSectionRaw(null);
  }, []);

  const setSection = useCallback((v: string | null) => {
    setSectionRaw(v);
  }, []);

  return {
    directorate,
    division,
    department,
    section,

    directorateOptions,
    divisionOptions,
    departmentOptions,
    sectionOptions,

    setDirectorate,
    setDivision,
    setDepartment,
    setSection,

    displayItems,
  };
}

// =====================================================
// UI Pieces
// =====================================================
function SidebarNavButton(props: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
        props.active
          ? "bg-white/30 text-white shadow-lg backdrop-blur-sm font-semibold"
          : "text-white/90 hover:bg-white/20 hover:text-white"
      )}
      onClick={props.onClick}
      type="button"
    >
      {props.icon}
      <span>{props.label}</span>
    </button>
  );
}

function HeaderBar({ userName, onLogout }: { userName?: string; onLogout?: () => void }) {
  return (
    <header
      className="border-b shadow-sm sticky top-0 z-10"
      style={{ background: "linear-gradient(90deg, #e88539 0%, #0a8291 100%)" }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div />

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
              <User className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">{userName || "User"}</span>
            </div>

            {onLogout && (
              <>
                <Button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:inline-flex bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>

                <Button
                  type="button"
                  onClick={onLogout}
                  size="icon"
                  className="sm:hidden bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HierarchyFilters(props: {
  directorateValue: string | null;
  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;
  directorateOptions: string[];
  divisionOptions: string[];
  departmentOptions: string[];
  sectionOptions: string[];
  onChangeDirectorate: (v: string | null) => void;
  onChangeDivision: (v: string | null) => void;
  onChangeDepartment: (v: string | null) => void;
  onChangeSection: (v: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Select
        value={props.directorateValue || "all"}
        onValueChange={(v) => props.onChangeDirectorate(v === "all" ? null : v)}
      >
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="Directorate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Directorates</SelectItem>
          {props.directorateOptions.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={props.divisionValue || "all"}
        onValueChange={(v) => props.onChangeDivision(v === "all" ? null : v)}
      >
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="Division" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Divisions</SelectItem>
          {props.divisionOptions.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={props.departmentValue || "all"}
        onValueChange={(v) => props.onChangeDepartment(v === "all" ? null : v)}
      >
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {props.departmentOptions.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={props.sectionValue || "all"}
        onValueChange={(v) => props.onChangeSection(v === "all" ? null : v)}
      >
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="Section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sections</SelectItem>
          {props.sectionOptions.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function BarLineChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;
  year: string;
  month: string;
  onYear: (y: string) => void;
  onMonth: (m: string) => void;
  hierarchy: {
    directorate: string | null;
    division: string | null;
    department: string | null;
    section: string | null;
    directorateOptions: string[];
    divisionOptions: string[];
    departmentOptions: string[];
    sectionOptions: string[];
    setDirectorate: (v: string | null) => void;
    setDivision: (v: string | null) => void;
    setDepartment: (v: string | null) => void;
    setSection: (v: string | null) => void;
  };
  data: ChartRow[];
  yLeftDomain: [number, number];
  yLeftTicks: number[];
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
          </div>

          <HierarchyFilters
            directorateValue={props.hierarchy.directorate}
            divisionValue={props.hierarchy.division}
            departmentValue={props.hierarchy.department}
            sectionValue={props.hierarchy.section}
            directorateOptions={props.hierarchy.directorateOptions}
            divisionOptions={props.hierarchy.divisionOptions}
            departmentOptions={props.hierarchy.departmentOptions}
            sectionOptions={props.hierarchy.sectionOptions}
            onChangeDirectorate={props.hierarchy.setDirectorate}
            onChangeDivision={props.hierarchy.setDivision}
            onChangeDepartment={props.hierarchy.setDepartment}
            onChangeSection={props.hierarchy.setSection}
          />

          <p className="text-xs text-muted-foreground mt-2 italic">
            Filters are hierarchical: Directorate → Division → Department → Section.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[500px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={props.data} margin={{ top: 30, right: 40, left: 20, bottom: 140 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="department"
                tick={(tickProps: any) => {
                  const { x, y, payload, index } = tickProps;
                  const row = props.data[index];
                  if (!row) return null;

                  const under = row.Actual < row.Plan;
                  const full = payload.value;
                  const short = getDepartmentAbbr(full);

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <title>{full}</title>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill={under ? "#DC2626" : "currentColor"}
                        fontSize={11}
                        fontWeight={under ? "bold" : "normal"}
                        transform="rotate(-45)"
                        style={{ cursor: "help" }}
                      >
                        {short}
                      </text>
                    </g>
                  );
                }}
                tickLine={{ stroke: "currentColor" }}
                height={130}
                interval={0}
              />

              <YAxis
                yAxisId="left"
                domain={props.yLeftDomain}
                ticks={props.yLeftTicks}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: "Collected",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 12 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 200]}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: "Achievement (%)",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "currentColor", fontSize: 12 },
                }}
              />

              <Tooltip
                content={(p: any) => {
                  const { active, payload, label } = p;
                  if (!active || !payload?.length) return null;

                  const data = payload[0].payload as ChartRow;
                  const under = data.Actual < data.Plan;

                  return (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <p style={{ color: "#1f2937", fontWeight: "bold", marginBottom: "8px" }}>{label}</p>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>Plan: {data.Plan}</p>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>Actual: {data.Actual}</p>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>Achievement: {data.Achievement}%</p>
                      {under && (
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
                          ⚠️ Not Achieved
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="square" />

              <Bar yAxisId="left" dataKey="Plan" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Plan" position="top" style={{ fontSize: 10, fontWeight: "bold" }} />
              </Bar>

              <Bar yAxisId="left" dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="Actual"
                  position="top"
                  content={(lp: any) => {
                    const { x, y, width, index, value } = lp;
                    const row = props.data[index];
                    if (!row) return null;
                    const under = row.Actual < row.Plan;
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 5}
                        fill={under ? "#DC2626" : "currentColor"}
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

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Achievement"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Modules config
// =====================================================
const MODULES: ModuleConfig[] = [
  {
    id: "ss",
    type: "SS",
    title: "Suggestion System",
    description: "Individual improvement ideas that can be implemented quickly",
    icon: Lightbulb,
    gradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
    bgColor: "rgba(0, 97, 135, 0.1)",
    iconColor: "#006187",
  },
  {
    id: "qcc",
    type: "QCC",
    title: "Quality Control Circle",
    description: "Team improvement within one department",
    icon: Users,
    gradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    bgColor: "rgba(238, 100, 46, 0.1)",
    iconColor: "#EE642E",
  },
  {
    id: "qcp",
    type: "QCP",
    title: "Quality Control Project",
    description: "Cross-department improvement initiative with measurable outcomes",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    bgColor: "rgba(95, 206, 160, 0.1)",
    iconColor: "#007B5F",
  },
  {
    id: "tebp",
    type: "TEBP",
    title: "The Executive Business Practices",
    description: "Strategic improvements requiring management approval",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #015952 0%, #EE642E 100%)",
    bgColor: "rgba(1, 89, 82, 0.1)",
    iconColor: "#015952",
  },
  {
    id: "crp",
    type: "CRP",
    title: "Cost Reduction Project",
    description: "Measurable cost savings initiatives",
    icon: DollarSign,
    gradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
    bgColor: "rgba(127, 237, 132, 0.1)",
    iconColor: "#5FCEA0",
  },
];

// =====================================================
// Main Component
// =====================================================
export function ProjectTypeSelector(props: ProjectTypeSelectorProps) {
  useTheme();

  const {
    user,
    selectedModule,
    onSelectSS,
    onSelectQCC,
    onSelectQCP,
    onSelectTEBP,
    onSelectCRP,
    projects,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ route-driven view (optionally provided by parent)
  const currentView: ViewKey = useMemo(() => {
    return props.currentView ?? getViewFromLocation(location);
  }, [props.currentView, location.pathname, location.hash]);

  // -----------------------------
  // Auth cookie & role
  // -----------------------------
  const auth = useAuthCookie();
  const canAccessApproval = auth.actorType === "REVIEWER" || auth.actorType === "SUPERIOR";

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = useCallback(() => {
    // delete cookie (best effort)
    destroyCookie(auth.key);
    destroyCookie("inovasis_auth");

    // clear storage
    try {
      localStorage.removeItem("inovasis_auth");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch {}

    navigate("/auth/login", { replace: true });
  }, [auth.key, navigate]);

  // normalize uppercase approval route
  useEffect(() => {
    if (normalizePath(location.pathname) === "/approval") return;
    if (location.pathname === "/Approval") navigate("/approval", { replace: true });
  }, [location.pathname, navigate]);

  // guard approval access
  useEffect(() => {
    if (currentView === "approval" && !canAccessApproval) {
      navigate("/home", { replace: true });
    }
  }, [currentView, canAccessApproval, navigate]);

  /**
   * Avoid forcing navigation loops.
   * Only auto-go to /create when selectedModule transitions from empty -> filled
   * (keep your original intent but safer).
   */
  const prevSelectedModuleRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const prev = prevSelectedModuleRef.current;

    if (!prev && selectedModule) {
      // If you still want this behavior:
      navigate("/create", { replace: true });
    }

    prevSelectedModuleRef.current = selectedModule;
  }, [selectedModule, navigate]);

  // -----------------------------
  // Module click (stable)
  // -----------------------------
  const moduleClick = useMemo<Record<ModuleId, () => void>>(
    () => ({
      ss: onSelectSS,
      qcc: onSelectQCC,
      qcp: onSelectQCP,
      tebp: onSelectTEBP,
      crp: onSelectCRP,
    }),
    [onSelectSS, onSelectQCC, onSelectQCP, onSelectTEBP, onSelectCRP]
  );

  // -----------------------------
  // Mock chart data (legacy)
  // -----------------------------
  const ssDataByYearMonth: ChartDataByYearMonth = useMemo(() => MOCK_SS_DATA, []);
  const qccDataByYearMonth: ChartDataByYearMonth = useMemo(() => MOCK_QCC_DATA, []);

  // -----------------------------
  // Org hierarchy (shared)
  // -----------------------------
  const directorateOptions = useMemo(
    () => ["Finance & Accounting", "Plant Dev & Engineering", "Operation&IT"],
    []
  );

  const directorateMapping: Record<string, string[]> = useMemo(
    () => ({
      "Finance & Accounting": ["Finance & Accounting"],
      "Plant Dev & Engineering": ["Plant Dev & Engineering"],
      "Operation&IT": ["IT"],
    }),
    []
  );

  const organizationStructure: OrgStructure = useMemo(() => MOCK_ORG_STRUCTURE, []);

  const ssHierarchy = useOrgHierarchy({ directorateOptions, directorateMapping, organizationStructure });
  const qccHierarchy = useOrgHierarchy({ directorateOptions, directorateMapping, organizationStructure });

  const [selectedSSYear, setSelectedSSYear] = useState("2024");
  const [selectedSSMonth, setSelectedSSMonth] = useState("Jan");
  const [selectedQCCYear, setSelectedQCCYear] = useState("2024");
  const [selectedQCCMonth, setSelectedQCCMonth] = useState("Jan");

  const ssChartData = useMemo(
    () => cumulativeByMonth(ssDataByYearMonth, selectedSSYear, selectedSSMonth, ssHierarchy.displayItems),
    [ssDataByYearMonth, selectedSSYear, selectedSSMonth, ssHierarchy.displayItems]
  );

  const qccChartData = useMemo(
    () => cumulativeByMonth(qccDataByYearMonth, selectedQCCYear, selectedQCCMonth, qccHierarchy.displayItems),
    [qccDataByYearMonth, selectedQCCYear, selectedQCCMonth, qccHierarchy.displayItems]
  );

  // -----------------------------
  // Sidebar
  // -----------------------------
  const sidebarItems = useMemo(
    () =>
      [
        { key: "home" as const, label: "Home", icon: <HomeIcon className="w-5 h-5" />, show: true },
        { key: "create" as const, label: "Create Idea or Project", icon: <Lightbulb className="w-5 h-5" />, show: true },
        { key: "dashboard" as const, label: "Dashboard", icon: <BarChart3 className="w-5 h-5" />, show: true },
        { key: "historical" as const, label: "Historical Projects", icon: <Clock className="w-5 h-5" />, show: true },
        { key: "calendar" as const, label: "Calendar Event", icon: <CalendarIcon className="w-5 h-5" />, show: true },
        { key: "approval" as const, label: "Approval", icon: <CheckCircle2 className="w-5 h-5" />, show: canAccessApproval },
      ].filter((x) => x.show),
    [canAccessApproval]
  );

  const go = useCallback(
    (view: ViewKey) => {
      if (view === "approval" && !canAccessApproval) {
        navigate("/home");
        return;
      }
      navigate(VIEW_PATHS[view]);
    },
    [canAccessApproval, navigate]
  );

  // -----------------------------
  // Home content state
  // -----------------------------
  const [selectedHomeModule, setSelectedHomeModule] = useState<ModuleId | null>(null);

  // reset selection when leaving home (prevents stale expanded card when returning)
  useEffect(() => {
    if (currentView !== "home") setSelectedHomeModule(null);
  }, [currentView]);

  // =====================================================
  // Views
  // =====================================================
  const Sidebar = (
    <aside
      className="w-64 border-r shadow-lg flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-20"
      style={{ background: "linear-gradient(180deg, #e88539 0%, #0a8291 100%)" }}
    >
      <div className="p-6 border-b border-white/20">
        <img src={imageLogo} alt="inovaSIS" className="h-8 w-auto mb-2" />
        <p className="text-xs text-white/90">Improvement Project Tracking System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarNavButton
            key={item.key}
            active={currentView === item.key}
            icon={item.icon}
            label={item.label}
            onClick={() => go(item.key)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-white/20 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-white/15 hover:bg-white/25 text-white transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Logout</span>
        </button>

        <div className="text-center">
          <p className="text-white font-semibold">InovaSIS</p>
          <p className="text-white/90 text-xs">2025</p>
        </div>
      </div>
    </aside>
  );

  const HomeView = (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <img
            src={imageLogo}
            alt="InovaSIS"
            className="h-24 sm:h-32 w-auto mb-4 animate-in fade-in zoom-in duration-500"
          />
          <p className="text-white text-lg sm:text-xl">
            InovaSIS is an improvement program implemented across PT Saptaindra Sejati, ranging from
            individual ideas to group-based projects.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedHomeModule === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedHomeModule(isSelected ? null : m.id)}
                  className={cn(
                    "flex flex-col items-center group transition-all duration-300 rounded-2xl px-3 py-4",
                    isSelected ? "ring-4 ring-offset-2 bg-white" : "bg-white/10 backdrop-blur-sm hover:bg-white"
                  )}
                >
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all mb-2 group-hover:scale-105"
                    style={{ backgroundColor: m.iconColor }}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3
                    className={cn(
                      "text-xs md:text-sm text-center max-w-[90px] leading-tight transition-colors",
                      isSelected ? "" : "text-white"
                    )}
                    style={{ fontWeight: 700, color: isSelected ? m.iconColor : undefined }}
                  >
                    <span className={isSelected ? "" : "group-hover:hidden"}>{m.title}</span>
                    {!isSelected && (
                      <span className="hidden group-hover:inline" style={{ color: m.iconColor }}>
                        {m.title}
                      </span>
                    )}
                  </h3>
                </button>
              );
            })}
          </div>

          {selectedHomeModule && (
            <Card className="rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-card shadow-xl relative">
              <button
                type="button"
                onClick={() => setSelectedHomeModule(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                style={{ color: MODULES.find((m) => m.id === selectedHomeModule)?.iconColor }}
              >
                ✕
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: MODULES.find((m) => m.id === selectedHomeModule)?.bgColor }}
                >
                  {(() => {
                    const mm = MODULES.find((m) => m.id === selectedHomeModule);
                    const Icon = mm?.icon;
                    return Icon ? <Icon className="w-6 h-6" style={{ color: mm?.iconColor }} /> : null;
                  })()}
                </div>

                <div className="flex-1">
                  <h3
                    className="text-xl mb-3"
                    style={{ color: MODULES.find((m) => m.id === selectedHomeModule)?.iconColor }}
                  >
                    {MODULES.find((m) => m.id === selectedHomeModule)?.title}
                  </h3>

                  <div className="space-y-3 text-sm text-foreground">
                    {selectedHomeModule === "ss" && (
                      <>
                        <p><strong>What is Suggestion System?</strong></p>
                        <p>A platform for employees to submit individual improvement ideas that can be implemented quickly.</p>
                        <div className="mt-6">
                          <p className="mb-3"><strong>SS flow</strong></p>
                          <img
                            src={ssFlowchart}
                            alt="SS flow"
                            className="w-full h-auto object-contain rounded-lg shadow-md border-4 border-black"
                          />
                        </div>
                      </>
                    )}

                    {selectedHomeModule === "qcc" && (
                      <>
                        <p><strong>What is Quality Control Circle?</strong></p>
                        <p>A team-based approach where a small group collaborates to solve work-related problems.</p>
                        <div className="mt-6">
                          <p className="mb-3"><strong>QCC flow</strong></p>
                          <img
                            src={qccFlowchart}
                            alt="QCC flow"
                            className="w-full max-w-2xl h-auto object-contain rounded-lg shadow-md border-4 border-black mx-auto"
                          />
                        </div>
                      </>
                    )}

                    {selectedHomeModule === "qcp" && (
                      <>
                        <p><strong>What is Quality Control Project?</strong></p>
                        <p>A structured improvement initiative with clear targets and measurable outcomes.</p>
                      </>
                    )}

                    {selectedHomeModule === "tebp" && (
                      <>
                        <p><strong>What is The Executive Business Practices?</strong></p>
                        <p>Strategic business practice improvements requiring management approval and oversight.</p>
                      </>
                    )}

                    {selectedHomeModule === "crp" && (
                      <>
                        <p><strong>What is Cost Reduction Project?</strong></p>
                        <p>A measurable cost saving initiative without sacrificing quality or service.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const CreateView = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-white text-2xl sm:text-3xl">Select the improvement type you want to create</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-card"
              onClick={moduleClick[m.id]}
              style={{ ["--module-color" as any]: m.iconColor }}
            >
              <CardContent className="p-6">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: m.bgColor }}
                >
                  <Icon className="w-7 h-7" style={{ color: m.iconColor }} />
                </div>

                <h3 className="mb-2 transition-colors duration-300 group-hover:[color:var(--module-color)]">
                  {m.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:[color:var(--module-color)]">
                  {m.description}
                </p>

                <div className="mt-4 h-1 w-0 group-hover:w-full rounded-full transition-all duration-300" style={{ background: m.gradient }} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const LegacyChartDashboardView = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 sm:gap-6">
        <div className="lg:col-span-4">
          <BarLineChartCard
            title="SS Collected"
            subtitle="Per Department (Cumulative YTD)"
            accentColor="#006187"
            year={selectedSSYear}
            month={selectedSSMonth}
            onYear={setSelectedSSYear}
            onMonth={setSelectedSSMonth}
            hierarchy={{
              directorate: ssHierarchy.directorate,
              division: ssHierarchy.division,
              department: ssHierarchy.department,
              section: ssHierarchy.section,
              directorateOptions: ssHierarchy.directorateOptions,
              divisionOptions: ssHierarchy.divisionOptions,
              departmentOptions: ssHierarchy.departmentOptions,
              sectionOptions: ssHierarchy.sectionOptions,
              setDirectorate: ssHierarchy.setDirectorate,
              setDivision: ssHierarchy.setDivision,
              setDepartment: ssHierarchy.setDepartment,
              setSection: ssHierarchy.setSection,
            }}
            data={ssChartData}
            yLeftDomain={[0, 1600]}
            yLeftTicks={[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600]}
          />
        </div>

        <div className="lg:col-span-4">
          <BarLineChartCard
            title="QCC/P Collected"
            subtitle="Per Department (Cumulative YTD)"
            accentColor="#EE642E"
            year={selectedQCCYear}
            month={selectedQCCMonth}
            onYear={setSelectedQCCYear}
            onMonth={setSelectedQCCMonth}
            hierarchy={{
              directorate: qccHierarchy.directorate,
              division: qccHierarchy.division,
              department: qccHierarchy.department,
              section: qccHierarchy.section,
              directorateOptions: qccHierarchy.directorateOptions,
              divisionOptions: qccHierarchy.divisionOptions,
              departmentOptions: qccHierarchy.departmentOptions,
              sectionOptions: qccHierarchy.sectionOptions,
              setDirectorate: qccHierarchy.setDirectorate,
              setDivision: qccHierarchy.setDivision,
              setDepartment: qccHierarchy.setDepartment,
              setSection: qccHierarchy.setSection,
            }}
            data={qccChartData}
            yLeftDomain={[0, 100]}
            yLeftTicks={[0, 20, 40, 60, 80, 100]}
          />
        </div>
      </div>
    </div>
  );

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="min-h-screen flex overflow-hidden">
      {Sidebar}

      <div className="flex-1 flex flex-col lg:ml-64">
        <HeaderBar userName={user?.name || auth.name} onLogout={handleLogout} />

        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {currentView === "home" && HomeView}
          {currentView === "create" && CreateView}

          {currentView === "dashboard" && (
            <DashboardAnalyticsAndMonitoring
              key={location.key}
              projects={projects}
              modules={MODULES as any}
              qccDataByYearMonth={qccDataByYearMonth as any}
              organizationStructure={organizationStructure}
            />
          )}

          {/* If you want the old charts instead:
              {currentView === "dashboard" && LegacyChartDashboardView}
          */}

          {currentView === "historical" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
              <HistoricalProjects />
            </div>
          )}

          {currentView === "calendar" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
              <CalendarView />
            </div>
          )}

          {currentView === "approval" && canAccessApproval && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
              <Approval />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MOCK placeholders
// =====================================================
const MOCK_SS_DATA: ChartDataByYearMonth = {
  "2024": {
    Jan: [{ department: "Production", Plan: 15, Actual: 75, Achievement: 500 }],
  },
};

const MOCK_QCC_DATA: ChartDataByYearMonth = {
  "2024": {
    Jan: [{ department: "Production", Plan: 2, Actual: 1, Achievement: 50 }],
  },
};

const MOCK_ORG_STRUCTURE: OrgStructure = {
  IT: {
    "IT & OT Development Department": ["Application System", "ERP & Integration System"],
  },
  "Finance & Accounting": {
    "Accounting, Payable & Compl Department": ["General Accounting", "AP Control"],
  },
  "Plant Dev & Engineering": {
    "Plant Engineering Department": ["Equipment Engineer", "Electrical Engineer"],
  },
};
