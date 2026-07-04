import { 
  BarChart3, 
  LayoutDashboard, 
  FileText, 
  Download,
  Users,
  Target,
  Trophy,
  Activity
} from "lucide-react";
import { ModuleId, ModuleConfig } from "./types";

export const YEARS = ["2023", "2024", "2025", "2026"] as const;
export const CURRENT_YEAR = new Date().getFullYear().toString();
export const CURRENT_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()];

export const MONTHS = [
  { value: "all", label: "All Month" },
  { value: "Jan", label: "January" },
  { value: "Feb", label: "February" },
  { value: "Mar", label: "March" },
  { value: "Apr", label: "April" },
  { value: "May", label: "May" },
  { value: "Jun", label: "June" },
  { value: "Jul", label: "July" },
  { value: "Aug", label: "August" },
  { value: "Sep", label: "September" },
  { value: "Oct", label: "October" },
  { value: "Nov", label: "November" },
  { value: "Dec", label: "December" },
] as const;

export const MONTH_ORDER = ["all", ...MONTHS.filter(m => m.value !== "all").map((m) => m.value)];

export const MODULE_TYPE_MAP: Record<ModuleId, any> = {
  ss: "SS",
  qcc: "QCC",
  qcp: "QCP",
  tebp: "TEBP",
  crp: "CRP",
};

export const MODULE_THEME: Record<
  ModuleId,
  {
    baseGradient: string;
    hoverGradient: string;
    boxShadow: { normal: string; active: string };
    panelBg: string;
    panelBorder: string;
    panelTitle: string;
  }
> = {
  ss: {
    baseGradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
    hoverGradient: "linear-gradient(135deg, #004D6B 0%, #005A48 100%)",
    boxShadow: {
      normal: "0 4px 12px rgba(0, 97, 135, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active: "0 6px 16px rgba(0, 97, 135, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(0, 97, 135, 0.1)",
    panelBorder: "#006187",
    panelTitle: "#006187",
  },
  qcc: {
    baseGradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    hoverGradient: "linear-gradient(135deg, #D66B1E 0%, #D5511A 100%)",
    boxShadow: {
      normal: "0 4px 12px rgba(238, 100, 46, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active: "0 6px 16px rgba(238, 100, 46, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(238, 100, 46, 0.1)",
    panelBorder: "#EE642E",
    panelTitle: "#EE642E",
  },
  qcp: {
    baseGradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    hoverGradient: "linear-gradient(135deg, #4AB88A 0%, #005A48 100%)",
    boxShadow: {
      normal: "0 4px 12px rgba(95, 206, 160, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active: "0 6px 16px rgba(95, 206, 160, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(95, 206, 160, 0.1)",
    panelBorder: "#5FCEA0",
    panelTitle: "#007B5F",
  },
  tebp: {
    baseGradient: "linear-gradient(135deg, #006D6F 0%, #00A6A6 100%)",
    hoverGradient: "linear-gradient(135deg, #00585A 0%, #009090 100%)",
    boxShadow: {
      normal: "0 4px 12px rgba(0, 109, 111, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active: "0 6px 16px rgba(0, 109, 111, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(1, 89, 82, 0.1)",
    panelBorder: "#015952",
    panelTitle: "#015952",
  },
  crp: {
    baseGradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
    hoverGradient: "linear-gradient(135deg, #68D56D 0%, #4AB88A 100%)",
    boxShadow: {
      normal: "0 4px 12px rgba(127, 237, 132, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active: "0 6px 16px rgba(127, 237, 132, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(127, 237, 132, 0.1)",
    panelBorder: "#7FED84",
    panelTitle: "#5FCEA0",
  },
};

export const SS_STATUS = {
  REVIEW_LEADER: "Review by leader",
  REJECT_LEADER: "Reject by leader",
  REVIEW_BPI: "Review by bpi",
  COMPLETE: "Complete",
} as const;

export const LEGACY_SS_STATUS_TO_NEW: Record<string, string> = {
  "review-by-leader": SS_STATUS.REVIEW_LEADER,
  "reject-by-leader": SS_STATUS.REJECT_LEADER,
  "review-by-bpi": SS_STATUS.REVIEW_BPI,
  completed: SS_STATUS.COMPLETE,
  "review by leader": SS_STATUS.REVIEW_LEADER,
  "reject by leader": SS_STATUS.REJECT_LEADER,
  "review by bpi": SS_STATUS.REVIEW_BPI,
  complete: SS_STATUS.COMPLETE,
  done: SS_STATUS.COMPLETE,
  finished: SS_STATUS.COMPLETE,
};
