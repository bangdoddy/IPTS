// src/components/questionnaire/projectTypeSelector.data.ts

export type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
export type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

export type ViewId = "home" | "dashboard" | "create" | "calendar" | "historical";

export type ProjectItem = {
  type: ProjectType;
  judulSS: string;
  pembuatSS: string;
  status: string;
  submittedDate: Date;
  step?: number;
  members?: Array<{ site: string; division: string; department: string; section: string }>;
};

// =========================
// Badge/status mapping
// =========================
export const STATUS_BADGE: Record<
  string,
  (projectType?: ProjectType, step?: number) => { label: string; className: string }
> = {
  // SS
  "review-by-leader": () => ({
    label: "Review by Leader",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  }),
  "review-by-bpi": () => ({
    label: "Review by BPI",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }),
  completed: () => ({
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-300",
  }),

  // QCC/QCP/TEBP
  registered: (projectType) => ({
    label: projectType === "TEBP" ? "Project Charter Approved" : "Project Registered",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  }),
  "in-progress": (_projectType, step) => ({
    label: step ? `In Progress - Step ${step}` : "In Progress",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }),
  finished: () => ({
    label: "Finished",
    className: "bg-green-100 text-green-800 border-green-300",
  }),
};

export const TYPE_LABEL: Record<ProjectType, string> = {
  SS: "Suggestion System",
  QCC: "Quality Control Circle",
  QCP: "Quality Control Project",
  TEBP: "The Executive Business Practices",
  CRP: "Cost Reduction Project",
};

export const TYPE_COLORS: Record<
  ProjectType,
  { bg: string; text: string; gradient: string }
> = {
  SS: {
    bg: "rgba(0, 97, 135, 0.15)",
    text: "#006187",
    gradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
  },
  QCC: {
    bg: "rgba(238, 100, 46, 0.15)",
    text: "#EE642E",
    gradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
  },
  QCP: {
    bg: "rgba(95, 206, 160, 0.15)",
    text: "#007B5F",
    gradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
  },
  TEBP: {
    bg: "rgba(1, 89, 82, 0.15)",
    text: "#015952",
    gradient: "linear-gradient(135deg, #015952 0%, #00A6A6 100%)",
  },
  CRP: {
    bg: "rgba(127, 237, 132, 0.15)",
    text: "#5FCEA0",
    gradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
  },
};

// =========================
// Mock Projects (kamu bisa pindahin ke API nanti)
// =========================
export const MOCK_PROJECTS: ProjectItem[] = [
  // SS sample
  {
    type: "SS",
    judulSS: "Membuat Kiosk Mode Pada Aplikasi IT",
    pembuatSS: "Hadiyan",
    status: "review-by-bpi",
    submittedDate: new Date("2024-11-15"),
  },
  {
    type: "SS",
    judulSS: "Implementasi Dashboard Analytics",
    pembuatSS: "Siti Nurhaliza",
    status: "completed",
    submittedDate: new Date("2024-11-05"),
  },

  // QCC sample
  {
    type: "QCC",
    judulSS: "Quality Enhancement Program Q4",
    pembuatSS: "Team Beta",
    status: "in-progress",
    step: 3,
    submittedDate: new Date("2024-11-18"),
  },
  {
    type: "QCC",
    judulSS: "Waste Reduction Project",
    pembuatSS: "Team Delta",
    status: "finished",
    submittedDate: new Date("2024-11-10"),
  },

  // QCP sample
  {
    type: "QCP",
    judulSS: "Supply Chain Optimization Project",
    pembuatSS: "Team Sigma",
    status: "in-progress",
    step: 2,
    submittedDate: new Date("2024-11-19"),
    members: [
      {
        site: "SERA",
        division: "Plant Dev & Engineering",
        department: "Plant Mining Department",
        section: "Plant Loader & Drill",
      },
      {
        site: "MACO",
        division: "IT",
        department: "IT & OT Development Department",
        section: "ERP & Integration System",
      },
    ],
  },

  // TEBP sample
  {
    type: "TEBP",
    judulSS: "Strategic Customer Excellence Program",
    pembuatSS: "Executive Team Beta",
    status: "in-progress",
    step: 4,
    submittedDate: new Date("2024-11-20"),
  },
];

