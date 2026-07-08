import React, { useState, useMemo, useEffect } from "react";
import {
  Folder,
  TrendingUp,
  Clock,
  Rocket,
  Target,
  Flag,
  FileText,
  Search,
  PenTool,
  Code2,
  Beaker,
  PlayCircle,
  Trophy,
  Eye,
  User
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Project } from "../types";

export function QccProjectMonitoringSummary(props: {
  filteredProjects: Project[];
  showDetailModal: (project: Project) => void;
  type?: "QCC" | "QCP";
}) {
  const [targetStep, setTargetStep] = useState<number>(7);
  const typeFilter = props.type || "QCC";

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>("10");

  // Filter projects by type
  const targetProjects = useMemo(() => {
    return props.filteredProjects.filter((p) => p.type === typeFilter);
  }, [props.filteredProjects, typeFilter]);

  // Project statistics based on target step
  const stats = useMemo(() => {
    let total = targetProjects.length;
    let onTrack = 0;
    let late = 0;
    let ahead = 0;

    const listWithStatus = targetProjects.map((p) => {
      // Clamp step between 1 and 8
      const actualStep = Math.min(
        8,
        Math.max(1, typeof p.step === "number" ? p.step : parseInt(String(p.step)) || 1)
      );

      let status: "on-track" | "late" | "ahead" = "on-track";
      if (actualStep < targetStep) {
        status = "late";
        late++;
      } else if (actualStep === targetStep) {
        status = "on-track";
        onTrack++;
      } else {
        status = "ahead";
        ahead++;
      }

      return {
        project: p,
        actualStep,
        status,
      };
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
  }, [targetProjects, targetStep]);

  // Paginated list calculation
  const paginatedList = useMemo(() => {
    if (pageSize === "all") {
      return stats.list;
    }
    const size = parseInt(pageSize) || 10;
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    return stats.list.slice(startIndex, endIndex);
  }, [stats.list, currentPage, pageSize]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [stats.list.length, pageSize]);

  // Pagination metadata
  const totalPages = useMemo(() => {
    if (pageSize === "all" || stats.total === 0) return 1;
    const size = parseInt(pageSize) || 10;
    return Math.max(1, Math.ceil(stats.total / size));
  }, [stats.total, pageSize]);

  const showingStart = useMemo(() => {
    if (stats.total === 0) return 0;
    if (pageSize === "all") return 1;
    const size = parseInt(pageSize) || 10;
    return (currentPage - 1) * size + 1;
  }, [stats.total, currentPage, pageSize]);

  const showingEnd = useMemo(() => {
    if (pageSize === "all") return stats.total;
    const size = parseInt(pageSize) || 10;
    return Math.min(stats.total, currentPage * size);
  }, [stats.total, currentPage, pageSize]);

  // Steps configuration
  const STEPS = useMemo(() => [
    { num: 1, name: "Initiation", icon: Flag },
    { num: 2, name: "Planning", icon: FileText },
    { num: 3, name: "Analysis", icon: Search },
    { num: 4, name: "Design", icon: PenTool },
    { num: 5, name: "Development", icon: Code2 },
    { num: 6, name: "Testing", icon: Beaker },
    { num: 7, name: "Implementation", icon: PlayCircle },
    { num: 8, name: "Closure", icon: Trophy }
  ], []);

  // Avatar color map based on leader/facilitator name hash
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500 text-white",
      "bg-emerald-500 text-white",
      "bg-amber-500 text-white",
      "bg-blue-500 text-white",
      "bg-indigo-500 text-white",
      "bg-pink-500 text-white",
      "bg-teal-500 text-white"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8 mt-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Project */}
        <Card className="shadow-md border border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Project</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-800">{stats.total}</span>
                <span className="text-xs text-slate-400 font-medium">Projects</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On Track */}
        <Card className="shadow-md border border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On Track</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-800">{stats.onTrack}</span>
                  <span className="text-xs text-slate-400 font-medium">Projects</span>
                </div>
              </div>
            </div>
            <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-100 rounded-lg px-2.5 py-1 text-xs font-bold">
              {stats.onTrackPct}
            </Badge>
          </CardContent>
        </Card>

        {/* Late */}
        <Card className="shadow-md border border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-800">{stats.late}</span>
                  <span className="text-xs text-slate-400 font-medium">Projects</span>
                </div>
              </div>
            </div>
            <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-100 rounded-lg px-2.5 py-1 text-xs font-bold">
              {stats.latePct}
            </Badge>
          </CardContent>
        </Card>

        {/* Ahead */}
        <Card className="shadow-md border border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 p-3">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ahead</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-800">{stats.ahead}</span>
                  <span className="text-xs text-slate-400 font-medium">Projects</span>
                </div>
              </div>
            </div>
            <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1 text-xs font-bold">
              {stats.aheadPct}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Target Step Banner */}
      <div className="bg-gradient-to-r from-blue-50/20 via-blue-50/50 to-white border border-blue-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-900 shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest block">Current Target Step</span>
            <span className="text-2xl font-black text-blue-900">Posisi saat ini</span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Berdasarkan timeline plan, semua project seharusnya sudah mencapai minimal Step {targetStep} pada bulan ini.
            </p>
          </div>
        </div>

        {/* Timeline Selector */}
        <div className="flex items-center gap-4 flex-1 max-w-xl relative px-4 py-8">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {Array.from({ length: 8 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isTarget = stepNum === targetStep;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
                {isTarget && (
                  <div className="absolute -top-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap animate-bounce">
                    Posisi saat ini
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
                  </div>
                )}
                <button
                  onClick={() => setTargetStep(stepNum)}
                  className={`rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${isTarget
                    ? "w-8 h-8 bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                    : "w-5 h-5 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                />
              </div>
            );
          })}
        </div>

        {/* Peak Mountain SVG */}
        <div className="hidden lg:block shrink-0 pl-6 border-l border-slate-200/60">
          <svg viewBox="0 0 120 80" className="w-24 h-16">
            <path d="M20 70 L50 35 L65 50 L95 20 L115 70 Z" fill="#f1f5f9" />
            <path d="M40 70 L80 25 L115 70 Z" fill="#1e3a8a" />
            <path d="M80 25 L92 40 L85 70 Z" fill="#172554" />
            <polygon points="80,25 72,34 77,36 80,33 83,36 88,34" fill="#ffffff" />
            <line x1="80" y1="25" x2="80" y2="10" stroke="#1e3a8a" strokeWidth="2" />
            <path d="M80 10 L95 15 L80 20 Z" fill="#3b82f6" />
          </svg>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white mt-4">
        <table className="w-full text-sm text-left border border-slate-200 border-collapse">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-[#1b305b] text-white" style={{ backgroundColor: "#1b305b", color: "#ffffff" }}>
              <th rowSpan={2} style={{ backgroundColor: "#1b305b", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider min-w-[150px] bg-[#1b305b] text-white">
                Department Head
              </th>
              <th rowSpan={2} style={{ backgroundColor: "#1b305b", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border-b border-slate-700 text-xs uppercase tracking-wider min-w-[150px] bg-[#1b305b] text-white">
                Project
              </th>
              <th colSpan={8} style={{ backgroundColor: "#1b305b", color: "#ffffff" }} className="px-4 py-2 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider bg-[#1b305b] text-white">
                Progress (8 Step)
              </th>
              <th rowSpan={2} style={{ backgroundColor: "#1b305b", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider min-w-[120px] bg-[#1b305b] text-white">
                Status
              </th>

            </tr>
            {/* Header Row 2 */}
            <tr className="bg-[#1b305b] text-slate-300" style={{ backgroundColor: "#1b305b", color: "#cbd5e1" }}>
              {STEPS.map((step) => {
                const isTarget = step.num === targetStep;
                return (
                  <th
                    key={step.num}
                    style={isTarget ? { backgroundColor: "rgba(30, 58, 138, 0.4)", color: "#93c5fd", width: "50px" } : { backgroundColor: "#1b305b", color: "#cbd5e1", width: "50px" }}
                    className={`px-1 py-2 text-center border border-slate-700 text-[10px] font-bold w-[50px] min-w-[50px] ${isTarget
                      ? "bg-blue-900/40 text-blue-200 border-r-2 border-dotted border-blue-400"
                      : "bg-[#1b305b] text-slate-300"
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center w-[50px] min-w-[50px] py-1 relative pt-4">
                      {isTarget && (
                        <>
                          <span className="text-[10px] text-orange-400 absolute top-0 font-bold animate-bounce z-20">
                            ▼
                          </span>
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 border-l-2 border-dashed border-blue-400 h-[2000px] pointer-events-none z-10" />
                        </>
                      )}
                      <span className="text-sm font-black">{step.num}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedList.map((item, index) => {
              const { project, actualStep, status } = item;
              const deptHeadName = project.fasilitator || project.leader || "Unnamed Head";
              const initials = getInitials(deptHeadName);
              const avatarCls = getAvatarColor(deptHeadName);

              return (
                <tr
                  key={project.id || project.itemKey || index}
                  className="hover:bg-slate-50/50 transition-colors duration-255 group"
                >
                  {/* Department Head */}
                  <td className="px-6 py-4 border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 line-clamp-1">{deptHeadName}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {project.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Project Info */}
                  <td className="px-6 py-4 border border-slate-200/80">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 font-mono text-xs">
                        {project.itemKey || `PRJ-${String(project.id).padStart(3, "0")}`}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 font-medium line-clamp-2" title={project.temaQccp || project.namaGroupQccp}>
                        {project.temaQccp || project.namaGroupQccp || "No Title"}
                      </span>
                    </div>
                  </td>

                  {/* Progress 8 Steps */}
                  {STEPS.map((step) => {
                    const isPassed = step.num <= actualStep;
                    const isTargetCol = step.num === targetStep;

                    const segmentColor = isPassed
                      ? status === "late"
                        ? "#ef4444"
                        : status === "on-track"
                          ? "#22c55e"
                          : "#f97316"
                      : "#e2e8f0";

                    const roundedClass =
                      step.num === 1
                        ? "rounded-l-md"
                        : step.num === 8
                          ? "rounded-r-md"
                          : "rounded-none";

                    return (
                      <td
                        key={step.num}
                        style={{ width: "50px" }}
                        className={`px-0 py-4 align-middle border border-slate-200/80 w-[50px] min-w-[50px] ${isTargetCol ? "bg-blue-50/20 border-r-2 border-dotted border-blue-400" : ""
                          }`}
                      >
                        <div
                          style={{ backgroundColor: segmentColor }}
                          className={`h-3 w-full ${roundedClass} transition-all duration-300`}
                        />
                      </td>
                    );
                  })}

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center border border-slate-200/80">
                    {status === "late" && (
                      <div
                        style={{ backgroundColor: "#fef2f2", color: "#b91c1c", borderColor: "#fee2e2" }}
                        className="inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#ef4444" }} />
                        <span>Late</span>
                        <span className="text-[10px] font-medium" style={{ color: "rgba(239, 68, 68, 0.7)" }}>(Plan: Step {targetStep})</span>
                      </div>
                    )}
                    {status === "on-track" && (
                      <div
                        style={{ backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#dcfce7" }}
                        className="inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#22c55e" }} />
                        <span>On Track</span>
                        <span className="text-[10px] font-medium" style={{ color: "rgba(34, 197, 94, 0.7)" }}>(Plan: Step {targetStep})</span>
                      </div>
                    )}
                    {status === "ahead" && (
                      <div
                        style={{ backgroundColor: "#fef9c3", color: "#a16207", borderColor: "#fef08a" }}
                        className="inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#eab308" }} />
                        <span>Ahead</span>
                        <span className="text-[10px] font-medium" style={{ color: "rgba(202, 138, 4, 0.7)" }}>(Plan: Step {targetStep})</span>
                      </div>
                    )}
                  </td>


                </tr>
              );
            })}

            {stats.total === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-slate-400 italic font-medium border border-slate-200/80">
                  No {typeFilter} projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
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
            {stats.total === 0 ? "No data" : `Showing ${showingStart}-${showingEnd} of ${stats.total}`}
          </span>
        </div>

        {pageSize !== "all" && stats.total > 0 && (
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
