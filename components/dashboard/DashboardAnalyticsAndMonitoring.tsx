import React, { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { API } from "../../config";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Types
import { 
  DashboardAnalyticsAndMonitoringProps, 
  ModuleId 
} from "./types";

// Hooks
import { 
  useAuthToken, 
  useLoginNrp, 
  useSsList, 
  useQccListByNrp, 
  useQcpListByNrp, 
  useQccClassificationApi,
  useProjectChartApi,
  useSsTotalChart
} from "./hooks/useApiHooks";
import { useMonitoring, useSsChartBound } from "./hooks/useMonitoring";
import { useOrgMasterOnce } from "./hooks/useOrgMaster";
import { useChartFilter, useOrgOptionsFromStructure, useOrgFilterOptions } from "./hooks/useFilterHooks";
import { useApiPlanActualChartBound } from "./hooks/useQccLogic";
import { monthToNumber } from "./utils";
import { useProjectDetailApi } from "./hooks/useDetailHooks";

// Components
import { QuickModuleGrid, StatsPanel, StepsPanel, MemberFilters } from "./components/MonitoringPanels";
import { GrandTotalChartCard, PlanActualChartCard } from "./components/ChartCards";
import { ProjectsTable } from "./components/ProjectsTable";
import { DetailModal as SsDetailModal, EditModal as SsEditModal } from "./components/SSModals";
import { QccDetailModal } from "./components/QccModals";
import { QccDashboardContainer } from "./qcc/QccDashboardContainer";
import { QcpDashboardContainer } from "./qcc/QcpDashboardContainer";

export default function DashboardAnalyticsAndMonitoring(props: DashboardAnalyticsAndMonitoringProps) {
  const token = useAuthToken();
  const loginNrp = useLoginNrp();
  const [refreshKey, setRefreshKey] = useState(0);
  const isQFamily = (mid: ModuleId | null) => mid === "qcc" || mid === "qcp" || mid === "tebp";

  // 1. Master Data
  const master = useOrgMasterOnce({ enabled: true });

  // 2. SS List (Paged)
  const [ssPageIndex, setSsPageIndex] = useState(0);
  const ssList = useSsList({
    enabled: true,
    url: (API as any).SUGGESTION_LIST,
    body: {
      ...props.ssListBaseBody,
      PageIndex: ssPageIndex,
      PageSize: 10,
    },
    token,
  });

  // 3. QCC / QCP List (by NRP)
  const qccList = useQccListByNrp({
    enabled: !!loginNrp,
    url: (API as any).QCC_REGISTRATION_LIST,
    nrp: loginNrp || "",
    token,
    refreshKey,
  });
  const qcpList = useQcpListByNrp({
    enabled: !!loginNrp,
    url: (API as any).QCP_REGISTRATION_LIST,
    nrp: loginNrp || "",
    token,
    refreshKey,
  });

  // 4. Monitoring Logic
  const mon = useMonitoring({
    projects: [...qccList.rows, ...qcpList.rows],
    modules: props.modules,
    ssRows: ssList.rows,
  });

  const orgFilter = useOrgFilterOptions(master, mon.selectedDivision, mon.selectedDepartment, {
    sites: [], divisions: [], departments: [], sections: []
  });

  // 5. Chart Filters & Data
  const ssFilter = useChartFilter();
  const qccFilter = useChartFilter();
  const qcpFilter = useChartFilter();

  const orgOptions = useOrgOptionsFromStructure(master, {
    divisions: [], departments: [], sections: []
  });

  // 6. Chart API Hooks
  const ssChartApi = useProjectChartApi({
    enabled: true,
    url: (API as any).SUGGESTION_DASHBOARD_CHART,
    body: {
      action: 1,
      year: Number(ssFilter.year) || 2026,
      month: monthToNumber(ssFilter.month),
      division: ssFilter.division || "",
      department: ssFilter.department || "",
      section: ssFilter.section || "",
      pageNumber: 0,
      pageSize: 0,
    },
    token,
    errorLabel: "SS Chart",
  });

  const qccChartApi = useProjectChartApi({
    enabled: true,
    url: (API as any).QCC_DASHBOARD_CHART,
    body: {
      year: Number(qccFilter.year) || 2026,
      month: monthToNumber(qccFilter.month),
      division: qccFilter.division || "",
      department: qccFilter.department || "",
      section: qccFilter.section || "",
      pageNumber: qccFilter.pageIndex + 1,
      pageSize: 5,
    },
    token,
    errorLabel: "QCC Chart",
  });

  const qcpChartApi = useProjectChartApi({
    enabled: true,
    url: (API as any).QCP_DASHBOARD_CHART,
    body: {
      year: Number(qcpFilter.year) || 2026,
      month: monthToNumber(qcpFilter.month),
      division: qcpFilter.division || "",
      department: qcpFilter.department || "",
      section: qcpFilter.section || "",
      pageNumber: qcpFilter.pageIndex + 1,
      pageSize: 5,
    },
    token,
    errorLabel: "QCP Chart",
  });

  const ssTotalChartApi = useSsTotalChart({
    enabled: true,
    url: (API as any).SUGGESTION_DASHBOARDCHART_TOTAL || (API as any).SUGGESTION_DASHBOARD_CHART_TOTAL || API.SUGGESTION_DASHBOARDCHART_TOTAL,
    body: {
      action: 1,
      year: Number(ssFilter.year) || 2026,
      month: monthToNumber(ssFilter.month),
      division: ssFilter.division || "",
      department: ssFilter.department || "",
      section: ssFilter.section || "",
      pageNumber: 0,
      pageSize: 0,
    },
    token,
  });

  // 7. Chart Bounding
  const ssChart = useSsChartBound({
    rows: ssChartApi.rows as any,
    filter: ssFilter,
    mergedDivisions: orgOptions.allDivisions,
    mergedDepartments: orgOptions.allDepartments,
    mergedSections: [],
    orgFallback: orgOptions
  });

  const qccChart = useApiPlanActualChartBound({
    rows: qccChartApi.rows,
    filter: qccFilter,
    org: orgOptions
  });

  const qcpChart = useApiPlanActualChartBound({
    rows: qcpChartApi.rows,
    filter: qcpFilter,
    org: orgOptions
  });

  // 8. Detail / Edit Modals
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailType, setDetailType] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const detailApi = useProjectDetailApi(detailId, detailType || "");

  const handleOpenDetail = (id: string, type: string) => {
    setDetailId(id);
    setDetailType(type);
  };

  const handleOpenEdit = (id: string) => {
    setEditId(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <LayoutDashboard className="w-6 h-6 sm:w-8 h-8 text-primary" />
            </div>
            Analytics & Monitoring
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track performance and monitor project progress across all modules
          </p>
        </div>
      </header>

      {/* TOP CHARTS AREA */}
      {(mon.selectedModule === null || mon.selectedModule === "ss") && (
        <div className="mt-8 space-y-12 animate-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <GrandTotalChartCard 
              title="Grand Total SS"
              subtitle="Total Actual vs Target Performance"
              accentColor="#4472C4"
              plan={ssTotalChartApi.data?.totalTarget || 0}
              actual={ssTotalChartApi.data?.totalActual || 0}
              loading={ssTotalChartApi.loading}
              year={ssFilter.year}
              month={ssFilter.month}
              onYear={ssFilter.setYear}
              onMonth={ssFilter.setMonth}
            />

            <PlanActualChartCard 
              title="SS Collected"
              subtitle="Achievement per Division/Department"
              accentColor="#006187"
              data={ssChart.data}
              yDomain={[0, 100]}
              year={ssFilter.year}
              month={ssFilter.month}
              onYear={ssFilter.setYear}
              onMonth={ssFilter.setMonth}
              divisionValue={ssFilter.division}
              departmentValue={ssFilter.department}
              sectionValue={ssFilter.section}
              divisions={orgOptions.allDivisions}
              departments={ssChart.filteredDepartments}
              sections={ssChart.filteredSections}
              onDivision={ssFilter.setDivision}
              onDepartment={ssFilter.setDepartment}
              onSection={ssFilter.setSection}
              showPaging={ssChart.showPaging}
              pageIndex={ssFilter.pageIndex}
              totalPages={ssChart.totalPages}
              onPrevPage={() => ssFilter.setPageIndex(p => Math.max(0, p - 1))}
              onNextPage={() => ssFilter.setPageIndex(p => p + 1)}
              canPrev={ssFilter.pageIndex > 0}
              canNext={ssFilter.pageIndex + 1 < ssChart.totalPages}
              hideFilters={true}
            />
          </div>
        </div>
      )}

      {mon.selectedModule === "qcc" && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
           <QccDashboardContainer />
        </div>
      )}

      {mon.selectedModule === "qcp" && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
           <QcpDashboardContainer />
        </div>
      )}

      {/* PROJECT MONITORING SECTION */}
      <div className="mt-12">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Project Monitoring</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Track all project submissions and their status
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-card-foreground">Quick Filter by Module</h3>
                <p className="text-xs text-muted-foreground mt-1">Click to view specific module statistics</p>
              </div>

              <QuickModuleGrid 
                modules={props.modules} 
                selectedId={mon.selectedModule} 
                onSelect={mon.setSelectedModule}
                onResetFilters={mon.resetAllFilters}
              />

              {mon.selectedModule && (
                <div 
                  className="mt-4 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 border-2" 
                  style={{ 
                    background: mon.selectedModule ? (MODULE_THEME[mon.selectedModule]?.panelBg || "#ffffff") : "#ffffff", 
                    borderColor: mon.selectedModule ? (MODULE_THEME[mon.selectedModule]?.panelBorder || "#e5e7eb") : "#e5e7eb" 
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ color: mon.selectedModule ? (MODULE_THEME[mon.selectedModule]?.panelTitle || "inherit") : "inherit" }}>
                      Module Statistics
                    </h4>
                    <button
                      onClick={() => {
                        mon.setSelectedModule(null);
                        mon.resetAllFilters();
                      }}
                      className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    <StatsPanel 
                      moduleId={mon.selectedModule}
                      selectedStatus={mon.selectedStatus}
                      onSelectStatus={mon.setSelectedStatus}
                      onSelectStep={mon.setSelectedStep}
                      getModuleStats={mon.getModuleStats}
                      ssOverrideTotals={
                        mon.selectedModule === "ss" ? ssList.totals : undefined
                      }
                    />

                    {isQFamily(mon.selectedModule) && mon.selectedStatus === "in-progress" && (
                      <StepsPanel 
                        moduleId={mon.selectedModule}
                        projects={mon.filteredProjects}
                        selectedStep={mon.selectedStep}
                        onSelectStep={mon.setSelectedStep}
                      />
                    )}

                    <MemberFilters 
                      options={orgFilter}
                      orgLoading={master.loading}
                      selectedSite={mon.selectedSite}
                      selectedDivision={mon.selectedDivision}
                      selectedDepartment={mon.selectedDepartment}
                      selectedSection={mon.selectedSection}
                      onSite={mon.setSelectedSite}
                      onDivision={mon.setSelectedDivision}
                      onDepartment={mon.setSelectedDepartment}
                      onSection={mon.setSelectedSection}
                    />
                  </div>
                </div>
              )}
            </div>

            {mon.selectedModule ? (
              <div className="mt-6">
                <ProjectsTable 
                  selectedModule={mon.selectedModule}
                  filteredProjects={mon.filteredProjects}
                  selectedStatus={mon.selectedStatus}
                  selectedStep={mon.selectedStep}
                  setSelectedStatus={mon.setSelectedStatus}
                  setSelectedStep={mon.setSelectedStep}
                  getTypeColor={mon.getTypeColor}
                  getStatusBadge={mon.getStatusBadgeLabel}
                  onQccStepSubmitted={() => setRefreshKey(k => k + 1)}
                  ssPaging={mon.selectedModule === "ss" ? {
                    pageNumber: ssPageIndex,
                    pageSize: 10,
                    totalRows: ssList.totalRows,
                    totalPages: ssList.totalPages,
                    setPageNumber: setSsPageIndex,
                    setPageSize: () => {}
                  } : undefined}
                  showDetailModal={handleOpenDetail}
                  showEditModal={handleOpenEdit}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <LayoutDashboard className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p>Select a module above to view filtered projects</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {detailId && detailType === "SS" && (
        <SsDetailModal 
          project={detailApi.data}
          loading={detailApi.loading}
          onClose={() => setDetailId(null)}
        />
      )}
      {detailId && (detailType === "QCC" || detailType === "QCP") && (
        <QccDetailModal 
          project={mon.filteredProjects.find(p => String(p.id) === detailId) || detailApi.data}
          onClose={() => setDetailId(null)}
          onStepSubmitted={() => setRefreshKey(k => k + 1)}
        />
      )}
      {editId && (
        <SsEditModal 
          id={editId}
          onClose={() => setEditId(null)}
          onSuccess={() => {
            setEditId(null);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}