// =========================
// Organization structure (Division → Department → Section)
// (kamu bisa paste lengkap dari kode lama kalau mau)
// =========================
const organizationStructure: Record<string, Record<string, string[]>> = {
    'Accounting': {
      'General Accounting Department': ['AP Section', 'AR Section', 'General Ledger Section'],
      'Tax & Compliance Department': ['Tax Planning Section', 'Tax Reporting Section']
    },
    'Budgeting & Reporting': {
      'Budget Department': ['Budget Planning Section', 'Budget Control Section'],
      'Financial Reporting Department': ['Management Reporting Section', 'External Reporting Section']
    },
    'Cost Management': {
      'Cost Control Department': ['Cost Analysis Section', 'Cost Reporting Section'],
      'Cost Reduction Department': ['Cost Optimization Section', 'Project Evaluation Section']
    },
    'Finance & Treasury': {
      'Treasury Department': ['Cash Management Section', 'Investment Section'],
      'Finance Department': ['Financial Planning Section', 'Corporate Finance Section']
    },
    'General Affairs': {
      'Facility Management Department': ['Building Maintenance Section', 'Security Section'],
      'General Services Department': ['Transportation Section', 'Procurement Section']
    },
    'HC Business Partner': {
      'HCBP Department': ['Business Partner A Section', 'Business Partner B Section'],
      'Organization Development Department': ['Organization Design Section', 'Change Management Section']
    },
    'HC Compliance': {
      'Labor Relations Department': ['Industrial Relations Section', 'Employee Relations Section'],
      'Compensation & Benefits Department': ['Payroll Section', 'Benefits Administration Section']
    },
    'HC Data & System': {
      'HRIS Department': ['System Development Section', 'Data Analytics Section'],
      'HR Operations Department': ['HR Administration Section', 'Records Management Section']
    },
    'IT Application': {
      'Application Development Department': ['ERP Development Section', 'Web & Mobile Section'],
      'Application Support Department': ['Help Desk Section', 'Application Maintenance Section']
    },
    'IT Infrastructure': {
      'Network & Server Department': ['Network Operations Section', 'Server Management Section'],
      'IT Security Department': ['Security Operations Section', 'Cybersecurity Section']
    },
    'IT OT Mine Operation': {
      'OT System Department': ['SCADA Section', 'IoT & Sensor Section'],
      'Mine IT Department': ['Mine System Section', 'Dispatch System Section']
    },
    'Maintenance': {
      'Maintenance Planning Department': ['Planning Section', 'Scheduling Section'],
      'Maintenance Execution Department': ['Heavy Equipment Section', 'Light Vehicle Section']
    },
    'Material & Services': {
      'Procurement Department': ['Strategic Sourcing Section', 'Vendor Management Section'],
      'Warehouse Department': ['Inventory Control Section', 'Logistics Section']
    },
    'Mine Operations': {
      'Mining Operations Department': ['Production Section', 'Drilling & Blasting Section'],
      'Mine Engineering Department': ['Mine Planning Section', 'Survey & Geotech Section']
    },
    'Mine Planning': {
      'Short Term Planning Department': ['Daily Planning Section', 'Weekly Planning Section'],
      'Long Term Planning Department': ['Strategic Planning Section', 'Resource Modeling Section']
    },
    'Mining Contractors': {
      'Contractor Management Department': ['Contract Administration Section', 'Performance Monitoring Section'],
      'Contractor Development Department': ['Training & Development Section', 'Safety Compliance Section']
    },
    'People Development & Culture': {
      'Learning & Development Department': ['Training Section', 'Leadership Development Section'],
      'Culture & Engagement Department': ['Employee Engagement Section', 'Culture Programs Section']
    },
    'Plant': {
      'Plant Operations Department': ['Plant A Section', 'Plant B Section'],
      'Plant Support Department': ['Technical Support Section', 'Quality Control Section']
    },
    'Plant Maintenance': {
      'Plant Maintenance Department': ['Preventive Maintenance Section', 'Corrective Maintenance Section'],
      'Plant Engineering Department': ['Equipment Engineering Section', 'Reliability Section']
    },
    'Production': {
      'Production Planning Department': ['Production Scheduling Section', 'Capacity Planning Section'],
      'Production Control Department': ['Quality Assurance Section', 'Process Control Section']
    }
  };

// =========================
// Chart data (contoh ringkas)
// Kalau mau full: pindahin seluruh ssDataByYearMonth & qccDataByYearMonth dari kode lama ke sini.
// =========================
export type MonthKey =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export type ChartRow = { department: string; Plan: number; Actual: number; Achievement?: number };

export const MONTH_ORDER: MonthKey[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const SS_DATA_BY_YEAR_MONTH: Record<string, Record<MonthKey, ChartRow[]>> = {
  "2024": {
    Jan: [
      { department: "Production", Plan: 15, Actual: 75, Achievement: 500 },
      { department: "Quality", Plan: 10, Actual: 28, Achievement: 280 },
      { department: "Maintenance", Plan: 8, Actual: 22, Achievement: 275 },
      { department: "IT", Plan: 5, Actual: 15, Achievement: 300 },
    ],
    Feb: [
      { department: "Production", Plan: 30, Actual: 85, Achievement: 283 },
      { department: "Quality", Plan: 20, Actual: 44, Achievement: 220 },
      { department: "Maintenance", Plan: 17, Actual: 10, Achievement: 59 },
      { department: "IT", Plan: 7, Actual: 20, Achievement: 286 },
    ],
    Mar: [
      { department: "Production", Plan: 30, Actual: 90, Achievement: 300 },
      { department: "Quality", Plan: 22, Actual: 43, Achievement: 195 },
      { department: "Maintenance", Plan: 17, Actual: 50, Achievement: 294 },
      { department: "IT", Plan: 10, Actual: 13, Achievement: 130 },
    ],
    Apr: [],
    May: [],
    Jun: [],
    Jul: [],
    Aug: [],
    Sep: [],
    Oct: [],
    Nov: [],
    Dec: [],
  },
};

export const QCC_DATA_BY_YEAR_MONTH: Record<string, Record<MonthKey, ChartRow[]>> = {
  "2024": {
    Jan: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Feb: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 2, Actual: 0, Achievement: 0 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Mar: [
      { department: "Production", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Quality", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Apr: [],
    May: [],
    Jun: [],
    Jul: [],
    Aug: [],
    Sep: [],
    Oct: [],
    Nov: [],
    Dec: [],
  },
};
