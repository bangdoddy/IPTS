// src/DashboardPage.tsx
import React, { useMemo } from "react";
import DashboardAnalyticsAndMonitoring from "../components/dashboard/DashboardAnalyticsAndMonitoring";
import { MODULES } from "./config/modules";

// pakai types minimal biar nggak ribet dulu
type ChartRow = { department: string; Plan: number; Actual: number; Achievement: number };
type ChartDataByYearMonth = Record<string, Record<string, ChartRow[]>>;
type OrgStructure = Record<string, Record<string, string[]>>;

type Props = {
  projects: any[];
  qccDataByYearMonth: ChartDataByYearMonth;
  organizationStructure: OrgStructure;
};

export default function DashboardPage(props: Props) {
  // modules from single source
  const modules = useMemo(() => MODULES as any, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <DashboardAnalyticsAndMonitoring
        // kunci: jangan pakai location.key lagi di sini
        projects={props.projects}
        modules={modules}
        qccDataByYearMonth={props.qccDataByYearMonth as any}
        organizationStructure={props.organizationStructure as any}
      />
    </div>
  );
}
