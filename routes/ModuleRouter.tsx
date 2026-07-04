// src/routes/ModuleRouter.tsx
import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { PATHS, type ModuleId } from "./paths";
import { authUserOrNull } from "../libs/auth";

import { SuggestionSystem } from "../components/modules/SuggestionSystem";
import { QualityControlCircle } from "../components/modules/QualityControlCircle";
import { QualityControlProject } from "../components/modules/QualityControlProject";
import { ExecutiveBusinessPractices } from "../components/modules/ExecutiveBusinessPractices";
import { CostReductionProject } from "../components/modules/CostReductionProject";

const VALID: ModuleId[] = ["ss", "qcc", "qcp", "tebp", "crp"];

export default function ModuleRouter(props: { onBack: () => void; onSubmit: (p: any) => void }) {
  const { id } = useParams();
  const user = authUserOrNull();
  if (!user) return null;

  const moduleId = String(id ?? "").toLowerCase() as ModuleId;
  if (!VALID.includes(moduleId)) return <Navigate to={PATHS.app.create} replace />;

  switch (moduleId) {
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
