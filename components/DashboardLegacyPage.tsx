// src/components/DashboardLegacyPage.tsx
import React, { useMemo } from "react";
import DashboardLegacy from "./dashboard/DashboardLegacy";
import { MODULES } from "./config/modules";

type ChartRow = { department: string; Plan: number; Actual: number; Achievement: number };
type ChartDataByYearMonth = Record<string, Record<string, ChartRow[]>>;
type OrgStructure = Record<string, Record<string, string[]>>;

type Props = {
  projects: any[];
  qccDataByYearMonth: ChartDataByYearMonth;
  organizationStructure: OrgStructure;
};

export default function DashboardLegacyPage(props: Props) {
  const modules = useMemo(() => MODULES as any, []);

  return (
    <div className="w-full max-w-none py-6 sm:py-10">
      <DashboardLegacy
        projects={props.projects}
        modules={modules}
        qccDataByYearMonth={props.qccDataByYearMonth as any}
        organizationStructure={props.organizationStructure as any}
      />
    </div>
  );
}
