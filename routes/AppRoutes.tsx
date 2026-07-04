import ProjectStatusQcc from "../components/projectstatusqcc/index";
// src/routes/AppRoutes.tsx
import React, { useCallback } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Login } from "../components/auth/Login";
import { OTP } from "../components/auth/OTP";

import { SuggestionSystem } from "../components/modules/SuggestionSystem";
import { QualityControlCircle } from "../components/modules/QualityControlCircle";
import { QualityControlProject } from "../components/modules/QualityControlProject";
import { ExecutiveBusinessPractices } from "../components/modules/ExecutiveBusinessPractices";
import { CostReductionProject } from "../components/modules/CostReductionProject";
import ProjectStatusQcp from "../components/projectstatusqcp/index";

import { authUserOrNull } from "../libs/auth";
import { PATHS, type ModuleId } from "./paths";
import { MODULES } from "../components/config/modules";

import { AppShell } from "../components/layout/AppShell";

// pages (root src/*.tsx)
import HomePage from "../components/HomePage";
import CreatePage from "../components/CreatePage";
import DashboardPage from "../components/DashboardPage";
import DashboardLegacyPage from "../components/DashboardLegacyPage";
import HistoricalPage from "../components/HistoricalPage";
import HomeHistoricalPage from "../components/HistoricalProject/Home";
import { Home as ProjectStatusPage } from "../components/projectstatusss/index";
import { SSDraft as ProjectDraftSS } from "../components/projectstatusss/projectdraftss";
import MasterManagementPage from "../components/master/MasterManagementPage";
import UserMaintenancePage from "../components/master/UserMaintenancePage";
import DataPlanPage from "../components/master/DataPlanPage";
import CalendarPage from "../components/CalendarPage";
import ApprovalPage from "../components/ApprovalPage";
import DashboardDemo from "../components/dashboard-demo/DashboardLegacy";

