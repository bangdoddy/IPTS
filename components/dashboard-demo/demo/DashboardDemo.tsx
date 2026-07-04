import React, { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

// Types & Config
import { 
  Project, 
  ModuleId 
} from "../types";
import { MODULES } from "../../config/modules";
import { SS_STATUS, YEARS, MONTHS } from "../constants";

// Hooks
import { useMonitoring } from "../hooks/useMonitoring";

// Components
import { QuickModuleGrid, StatsPanel, StepsPanel, MemberFilters } from "../components/MonitoringPanels";
import { GrandTotalChartCard, PlanActualChartCard } from "../components/ChartCards";
import { ProjectsTable } from "../components/ProjectsTable";
import { DetailModal as SsDetailModal } from "../components/SSModals";
import { QccDetailModal } from "../components/QccModals";

// Mock Data
import demoData from "./DashboardDemoData.json";

export default function DashboardDemo() {
  const [refreshKey] = useState(0);
  
  // 1. Mock Filter States (for charts)
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("5");

  // 2. Monitoring Logic using Mock Projects
  const mon = useMonitoring({
    projects: demoData.projects as Project[],
    modules: MODULES as any,
    ssRows: demoData.projects.filter(p => p.type === "SS") as Project[],
  });

  const orgOptions = useMemo(() => ({
    sites: Object.keys(demoData.orgStructure),
    divisions: ["Human Capital", "Manufacturing", "Commercial", "Operations", "Finance & Accounting"],
    departments: [],
    sections: []
  }), []);

  // 3. Mock Chart Data Processing
  // For Grand Total, we pick the data point corresponding to selected year/month
  // In demo data, we only have months like "May 26"
  const selectedMonthLabel = useMemo(() => {
    const m = MONTHS.find(m => m.value === month)?.label.substring(0, 3);
    const y = year.substring(2);
    return `${m} ${y}`;
  }, [year, month]);

  const currentChartPoint = useMemo(() => {
    const source = mon.selectedModule === "ss" ? demoData.ssChart :
                   mon.selectedModule === "qcc" ? demoData.qccChart :
                   demoData.qcpChart;
    return source.find(d => d.month === selectedMonthLabel) || source[source.length - 1];
  }, [mon.selectedModule, selectedMonthLabel]);

  // Filter labels for Plan vs Actual (Mocked for Demo)
  const mockPlanActualData = useMemo(() => {
    return [
      { department: "Production", Plan: 100, Actual: 95, Achievement: 95 },
      { department: "Quality", Plan: 80, Actual: 85, Achievement: 106.2 },
      { department: "Maintenance", Plan: 60, Actual: 58, Achievement: 96.6 },
      { department: "IT", Plan: 40, Actual: 42, Achievement: 105 },
      { department: "HR", Plan: 30, Actual: 30, Achievement: 100 }
    ];
  }, []);

  // 4. Modals State
  const [detailItem, setDetailItem] = useState<Project | null>(null);

  return (
    <div className="w-full max-w-none py-8 space-y-8 animate-in fade-in duration-700 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Innovation Dashboard <span className="text-sm font-normal text-muted-foreground ml-2">(Demo Mode)</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visualizing performance with mock data for year 2025-2026.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Card className="shadow-xl border-0 bg-white ring-1 ring-black/5">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <CardTitle className="text-2xl font-black text-gray-800">Project Monitoring</CardTitle>
            <p className="text-sm text-muted-foreground">Track all project submissions and their status</p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Filter by Module</h3>
                  <QuickModuleGrid
                    modules={MODULES as any}
                    selectedId={mon.selectedModule}
                    onSelect={mon.setSelectedModule}
                    onResetFilters={mon.resetAllFilters}
                  />
                </div>
              </div>

              {mon.selectedModule ? (
                <div className="pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Filters & Stats */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="space-y-2">
                         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Summary Statistics</h3>
                         <StatsPanel
                          moduleId={mon.selectedModule}
                          selectedStatus={mon.selectedStatus || ""}
                          onSelectStatus={mon.setSelectedStatus}
                          onSelectStep={mon.setSelectedStep}
                          getModuleStats={mon.getModuleStats}
                        />
                      </div>

                      {mon.selectedModule !== "ss" && mon.selectedStatus === "in-progress" && (
                        <StepsPanel
                          moduleId={mon.selectedModule}
                          projects={mon.filteredProjects}
                          selectedStep={mon.selectedStep}
                          onSelectStep={mon.setSelectedStep}
                        />
                      )}

                      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Organizational Filters</h3>
                        <MemberFilters
                          options={orgOptions}
                          orgLoading={false}
                          selectedSite={mon.selectedSite || ""}
                          selectedDivision={mon.selectedDivision || ""}
                          selectedDepartment={mon.selectedDepartment || ""}
                          selectedSection={mon.selectedSection || ""}
                          onSite={mon.setSelectedSite}
                          onDivision={mon.setSelectedDivision}
                          onDepartment={mon.setSelectedDepartment}
                          onSection={mon.setSelectedSection}
                        />
                      </div>
                    </div>

                    {/* Right Column: Charts */}
                    <div className="lg:col-span-5 space-y-6">
                       <GrandTotalChartCard
                         title={`${mon.selectedModule.toUpperCase()} Target vs Actual`}
                         subtitle={`Performance for ${selectedMonthLabel}`}
                         accentColor={mon.getTypeColor(mon.selectedModule as any).bg}
                         plan={currentChartPoint.plan}
                         actual={currentChartPoint.actual}
                         year={year}
                         month={month}
                         onYear={setYear}
                         onMonth={setMonth}
                       />
                       
                       <PlanActualChartCard
                         title="Achievement by Dept"
                         subtitle="Plan vs Actual Distribution"
                         accentColor={mon.getTypeColor(mon.selectedModule as any).bg}
                         data={mockPlanActualData}
                         yDomain={[0, 120]}
                         year={year}
                         month={month}
                         onYear={setYear}
                         onMonth={setMonth}
                         divisionValue={null}
                         departmentValue={null}
                         sectionValue={null}
                         divisions={[]}
                         departments={[]}
                         sections={[]}
                         onDivision={() => {}}
                         onDepartment={() => {}}
                         onSection={() => {}}
                         showPaging={false}
                         pageIndex={0}
                         totalPages={1}
                         onPrevPage={() => {}}
                         onNextPage={() => {}}
                         canPrev={false}
                         canNext={false}
                         hideFilters={true}
                       />
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Project Detail List</h3>
                       <span className="text-[10px] font-bold text-slate-400">{mon.filteredProjects.length} projects found</span>
                    </div>
                    <ProjectsTable
                      selectedModule={mon.selectedModule}
                      filteredProjects={mon.filteredProjects}
                      selectedStatus={mon.selectedStatus || ""}
                      selectedStep={mon.selectedStep}
                      setSelectedStatus={mon.setSelectedStatus}
                      setSelectedStep={mon.setSelectedStep}
                      getTypeColor={(t) => mon.getTypeColor(t as any).bg}
                      getStatusBadge={(p) => (
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {mon.getStatusBadgeLabel(p.status, p.step)}
                        </Badge>
                      )}
                      showDetailModal={setDetailItem}
                      showEditModal={() => {}}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 mt-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md mb-6 ring-1 ring-black/5 animate-bounce">
                    <LayoutDashboard className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Select a Module</h4>
                  <p className="text-sm text-slate-500 max-w-xs text-center mt-2 font-medium">
                    Click one of the modules above to visualize and monitor specific project performance data.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals for Demo */}
      {detailItem && detailItem.type === "SS" && (
        <SsDetailModal
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          item={detailItem as any}
        />
      )}
      {detailItem && detailItem.type !== "SS" && (
        <QccDetailModal
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          project={detailItem as any}
          refreshKey={refreshKey}
        />
      )}
    </div>
  );
}
