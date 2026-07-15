// src/config.ts
const PRODUCTION_API_BASE = "https://iptsbe.azurewebsites.net";

function resolveApiBaseUrl(): string {
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  // Production build must never silently fall back to localhost
  if (import.meta.env.PROD) return PRODUCTION_API_BASE;

  return "http://localhost:5251";
}

export const CONFIG = {
  apiBaseUrl: resolveApiBaseUrl(),
};

const u = (path: string) =>
  `${CONFIG.apiBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

// 1) Simpan path mentah dulu (stabil)
export const API_PATH = {

  // ===== Organization =====
  ORGANIZATION_EXECUTE: "/api/Master/orgstructure",
  MASTER_DIVISION: "/api/Master/divisions",
  MASTER_DEPARTMENT: "/api/Master/departments",
  MASTER_SECTION: "/api/Master/sections",
  MASTER_DATA_PLAN: "/api/Master/data-plan",

  // ===== Employee =====
  EMPLOYEE_EXECUTE: "/api/Employee/execute",
  EMPLOYEE_GET_LIST: "/api/Employee/get-list",
  EMPLOYEE_RETRIEVE: "/api/Employee/retrieve",

  // ===== ImprovementType =====
  IMPROVEMENTTYPE_LIST: "/api/ImprovementType/list",

  // ===== Suggestion =====
  SUGGESTION_EXECUTE: "/api/Suggestion/execute",
  SUGGESTION_LIST: "/api/Suggestion/list",
  SUGGESTION_RETRIEVE: "/api/Suggestion/retrieve",
  SUGGESTION_DASHBOARDCHART: "/api/Suggestion/Dashboard-Chart",
  SUGGESTION_DASHBOARDCHART_TOTAL: "/api/Suggestion/Dashboard-Chart-Total",
  SUGGESTION_DASHBOARDCHART_SITE: "/api/Suggestion/Dashboard-Chart-Site",
  SUGGESTION_DISTINCT_SITES: "/api/Suggestion/Distinct-Sites",
  SUGGESTION_IMPORT: "/api/Suggestion/import",

  SUGGESTION_CLASSIFICATION: "/api/Suggestion/classification",

  // ===== Scoring =====
  SCORINGEXEC: "/api/Scoring/execute",
  SCORING_LIST: "/api/Scoring/list",
  SCORING_RETRIEVE: "/api/Scoring/retrieve",
  REJECT_EXECUTE: "/api/Scoring/reject",


  // ===== Authentication =====
  AuthenticationNRP: "/api/Authentication/NRPAuthenticate",
  AuthenticationOTP: "/api/Authentication/OTPAuthenticate",

  // ===== KLASIFIKASI =====
  KLASIFIKASI_LIST: "/api/Klasifikasi/list",

  // ===== QCC =====
  QCC_CREATE: "/api/QccProject/create",
  QCC_LIST: "/api/QccProject/list",
  QCC_DELETE: "/api/QccProject/delete",
  QCC_STEP_CREATE: "/api/QccProject/step/create",
  QCC_APPROVAL_LIST: "/api/QccProject/approval/list",
  QCC_STEP_APPROVE: "/api/QccProject/step/approve",
  QCC_STEP_REJECT: "/api/QccProject/step/reject",
  QCC_CHART: "/api/QccProject/chart",
  QCC_DASHBOARD: "/api/QccProject/dashboard",
  QCC_RETRIEVE: "/api/QccProject/retrieve",

  // ===== QCP =====
  QCP_CREATE: "/api/QcpProject/create",
  QCP_LIST: "/api/QcpProject/list",
  QCP_CHART: "/api/QcpProject/chart",
  QCP_STEP_CREATE: "/api/QcpProject/step/create",
  QCP_APPROVAL_LIST: "/api/QcpProject/approval/list",
  QCP_STEP_APPROVE: "/api/QcpProject/step/approve",
  QCP_STEP_REJECT: "/api/QcpProject/step/reject",
  QCP_DASHBOARD: "/api/QcpProject/dashboard",
  QCP_RETRIEVE: "/api/QcpProject/retrieve",
  USER_MAINTENANCE: "/api/UserMaintenance",
  BLOB_UPLOAD: "/api/BlobStorage/upload",
} as const;

// 2) API versi STRING URL (paling aman dipakai)
export const API = {
  ORGANIZATION_EXECUTE: u(API_PATH.ORGANIZATION_EXECUTE),
  MASTER_DIVISION: u(API_PATH.MASTER_DIVISION),
  MASTER_DEPARTMENT: u(API_PATH.MASTER_DEPARTMENT),
  MASTER_SECTION: u(API_PATH.MASTER_SECTION),
  MASTER_DATA_PLAN: u(API_PATH.MASTER_DATA_PLAN),

  EMPLOYEE_EXECUTE: u(API_PATH.EMPLOYEE_EXECUTE),
  EMPLOYEE_GET_LIST: u(API_PATH.EMPLOYEE_GET_LIST),
  EMPLOYEE_RETRIEVE: u(API_PATH.EMPLOYEE_RETRIEVE),
  IMPROVEMENTTYPE_LIST: u(API_PATH.IMPROVEMENTTYPE_LIST),
  SUGGESTION_EXECUTE: u(API_PATH.SUGGESTION_EXECUTE),
  SUGGESTION_LIST: u(API_PATH.SUGGESTION_LIST),
  SUGGESTION_RETRIEVE: u(API_PATH.SUGGESTION_RETRIEVE),
  SUGGESTION_DASHBOARDCHART: u(API_PATH.SUGGESTION_DASHBOARDCHART),
  SUGGESTION_DASHBOARDCHART_TOTAL: u(API_PATH.SUGGESTION_DASHBOARDCHART_TOTAL),
  SUGGESTION_DASHBOARDCHART_SITE: u(API_PATH.SUGGESTION_DASHBOARDCHART_SITE),
  SUGGESTION_DISTINCT_SITES: u(API_PATH.SUGGESTION_DISTINCT_SITES),
  SUGGESTION_IMPORT: u(API_PATH.SUGGESTION_IMPORT),

  SCORING_EXECUTE: u(API_PATH.SCORINGEXEC),
  SCORING_LIST: u(API_PATH.SCORING_LIST),
  SCORING_RETRIEVE: u(API_PATH.SCORING_RETRIEVE),

  AuthenticationNRP: u(API_PATH.AuthenticationNRP),
  AuthenticationOTP: u(API_PATH.AuthenticationOTP),
  REJECT_EXECUTE: u(API_PATH.REJECT_EXECUTE),

  // QCC
  QCC_CREATE: u(API_PATH.QCC_CREATE),
  QCC_DELETE: u(API_PATH.QCC_DELETE),
  QCC_LIST: u(API_PATH.QCC_LIST),
  QCC_STEP_CREATE: u(API_PATH.QCC_STEP_CREATE),
  QCC_APPROVAL_LIST: u(API_PATH.QCC_APPROVAL_LIST),
  QCC_STEP_APPROVE: u(API_PATH.QCC_STEP_APPROVE),
  QCC_STEP_REJECT: u(API_PATH.QCC_STEP_REJECT),
  SUGGESTION_CLASSIFICATION: u(API_PATH.SUGGESTION_CLASSIFICATION),
  QCC_CHART: u(API_PATH.QCC_CHART),
  QCC_DASHBOARD: u(API_PATH.QCC_DASHBOARD),
  QCC_RETRIEVE: u(API_PATH.QCC_RETRIEVE),


  // QCP
  QCP_CREATE: u(API_PATH.QCP_CREATE),
  QCP_LIST: u(API_PATH.QCP_LIST),
  QCP_CHART: u(API_PATH.QCP_CHART),
  QCP_STEP_CREATE: u(API_PATH.QCP_STEP_CREATE),
  QCP_APPROVAL_LIST: u(API_PATH.QCP_APPROVAL_LIST),
  QCP_STEP_APPROVE: u(API_PATH.QCP_STEP_APPROVE),
  QCP_STEP_REJECT: u(API_PATH.QCP_STEP_REJECT),
  QCP_DASHBOARD: u(API_PATH.QCP_DASHBOARD),
  QCP_RETRIEVE: u(API_PATH.QCP_RETRIEVE),
  USER_MAINTENANCE: u(API_PATH.USER_MAINTENANCE),
  KLASIFIKASI_LIST: u(API_PATH.KLASIFIKASI_LIST),
  BLOB_UPLOAD: u(API_PATH.BLOB_UPLOAD),
} as const;

// 3) Optional: API versi FUNCTION (kalau kamu masih mau gaya lama)
export const API_FN = {
  ORGANIZATION_EXECUTE: () => API.ORGANIZATION_EXECUTE,
  EMPLOYEE_EXECUTE: () => API.EMPLOYEE_EXECUTE,
  EMPLOYEE_GET_LIST: () => API.EMPLOYEE_GET_LIST,
  EMPLOYEE_RETRIEVE: () => API.EMPLOYEE_RETRIEVE,
  IMPROVEMENTTYPE_LIST: () => API.IMPROVEMENTTYPE_LIST,
  SUGGESTION_EXECUTE: () => API.SUGGESTION_EXECUTE,
  SUGGESTION_LIST: () => API.SUGGESTION_LIST,
  SUGGESTION_RETRIEVE: () => API.SUGGESTION_RETRIEVE,
  SUGGESTION_DASHBOARDCHART: () => API.SUGGESTION_DASHBOARDCHART,
  SUGGESTION_DASHBOARDCHART_TOTAL: () => API.SUGGESTION_DASHBOARDCHART_TOTAL,
  SUGGESTION_DASHBOARDCHART_SITE: () => API.SUGGESTION_DASHBOARDCHART_SITE,
  SUGGESTION_IMPORT: () => API.SUGGESTION_IMPORT,
  SCORING_RETRIEVE: () => API.SCORING_RETRIEVE,
  SCORING_EXECUTE: () => API.SCORING_EXECUTE,
  AuthenticationNRP: () => API.AuthenticationNRP,
  AuthenticationOTP: () => API.AuthenticationOTP,
  REJECT_EXECUTE: () => API.REJECT_EXECUTE,
  KLASIFIKASI_LIST: () => API.KLASIFIKASI_LIST,
  BLOB_UPLOAD: () => API.BLOB_UPLOAD,
} as const;
