import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Folder,
  TrendingUp,
  Clock,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Project } from "../types";

const TABLE_HEADER_BG = "#1b305b";
const TARGET_COL_BG = "rgba(56, 189, 248, 0.28)";
const TARGET_COL_BG_HEADER = "rgba(56, 189, 248, 0.45)";
const TARGET_COL_BORDER = "rgba(14, 165, 233, 0.75)";
const TABLE_BORDER_CLASS = "border border-slate-300";
const TABLE_BORDER_Y_CLASS = "border-y border-slate-300";
const HEADER_CELL_CLASS =
  "px-3 py-3 font-bold text-center border border-white text-base leading-snug text-white";
const DEPT_HEAD_HEADER_CLASS =
  "px-3 py-3 font-bold text-center border border-white text-base leading-snug text-white";
const STEP_HEADER_CELL_CLASS =
  "px-2 py-2 font-bold text-center border border-white text-sm leading-snug text-white";
const DEPT_HEAD_CELL_CLASS =
  "px-3 py-3 text-left align-middle bg-white group-hover:bg-slate-50/50 min-w-0 normal-case";
const TABLE_ROW_TEXT_CLASS = "text-[9px] leading-snug normal-case";

/** Column widths (11 cols): dept, project, 8× step, status */
const TABLE_COL_WIDTHS = ["10%", "22%", "7%", "7%", "7%", "7%", "7%", "7%", "7%", "7%", "12%"] as const;

/** Convert ALL CAPS / mixed text to Title Case for display. */
function toTitleCase(text: string): string {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const match = word.match(/^([^A-Za-z0-9]*)([A-Za-z0-9]+)([^A-Za-z0-9]*)$/);
      if (!match) return word;
      const [, lead, core, trail] = match;
      return `${lead}${core.charAt(0).toUpperCase()}${core.slice(1).toLowerCase()}${trail}`;
    })
    .join(" ");
}

