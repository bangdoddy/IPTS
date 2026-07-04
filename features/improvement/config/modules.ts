import { Lightbulb, Users, ClipboardCheck, TrendingUp, DollarSign } from "lucide-react";

export type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";
export type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";

export type ModuleConfig = {
  id: ModuleId;
  type: ProjectType;
  title: string;
  description: string;
  icon: any; // lucide icon type (biar simple)
  gradient: string;
  bgColor: string;
  iconColor: string;
};

export const MODULES: ModuleConfig[] = [
  {
    id: "ss",
    type: "SS",
    title: "Suggestion System",
    description: "Perbaikan yang dilaksanakan secara perorangan dengan waktu yang singkat",
    icon: Lightbulb,
    gradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
    bgColor: "rgba(0, 97, 135, 0.1)",
    iconColor: "#006187",
  },
  {
    id: "qcc",
    type: "QCC",
    title: "Quality Control Circle",
    description: "Perbaikan secara kelompok dengan melibatkan satu department",
    icon: Users,
    gradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    bgColor: "rgba(238, 100, 46, 0.1)",
    iconColor: "#EE642E",
  },
  {
    id: "qcp",
    type: "QCP",
    title: "Quality Control Project",
    description: "Perbaikan secara kelompok dengan melibatkan lintas department",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    bgColor: "rgba(95, 206, 160, 0.1)",
    iconColor: "#007B5F",
  },
  {
    id: "tebp",
    type: "TEBP",
    title: "The Executive Business Practices",
    description: "Peningkatan praktik bisnis strategis yang memerlukan persetujuan manajemen",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #015952 0%, #EE642E 100%)",
    bgColor: "rgba(1, 89, 82, 0.1)",
    iconColor: "#015952",
  },
  {
    id: "crp",
    type: "CRP",
    title: "Cost Reduction Project",
    description: "Inisiatif fokus anggaran dengan penghematan biaya yang terukur",
    icon: DollarSign,
    gradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
    bgColor: "rgba(127, 237, 132, 0.1)",
    iconColor: "#5FCEA0",
  },
];
