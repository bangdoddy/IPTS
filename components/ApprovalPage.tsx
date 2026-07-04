// src/ApprovalPage.tsx
import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Approval } from "../components/approval";
import { ApprovalQcc } from "../components/approvalqcc";
import { ApprovalQcp } from "../components/approvalqcp";
import { getCookieJson } from "../libs/cookie";
import { PATHS } from "../routes/paths";

type AuthCookie = {
  actorType?: string;
  actortype?: string;
  [k: string]: any;
};

export default function ApprovalPage({ moduleId = "ss" }: { moduleId?: "ss" | "qcc" | "qcp" }) {
  const canAccess = useMemo(() => {
    const val = getCookieJson<AuthCookie>("inovasis_auth");
    const actorTypeRaw = String(val?.actorType ?? val?.actortype ?? "").toUpperCase();
    return actorTypeRaw === "REVIEWER" || actorTypeRaw === "SUPERIOR";
  }, []);

  if (!canAccess) return <Navigate to={PATHS.app.home} replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {moduleId === "ss" ? (
        <Approval />
      ) : moduleId === "qcc" ? (
        <ApprovalQcc />
      ) : moduleId === "qcp" ? (
        <ApprovalQcp />
      ) : (
        <div className="text-sm text-muted-foreground">Approval {moduleId.toUpperCase()} belum tersedia.</div>
      )}
    </div>
  );
}