function ProjectDescription({ text }: { text: string }) {
  const displayText = useMemo(() => toTitleCase(text), [text]);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <div className="min-w-0">
      <p
        ref={textRef}
        className={`text-[9px] text-slate-500 mt-1 font-medium leading-snug break-words normal-case ${expanded ? "" : "line-clamp-3"
          }`}
        style={{ textTransform: "none" }}
      >
        {displayText}
      </p>
      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-[9px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function SummaryStatCard(props: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  labelColor?: string;
  value: number;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const clickable = Boolean(props.onClick);

  return (
    <Card
      className={`shadow-sm border bg-white rounded-2xl overflow-hidden h-full transition-all ${clickable ? "cursor-pointer hover:shadow-md hover:border-slate-200" : "border-slate-100"
        } ${props.active ? "ring-2 ring-blue-500 border-blue-300 shadow-md" : "border-slate-100"}`}
      onClick={props.onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              props.onClick?.();
            }
          }
          : undefined
      }
    >
      <CardContent className="p-4 flex items-center justify-between gap-3 min-h-[88px]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: props.iconBg }}
          >
            {props.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight" style={{ color: props.labelColor ?? "#0f172a" }}>
              {props.label}
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{props.value}</span>
              <span className="text-xs text-slate-400 font-medium">Projects</span>
            </div>
          </div>
        </div>
        {props.badge ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap"
            style={{
              backgroundColor: props.badgeBg ?? "#f1f5f9",
              color: props.badgeColor ?? "#334155",
            }}
          >
            {props.badge}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatusBadge(props: { status: "late" | "on-track" | "ahead"; targetStep: number }) {
  const config = {
    late: {
      wrapBg: "#fef2f2",
      wrapBorder: "#fecaca",
      dot: "#ef4444",
      label: "#b91c1c",
      sub: "#dc2626",
      text: "Late",
    },
    "on-track": {
      wrapBg: "#f0fdf4",
      wrapBorder: "#bbf7d0",
      dot: "#22c55e",
      label: "#15803d",
      sub: "#16a34a",
      text: "On Track",
    },
    ahead: {
      wrapBg: "#fff7ed",
      wrapBorder: "#fed7aa",
      dot: "#f97316",
      label: "#c2410c",
      sub: "#ea580c",
      text: "Ahead",
    },
  }[props.status];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 ${TABLE_ROW_TEXT_CLASS}`}
      style={{
        backgroundColor: config.wrapBg,
        borderColor: config.wrapBorder,
      }}
    >
      <div className="flex items-center gap-1.5 px-0.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: config.dot }} />
        <span className={`${TABLE_ROW_TEXT_CLASS} font-bold whitespace-nowrap`} style={{ color: config.label }}>
          {config.text}
        </span>
      </div>
      <span className={`${TABLE_ROW_TEXT_CLASS} font-normal whitespace-nowrap px-0.5`} style={{ color: config.sub }}>
        (Plan: Step {props.targetStep})
      </span>
    </div>
  );
}

function getSegmentColor(isPassed: boolean, status: "on-track" | "late" | "ahead") {
  if (!isPassed) return "#e2e8f0";
  if (status === "late") return "#ef4444";
  if (status === "on-track") return "#22c55e";
  return "#f97316";
}

/** Show primary leader only (data may store co-leaders as "Name A / Name B"). */
function getLeaderDisplayName(leader?: string): string {
  const raw = String(leader ?? "").trim();
  if (!raw) return "Unnamed Head";
  const primary = raw.split(/\s*\/\s*/)[0]?.trim();
  return toTitleCase(primary || raw);
}

/** Target step follows calendar month (Jan=1 … Aug=8), capped at 8. */
function getTargetStepFromServerDate(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  return Math.min(Math.max(month, 1), 8);
}

function getCalendarMonth(date: Date = new Date()): number {
  return date.getMonth() + 1;
}

/**
 * Jan–Aug: compare actual step vs current month (target step).
 * Sep–Dec: deadline was Step 8 in August — still at Step 8 counts as late.
 */
function getProjectStatus(
  actualStep: number,
  targetStep: number,
  calendarMonth: number
): "on-track" | "late" | "ahead" {
  if (calendarMonth >= 9) {
    if (actualStep < 8) return "late";
    if (actualStep === 8) return "late";
    return "ahead";
  }

  if (actualStep < targetStep) return "late";
  if (actualStep === targetStep) return "on-track";
  return "ahead";
}

type StatusFilter = "all" | "on-track" | "late" | "ahead";

export function QccProjectMonitoringSummary(props: {
  filteredProjects: Project[];
  showDetailModal: (project: Project) => void;
  type?: "QCC" | "QCP";
}) {
  const typeFilter = props.type || "QCC";

  const serverNow = useMemo(() => new Date(), []);
  const calendarMonth = useMemo(() => getCalendarMonth(serverNow), [serverNow]);
  const targetStep = useMemo(() => getTargetStepFromServerDate(serverNow), [serverNow]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>("10");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const targetProjects = useMemo(() => {
    return props.filteredProjects.filter((p) => p.type === typeFilter);
  }, [props.filteredProjects, typeFilter]);

  const stats = useMemo(() => {
    const total = targetProjects.length;
    let onTrack = 0;
    let late = 0;
    let ahead = 0;

    const listWithStatus = targetProjects.map((p) => {
      const actualStep = Math.min(
        8,
        Math.max(1, typeof p.step === "number" ? p.step : parseInt(String(p.step)) || 1)
      );

      const status = getProjectStatus(actualStep, targetStep, calendarMonth);

      if (status === "late") late++;
      else if (status === "on-track") onTrack++;
      else ahead++;

      return { project: p, actualStep, status };
    });

    const getPercentage = (count: number) => {
      if (total === 0) return "0.0%";
      return ((count / total) * 100).toFixed(1) + "%";
    };

    return {
      total,
      onTrack,
      onTrackPct: getPercentage(onTrack),
      late,
      latePct: getPercentage(late),
      ahead,
      aheadPct: getPercentage(ahead),
      list: listWithStatus,
    };
  }, [targetProjects, targetStep, calendarMonth]);

  const filteredList = useMemo(() => {
    if (statusFilter === "all") return stats.list;
    return stats.list.filter((item) => item.status === statusFilter);
  }, [stats.list, statusFilter]);

  const filteredTotal = filteredList.length;

  const paginatedList = useMemo(() => {
    if (pageSize === "all") return filteredList;
    const size = parseInt(pageSize) || 10;
    const startIndex = (currentPage - 1) * size;
    return filteredList.slice(startIndex, startIndex + size);
  }, [filteredList, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTotal, pageSize, statusFilter]);

  const totalPages = useMemo(() => {
    if (pageSize === "all" || filteredTotal === 0) return 1;
    const size = parseInt(pageSize) || 10;
    return Math.max(1, Math.ceil(filteredTotal / size));
  }, [filteredTotal, pageSize]);

  const showingStart = useMemo(() => {
    if (filteredTotal === 0) return 0;
    if (pageSize === "all") return 1;
    const size = parseInt(pageSize) || 10;
    return (currentPage - 1) * size + 1;
  }, [filteredTotal, currentPage, pageSize]);

  const showingEnd = useMemo(() => {
    if (pageSize === "all") return filteredTotal;
    const size = parseInt(pageSize) || 10;
    return Math.min(filteredTotal, currentPage * size);
  }, [filteredTotal, currentPage, pageSize]);

  const STEPS = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        num: i + 1,
        name: `Step ${i + 1}`,
      })),
    []
  );

  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-3">
        <SummaryStatCard
          icon={<Folder className="w-5 h-5" style={{ color: "#2563eb" }} />}
          iconBg="#eff6ff"
          label="Total Project"
          value={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <SummaryStatCard
          icon={<TrendingUp className="w-5 h-5" style={{ color: "#16a34a" }} />}
          iconBg="#f0fdf4"
          label="On Track"
          labelColor="#16a34a"
          value={stats.onTrack}
          badge={stats.onTrackPct}
          badgeBg="#f0fdf4"
          badgeColor="#16a34a"
          active={statusFilter === "on-track"}
          onClick={() => setStatusFilter("on-track")}
        />
        <SummaryStatCard
          icon={<Clock className="w-5 h-5" style={{ color: "#ef4444" }} />}
          iconBg="#fef2f2"
          label="Late"
          value={stats.late}
          badge={stats.latePct}
          badgeBg="#fef2f2"
          badgeColor="#ef4444"
          active={statusFilter === "late"}
          onClick={() => setStatusFilter("late")}
        />
        <SummaryStatCard
          icon={<Rocket className="w-5 h-5" style={{ color: "#f97316" }} />}
          iconBg="#fff7ed"
          label="Ahead"
          value={stats.ahead}
          badge={stats.aheadPct}
          badgeBg="#fff7ed"
          badgeColor="#f97316"
          active={statusFilter === "ahead"}
          onClick={() => setStatusFilter("ahead")}
        />
      </div>

      <div aria-hidden className="h-28" />

      <div className="pt-4 bg-white">
        <table className={`w-full table-fixed text-[11px] text-left border-collapse normal-case ${TABLE_BORDER_CLASS}`}>
          <colgroup>
            {TABLE_COL_WIDTHS.map((width, i) => (
              <col key={i} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: TABLE_HEADER_BG, color: "#ffffff" }}>
              <th
                rowSpan={2}
                className={DEPT_HEAD_HEADER_CLASS}
                style={{ backgroundColor: TABLE_HEADER_BG, border: "1.5px solid white" }}
              >
                Department Head
              </th>
              <th
                rowSpan={2}
                className={HEADER_CELL_CLASS}
                style={{ backgroundColor: TABLE_HEADER_BG, border: "1.5px solid white" }}
              >
                Project
              </th>
              <th
                colSpan={8}
                className={HEADER_CELL_CLASS}
                style={{ backgroundColor: TABLE_HEADER_BG, border: "1.5px solid white" }}
              >
                Progress (8 Steps)
              </th>
              <th
                rowSpan={2}
                className={HEADER_CELL_CLASS}
                style={{ backgroundColor: TABLE_HEADER_BG, border: "1.5px solid white" }}
              >
                Status
              </th>
            </tr>
            <tr style={{ backgroundColor: TABLE_HEADER_BG }}>
              {STEPS.map((step) => {
                const isTarget = step.num === targetStep;
                return (
                  <th
                    key={step.num}
                    title={
                      isTarget
                        ? `Monthly target (Month ${calendarMonth}) — ${step.name}`
                        : step.name
                    }
                    className={STEP_HEADER_CELL_CLASS}
                    style={{
                      backgroundColor: isTarget ? TARGET_COL_BG_HEADER : TABLE_HEADER_BG,
                      color: "#ffffff",
                      border: "1.5px solid white",
                    }}
                  >
                    {step.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {paginatedList.map((item, index) => {
              const { project, actualStep, status } = item;
              const deptHeadName = getLeaderDisplayName(project.leader);

              return (
                <tr
                  key={project.id || project.itemKey || index}
                  className="group transition-colors"
                >
                  <td className={`${DEPT_HEAD_CELL_CLASS} ${TABLE_BORDER_CLASS}`}>
                    <div className={`font-semibold text-slate-800 ${TABLE_ROW_TEXT_CLASS} break-words`}>
                      {deptHeadName}
                    </div>
                    {project.department ? (
                      <div className={`${TABLE_ROW_TEXT_CLASS} font-medium text-slate-400 mt-0.5`}>
                        {toTitleCase(project.department)}
                      </div>
                    ) : null}
                  </td>

                  <td className={`px-3 py-4 ${TABLE_BORDER_CLASS} bg-white group-hover:bg-slate-50/50 min-w-0 align-top normal-case`}>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-bold text-slate-800 font-mono ${TABLE_ROW_TEXT_CLASS} truncate`}>
                        {project.itemKey || `PRJ-${String(project.id).padStart(3, "0")}`}
                      </span>
                      <ProjectDescription
                        text={project.temaQccp || project.namaGroupQccp || "No Title"}
                      />
                    </div>
                  </td>

                  {STEPS.map((step) => {
                    const isTargetCol = step.num === targetStep;
                    const isFirst = step.num === 1;
                    const isLast = step.num === 8;
                    return (
                      <td
                        key={step.num}
                        className={`px-0.5 py-4 align-middle relative ${TABLE_BORDER_Y_CLASS} ${isTargetCol ? "border-x-2" : `${TABLE_BORDER_CLASS} bg-white group-hover:bg-slate-50/50`
                          }`}
                        style={
                          isTargetCol
                            ? {
                              backgroundColor: TARGET_COL_BG,
                              borderLeftColor: TARGET_COL_BORDER,
                              borderRightColor: TARGET_COL_BORDER,
                            }
                            : undefined
                        }
                      >
                        <div
                          className={`h-3 w-full shadow-sm ${isFirst ? "rounded-l-lg" : ""} ${isLast ? "rounded-r-lg" : ""}`}
                          style={{
                            backgroundColor: getSegmentColor(step.num <= actualStep, status),
                          }}
                        />
                      </td>
                    );
                  })}

                  <td className={`px-3 py-4 ${TABLE_BORDER_CLASS} bg-white group-hover:bg-slate-50/50 min-w-0 align-middle`}>
                    <div className="flex justify-center px-1">
                      <StatusBadge status={status} targetStep={targetStep} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredTotal === 0 && (
              <tr>
                <td colSpan={11} className={`px-6 py-12 text-center text-slate-400 italic font-medium ${TABLE_BORDER_CLASS}`}>
                  No Data Entry
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div aria-hidden className="h-10" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm outline-none hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <span className="text-xs font-medium text-slate-400">
            {filteredTotal === 0 ? "No data" : `Showing ${showingStart}-${showingEnd} of ${filteredTotal}`}
          </span>
        </div>

        {pageSize !== "all" && filteredTotal > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-8 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Previous
            </Button>
            <span className="px-2 text-xs font-semibold text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
