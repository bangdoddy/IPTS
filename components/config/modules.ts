// src/config/modules.ts
import type { ComponentType } from "react";
import { Lightbulb, Users, ClipboardCheck, TrendingUp, DollarSign } from "lucide-react";
import type { ModuleId } from "../../routes/paths";

export type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

/** Label singkat untuk Quick Filter dashboard */
export const MODULE_QUICK_LABEL: Record<ModuleId, string> = {
  ss: "SS",
  qcc: "QCC",
  qcp: "QCP",
  tebp: "TEBP",
  crp: "CRP",
};

export type ModuleConfig = {
  id: ModuleId;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  bgColor: string;
  iconColor: string;
  type: ProjectType;
};

export const MODULES: ModuleConfig[] = [
  {
    id: "ss",
    type: "SS",
    title: "Suggestion System",
    description: "Individual improvement ideas that can be implemented quickly",
    icon: Lightbulb,
    gradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
    bgColor: "rgba(0, 97, 135, 0.1)",
    iconColor: "#006187",
  },
  {
    id: "qcc",
    type: "QCC",
    title: "Quality Control Circle",
    description: "Team improvement within one department",
    icon: Users,
    gradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    bgColor: "rgba(238, 100, 46, 0.1)",
    iconColor: "#EE642E",
  },
  {
    id: "qcp",
    type: "QCP",
    title: "Quality Control Project",
    description: "Cross-department improvement initiative with measurable outcomes",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    bgColor: "rgba(95, 206, 160, 0.1)",
    iconColor: "#007B5F",
  },
  {
    id: "tebp",
    type: "TEBP",
    title: "The Executive Business Practices",
    description: "Strategic improvements requiring management approval",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #015952 0%, #EE642E 100%)",
    bgColor: "rgba(1, 89, 82, 0.1)",
    iconColor: "#015952",
  },
  {
    id: "crp",
    type: "CRP",
    title: "Cost Reduction Project",
    description: "Measurable cost savings initiatives",
    icon: DollarSign,
    gradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
    bgColor: "rgba(127, 237, 132, 0.1)",
    iconColor: "#5FCEA0",
  },
];
