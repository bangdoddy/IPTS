// src/components/questionnaire/dummyData.ts

export type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
export type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

export type ProjectStatus =
  | "review-by-leader"
  | "review-by-bpi"
  | "completed"
  | "registered"
  | "in-progress"
  | "finished";

export type ProjectMember = {
  site: string;
  division: string;
  department: string;
  section: string;
};

export type DummyProject = {
  type: ProjectType;
  judulSS: string;
  pembuatSS: string;
  status: ProjectStatus;
  step?: number;
  submittedDate: Date;
  members?: ProjectMember[]; // khusus QCP
};

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

export type MonthlyPlanActual = {
  department: string;
  Plan: number;
  Actual: number;
  Achievement?: number; // kalau butuh
};

export type YearMonthMap = Record<string, Record<MonthKey, MonthlyPlanActual[]>>;

// =====================================
// Dummy projects (dipindah utuh)
// =====================================
export const DUMMY_PROJECTS: DummyProject[] = [
  // SS Projects - 10 data
  {
    type: "SS",
    judulSS: "Membuat Kiosk Mode Pada Aplikasi IT",
    pembuatSS: "Hadiyan",
    status: "review-by-bpi",
    submittedDate: new Date("2024-11-15"),
  },
  {
    type: "SS",
    judulSS: "Optimasi Sistem Monitoring Real-Time",
    pembuatSS: "Andi Wijaya",
    status: "review-by-leader",
    submittedDate: new Date("2024-11-10"),
  },
  {
    type: "SS",
    judulSS: "Implementasi Dashboard Analytics",
    pembuatSS: "Siti Nurhaliza",
    status: "completed",
    submittedDate: new Date("2024-11-05"),
  },
  {
    type: "SS",
    judulSS: "Automasi Proses Approval Document",
    pembuatSS: "Budi Santoso",
    status: "review-by-bpi",
    submittedDate: new Date("2024-11-12"),
  },
  {
    type: "SS",
    judulSS: "Digital Work Instruction System",
    pembuatSS: "Dewi Kartika",
    status: "review-by-leader",
    submittedDate: new Date("2024-11-18"),
  },
  {
    type: "SS",
    judulSS: "Safety Equipment Tracking App",
    pembuatSS: "Ahmad Fauzi",
    status: "review-by-bpi",
    submittedDate: new Date("2024-11-20"),
  },
  {
    type: "SS",
    judulSS: "Energy Monitoring Dashboard",
    pembuatSS: "Rina Melati",
    status: "completed",
    submittedDate: new Date("2024-11-08"),
  },
  {
    type: "SS",
    judulSS: "Inventory Management Optimization",
    pembuatSS: "Hendra Gunawan",
    status: "review-by-leader",
    submittedDate: new Date("2024-11-14"),
  },
  {
    type: "SS",
    judulSS: "Quality Control Checklist Mobile App",
    pembuatSS: "Linda Susanti",
    status: "review-by-bpi",
    submittedDate: new Date("2024-11-22"),
  },
  {
    type: "SS",
    judulSS: "Parking Space Management System",
    pembuatSS: "Yusuf Rahman",
    status: "completed",
    submittedDate: new Date("2024-11-03"),
  },

  // QCC Projects - 10 data
  {
    type: "QCC",
    judulSS: "Improvement Process Manufacturing Line 1",
    pembuatSS: "Team Alpha",
    status: "registered",
    submittedDate: new Date("2024-11-20"),
  },
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
    judulSS: "Safety Improvement Initiative",
    pembuatSS: "Team Gamma",
    status: "in-progress",
    step: 5,
    submittedDate: new Date("2024-11-15"),
  },
  {
    type: "QCC",
    judulSS: "Waste Reduction Project",
    pembuatSS: "Team Delta",
    status: "finished",
    submittedDate: new Date("2024-11-10"),
  },
  {
    type: "QCC",
    judulSS: "Assembly Line Efficiency Improvement",
    pembuatSS: "Team Epsilon",
    status: "in-progress",
    step: 2,
    submittedDate: new Date("2024-11-22"),
  },
  {
    type: "QCC",
    judulSS: "Packaging Process Optimization",
    pembuatSS: "Team Zeta",
    status: "in-progress",
    step: 7,
    submittedDate: new Date("2024-11-17"),
  },
  {
    type: "QCC",
    judulSS: "Equipment Downtime Reduction",
    pembuatSS: "Team Theta",
    status: "registered",
    submittedDate: new Date("2024-11-21"),
  },
  {
    type: "QCC",
    judulSS: "First Pass Yield Enhancement",
    pembuatSS: "Team Kappa",
    status: "in-progress",
    step: 4,
    submittedDate: new Date("2024-11-16"),
  },
  {
    type: "QCC",
    judulSS: "Ergonomics Workplace Improvement",
    pembuatSS: "Team Lambda",
    status: "in-progress",
    step: 6,
    submittedDate: new Date("2024-11-13"),
  },
  {
    type: "QCC",
    judulSS: "Material Handling Optimization",
    pembuatSS: "Team Omega",
    status: "finished",
    submittedDate: new Date("2024-11-07"),
  },

  // QCP Projects - 10 data
  {
    type: "QCP",
    judulSS: "Cross-Department Quality Initiative",
    pembuatSS: "Team Phoenix",
    status: "registered",
    submittedDate: new Date("2024-11-22"),
    members: [
      {
        site: "JAHO",
        division: "IT",
        department: "IT & OT Development Department",
        section: "ERP & Integration System",
      },
      {
        site: "ADMO",
        division: "Finance & Accounting",
        department: "Finance & Asset Management Department",
        section: "Plant Budget & Cost Control",
      },
    ],
  },
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
      {
        site: "JAHO",
        division: "Finance & Accounting",
        department: "Accounting, Payable & Compl Department",
        section: "General Accounting",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Production Quality Enhancement",
    pembuatSS: "Team Omega",
    status: "in-progress",
    step: 4,
    submittedDate: new Date("2024-11-16"),
    members: [
      {
        site: "JAHO",
        division: "Plant Dev & Engineering",
        department: "Plant Department",
        section: "Plant Development & GOH",
      },
      {
        site: "SERA",
        division: "IT",
        department: "IT Planning & Infrastructure Department",
        section: "IT Infrastructure & Comm",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Integrated Quality Management System",
    pembuatSS: "Team Nexus",
    status: "in-progress",
    step: 6,
    submittedDate: new Date("2024-11-14"),
    members: [
      {
        site: "ADMO",
        division: "Finance & Accounting",
        department: "Accounting, Payable & Compl Department",
        section: "General Accounting",
      },
      {
        site: "SERA",
        division: "Plant Dev & Engineering",
        department: "Plant Hauling Department",
        section: "Plant Hauler & Wheel Loader",
      },
      {
        site: "MACO",
        division: "IT",
        department: "IT & OT Development Department",
        section: "Application System",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Customer Satisfaction Improvement",
    pembuatSS: "Team Apex",
    status: "finished",
    submittedDate: new Date("2024-11-08"),
    members: [
      {
        site: "MACO",
        division: "IT",
        department: "IT & OT Development Department",
        section: "ERP & Integration System",
      },
      {
        site: "JAHO",
        division: "Finance & Accounting",
        department: "Plant Budget & Contract Department",
        section: "Plant Budget & Cost Control",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Equipment Reliability Program",
    pembuatSS: "Team Vertex",
    status: "finished",
    submittedDate: new Date("2024-11-01"),
    members: [
      {
        site: "SERA",
        division: "Plant Dev & Engineering",
        department: "Plant Engineering Department",
        section: "Equipment Engineer",
      },
      {
        site: "ADMO",
        division: "Finance & Accounting",
        department: "Finance & Asset Management Department",
        section: "Plant Budget & Cost Control",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Supplier Quality Management",
    pembuatSS: "Team Titan",
    status: "in-progress",
    step: 3,
    submittedDate: new Date("2024-11-20"),
    members: [
      {
        site: "JAHO",
        division: "Plant Dev & Engineering",
        department: "Plant Support Equipment Department",
        section: "Plant Contract & Equipment Mgmt",
      },
      {
        site: "SERA",
        division: "Finance & Accounting",
        department: "Accounting, Payable & Compl Department",
        section: "AP Control",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Automated Inspection System Implementation",
    pembuatSS: "Team Vanguard",
    status: "in-progress",
    step: 5,
    submittedDate: new Date("2024-11-17"),
    members: [
      {
        site: "MACO",
        division: "Plant Dev & Engineering",
        department: "Plant System Development Department",
        section: "Plant Technical Assessment",
      },
      {
        site: "JAHO",
        division: "IT",
        department: "IT & OT Development Department",
        section: "Application System",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Product Traceability Enhancement",
    pembuatSS: "Team Zenith",
    status: "registered",
    submittedDate: new Date("2024-11-21"),
    members: [
      {
        site: "SERA",
        division: "Plant Dev & Engineering",
        department: "Operation & Plant People Dev Department",
        section: "Operation People Development",
      },
      {
        site: "ADMO",
        division: "IT",
        department: "IT Planning & Infrastructure Department",
        section: "IT Infrastructure & Comm",
      },
    ],
  },
  {
    type: "QCP",
    judulSS: "Statistical Process Control Implementation",
    pembuatSS: "Team Catalyst",
    status: "in-progress",
    step: 8,
    submittedDate: new Date("2024-11-12"),
    members: [
      {
        site: "JAHO",
        division: "Plant Dev & Engineering",
        department: "Plant Overhaul & Comex Department",
        section: "Plant Overhaul",
      },
      {
        site: "MACO",
        division: "Finance & Accounting",
        department: "Accounting, Payable & Compl Department",
        section: "General Accounting",
      },
      {
        site: "SERA",
        division: "IT",
        department: "IT & OT Development Department",
        section: "ERP & Integration System",
      },
    ],
  },

  // TEBP Projects - 3 data
  {
    type: "TEBP",
    judulSS: "Digital Transformation Strategy",
    pembuatSS: "Executive Team Alpha",
    status: "registered",
    submittedDate: new Date("2024-11-21"),
  },
  {
    type: "TEBP",
    judulSS: "Strategic Customer Excellence Program",
    pembuatSS: "Executive Team Beta",
    status: "in-progress",
    step: 4,
    submittedDate: new Date("2024-11-20"),
  },
  {
    type: "TEBP",
    judulSS: "Sustainability and ESG Integration",
    pembuatSS: "Executive Team Gamma",
    status: "finished",
    submittedDate: new Date("2024-11-15"),
  },
];

// =====================================
// SS monthly data (dipindah dari file)
// CATATAN: aku masukin 2024 & 2025 lengkap
// Untuk 2023 kamu tinggal paste pola yang sama
// =====================================
export const SS_DATA_BY_YEAR_MONTH: YearMonthMap = {
  // ✅ kalau mau, paste 2023 dari file lama ke sini juga
  "2024": {
    Jan: [
      { department: "Production", Plan: 15, Actual: 75, Achievement: 500 },
      { department: "Quality", Plan: 10, Actual: 28, Achievement: 280 },
      { department: "Maintenance", Plan: 8, Actual: 22, Achievement: 275 },
      { department: "Logistics", Plan: 7, Actual: 25, Achievement: 357 },
      { department: "IT", Plan: 5, Actual: 15, Achievement: 300 },
      { department: "HR", Plan: 3, Actual: 8, Achievement: 267 },
    ],
    Feb: [
      { department: "Production", Plan: 30, Actual: 85, Achievement: 283 },
      { department: "Quality", Plan: 20, Actual: 44, Achievement: 220 },
      { department: "Maintenance", Plan: 17, Actual: 10, Achievement: 59 },
      { department: "Logistics", Plan: 15, Actual: 30, Achievement: 200 },
      { department: "IT", Plan: 7, Actual: 20, Achievement: 286 },
      { department: "HR", Plan: 5, Actual: 2, Achievement: 40 },
    ],
    Mar: [
      { department: "Production", Plan: 30, Actual: 90, Achievement: 300 },
      { department: "Quality", Plan: 22, Actual: 43, Achievement: 195 },
      { department: "Maintenance", Plan: 17, Actual: 50, Achievement: 294 },
      { department: "Logistics", Plan: 16, Actual: 27, Achievement: 169 },
      { department: "IT", Plan: 10, Actual: 13, Achievement: 130 },
      { department: "HR", Plan: 5, Actual: 10, Achievement: 200 },
    ],
    Apr: [
      { department: "Production", Plan: 50, Actual: 80, Achievement: 160 },
      { department: "Quality", Plan: 36, Actual: 37, Achievement: 103 },
      { department: "Maintenance", Plan: 26, Actual: 30, Achievement: 115 },
      { department: "Logistics", Plan: 24, Actual: 23, Achievement: 96 },
      { department: "IT", Plan: 13, Actual: 14, Achievement: 108 },
      { department: "HR", Plan: 4, Actual: 2, Achievement: 50 },
    ],
    May: [
      { department: "Production", Plan: 50, Actual: 85, Achievement: 170 },
      { department: "Quality", Plan: 34, Actual: 25, Achievement: 74 },
      { department: "Maintenance", Plan: 27, Actual: 30, Achievement: 111 },
      { department: "Logistics", Plan: 23, Actual: 23, Achievement: 100 },
      { department: "IT", Plan: 13, Actual: 16, Achievement: 123 },
      { department: "HR", Plan: 9, Actual: 5, Achievement: 56 },
    ],
    Jun: [
      { department: "Production", Plan: 50, Actual: 95, Achievement: 190 },
      { department: "Quality", Plan: 36, Actual: 74, Achievement: 206 },
      { department: "Maintenance", Plan: 27, Actual: 36, Achievement: 133 },
      { department: "Logistics", Plan: 23, Actual: 30, Achievement: 130 },
      { department: "IT", Plan: 14, Actual: 17, Achievement: 121 },
      { department: "HR", Plan: 4, Actual: 3, Achievement: 75 },
    ],
    Jul: [
      { department: "Production", Plan: 50, Actual: 88, Achievement: 176 },
      { department: "Quality", Plan: 34, Actual: 40, Achievement: 118 },
      { department: "Maintenance", Plan: 26, Actual: 34, Achievement: 131 },
      { department: "Logistics", Plan: 24, Actual: 30, Achievement: 125 },
      { department: "IT", Plan: 16, Actual: 13, Achievement: 81 },
      { department: "HR", Plan: 4, Actual: 1, Achievement: 25 },
    ],
    Aug: [
      { department: "Production", Plan: 53, Actual: 98, Achievement: 185 },
      { department: "Quality", Plan: 36, Actual: 50, Achievement: 139 },
      { department: "Maintenance", Plan: 28, Actual: 43, Achievement: 154 },
      { department: "Logistics", Plan: 26, Actual: 30, Achievement: 115 },
      { department: "IT", Plan: 17, Actual: 24, Achievement: 141 },
      { department: "HR", Plan: 3, Actual: 7, Achievement: 233 },
    ],
    Sep: [
      { department: "Production", Plan: 57, Actual: 90, Achievement: 158 },
      { department: "Quality", Plan: 40, Actual: 43, Achievement: 108 },
      { department: "Maintenance", Plan: 29, Actual: 33, Achievement: 114 },
      { department: "Logistics", Plan: 27, Actual: 30, Achievement: 111 },
      { department: "IT", Plan: 17, Actual: 16, Achievement: 94 },
      { department: "HR", Plan: 3, Actual: 1, Achievement: 33 },
    ],
    Oct: [
      { department: "Production", Plan: 53, Actual: 85, Achievement: 160 },
      { department: "Quality", Plan: 37, Actual: 28, Achievement: 76 },
      { department: "Maintenance", Plan: 30, Actual: 25, Achievement: 83 },
      { department: "Logistics", Plan: 27, Actual: 22, Achievement: 81 },
      { department: "IT", Plan: 16, Actual: 12, Achievement: 75 },
      { department: "HR", Plan: 3, Actual: 1, Achievement: 33 },
    ],
    Nov: [
      { department: "Production", Plan: 40, Actual: 78, Achievement: 195 },
      { department: "Quality", Plan: 27, Actual: 25, Achievement: 93 },
      { department: "Maintenance", Plan: 20, Actual: 18, Achievement: 90 },
      { department: "Logistics", Plan: 18, Actual: 16, Achievement: 89 },
      { department: "IT", Plan: 17, Actual: 14, Achievement: 82 },
      { department: "HR", Plan: 2, Actual: 1, Achievement: 50 },
    ],
    Dec: [
      { department: "Production", Plan: 40, Actual: 72, Achievement: 180 },
      { department: "Quality", Plan: 30, Actual: 28, Achievement: 93 },
      { department: "Maintenance", Plan: 23, Actual: 20, Achievement: 87 },
      { department: "Logistics", Plan: 20, Actual: 18, Achievement: 90 },
      { department: "IT", Plan: 10, Actual: 8, Achievement: 80 },
      { department: "HR", Plan: 2, Actual: 1, Achievement: 50 },
    ],
  },

  "2025": {
    Jan: [
      { department: "Production", Plan: 18, Actual: 80, Achievement: 444 },
      { department: "Quality", Plan: 12, Actual: 32, Achievement: 267 },
      { department: "Maintenance", Plan: 10, Actual: 26, Achievement: 260 },
      { department: "Logistics", Plan: 8, Actual: 28, Achievement: 350 },
      { department: "IT", Plan: 6, Actual: 18, Achievement: 300 },
      { department: "HR", Plan: 4, Actual: 10, Achievement: 250 },
    ],
    Feb: [
      { department: "Production", Plan: 35, Actual: 90, Achievement: 257 },
      { department: "Quality", Plan: 24, Actual: 50, Achievement: 208 },
      { department: "Maintenance", Plan: 20, Actual: 14, Achievement: 70 },
      { department: "Logistics", Plan: 18, Actual: 35, Achievement: 194 },
      { department: "IT", Plan: 9, Actual: 24, Achievement: 267 },
      { department: "HR", Plan: 6, Actual: 4, Achievement: 67 },
    ],
    Mar: [
      { department: "Production", Plan: 35, Actual: 95, Achievement: 271 },
      { department: "Quality", Plan: 26, Actual: 50, Achievement: 192 },
      { department: "Maintenance", Plan: 20, Actual: 58, Achievement: 290 },
      { department: "Logistics", Plan: 19, Actual: 32, Achievement: 168 },
      { department: "IT", Plan: 12, Actual: 16, Achievement: 133 },
      { department: "HR", Plan: 6, Actual: 12, Achievement: 200 },
    ],
    Apr: [
      { department: "Production", Plan: 55, Actual: 88, Achievement: 160 },
      { department: "Quality", Plan: 40, Actual: 43, Achievement: 108 },
      { department: "Maintenance", Plan: 30, Actual: 35, Achievement: 117 },
      { department: "Logistics", Plan: 28, Actual: 27, Achievement: 96 },
      { department: "IT", Plan: 15, Actual: 17, Achievement: 113 },
      { department: "HR", Plan: 5, Actual: 3, Achievement: 60 },
    ],
    May: [
      { department: "Production", Plan: 55, Actual: 92, Achievement: 167 },
      { department: "Quality", Plan: 38, Actual: 30, Achievement: 79 },
      { department: "Maintenance", Plan: 32, Actual: 35, Achievement: 109 },
      { department: "Logistics", Plan: 27, Actual: 27, Achievement: 100 },
      { department: "IT", Plan: 15, Actual: 19, Achievement: 127 },
      { department: "HR", Plan: 10, Actual: 6, Achievement: 60 },
    ],
    Jun: [
      { department: "Production", Plan: 55, Actual: 98, Achievement: 178 },
      { department: "Quality", Plan: 40, Actual: 85, Achievement: 213 },
      { department: "Maintenance", Plan: 32, Actual: 42, Achievement: 131 },
      { department: "Logistics", Plan: 27, Actual: 35, Achievement: 130 },
      { department: "IT", Plan: 16, Actual: 20, Achievement: 125 },
      { department: "HR", Plan: 5, Actual: 4, Achievement: 80 },
    ],
    Jul: [
      { department: "Production", Plan: 55, Actual: 90, Achievement: 164 },
      { department: "Quality", Plan: 38, Actual: 46, Achievement: 121 },
      { department: "Maintenance", Plan: 30, Actual: 40, Achievement: 133 },
      { department: "Logistics", Plan: 28, Actual: 35, Achievement: 125 },
      { department: "IT", Plan: 18, Actual: 16, Achievement: 89 },
      { department: "HR", Plan: 5, Actual: 2, Achievement: 40 },
    ],
    Aug: [
      { department: "Production", Plan: 60, Actual: 100, Achievement: 167 },
      { department: "Quality", Plan: 40, Actual: 58, Achievement: 145 },
      { department: "Maintenance", Plan: 32, Actual: 50, Achievement: 156 },
      { department: "Logistics", Plan: 30, Actual: 35, Achievement: 117 },
      { department: "IT", Plan: 19, Actual: 28, Achievement: 147 },
      { department: "HR", Plan: 4, Actual: 8, Achievement: 200 },
    ],
    Sep: [
      { department: "Production", Plan: 63, Actual: 93, Achievement: 148 },
      { department: "Quality", Plan: 44, Actual: 50, Achievement: 114 },
      { department: "Maintenance", Plan: 34, Actual: 39, Achievement: 115 },
      { department: "Logistics", Plan: 31, Actual: 35, Achievement: 113 },
      { department: "IT", Plan: 19, Actual: 19, Achievement: 100 },
      { department: "HR", Plan: 4, Actual: 2, Achievement: 50 },
    ],
    Oct: [
      { department: "Production", Plan: 60, Actual: 87, Achievement: 145 },
      { department: "Quality", Plan: 42, Actual: 34, Achievement: 81 },
      { department: "Maintenance", Plan: 35, Actual: 30, Achievement: 86 },
      { department: "Logistics", Plan: 31, Actual: 26, Achievement: 84 },
      { department: "IT", Plan: 18, Actual: 15, Achievement: 83 },
      { department: "HR", Plan: 4, Actual: 2, Achievement: 50 },
    ],
    Nov: [
      { department: "Production", Plan: 45, Actual: 80, Achievement: 178 },
      { department: "Quality", Plan: 31, Actual: 30, Achievement: 97 },
      { department: "Maintenance", Plan: 24, Actual: 22, Achievement: 92 },
      { department: "Logistics", Plan: 21, Actual: 19, Achievement: 90 },
      { department: "IT", Plan: 19, Actual: 17, Achievement: 89 },
      { department: "HR", Plan: 3, Actual: 2, Achievement: 67 },
    ],
    Dec: [
      { department: "Production", Plan: 45, Actual: 75, Achievement: 167 },
      { department: "Quality", Plan: 34, Actual: 34, Achievement: 100 },
      { department: "Maintenance", Plan: 27, Actual: 24, Achievement: 89 },
      { department: "Logistics", Plan: 24, Actual: 22, Achievement: 92 },
      { department: "IT", Plan: 12, Actual: 10, Achievement: 83 },
      { department: "HR", Plan: 3, Actual: 2, Achievement: 67 },
    ],
  },
};

// =====================================
// QCC monthly data (dipindah dari file)
// =====================================
export const QCC_DATA_BY_YEAR_MONTH: YearMonthMap = {
  "2024": {
    Jan: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Feb: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 2, Actual: 0, Achievement: 0 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Mar: [
      { department: "Production", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Quality", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Apr: [
      { department: "Production", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "Quality", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    May: [
      { department: "Production", Plan: 8, Actual: 6, Achievement: 75 },
      { department: "Quality", Plan: 6, Actual: 6, Achievement: 100 },
      { department: "Maintenance", Plan: 4, Actual: 3, Achievement: 75 },
      { department: "Logistics", Plan: 4, Actual: 3, Achievement: 75 },
      { department: "IT", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "HR", Plan: 3, Actual: 2, Achievement: 67 },
    ],
    Jun: [
      { department: "Production", Plan: 2, Actual: 2, Achievement: 100 },
      { department: "Quality", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 0, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Jul: [
      { department: "Production", Plan: 2, Actual: 11, Achievement: 550 },
      { department: "Quality", Plan: 2, Actual: 9, Achievement: 450 },
      { department: "Maintenance", Plan: 1, Actual: 7, Achievement: 700 },
      { department: "Logistics", Plan: 2, Actual: 8, Achievement: 400 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Aug: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Sep: [
      { department: "Production", Plan: 7, Actual: 7, Achievement: 100 },
      { department: "Quality", Plan: 5, Actual: 5, Achievement: 100 },
      { department: "Maintenance", Plan: 3, Actual: 3, Achievement: 100 },
      { department: "Logistics", Plan: 4, Actual: 4, Achievement: 100 },
      { department: "IT", Plan: 2, Actual: 2, Achievement: 100 },
      { department: "HR", Plan: 2, Actual: 2, Achievement: 100 },
    ],
    Oct: [
      { department: "Production", Plan: 6, Actual: 3, Achievement: 50 },
      { department: "Quality", Plan: 4, Actual: 2, Achievement: 50 },
      { department: "Maintenance", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Logistics", Plan: 3, Actual: 1, Achievement: 33 },
      { department: "IT", Plan: 2, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Nov: [
      { department: "Production", Plan: 2, Actual: 4, Achievement: 200 },
      { department: "Quality", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Dec: [
      { department: "Production", Plan: 2, Actual: 4, Achievement: 200 },
      { department: "Quality", Plan: 2, Actual: 3, Achievement: 150 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
  },

  "2025": {
    Jan: [
      { department: "Production", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Quality", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Feb: [
      { department: "Production", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "Quality", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Maintenance", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 0, Achievement: 0 },
      { department: "HR", Plan: 1, Actual: 0, Achievement: 0 },
    ],
    Mar: [
      { department: "Production", Plan: 3, Actual: 4, Achievement: 133 },
      { department: "Quality", Plan: 2, Actual: 4, Achievement: 200 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Apr: [
      { department: "Production", Plan: 4, Actual: 3, Achievement: 75 },
      { department: "Quality", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "Maintenance", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "Logistics", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    May: [
      { department: "Production", Plan: 10, Actual: 8, Achievement: 80 },
      { department: "Quality", Plan: 7, Actual: 7, Achievement: 100 },
      { department: "Maintenance", Plan: 5, Actual: 4, Achievement: 80 },
      { department: "Logistics", Plan: 5, Actual: 4, Achievement: 80 },
      { department: "IT", Plan: 4, Actual: 3, Achievement: 75 },
      { department: "HR", Plan: 4, Actual: 3, Achievement: 75 },
    ],
    Jun: [
      { department: "Production", Plan: 3, Actual: 3, Achievement: 100 },
      { department: "Quality", Plan: 2, Actual: 2, Achievement: 100 },
      { department: "Maintenance", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Jul: [
      { department: "Production", Plan: 3, Actual: 13, Achievement: 433 },
      { department: "Quality", Plan: 2, Actual: 10, Achievement: 500 },
      { department: "Maintenance", Plan: 1, Actual: 8, Achievement: 800 },
      { department: "Logistics", Plan: 2, Actual: 9, Achievement: 450 },
      { department: "IT", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "HR", Plan: 1, Actual: 2, Achievement: 200 },
    ],
    Aug: [
      { department: "Production", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "Quality", Plan: 2, Actual: 2, Achievement: 100 },
      { department: "Maintenance", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "Logistics", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Sep: [
      { department: "Production", Plan: 8, Actual: 8, Achievement: 100 },
      { department: "Quality", Plan: 6, Actual: 6, Achievement: 100 },
      { department: "Maintenance", Plan: 4, Actual: 4, Achievement: 100 },
      { department: "Logistics", Plan: 5, Actual: 5, Achievement: 100 },
      { department: "IT", Plan: 2, Actual: 2, Achievement: 100 },
      { department: "HR", Plan: 2, Actual: 2, Achievement: 100 },
    ],
    Oct: [
      { department: "Production", Plan: 7, Actual: 4, Achievement: 57 },
      { department: "Quality", Plan: 5, Actual: 3, Achievement: 60 },
      { department: "Maintenance", Plan: 3, Actual: 2, Achievement: 67 },
      { department: "Logistics", Plan: 4, Actual: 2, Achievement: 50 },
      { department: "IT", Plan: 2, Actual: 1, Achievement: 50 },
      { department: "HR", Plan: 2, Actual: 1, Achievement: 50 },
    ],
    Nov: [
      { department: "Production", Plan: 3, Actual: 5, Achievement: 167 },
      { department: "Quality", Plan: 2, Actual: 4, Achievement: 200 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
    Dec: [
      { department: "Production", Plan: 3, Actual: 5, Achievement: 167 },
      { department: "Quality", Plan: 2, Actual: 4, Achievement: 200 },
      { department: "Maintenance", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "Logistics", Plan: 1, Actual: 2, Achievement: 200 },
      { department: "IT", Plan: 1, Actual: 1, Achievement: 100 },
      { department: "HR", Plan: 1, Actual: 1, Achievement: 100 },
    ],
  },
};
