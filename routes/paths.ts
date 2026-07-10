// src/routes/paths.ts
export const PATHS = {
  root: "/",

  auth: {
    login: "/auth/login",
    otp: "/auth/otp",
  },

  app: {
    home: "/home",
    create: "/create",
    dashboard: "/dashboard",
    dashboardNew: "/dashboard-v2",
    historical: "/historical",
    master: "/master",
    masterDivision: "/master/division",
    masterDepartment: "/master/department",
    masterSection: "/master/section",
    masterDataPlan: "/master/data-plan",
    calendar: "/calendar",
    approval: "/approval",
    approvalSS: "/approval/ss",
    approvalQCC: "/approval/qcc",
    approvalQCP: "/approval/qcp",
    projectstatusss: "/project-status-ss",
    trackingss: "/trackingSS",
    trackingqcc: "/trackingQCC",
    projectstatussdraft: "/project-status-draft",
    projectstatusqcp: "/project-status-qcp",
    projectstatusqcc: "/project-status-qcc",
    userMaintenance: "/master/user-maintenance",
    dashboardDemo: "/dashboard-demo",
  },

  module: {
    any: "/module/:id",
    ss: "/module/ss",
    qcc: "/module/qcc",
    qcp: "/module/qcp",
    tebp: "/module/tebp",
    crp: "/module/crp",
  },
} as const;

export type ViewKey = "home" | "create" | "dashboard" | "historical" | "calendar" | "approval";
export type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
