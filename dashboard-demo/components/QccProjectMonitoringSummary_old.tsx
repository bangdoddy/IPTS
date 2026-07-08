import React, { useState, useMemo } from "react";
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
}) {
  const [targetStep, setTargetStep] = useState<number>(7);

  // Filter only QCC projects (just in case they are not already pre-filtered)
  const qccProjects = useMemo(() => {
    return props.filteredProjects.filter((p) => p.type === "QCC");
  }, [props.filteredProjects]);

  // Project statistics based on target step
  const stats = useMemo(() => {
    let total = qccProjects.length;
    let onTrack = 0;
    let late = 0;
    let ahead = 0;

    const listWithStatus = qccProjects.map((p) => {
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
  }, [qccProjects, targetStep]);

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
      <div className="bg-gradient-to-r from-blue-50/20 via-blue-50/50 to-white border border-blue-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-900 shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest block">Current Target Step</span>
            <span className="text-2xl font-black text-blue-900">STEP {targetStep}</span>
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${isTarget
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                >
                  {stepNum}
                </button>
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
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
        <table className="w-full text-sm text-left border border-slate-200 border-collapse">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-[#0f172a] text-white" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
              <th rowSpan={2} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider min-w-[150px] bg-[#0f172a] text-white">
                Department Head
              </th>
              <th rowSpan={2} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border-b border-slate-700 text-xs uppercase tracking-wider min-w-[150px] bg-[#0f172a] text-white">
                Project
              </th>
              <th colSpan={8} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} className="px-4 py-2 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider bg-[#0f172a] text-white">
                Progress (8 Step)
              </th>
              <th rowSpan={2} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} className="px-6 py-4 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider min-w-[120px] bg-[#0f172a] text-white">
                Status
              </th>
              <th rowSpan={2} style={{ backgroundColor: "#0f172a", color: "#ffffff" }} className="px-4 py-4 font-bold text-center border border-slate-700 text-xs uppercase tracking-wider w-[60px] bg-[#0f172a] text-white">
                Action
              </th>
            </tr>
            {/* Header Row 2 */}
            <tr className="bg-[#0f172a] text-slate-300" style={{ backgroundColor: "#0f172a", color: "#cbd5e1" }}>
              {STEPS.map((step) => {
                const IconComponent = step.icon;
                const isTarget = step.num === targetStep;
                return (
                  <th
                    key={step.num}
                    style={isTarget ? { backgroundColor: "rgba(30, 58, 138, 0.4)", color: "#93c5fd" } : { backgroundColor: "#0f172a", color: "#cbd5e1" }}
                    className={`px-1 py-3 text-center border border-slate-700 text-[10px] font-bold ${
                      isTarget 
                        ? "bg-blue-900/40 text-blue-200 border-r-2 border-dashed border-blue-500/50" 
                        : "bg-[#0f172a] text-slate-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5 min-w-[65px] relative pt-3">
                      {isTarget && (
                        <>
                          <span className="text-[10px] text-orange-400 absolute top-0 font-bold animate-bounce z-20">
                            ▼
                          </span>
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 border-l-2 border-dashed border-blue-400 h-[2000px] pointer-events-none z-10" />
                        </>
                      )}
                      <span className="text-[11px] font-black">{step.num}</span>
                      <IconComponent className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-medium leading-none opacity-85">{step.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.list.map((item, index) => {
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
                          {project.department || "Dept Head"}
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
                        ? "rounded-l-lg"
                        : step.num === 8
                          ? "rounded-r-lg"
                          : "rounded-md";

                    return (
                      <td
                        key={step.num}
                        className={`px-1 py-4 align-middle border border-slate-200/80 ${isTargetCol ? "bg-blue-50/20 border-r-2 border-dashed border-blue-400" : ""
                          }`}
                      >
                        <div
                          style={{ backgroundColor: segmentColor }}
                          className={`h-3 w-full ${roundedClass} transition-all duration-300 shadow-sm`}
                        />
                      </td>
                    );
                  })}

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center border border-slate-200/80">
                    {status === "late" && (
                      <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg px-2.5 py-1 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                        <span>Late</span>
                        <span className="text-[10px] text-red-500/70 font-medium">(Plan: Step {targetStep})</span>
                      </div>
                    )}
                    {status === "on-track" && (
                      <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 rounded-lg px-2.5 py-1 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                        <span>On Track</span>
                        <span className="text-[10px] text-green-500/70 font-medium">(Plan: Step {targetStep})</span>
                      </div>
                    )}
                    {status === "ahead" && (
                      <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg px-2.5 py-1 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#f97316" }} />
                        <span>Ahead</span>
                        <span className="text-[10px] text-orange-500/70 font-medium">(Plan: Step {targetStep})</span>
                      </div>
                    )}
                  </td>

                  {/* Action Eye Button */}
                  <td className="px-4 py-4 text-center border border-slate-200/80">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => props.showDetailModal(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}

            {stats.total === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-slate-400 italic font-medium border border-slate-200/80">
                  No QCC projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
