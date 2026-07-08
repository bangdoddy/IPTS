import React from "react";
import { Search, Globe, Building2, Layout, Users } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ModuleConfig, ModuleId, Project } from "../types";
import { MODULE_THEME } from "../constants";
import { cn } from "../utils";

export function QuickModuleGrid(props: {
  modules: ModuleConfig[];
  selectedId: ModuleId | null;
  onSelect: (id: ModuleId | null) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {props.modules.map((m) => {
        const Icon = m.icon;
        const id = m.id;
        const theme = MODULE_THEME[id];

        const active = props.selectedId === id;
        const dimmed = !!props.selectedId && props.selectedId !== id;

        return (
          <Button
            key={m.id}
            onClick={() => {
              props.onSelect(active ? null : id);
              props.onResetFilters();
            }}
            className={cn(
              "h-auto py-5 px-4 flex flex-col items-center gap-2.5 border-0 transition-all duration-300",
              active ? "ring-2 ring-white ring-offset-2" : ""
            )}
            style={{
              background: theme.baseGradient,
              opacity: dimmed ? 0.5 : 1,
              color: "#FFFFFF",
              fontWeight: "700",
              borderRadius: "15px",
              boxShadow: active ? theme.boxShadow.active : theme.boxShadow.normal,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!props.selectedId || active) e.currentTarget.style.background = theme.hoverGradient;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = theme.baseGradient;
            }}
          >
            <Icon className={id === "tebp" ? "w-5 h-5 text-[#E8FFFA]" : "w-5 h-5"} />
            <p className="text-xs text-center leading-tight" style={{ fontWeight: "700" }}>
              {id === "crp" ? "Cost Reduction" : m.title}
            </p>
          </Button>
        );
      })}
    </div>
  );
}

export function StatsPanel({
  moduleId,
  selectedStatus,
  onSelectStatus,
  onSelectStep,
  getModuleStats,
  ssOverrideTotals
}: {
  moduleId: ModuleId;
  selectedStatus: string;
  onSelectStatus: (s: string) => void;
  onSelectStep: (s: number | null) => void;
  getModuleStats: (mid: ModuleId) => any;
  ssOverrideTotals?: { reviewByLeader: number; reviewByBPI: number; completed: number };
}) {
  const stats = getModuleStats(moduleId);
  const theme = MODULE_THEME[moduleId];
  
  const items = moduleId === "ss" ? [
    { key: "review-by-leader", label: "Review Leader", value: ssOverrideTotals?.reviewByLeader ?? 0, color: "#ED8330" },
    { key: "review-by-bpi", label: "Review BPI", value: ssOverrideTotals?.reviewByBPI ?? 0, color: "#006187" },
    { key: "complete", label: "Complete", value: ssOverrideTotals?.completed ?? 0, color: "#22c55e" },
  ] : [
    { key: "submitted", label: "Submitted", value: stats.submitted, color: "#006187" },
    { key: "in-progress", label: "In Progress", value: stats.inProgress, color: "#ED8330" },
    { key: "approved", label: "Approved", value: stats.approved, color: "#22c55e" },
    { key: "rejected", label: "Rejected", value: stats.rejected, color: "#ef4444" },
  ];

  return (
    <div className={cn(
      "grid gap-3 mb-4",
      moduleId === "ss" ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"
    )}>
      {items.map((item) => {
        const isSelected = selectedStatus === item.key;
        return (
          <button
            key={item.key}
            onClick={() => {
              onSelectStatus(isSelected ? "" : item.key);
              onSelectStep(null);
            }}
            className={cn(
              "p-3 rounded-xl border-2 transition-all text-left group relative overflow-hidden",
              isSelected ? "bg-white shadow-md" : "bg-white/50 border-transparent hover:bg-white"
            )}
            style={{ borderColor: isSelected ? item.color : "transparent" }}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1 group-hover:text-primary transition-colors">
              {item.label}
            </div>
            <div className="text-xl font-black" style={{ color: item.color }}>
              {item.value}
            </div>
            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StepsPanel({
  moduleId,
  projects,
  selectedStep,
  onSelectStep
}: {
  moduleId: ModuleId;
  projects: Project[];
  selectedStep: number | null;
  onSelectStep: (s: number | null) => void;
}) {
  const stepCounts = projects.reduce((acc, p) => {
    if (p.status === "in-progress" && p.step) {
      acc[p.step] = (acc[p.step] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="mb-4 animate-in fade-in slide-in-from-left-2 duration-500">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Layout className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter by Step</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
          const count = stepCounts[step] || 0;
          const isSelected = selectedStep === step;
          return (
            <button
              key={step}
              onClick={() => onSelectStep(isSelected ? null : step)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2",
                isSelected
                  ? "bg-primary text-white border-primary shadow-lg scale-105"
                  : "bg-white border-transparent hover:border-primary/30"
              )}
            >
              <span className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px]", isSelected ? "bg-white/20" : "bg-muted")}>
                {step}
              </span>
              <span>Step {step}</span>
              <Badge variant="secondary" className={cn("ml-1 h-4 px-1 text-[10px] font-black", isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MemberFilters({
  options,
  orgLoading,
  selectedSite,
  selectedDivision,
  selectedDepartment,
  selectedSection,
  onSite,
  onDivision,
  onDepartment,
  onSection
}: {
  options: any;
  orgLoading: boolean;
  selectedSite: string;
  selectedDivision: string;
  selectedDepartment: string;
  selectedSection: string;
  onSite: (s: string) => void;
  onDivision: (s: string) => void;
  onDepartment: (s: string) => void;
  onSection: (s: string) => void;
}) {
  const FilterGroup = ({ label, icon: Icon, value, onSelect, items, placeholder }: any) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      </div>
      <select
        className="w-full bg-white border-2 border-transparent hover:border-primary/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm appearance-none"
        value={value || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">{orgLoading ? "Loading..." : placeholder}</option>
        {items.map((it: string) => (
          <option key={it} value={it}>{it}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-black/5">
      <FilterGroup
        label="Site"
        icon={Globe}
        value={selectedSite}
        onSelect={onSite}
        items={options.sites}
        placeholder="All Sites"
      />
      <FilterGroup
        label="Division"
        icon={Building2}
        value={selectedDivision}
        onSelect={onDivision}
        items={options.divisions}
        placeholder="All Divisions"
      />
      <FilterGroup
        label="Department"
        icon={Layout}
        value={selectedDepartment}
        onSelect={onDepartment}
        items={options.departments}
        placeholder="All Departments"
      />
      <FilterGroup
        label="Section"
        icon={Users}
        value={selectedSection}
        onSelect={onSection}
        items={options.sections}
        placeholder="All Sections"
      />
    </div>
  );
}