// =====================================================
// Guards
// =====================================================
function Protected({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user = authUserOrNull();

  if (!user) {
    return (
      <Navigate
        to={PATHS.auth.login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const user = authUserOrNull();
  if (user) return <Navigate to={PATHS.app.home} replace />;
  return <>{children}</>;
}

// =====================================================
// Types
// =====================================================
type AppRoutesProps = {
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
};

// =====================================================
// Mock data sementara (pindah nanti kalau mau)
// =====================================================
type ChartRow = { department: string; Plan: number; Actual: number; Achievement: number };
type ChartDataByYearMonth = Record<string, Record<string, ChartRow[]>>;
type OrgStructure = Record<string, Record<string, string[]>>;

const MOCK_QCC_DATA: ChartDataByYearMonth = {
  "2024": { Jan: [{ department: "Production", Plan: 2, Actual: 1, Achievement: 50 }] },
};

const MOCK_ORG_STRUCTURE: OrgStructure = {
  IT: { "IT & OT Development Department": ["Application System", "ERP & Integration System"] },
  "Finance & Accounting": { "Accounting, Payable & Compl Department": ["General Accounting", "AP Control"] },
  "Plant Dev & Engineering": { "Plant Engineering Department": ["Equipment Engineer", "Electrical Engineer"] },
};

// =====================================================
// Module Router (component-level)
// =====================================================
function ModuleRoute(props: { onBack: () => void; onSubmit: (p: any) => void; moduleId: ModuleId }) {
  const user = authUserOrNull();
  if (!user) return null;

  switch (props.moduleId) {
    case "ss":
      return <SuggestionSystem user={user} onBack={props.onBack} onSubmit={props.onSubmit} />;
    case "qcc":
      return <QualityControlCircle user={user} onBack={props.onBack} onSubmit={props.onSubmit} />;
    case "qcp":
      return <QualityControlProject user={user} onBack={props.onBack} onSubmit={props.onSubmit} />;
    case "tebp":
      return <ExecutiveBusinessPractices user={user} onBack={props.onBack} onSubmit={props.onSubmit} />;
    case "crp":
      return <CostReductionProject user={user} onBack={props.onBack} onSubmit={props.onSubmit} />;
    default:
      return <Navigate to={PATHS.app.create} replace />;
  }
}

// =====================================================
// Main
// =====================================================
export default function AppRoutes({ projects, setProjects }: AppRoutesProps) {
  const navigate = useNavigate();
  const user = authUserOrNull();
  const authed = Boolean(user);

  const defaultAfterRoot = authed ? PATHS.app.home : PATHS.auth.login;

  const handleProjectSubmit = useCallback(
    (project: any) => {
      setProjects((prev) => [
        ...prev,
        { ...project, id: prev.length + 1, submittedDate: new Date().toISOString() },
      ]);
      navigate(PATHS.app.dashboard);
    },
    [navigate, setProjects]
  );

  const handleBackFromModule = useCallback(() => {
    navigate(PATHS.app.create);
  }, [navigate]);

  return (
    <Routes>
      {/* root */}
      <Route path={PATHS.root} element={<Navigate to={defaultAfterRoot} replace />} />

      {/* AUTH */}
      <Route
        path={PATHS.auth.login}
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path={PATHS.auth.otp}
        element={
          <PublicOnly>
            <OTP />
          </PublicOnly>
        }
      />

      {/* APP (PRIVATE) */}
      <Route
        element={
          <Protected>
            <AppShell user={user} />
          </Protected>
        }
      >
        <Route path={PATHS.app.home} element={<HomePage />} />
        <Route path={PATHS.app.create} element={<CreatePage />} />
        <Route
          path={PATHS.app.dashboard}
          element={
            <DashboardDemo
              projects={projects}
              modules={MODULES as any}
              qccDataByYearMonth={MOCK_QCC_DATA}
              organizationStructure={MOCK_ORG_STRUCTURE}
            />
          }
        />
        <Route
          path={PATHS.app.dashboardNew}
          element={
            <DashboardPage
              projects={projects}
              qccDataByYearMonth={MOCK_QCC_DATA}
              organizationStructure={MOCK_ORG_STRUCTURE}
            />
          }
        />
        <Route path={PATHS.app.historical} element={<HistoricalPage />} />
        <Route path={PATHS.app.master} element={<Navigate to={PATHS.app.masterDivision} replace />} />
        <Route path={PATHS.app.masterDivision} element={<MasterManagementPage />} />
        <Route path={PATHS.app.masterDepartment} element={<MasterManagementPage />} />
        <Route path={PATHS.app.masterSection} element={<MasterManagementPage />} />
        <Route path={PATHS.app.masterDataPlan} element={<DataPlanPage />} />
        <Route path={PATHS.app.userMaintenance} element={<UserMaintenancePage />} />
        <Route
          path={PATHS.app.projectstatusss}
          element={<ProjectStatusPage />}
        />
        <Route
          path={PATHS.app.projectstatussdraft}
          element={<ProjectDraftSS />}
        />
        <Route
          path={PATHS.app.projectstatusqcp}
          element={<ProjectStatusQcp />}
        />
        <Route
          path={PATHS.app.projectstatusqcc}
          element={<ProjectStatusQcc />}
        />
        <Route path={PATHS.app.calendar} element={<CalendarPage />} />
        <Route path={PATHS.app.approval} element={<Navigate to={PATHS.app.approvalSS} replace />} />
        <Route path={PATHS.app.approvalSS} element={<ApprovalPage moduleId="ss" />} />
        <Route path={PATHS.app.approvalQCC} element={<ApprovalPage moduleId="qcc" />} />
        <Route path={PATHS.app.approvalQCP} element={<ApprovalPage moduleId="qcp" />} />
        <Route
          path={PATHS.app.dashboardDemo}
          element={
            <DashboardDemo
              projects={projects}
              modules={MODULES as any}
              qccDataByYearMonth={MOCK_QCC_DATA}
              organizationStructure={MOCK_ORG_STRUCTURE}
            />
          }
        />
        <Route
          path="/dashboard-home"
          element={
            <DashboardLegacyPage
              projects={projects}
              qccDataByYearMonth={MOCK_QCC_DATA}
              organizationStructure={MOCK_ORG_STRUCTURE}
            />
          }
        />
      </Route>

      {/* MODULES (PRIVATE) */}
      <Route
        path={PATHS.module.ss}
        element={
          <Protected>
            <ModuleRoute moduleId="ss" onBack={handleBackFromModule} onSubmit={handleProjectSubmit} />
          </Protected>
        }
      />
      <Route
        path={PATHS.module.qcc}
        element={
          <Protected>
            <ModuleRoute moduleId="qcc" onBack={handleBackFromModule} onSubmit={handleProjectSubmit} />
          </Protected>
        }
      />
      <Route
        path={PATHS.module.qcp}
        element={
          <Protected>
            <ModuleRoute moduleId="qcp" onBack={handleBackFromModule} onSubmit={handleProjectSubmit} />
          </Protected>
        }
      />
      <Route
        path={PATHS.module.tebp}
        element={
          <Protected>
            <ModuleRoute moduleId="tebp" onBack={handleBackFromModule} onSubmit={handleProjectSubmit} />
          </Protected>
        }
      />
      <Route
        path={PATHS.module.crp}
        element={
          <Protected>
            <ModuleRoute moduleId="crp" onBack={handleBackFromModule} onSubmit={handleProjectSubmit} />
          </Protected>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to={defaultAfterRoot} replace />} />
    </Routes>
  );
}
