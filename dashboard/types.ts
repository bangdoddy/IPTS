import React from "react";

export type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
export type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

export type QccMember = {
  name?: string;
  department?: string;
  section?: string;
  nrp?: string;
  site?: string;
  division?: string;
};

export type AnyStatus = string; // Simplified for now, or refine if needed

export type Project = {
  id?: number | string;
  type: ProjectType;

  // SS
  itemKey?: string;
  ideNumber?: string;
  site?: string;

  // QCC fields
  nrpSelected?: string;
  lokasi?: string;
  department?: string;
  section?: string;
  namaGroupQccp?: string;
  fasilitatorNrp?: string;
  fasilitator?: string;
  fasilitatorDepartment?: string;
  fasilitatorSection?: string;
  leaderNrp?: string;
  leader?: string;
  leaderDepartment?: string;
  leaderSection?: string;
  members?: QccMember[];
  temaQccp?: string;
  kpiDidukung?: string;
  masalahPeluang1?: string;
  masalahPeluang2?: string;
  masalahPeluang3?: string;
  masalahPeluang4?: string;
  apaTargetnya?: string;
  berapaTargetnya?: string;
  kapanDicapai?: string;
  kondisiSebelum?: string;
  supportingDocument?: string;
  createdBy?: string;
  createdAt?: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;

  // common fields
  judulSS: string;
  pembuatSS: string;
  status: AnyStatus;
  submittedDate: Date | string;
  step?: number | string;
  stepStatus?: string;
  leaderName?: string;
};

export type PlanActualRow = {
  department: string;
  Plan: number;
  Actual: number;
  Achievement?: number;
};

export type TotalRow = { label: string; plan: number; actual: number };
export type ChartDataByYearMonth = Record<string, Record<string, PlanActualRow[]>>;

export type OrgStructure = Record<string, Record<string, string[]>>;

export type ModuleConfig = {
  id: ModuleId;
  title: string;
  gradient: string;
  bgColor: string;
  iconColor: string;
  type: ProjectType;
  icon: React.ElementType;
};

export type ProjectChartApiRow = {
  division?: string;
  department?: string;
  section?: string;
  planSS?: number;
  plan?: number;
  Plan?: number;
  actual?: number;
  Actual?: number;
  totalPlan?: number;
  totalActual?: number;
  achievement?: number;
};

export type OrgApiRow = {
  divisionCode?: string;
  divisionName?: string;
  departmentCode?: string | null;
  departmentName?: string | null;
  sectionCode?: string | null;
  sectionName?: string | null;
  departmentCount?: number | null;
  sectionCount?: number | null;
};

export type OrgMaster = {
  ready: boolean;
  loading: boolean;
  divRows: OrgApiRow[];
  deptRows: OrgApiRow[];
  secRows: OrgApiRow[];
};

export type MemberOptions = {
  sites: string[];
  divisions: string[];
  departments: string[];
  sections: string[];
};

export type SSStatus = "Review by leader" | "Reject by leader" | "Review by bpi" | "Complete";

export type SsChartApiRow = {
  division?: string;
  department?: string;
  section?: string;
  planSS?: number;
  plan?: number;
  actual?: number;
  totalSSPerDivision?: number;
  totalSSPerDepartment?: number;
  totalSSPerSection?: number;
  totalRows?: number;
  totalPages?: number;
};

export type DashboardAnalyticsAndMonitoringProps = {
  projects: Project[];
  modules: ModuleConfig[];
  qccDataByYearMonth: ChartDataByYearMonth;
  ssDataByYearMonth?: ChartDataByYearMonth;
  organizationStructure: OrgStructure;

  ssProjectTypeNumber?: number;
  ssListBaseBody?: Record<string, any>;
};
