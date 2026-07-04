// QCC Classification API hook
function useQccClassificationApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}) {
  const r = usePostJson<any[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("QCC classification http error:", status, payload),
  });
  return { rows: r.data ?? [], loading: r.loading };
}

// Modal detail QCC
function formatDate(dt: string | Date | undefined): string {
  if (!dt) return "-";
  if (typeof dt === "string") return dt;
  if (dt instanceof Date && !isNaN(dt.getTime())) {
    return dt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  }
  return "-";
}

function QccDetailModal({
  project,
  onClose,
  onStepSubmitted,
}: {
  project: Project;
  onClose: () => void;
  onStepSubmitted?: () => void;
}) {
  const safeStr = (v: any, fallback = "-") => (v == null || v === "" ? fallback : v);
  const loginNrp = useLoginNrp();
  const [stepOpen, setStepOpen] = useState(false);
  const [stepFile, setStepFile] = useState<File | null>(null);
  const [stepDesc, setStepDesc] = useState("");
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState("");
  const [stepSuccess, setStepSuccess] = useState("");
        const [pdfOpen, setPdfOpen] = useState(false); // Moved state declaration here
  const itemKey = String(project.itemKey || "").trim();
  const [localLastStep, setLocalLastStep] = useState(() => pickNumber(project.step, 0));
  const [localLastStepStatus, setLocalLastStepStatus] = useState(() => normalizeQStatusKey(project.stepStatus));
  const [localProjectStatus, setLocalProjectStatus] = useState(() => normalizeQStatusKey(project.status));

  useEffect(() => {
    setLocalLastStep(pickNumber(project.step, 0));
    setLocalLastStepStatus(normalizeQStatusKey(project.stepStatus));
    setLocalProjectStatus(normalizeQStatusKey(project.status));
  }, [project.id, project.itemKey, project.step, project.stepStatus, project.status]);

  const stepMode: "next" | "this" | "none" =
    localLastStep === 0
      ? localProjectStatus === "submitted"
        ? "next"
        : "none"
      : localLastStepStatus === "approved"
      ? "next"
      : localLastStepStatus === "rejected"
      ? "this"
      : "none";

  const targetStep =
    stepMode === "next" ? (localLastStep > 0 ? localLastStep + 1 : 1) : stepMode === "this" ? localLastStep : 0;

  const canShowStepButton = targetStep >= 1 && targetStep <= 8;
  const stepButtonLabel = stepMode === "this" ? `This Step ${targetStep}` : `Next Step ${targetStep}`;

  async function handleSubmitStep() {
    setStepError("");
    setStepSuccess("");

    if (!itemKey) {
      setStepError("ItemKey belum ada. Pastikan data QCC sudah memiliki ItemKey dari API.");
      return;
    }
    if (!stepFile) {
      setStepError("File wajib diupload.");
      return;
    }
    if (!String(stepDesc || "").trim()) {
      setStepError("Keterangan wajib diisi.");
      return;
    }
    if (!canShowStepButton) {
      setStepError("Step tidak valid.");
      return;
    }

    setStepLoading(true);
    try {
      const fd = new FormData();
      fd.append("ItemKey", itemKey);
      fd.append("Step", String(targetStep));
      fd.append("Desc", String(stepDesc || "").trim());
      fd.append("CreatedBy", String(loginNrp || project.createdBy || "").trim());
      fd.append("FileDoc", stepFile);

      const stepCreateUrl = project.type === "QCP" ? (API as any).QCP_STEP_CREATE : API.QCC_STEP_CREATE;
      const resp = await fetch(stepCreateUrl, { method: "POST", body: fd });
      const json = await resp.json().catch(() => ({}));
      const responseCode = Number(json?.responseCode ?? json?.ResponseCode ?? resp.status);
      if (responseCode !== 200) throw new Error(json?.message ?? json?.Message ?? "Gagal submit step");

      setStepSuccess(`Berhasil submit Step ${targetStep}.`);
      setLocalLastStep(targetStep);
      setLocalLastStepStatus(targetStep === 1 || targetStep === 8 ? "submitted" : "approved");
      if (targetStep === 1) setLocalProjectStatus("in-progress");
      setStepFile(null);
      setStepDesc("");
      setStepOpen(false);
      onStepSubmitted?.();
      onClose();
    } catch (e: any) {
      setStepError(e?.message || "Gagal submit step");
    } finally {
      setStepLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Badge variant="outline" style={{ backgroundColor: '#EE642E15', color: '#EE642E', borderColor: '#EE642E' }}>{project.type}</Badge>
            <span>{safeStr(project.namaGroupQccp || project.judulSS)}</span>
          </h2>
          <div className="flex items-center gap-2">
            {canShowStepButton && (
              <Button
                size="sm"
                variant="outline"
                style={{ backgroundColor: "#e5e7eb", color: "#111" }}
                onClick={() => {
                  setStepError("");
                  setStepSuccess("");
                  setStepOpen(true);
                }}
                disabled={!itemKey}
                title={!itemKey ? "ItemKey belum tersedia dari API" : undefined}
              >
                {stepButtonLabel}
              </Button>
            )}
            <Button onClick={onClose} variant="ghost">✕</Button>
          </div>
        </div>

        {(stepError || stepSuccess) && (
          <div className="px-6 pt-3">
            {stepError && <div className="text-sm text-red-600">{stepError}</div>}
            {stepSuccess && <div className="text-sm text-green-700">{stepSuccess}</div>}
          </div>
        )}

        {stepOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Upload Step {targetStep}</h3>
                <Button
                  onClick={() => {
                    if (stepLoading) return;
                    setStepOpen(false);
                  }}
                  variant="ghost"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  ItemKey: <b>{itemKey || "-"}</b>
                </div>

                <div>
                  <label className="text-sm font-medium">File</label>
                  <input
                    type="file"
                    className="mt-1 block w-full text-sm"
                    onChange={(e) => setStepFile(e.target.files?.[0] ?? null)}
                    disabled={stepLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Keterangan</label>
                  <textarea
                    className="mt-1 w-full border rounded-md p-2 text-sm"
                    rows={4}
                    value={stepDesc}
                    onChange={(e) => setStepDesc(e.target.value)}
                    disabled={stepLoading}
                  />
                </div>

                {stepError && <div className="text-sm text-red-600">{stepError}</div>}
                {stepSuccess && <div className="text-sm text-green-700">{stepSuccess}</div>}

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStepOpen(false)}
                    disabled={stepLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitStep}
                    disabled={stepLoading}
                    style={{ backgroundColor: "#EE642E", color: "#fff" }}
                  >
                    {stepLoading ? "Mengirim..." : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Data Team QCC */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">DATA TEAM QCC</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><b>Lokasi:</b> {safeStr(project.lokasi)}</div>
              <div><b>Nama Group:</b> {safeStr(project.namaGroupQccp || project.judulSS)}</div>
              <div><b>Department:</b> {safeStr(project.department)}</div>
              <div><b>Section:</b> {safeStr(project.section)}</div>
              <div><b>Fasilitator:</b> {safeStr(project.fasilitator)} ({safeStr(project.fasilitatorNrp)})</div>
              <div><b>Fasilitator Dept/Section:</b> {safeStr(project.fasilitatorDepartment)} / {safeStr(project.fasilitatorSection)}</div>
              <div><b>Leader:</b> {safeStr(project.leader)} ({safeStr(project.leaderNrp)})</div>
              <div><b>Leader Dept/Section:</b> {safeStr(project.leaderDepartment)} / {safeStr(project.leaderSection)}</div>
              <div><b>Pembuat:</b> {safeStr(project.pembuatSS)}</div>
              <div><b>Status:</b> {safeStr(project.status)}</div>
              <div><b>Created By:</b> {safeStr(project.createdBy)}</div>
              <div><b>Created At:</b> {formatDate(project.createdAt || project.submittedDate)}</div>
              <div><b>Updated By:</b> {safeStr(project.updatedBy)}</div>
              <div><b>Updated At:</b> {formatDate(project.updatedAt)}</div>
            </div>
            <div className="mt-3">
              <div className="font-medium mb-1">Anggota:</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border">No</th>
                      <th className="px-2 py-1 border">Nama</th>
                      <th className="px-2 py-1 border">NRP</th>
                      <th className="px-2 py-1 border">Department</th>
                      <th className="px-2 py-1 border">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.members || []).map((m, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border text-center">{idx + 1}</td>
                        <td className="px-2 py-1 border">{safeStr(m.name)}</td>
                        <td className="px-2 py-1 border">{safeStr(m.nrp)}</td>
                        <td className="px-2 py-1 border">{safeStr(m.department)}</td>
                        <td className="px-2 py-1 border">{safeStr(m.section)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Sasaran QCC */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">SASARAN QCC</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><b>Tema QCC:</b> {safeStr(project.temaQccp)}</div>
              <div><b>KPI Didukung:</b> {safeStr(project.kpiDidukung)}</div>
            </div>
          </div>
          {/* Pernyataan Masalah/Peluang */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">PERNYATAAN MASALAH / PELUANG PERBAIKAN</div>
            <ol className="list-decimal ml-6 text-sm space-y-1">
              <li>
                Siapa atau kelompok mana, serta perangkat/mesin untuk melakukan review terhadap masalah yang bisa memunculkan keinginan atau alasan mengapa review dilaksanakan?
                <div className="mt-1 bg-white rounded p-2 border text-gray-700">{safeStr(project.masalahPeluang1)}</div>
              </li>
              <li>
                Kapan masalah terjadi?
                <div className="mt-1 bg-white rounded p-2 border text-gray-700">{safeStr(project.masalahPeluang2)}</div>
              </li>
              <li>
                Dimana masalah terjadi?
                <div className="mt-1 bg-white rounded p-2 border text-gray-700">{safeStr(project.masalahPeluang3)}</div>
              </li>
              <li>
                Apa dampak dari masalah tersebut bagi pelanggan dan perusahaan?
                <div className="mt-1 bg-white rounded p-2 border text-gray-700">{safeStr(project.masalahPeluang4)}</div>
              </li>
            </ol>
          </div>
          {/* Pernyataan Target */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">PERNYATAAN TARGET</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><b>Apa Targetnya:</b> {safeStr(project.apaTargetnya)}</div>
              <div><b>Berapa Targetnya:</b> {safeStr(project.berapaTargetnya)}</div>
              <div><b>Kapan Dicapai:</b> {safeStr(project.kapanDicapai)}</div>
            </div>
          </div>
          {/* Kondisi Sebelum QCC */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">KONDISI SEBELUM QCC</div>
            <div className="text-sm">{safeStr(project.kondisiSebelum)}</div>
          </div>
          {/* Dokumen Pendukung */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold mb-2 text-orange-700">LAMPIRAN DOKUMEN PENDUKUNG</div>
            <div className="text-sm flex gap-4 items-center">
              {project.supportingDocument && typeof project.supportingDocument === "string" && project.supportingDocument !== "-" ? (
                <>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 transition"
                    onClick={() => setPdfOpen(true)}
                  >
                    Lihat PDF
                  </button>
                  <a
                    href={`${CONFIG.apiBaseUrl}/qcc/${project.supportingDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Download
                  </a>
                  <PdfPopupViewer
                    fileUrl={`${CONFIG.apiBaseUrl}/qcc/${project.supportingDocument}`}
                    open={pdfOpen}
                    onClose={() => setPdfOpen(false)}
                  />
                </>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// DashboardAnalyticsAndMonitoring.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfPopupViewer } from '../ui/PdfPopupViewer';
// ...existing code...

type ProjectChartApiRow = {
  division?: string;
  department?: string;
  section?: string;
  planSS?: number;
  plan?: number;
  Plan?: number;
  actual?: number;
  Actual?: number;
  totalPlan?: number;
  totalActual?: number;
  achievement?: number;
};

function useProjectChartApi(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  errorLabel: string;
}) {
  const r = usePostJson<ProjectChartApiRow[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error(`${params.errorLabel} http error:`, status, payload),
  });
  return { rows: r.data ?? [], loading: r.loading };
}

// Map API result to PlanActualRow[] for chart
function mapProjectChartRowsToPlanActual(rows: ProjectChartApiRow[]): PlanActualRow[] {
  return rows.map((row) => ({
    department: row.department || row.division || "-",
    Plan: Number(row.planSS ?? row.plan ?? row.Plan ?? row.totalPlan ?? 0),
    Actual: Number(row.actual ?? row.Actual ?? row.totalActual ?? 0),
    Achievement:
      row.achievement !== undefined
        ? Number(row.achievement)
        : Number(row.planSS ?? row.plan ?? row.Plan ?? row.totalPlan ?? 0) > 0
          ? Math.round(
              (Number(row.actual ?? row.Actual ?? row.totalActual ?? 0) /
                Number(row.planSS ?? row.plan ?? row.Plan ?? row.totalPlan ?? 0)) *
                100
            )
          : 0,
  }));
}
import { BarChart3, LayoutDashboard,FileText,Download  } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ComposedChart
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { API,CONFIG } from "../../config";
import { getCookieJson } from "../../libs/cookie";

/* =====================================================
   STATUS (SS + Legacy mapping)
   ===================================================== */
const SS_STATUS = {
  REVIEW_LEADER: "Review by leader",
  REJECT_LEADER: "Reject by leader",
  REVIEW_BPI: "Review by bpi",
  COMPLETE: "Complete",
} as const;

type SSStatus = (typeof SS_STATUS)[keyof typeof SS_STATUS];
type QStatus = "registered" | "submitted" | "in-progress" | "finished";
type AnyStatus = SSStatus | QStatus;

const LEGACY_SS_STATUS_TO_NEW: Record<string, SSStatus> = {
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

const NEW_SS_STATUS_TO_LEGACY: Record<SSStatus, string> = {
  [SS_STATUS.REVIEW_LEADER]: "review-by-leader",
  [SS_STATUS.REJECT_LEADER]: "reject-by-leader",
  [SS_STATUS.REVIEW_BPI]: "review-by-bpi",
  [SS_STATUS.COMPLETE]: "completed",
};

function normalizeSSStatus(raw?: string): SSStatus {
  const s = String(raw || "").trim().toLowerCase();
  return LEGACY_SS_STATUS_TO_NEW[s] ?? SS_STATUS.REVIEW_LEADER;
}

function toApiSSStatus(selectedStatus: string | null): string {
  if (!selectedStatus) return "";
  const s = String(selectedStatus);
  if (
    s === SS_STATUS.REVIEW_LEADER ||
    s === SS_STATUS.REVIEW_BPI ||
    s === SS_STATUS.COMPLETE
  ) {
    return NEW_SS_STATUS_TO_LEGACY[s as SSStatus] ?? s;
  }
  return s;
}

/* =====================================================
   TYPES
   ===================================================== */
type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";
type ProjectType = "SS" | "QCC" | "QCP" | "TEBP" | "CRP";

export type QccMember = {
  name?: string;
  department?: string;
  section?: string;
  nrp?: string;
  site?: string;
  division?: string;
};

export type Project = {
  id?: number | string;
  type: ProjectType;

  // SS
  itemKey?: string;
  ideNumber?: string;
  site?: string;

  // QCC fields
  nrpSelected?: string;
  lokasi?: string;
  department?: string;
  section?: string;
  namaGroupQccp?: string;
  fasilitatorNrp?: string;
  fasilitator?: string;
  fasilitatorDepartment?: string;
  fasilitatorSection?: string;
  leaderNrp?: string;
  leader?: string;
  leaderDepartment?: string;
  leaderSection?: string;
  members?: QccMember[];
  temaQccp?: string;
  kpiDidukung?: string;
  masalahPeluang1?: string;
  masalahPeluang2?: string;
  masalahPeluang3?: string;
  masalahPeluang4?: string;
  apaTargetnya?: string;
  berapaTargetnya?: string;
  kapanDicapai?: string;
  kondisiSebelum?: string;
  supportingDocument?: string;
  createdBy?: string;
  createdAt?: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;

  // common fields (legacy naming from your code)
  judulSS: string;
  pembuatSS: string;
  status: AnyStatus;
  submittedDate: Date | string;
  step?: number | string;
  stepStatus?: string;
  leaderName?: string;
};

type PlanActualRow = {
  department: string;
  Plan: number;
  Actual: number;
  Achievement?: number;
};

type TotalRow = { label: string; plan: number; actual: number };
type ChartDataByYearMonth = Record<string, Record<string, PlanActualRow[]>>;

// old structure: Division -> Department -> [Sections]
type OrgStructure = Record<string, Record<string, string[]>>;

type ModuleConfig = {
  id: ModuleId;
  title: string;
  gradient: string;
  bgColor: string;
  iconColor: string;
  type: ProjectType;
  icon: React.ElementType;
};

// ================= QCC List Hook & Mapper =================
type QccApiRow = {
  id?: number | string;
  itemKey?: string;
  site?: string;
  nrpSelected?: string;
  lokasi?: string;
  department?: string;
  section?: string;
  namaGroupQccp?: string;
  fasilitatorNrp?: string;
  fasilitator?: string;
  fasilitatorDepartment?: string;
  fasilitatorSection?: string;
  leaderNrp?: string;
  leader?: string;
  leaderDepartment?: string;
  leaderSection?: string;
  members?: QccMember[];
  temaQccp?: string;
  kpiDidukung?: string;
  masalahPeluang1?: string;
  masalahPeluang2?: string;
  masalahPeluang3?: string;
  masalahPeluang4?: string;
  apaTargetnya?: string;
  berapaTargetnya?: string;
  kapanDicapai?: string;
  kondisiSebelum?: string;
  supportingDocument?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  status?: string;
  step?: number | string;
  stepStatus?: string;
};

function mapQccApiRowToProject(row: QccApiRow): Project {
  return {
    id: row.id,
    type: "QCC",
    itemKey: row.itemKey,
    site: row.site,
    nrpSelected: row.nrpSelected,
    lokasi: row.lokasi,
    department: row.department,
    section: row.section,
    namaGroupQccp: row.namaGroupQccp,
    fasilitatorNrp: row.fasilitatorNrp,
    fasilitator: row.fasilitator,
    fasilitatorDepartment: row.fasilitatorDepartment,
    fasilitatorSection: row.fasilitatorSection,
    leaderNrp: row.leaderNrp,
    leader: row.leader,
    leaderDepartment: row.leaderDepartment,
    leaderSection: row.leaderSection,
    members: row.members,
    temaQccp: row.temaQccp,
    kpiDidukung: row.kpiDidukung,
    masalahPeluang1: row.masalahPeluang1,
    masalahPeluang2: row.masalahPeluang2,
    masalahPeluang3: row.masalahPeluang3,
    masalahPeluang4: row.masalahPeluang4,
    apaTargetnya: row.apaTargetnya,
    berapaTargetnya: row.berapaTargetnya,
    kapanDicapai: row.kapanDicapai,
    kondisiSebelum: row.kondisiSebelum,
    supportingDocument: row.supportingDocument,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
    // legacy/common fields
    judulSS: row.namaGroupQccp ?? "-",
    pembuatSS: row.leader ?? "-",
    status: (row.status as AnyStatus) ?? "registered",
    submittedDate: row.createdAt ? new Date(row.createdAt) : new Date(),
    step: row.step,
    stepStatus: row.stepStatus,
    leaderName: row.leader,
  };
}

function useQccListByNrp(params: { enabled: boolean; url: string; nrp: string; token?: string | null; refreshKey?: number }) {
  const r = usePostJson<QccApiRow[]>({
    enabled: params.enabled,
    url: params.url,
    body: { CreatedBy: params.nrp, RefreshKey: params.refreshKey ?? 0 },
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("QCC list http error:", status, payload),
  });
  const rows = React.useMemo(() => (r.data ?? []).map(mapQccApiRowToProject), [r.data]);
  return { rows, loading: r.loading };
}

// ================= QCP List Hook & Mapper =================
type QcpApiRow = QccApiRow;

function mapQcpApiRowToProject(row: QcpApiRow): Project {
  return {
    id: row.id,
    type: "QCP",
    itemKey: row.itemKey,
    nrpSelected: row.nrpSelected,
    lokasi: row.lokasi,
    department: row.department,
    section: row.section,
    namaGroupQccp: row.namaGroupQccp,
    fasilitatorNrp: row.fasilitatorNrp,
    fasilitator: row.fasilitator,
    fasilitatorDepartment: row.fasilitatorDepartment,
    fasilitatorSection: row.fasilitatorSection,
    leaderNrp: row.leaderNrp,
    leader: row.leader,
    leaderDepartment: row.leaderDepartment,
    leaderSection: row.leaderSection,
    members: row.members,
    temaQccp: row.temaQccp,
    kpiDidukung: row.kpiDidukung,
    masalahPeluang1: row.masalahPeluang1,
    masalahPeluang2: row.masalahPeluang2,
    masalahPeluang3: row.masalahPeluang3,
    masalahPeluang4: row.masalahPeluang4,
    apaTargetnya: row.apaTargetnya,
    berapaTargetnya: row.berapaTargetnya,
    kapanDicapai: row.kapanDicapai,
    kondisiSebelum: row.kondisiSebelum,
    supportingDocument: row.supportingDocument,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
    judulSS: row.namaGroupQccp ?? "-",
    pembuatSS: row.leader ?? "-",
    status: (row.status as AnyStatus) ?? "registered",
    submittedDate: row.createdAt ? new Date(row.createdAt) : new Date(),
    step: row.step,
    stepStatus: row.stepStatus,
    leaderName: row.leader,
  };
}

function useQcpListByNrp(params: { enabled: boolean; url: string; nrp: string; token?: string | null; refreshKey?: number }) {
  const r = usePostJson<QcpApiRow[]>({
    enabled: params.enabled,
    url: params.url,
    body: { CreatedBy: params.nrp, RefreshKey: params.refreshKey ?? 0 },
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("QCP list http error:", status, payload),
  });
  const rows = React.useMemo(() => (r.data ?? []).map(mapQcpApiRowToProject), [r.data]);
  return { rows, loading: r.loading };
}

// Ambil NRP login dari cookie
function useLoginNrp() {
  return React.useMemo(() => {
    try {
      const c = getCookieJson<any>("inovasis_auth");
      return c?.nrp ?? c?.NRP ?? c?.username ?? null;
    } catch {
      return null;
    }
  }, []);
}

export type DashboardAnalyticsAndMonitoringProps = {
  projects: Project[];
  modules: ModuleConfig[];
  qccDataByYearMonth: ChartDataByYearMonth;
  ssDataByYearMonth?: ChartDataByYearMonth; // backward compat (unused)
  organizationStructure: OrgStructure;

  ssProjectTypeNumber?: number;
  ssListBaseBody?: Record<string, any>;
};

/* =====================================================
   CONST
   ===================================================== */
const YEARS = ["2023", "2024", "2025", "2026"] as const;

const MONTHS = [
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

const MONTH_ORDER = MONTHS.map((m) => m.value);

const MODULE_TYPE_MAP: Record<ModuleId, ProjectType> = {
  ss: "SS",
  qcc: "QCC",
  qcp: "QCP",
  tebp: "TEBP",
  crp: "CRP",
};

const MODULE_THEME: Record<
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
      normal:
        "0 4px 12px rgba(0, 97, 135, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active:
        "0 6px 16px rgba(0, 97, 135, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(0, 97, 135, 0.1)",
    panelBorder: "#006187",
    panelTitle: "#006187",
  },
  qcc: {
    baseGradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    hoverGradient: "linear-gradient(135deg, #D66B1E 0%, #D5511A 100%)",
    boxShadow: {
      normal:
        "0 4px 12px rgba(238, 100, 46, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active:
        "0 6px 16px rgba(238, 100, 46, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(238, 100, 46, 0.1)",
    panelBorder: "#EE642E",
    panelTitle: "#EE642E",
  },
  qcp: {
    baseGradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    hoverGradient: "linear-gradient(135deg, #4AB88A 0%, #005A48 100%)",
    boxShadow: {
      normal:
        "0 4px 12px rgba(95, 206, 160, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active:
        "0 6px 16px rgba(95, 206, 160, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(95, 206, 160, 0.1)",
    panelBorder: "#5FCEA0",
    panelTitle: "#007B5F",
  },
  tebp: {
    baseGradient: "linear-gradient(135deg, #006D6F 0%, #00A6A6 100%)",
    hoverGradient: "linear-gradient(135deg, #00585A 0%, #009090 100%)",
    boxShadow: {
      normal:
        "0 4px 12px rgba(0, 109, 111, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active:
        "0 6px 16px rgba(0, 109, 111, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(1, 89, 82, 0.1)",
    panelBorder: "#015952",
    panelTitle: "#015952",
  },
  crp: {
    baseGradient: "linear-gradient(135deg, #7FED84 0%, #5FCEA0 100%)",
    hoverGradient: "linear-gradient(135deg, #68D56D 0%, #4AB88A 100%)",
    boxShadow: {
      normal:
        "0 4px 12px rgba(127, 237, 132, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)",
      active:
        "0 6px 16px rgba(127, 237, 132, 0.35), 0 3px 6px rgba(0, 0, 0, 0.12)",
    },
    panelBg: "rgba(127, 237, 132, 0.1)",
    panelBorder: "#7FED84",
    panelTitle: "#5FCEA0",
  },
};

/* =====================================================
   UTILS
   ===================================================== */
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function uniqueSorted(list: string[]) {
  return Array.from(new Set(list))
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function isQFamily(id: ModuleId | null) {
  return id === "qcc" || id === "qcp" || id === "tebp";
}

function safeUuid() {
  // @ts-ignore
  return (
    globalThis.crypto?.randomUUID?.() ??
    `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`
  );
}

function pickNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function monthToNumber(m: string): number {
  const idx = MONTH_ORDER.indexOf(m as (typeof MONTH_ORDER)[number]);
  return idx >= 0 ? idx + 1 : 1;
}

function calcAchievement(plan: number, actual: number) {
  return plan > 0 ? Math.round((actual / plan) * 100) : 0;
}

function getDepartmentAbbr(fullName: string) {
  const abbrevMap: Record<string, string> = {
    "RECRUITMENT DEPARTMENT": "RECRUITMENT",
    "REMUNERATION DEPARTMENT": "REMUNERATION",
    "SHE OPERATION DEPARTMENT": "SHE OPERATION",
    "IT & OT DEVELOPMENT DEPARTMENT": "IT & OT DEV",
    "TECHNICAL SUPPORT DEPARTMENT": "TECH SUPPORT",
    "MAINTENANCE WCC DEPARTMENT": "MAINT WCC",
  };
  return abbrevMap[fullName] || fullName;
}

const normKey = (v: any) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

function normalizeQStatusKey(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function buildMaxMap<T extends Record<string, any>>(
  rows: T[],
  keyField: keyof T,
  valField: keyof T
) {
  const map = new Map<string, number>();
  for (const r of rows || []) {
    const k = normKey(r[keyField]);
    if (!k) continue;
    const v = Number(r[valField] ?? 0) || 0;
    map.set(k, Math.max(map.get(k) ?? 0, v));
  }
  return map;
}

function mapGet(map: Map<string, number>, rawKey: any) {
  return map.get(normKey(rawKey)) ?? 0;
}

function uniqueLabelsFromRows<T extends Record<string, any>>(
  rows: T[],
  field: keyof T
) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows || []) {
    const raw = String(r[field] ?? "").trim();
    if (!raw) continue;
    const k = normKey(raw);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(raw);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function buildNiceTicks(maxValue: number, tickCount = 8) {
  const max = Math.max(0, Number(maxValue) || 0);
  if (max <= 0) return { domain: [0, 1] as [number, number], ticks: [0, 1] };

  const roughStep = max / tickCount;
  const pow = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const norm = roughStep / pow;

  let nice = 1;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;

  const step = nice * pow;
  const top = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);

  return { domain: [0, top] as [number, number], ticks };
}

/* =====================================================
   AUTH TOKEN
   ===================================================== */
function useAuthToken() {
  return useMemo(() => {
    try {
      const c = getCookieJson<any>("inovasis_auth");
      return (c?.token ?? c?.accessToken ?? null) as string | null;
    } catch {
      return null;
    }
  }, []);
}

/* =====================================================
   HOOK: outside click
   ===================================================== */
function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  onOutside: () => void
) {
  const onOutsideRef = useRef(onOutside);
  useEffect(() => {
    onOutsideRef.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onOutsideRef.current?.();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref]);
}

/* =====================================================
   HOOK: chart filter
   ===================================================== */
function useChartFilter(initialYear = "2024", initialMonth = "Jan") {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const [division, setDivision] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(0);

  const resetHierarchy = useCallback(() => {
    setDivision(null);
    setDepartment(null);
    setSection(null);
    setPageIndex(0);
  }, []);

  return {
    year,
    month,
    setYear,
    setMonth,

    division,
    department,
    section,
    setDivision,
    setDepartment,
    setSection,

    pageIndex,
    setPageIndex,

    resetHierarchy,
  };
}

/* =====================================================
   ✅ Unified POST JSON hook (abort + stable deps)
   ===================================================== */
function usePostJson<T>(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
  mapData?: (raw: any) => T;
  onError?: (status: number, payload: any) => void;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const bodyJson = useMemo(
    () => JSON.stringify(params.body ?? {}),
    [params.body]
  );

  useEffect(() => {
    if (!params.enabled || !params.url) return;

    const ctrl = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(params.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(params.token ? { Authorization: `Bearer ${params.token}` } : {}),
          },
          body: bodyJson,
          signal: ctrl.signal,
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (!res.ok) {
          params.onError?.(res.status, json);
          if (alive) setData(null);
          return;
        }

        const raw = json?.data;
        const mapped = params.mapData ? params.mapData(raw) : (raw as T);
        if (alive) setData(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("POST fetch error:", e);
          if (alive) setData(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [params.enabled, params.url, params.token, bodyJson]); // keep stable

  return { data, loading };
}

/* =====================================================
   ORG OPTIONS from structure (fallback)
   ===================================================== */
function useOrgOptionsFromStructure(
  organizationStructure: OrgStructure,
  divisionListOverride?: string[]
) {
  const allDivisions = useMemo(() => {
    const base =
      divisionListOverride && divisionListOverride.length > 0
        ? divisionListOverride
        : Object.keys(organizationStructure || {});
    return uniqueSorted(base);
  }, [organizationStructure, divisionListOverride]);

  const departmentsByDivision = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const div of allDivisions) {
      map[div] = uniqueSorted(Object.keys(organizationStructure?.[div] || {}));
    }
    return map;
  }, [allDivisions, organizationStructure]);

  const allDepartments = useMemo(() => {
    const list: string[] = [];
    for (const div of allDivisions)
      list.push(...(departmentsByDivision[div] || []));
    return uniqueSorted(list);
  }, [allDivisions, departmentsByDivision]);

  const sectionsByDepartment = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const div of allDivisions) {
      const depts = organizationStructure?.[div] || {};
      for (const dept of Object.keys(depts)) {
        const sections = depts[dept] || [];
        map[dept] = uniqueSorted([...(map[dept] || []), ...sections]);
      }
    }
    return map;
  }, [allDivisions, organizationStructure]);

  return {
    allDivisions,
    departmentsByDivision,
    allDepartments,
    sectionsByDepartment,
  };
}

/* =====================================================
   ✅ ORG MASTER from API.ORGANIZATION_EXECUTE
   ===================================================== */
type OrgApiRow = {
  divisionCode?: string;
  divisionName?: string;

  departmentCode?: string | null;
  departmentName?: string | null;

  sectionCode?: string | null;
  sectionName?: string | null;

  departmentCount?: number | null;
  sectionCount?: number | null;
};

type OrgMaster = {
  ready: boolean;
  loading: boolean;
  divRows: OrgApiRow[];
  deptRows: OrgApiRow[];
  secRows: OrgApiRow[];
};

async function postOrg<T>(
  url: string,
  body: Record<string, any>,
  token?: string | null,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) throw new Error(`ORG HTTP ${res.status} ${JSON.stringify(json)}`);
  return (json?.data ?? null) as T;
}

function useOrgMasterOnce(params: {
  enabled: boolean;
  url: string;
  token?: string | null;
}) {
  const [master, setMaster] = useState<OrgMaster>({
    ready: false,
    loading: false,
    divRows: [],
    deptRows: [],
    secRows: [],
  });

  useEffect(() => {
    if (!params.enabled || !params.url) {
      setMaster((s) => ({ ...s, ready: true, loading: false }));
      return;
    }

    const ctrl = new AbortController();
    let alive = true;

    (async () => {
      setMaster({
        ready: false,
        loading: true,
        divRows: [],
        deptRows: [],
        secRows: [],
      });

      try {
        const base = {
          action: 1,
          divisionCode: "",
          departmentCode: "",
          sectionCode: "",
          name: "",
          keyword: "",
        };

        const [divRows, deptRows, secRows] = await Promise.all([
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 1 }, params.token, ctrl.signal),
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 2 }, params.token, ctrl.signal),
          postOrg<OrgApiRow[]>(params.url, { ...base, type: 3 }, params.token, ctrl.signal),
        ]);

        if (!alive) return;

        setMaster({
          ready: true,
          loading: false,
          divRows: Array.isArray(divRows) ? divRows : [],
          deptRows: Array.isArray(deptRows) ? deptRows : [],
          secRows: Array.isArray(secRows) ? secRows : [],
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        console.error("ORG master error:", e);
        setMaster({ ready: true, loading: false, divRows: [], deptRows: [], secRows: [] });
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [params.enabled, params.url, params.token]);

  return master;
}

function useOrgDerivedFromMaster(params: {
  master: OrgMaster;
  selectedDivisionName: string | null;
  selectedDepartmentName: string | null;
}) {
  const divisions = useMemo(() => {
    if (!params.master.divRows.length) return [];
    return uniqueSorted(
      params.master.divRows
        .map((r) => String(r.divisionName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.divRows]);

  const departments = useMemo(() => {
    if (!params.master.deptRows.length) return [];
    const divKey = normKey(params.selectedDivisionName);

    return uniqueSorted(
      params.master.deptRows
        .filter((r) => {
          const name = String(r.departmentName ?? "").trim();
          if (!name) return false;
          if (params.selectedDivisionName) return normKey(r.divisionName) === divKey;
          return true;
        })
        .map((r) => String(r.departmentName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.deptRows, params.selectedDivisionName]);

  const sections = useMemo(() => {
    if (!params.master.secRows.length) return [];
    const divKey = normKey(params.selectedDivisionName);
    const deptKey = normKey(params.selectedDepartmentName);

    return uniqueSorted(
      params.master.secRows
        .filter((r) => {
          const name = String(r.sectionName ?? "").trim();
          if (!name) return false;
          if (params.selectedDivisionName && normKey(r.divisionName) !== divKey) return false;
          if (params.selectedDepartmentName && normKey(r.departmentName) !== deptKey) return false;
          return true;
        })
        .map((r) => String(r.sectionName ?? "").trim())
        .filter(Boolean)
    );
  }, [params.master.secRows, params.selectedDivisionName, params.selectedDepartmentName]);

  return { divisions, departments, sections };
}

function useChartOrgOptionsFromMaster(params: {
  master: OrgMaster;
  selectedDivisionName: string | null;
  selectedDepartmentName: string | null;
  fallback: ReturnType<typeof useOrgOptionsFromStructure>;
}) {
  const { master, selectedDivisionName, selectedDepartmentName, fallback } = params;

  const allDivisions = useMemo(() => {
    if (!master.divRows.length) return fallback.allDivisions;
    return uniqueSorted(
      master.divRows
        .map((r) => String(r.divisionName ?? "").trim())
        .filter(Boolean)
    );
  }, [master.divRows, fallback.allDivisions]);

  const departmentsByDivision = useMemo(() => {
    if (!master.deptRows.length) return fallback.departmentsByDivision;

    const map: Record<string, string[]> = {};
    for (const div of allDivisions) map[div] = [];

    for (const row of master.deptRows) {
      const div = String(row.divisionName ?? "").trim();
      const dept = String(row.departmentName ?? "").trim();
      if (!div || !dept) continue;
      map[div] = uniqueSorted([...(map[div] || []), dept]);
    }

    return map;
  }, [master.deptRows, fallback.departmentsByDivision, allDivisions]);

  const allDepartments = useMemo(() => {
    if (!selectedDivisionName) {
      const list: string[] = [];
      for (const div of allDivisions) list.push(...(departmentsByDivision[div] || []));
      return uniqueSorted(list);
    }
    return uniqueSorted(departmentsByDivision[selectedDivisionName] || []);
  }, [allDivisions, departmentsByDivision, selectedDivisionName]);

  const sectionsByDepartment = useMemo(() => {
    if (!master.secRows.length) return fallback.sectionsByDepartment;

    const map: Record<string, string[]> = {};
    for (const row of master.secRows) {
      const div = String(row.divisionName ?? "").trim();
      const dept = String(row.departmentName ?? "").trim();
      const sec = String(row.sectionName ?? "").trim();
      if (!dept || !sec) continue;
      if (selectedDivisionName && normKey(div) !== normKey(selectedDivisionName)) continue;
      map[dept] = uniqueSorted([...(map[dept] || []), sec]);
    }
    return map;
  }, [master.secRows, fallback.sectionsByDepartment, selectedDivisionName]);

  return {
    allDivisions,
    departmentsByDivision,
    allDepartments,
    sectionsByDepartment,
  };
}

/* =====================================================
   Monitoring dropdown binding (division/department/section from ORG master)
   ===================================================== */
type MemberOptions = {
  sites: string[];
  divisions: string[];
  departments: string[];
  sections: string[];
};

function useMemberOrgOptionsFromMaster(params: {
  master: OrgMaster;
  selectedDivisionName: string | null;
  selectedDepartmentName: string | null;
  fallback: MemberOptions;
}): MemberOptions {
  const { master, selectedDivisionName, selectedDepartmentName, fallback } = params;

  const divisions = useMemo(() => {
    const list = master.divRows?.length
      ? master.divRows.map((r) => String(r.divisionName ?? "").trim()).filter(Boolean)
      : fallback.divisions;
    return uniqueSorted(list);
  }, [master.divRows, fallback.divisions]);

  const departments = useMemo(() => {
    if (!master.deptRows?.length) return uniqueSorted(fallback.departments);
    const divKey = normKey(selectedDivisionName);

    const list = master.deptRows
      .filter((r) => {
        const name = String(r.departmentName ?? "").trim();
        if (!name) return false;
        if (selectedDivisionName) return normKey(r.divisionName) === divKey;
        return true;
      })
      .map((r) => String(r.departmentName ?? "").trim())
      .filter(Boolean);

    return uniqueSorted(list);
  }, [master.deptRows, selectedDivisionName, fallback.departments]);

  const sections = useMemo(() => {
    if (!master.secRows?.length) return uniqueSorted(fallback.sections);

    const divKey = normKey(selectedDivisionName);
    const deptKey = normKey(selectedDepartmentName);

    const list = master.secRows
      .filter((r) => {
        const name = String(r.sectionName ?? "").trim();
        if (!name) return false;

        if (selectedDivisionName && normKey(r.divisionName) !== divKey) return false;
        if (selectedDepartmentName && normKey(r.departmentName) !== deptKey) return false;

        return true;
      })
      .map((r) => String(r.sectionName ?? "").trim())
      .filter(Boolean);

    return uniqueSorted(list);
  }, [master.secRows, selectedDivisionName, selectedDepartmentName, fallback.sections]);

  return { sites: fallback.sites, divisions, departments, sections };
}

/* =====================================================
   Q CHART: cumulative helpers
   ===================================================== */
function sumCumulativeForDepartments(params: {
  dataByYearMonth: ChartDataByYearMonth;
  year: string;
  month: string;
  departments: string[];
}): { Plan: number; Actual: number } {
  const { dataByYearMonth, year, month, departments } = params;
  const deptSet = new Set(departments);

  const targetMonthIndex = MONTH_ORDER.indexOf(month as (typeof MONTH_ORDER)[number]);
  if (targetMonthIndex < 0) return { Plan: 0, Actual: 0 };

  let plan = 0;
  let actual = 0;

  for (let i = 0; i <= targetMonthIndex; i++) {
    const mk = MONTH_ORDER[i];
    const monthData = dataByYearMonth?.[year]?.[mk] || [];
    for (const row of monthData) {
      if (deptSet.has(row.department)) {
        plan += Number(row.Plan || 0);
        actual += Number(row.Actual || 0);
      }
    }
  }

  return { Plan: plan, Actual: actual };
}

function cumulativeRowsForDepartmentList(params: {
  dataByYearMonth: ChartDataByYearMonth;
  year: string;
  month: string;
  departments: string[];
}): PlanActualRow[] {
  const { dataByYearMonth, year, month, departments } = params;

  return departments.map((dept) => {
    const totals = sumCumulativeForDepartments({
      dataByYearMonth,
      year,
      month,
      departments: [dept],
    });
    return {
      department: dept,
      Plan: totals.Plan,
      Actual: totals.Actual,
      Achievement: calcAchievement(totals.Plan, totals.Actual),
    };
  });
}

function usePlanActualChartData(params: {
  dataByYearMonth: ChartDataByYearMonth;
  filter: ReturnType<typeof useChartFilter>;
  org: ReturnType<typeof useOrgOptionsFromStructure>;
  pageSize?: number;
}) {
  const { dataByYearMonth, filter, org } = params;
  const pageSize = params.pageSize ?? 5;

  const pagedDivisions = useMemo(() => {
    const start = filter.pageIndex * pageSize;
    return org.allDivisions.slice(start, start + pageSize);
  }, [org.allDivisions, filter.pageIndex, pageSize]);

  const hasPrevPage = filter.pageIndex > 0;
  const hasNextPage = (filter.pageIndex + 1) * pageSize < org.allDivisions.length;

  const filteredDepartments = useMemo(() => {
    if (filter.division) return org.departmentsByDivision[filter.division] || [];
    return org.allDepartments;
  }, [filter.division, org.allDepartments, org.departmentsByDivision]);

  const filteredSections = useMemo(() => {
    if (filter.department) return org.sectionsByDepartment[filter.department] || [];
    const list: string[] = [];
    for (const dept of filteredDepartments)
      list.push(...(org.sectionsByDepartment[dept] || []));
    return uniqueSorted(list);
  }, [filter.department, filteredDepartments, org.sectionsByDepartment]);

  const data = useMemo<PlanActualRow[]>(() => {
    if (filter.department) {
      return cumulativeRowsForDepartmentList({
        dataByYearMonth,
        year: filter.year,
        month: filter.month,
        departments: [filter.department],
      });
    }

    if (filter.division) {
      const depts = org.departmentsByDivision[filter.division] || [];
      return cumulativeRowsForDepartmentList({
        dataByYearMonth,
        year: filter.year,
        month: filter.month,
        departments: depts,
      });
    }

    return pagedDivisions.map((div) => {
      const depts = org.departmentsByDivision[div] || [];
      const totals = sumCumulativeForDepartments({
        dataByYearMonth,
        year: filter.year,
        month: filter.month,
        departments: depts,
      });
      return {
        department: div,
        Plan: totals.Plan,
        Actual: totals.Actual,
        Achievement: calcAchievement(totals.Plan, totals.Actual),
      };
    });
  }, [
    dataByYearMonth,
    filter.department,
    filter.division,
    filter.month,
    filter.year,
    org.departmentsByDivision,
    pagedDivisions,
  ]);

  const showPaging = !filter.division && !filter.department && !filter.section;

  return {
    data,
    filteredDepartments,
    filteredSections,
    hasPrevPage,
    hasNextPage,
    showPaging,
    totalPages: Math.max(1, Math.ceil(org.allDivisions.length / pageSize)),
    pageSize,
  };
}

function useApiPlanActualChartBound(params: {
  rows: ProjectChartApiRow[];
  filter: ReturnType<typeof useChartFilter>;
  org: ReturnType<typeof useOrgOptionsFromStructure>;
  pageSize?: number;
}) {
  const { rows, filter, org } = params;
  const pageSize = params.pageSize ?? 5;

  return useMemo(() => {
    const hasApiRows = rows.length > 0;
    const divSel = String(filter.division ?? "").trim();
    const deptSel = String(filter.department ?? "").trim();
    const secSel = String(filter.section ?? "").trim();

    const pagedDivisions = org.allDivisions.slice(filter.pageIndex * pageSize, filter.pageIndex * pageSize + pageSize);
    const hasPrevPage = filter.pageIndex > 0;
    const hasNextPage = (filter.pageIndex + 1) * pageSize < org.allDivisions.length;
    const totalPages = Math.max(1, Math.ceil(org.allDivisions.length / pageSize));

    const filteredDepartments = divSel ? org.departmentsByDivision[divSel] || [] : org.allDepartments;
    const filteredSections = deptSel
      ? org.sectionsByDepartment[deptSel] || []
      : uniqueSorted(filteredDepartments.flatMap((d) => org.sectionsByDepartment[d] || []));

    if (hasApiRows) {
      return {
        data: mapProjectChartRowsToPlanActual(rows),
        filteredDepartments,
        filteredSections,
        hasPrevPage,
        hasNextPage,
        showPaging: !divSel && !deptSel && !secSel,
        totalPages,
      };
    }

    let labels: string[] = [];
    if (!divSel) {
      labels = pagedDivisions;
    } else if (!deptSel) {
      labels = filteredDepartments;
    } else if (!secSel) {
      labels = filteredSections;
    } else {
      labels = [secSel];
    }

    return {
      data: labels.map((label) => ({
        department: label,
        Plan: 0,
        Actual: 0,
        Achievement: 0,
      })),
      filteredDepartments,
      filteredSections,
      hasPrevPage,
      hasNextPage,
      showPaging: !divSel && !deptSel && !secSel,
      totalPages,
    };
  }, [
    rows,
    filter.division,
    filter.department,
    filter.section,
    filter.pageIndex,
    org.allDivisions,
    org.allDepartments,
    org.departmentsByDivision,
    org.sectionsByDepartment,
    pageSize,
  ]);
}

/* =====================================================
   SS API: dashboard chart + list
   ===================================================== */
type SsChartApiRow = {
  division?: string;
  department?: string;
  section?: string;

  planSS?: number;
  plan?: number;
  actual?: number;
  totalSSPerDivision?: number;
  totalSSPerDepartment?: number;
  totalSSPerSection?: number;

  totalRows?: number;
  totalPages?: number;
};

type SsApiRow = {
  itemKey?: string;
  ideano?: string;
  judul?: string;
  pembuat?: string;
  status?: string;
  createdAt?: string;
  directorate?: string;
  division?: string;
  department?: string;
  section?: string;

  totalRows?: number;
  totalPages?: number;

  totalReviewByLeader?: number | string;
  totalReviewByBpi?: number | string;
  totalComplete?: number | string;
};

function mapSsApiRowToProject(row: SsApiRow): Project {
  const itemKey = row.itemKey ?? "";
  return {
    id: itemKey || row.ideano || safeUuid(),
    itemKey: itemKey || undefined,
    ideNumber: itemKey || row.ideano || "-", // ide number from itemKey
    type: "SS",
    judulSS: row.judul ?? "-",
    pembuatSS: row.pembuat ?? "-",
    status: normalizeSSStatus(row.status),
    submittedDate: row.createdAt ? new Date(row.createdAt) : new Date(),
    members: [{ division: row.division, department: row.department, section: row.section }],
  };
}

type SsListResult = {
  rows: Project[];
  loading: boolean;
  totalRows: number;
  totalPages: number;
  totals: {
    reviewByLeader: number;
    reviewByBPI: number;
    completed: number;
  };
};

/**
 * ✅ IMPORTANT refactor:
 * - rows is memoized so it doesn't change every render
 * - prevents render-loop that can "lock" navigation
 */
function useSsList(params: {
  enabled: boolean;
  url: string;
  body: Record<string, any>;
  token?: string | null;
}): SsListResult {
  const r = usePostJson<SsApiRow[]>({
    enabled: params.enabled,
    url: params.url,
    body: params.body,
    token: params.token,
    mapData: (raw) => (Array.isArray(raw) ? raw : []),
    onError: (status, payload) =>
      console.error("SS list http error:", status, payload),
  });

  const items = r.data ?? [];
  const first = (items[0] ?? {}) as SsApiRow;

  const totalRows = pickNumber(first.totalRows, 0);
  const totalPages = Math.max(1, pickNumber(first.totalPages, totalRows > 0 ? 1 : 1));

  const totals = {
    reviewByLeader: pickNumber((first as any).totalReviewByLeader, 0),
    reviewByBPI: pickNumber((first as any).totalReviewByBpi, 0),
    completed: pickNumber((first as any).totalComplete, 0),
  };

  const rows = useMemo(() => items.map(mapSsApiRowToProject), [items]);

  return {
    loading: r.loading,
    totalRows,
    totalPages,
    rows,
    totals,
  };
}

/* =====================================================
   DROPDOWN UI helpers
   ===================================================== */
type DropdownItem = { value: string; label: string };

function DropdownFilter(props: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;

  allLabel: string;
  selectedValue: string | null;
  onSelect: (v: string | null) => void;

  items: DropdownItem[];
  minWidthClass?: string;
  maxHeightClass?: string;

  disabled?: boolean;
}) {
  const boxClass =
    "absolute top-full mt-1 z-10 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg";
  const btnClass =
    "w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="h-auto py-2 px-3 text-xs"
        onClick={props.onToggle}
        disabled={props.disabled}
      >
        {props.selectedValue ?? props.allLabel}
      </Button>

      {props.open && !props.disabled && (
        <div
          className={cn(
            boxClass,
            props.minWidthClass ?? "min-w-[160px]",
            props.maxHeightClass ?? ""
          )}
        >
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              props.onSelect(null);
              props.onClose();
            }}
          >
            {props.allLabel}
          </button>

          {props.items.map((it) => (
            <button
              key={it.value}
              type="button"
              className={btnClass}
              onClick={() => {
                props.onSelect(it.value);
                props.onClose();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function YearMonthControls(props: {
  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Select value={props.year} onValueChange={props.onYear}>
        <SelectTrigger className="w-[120px] border-2 font-semibold">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={props.month} onValueChange={props.onMonth}>
        <SelectTrigger className="w-[120px] border-2 font-semibold">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function HierarchyDropdowns(props: {
  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;

  divisions: string[];
  departments: string[];
  sections: string[];

  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;

  divisionAllLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<null | "division" | "department" | "section">(null);
  useOutsideClick(wrapRef as any, () => setOpen(null));

  const divItems = useMemo(() => props.divisions.map((x) => ({ value: x, label: x })), [props.divisions]);
  const deptItems = useMemo(() => props.departments.map((x) => ({ value: x, label: x })), [props.departments]);
  const secItems = useMemo(() => props.sections.map((x) => ({ value: x, label: x })), [props.sections]);

  return (
    <div ref={wrapRef} className="mt-2 flex flex-wrap gap-2">
      <DropdownFilter
        open={open === "division"}
        onToggle={() => setOpen((v) => (v === "division" ? null : "division"))}
        onClose={() => setOpen(null)}
        allLabel={props.divisionAllLabel ?? "All Divisions (Paged)"}
        selectedValue={props.divisionValue}
        onSelect={props.onDivision}
        items={divItems}
        minWidthClass="min-w-[200px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "department"}
        onToggle={() => setOpen((v) => (v === "department" ? null : "department"))}
        onClose={() => setOpen(null)}
        allLabel="All Departments"
        selectedValue={props.departmentValue}
        onSelect={props.onDepartment}
        items={deptItems}
        minWidthClass="min-w-[240px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "section"}
        onToggle={() => setOpen((v) => (v === "section" ? null : "section"))}
        onClose={() => setOpen(null)}
        allLabel="All Sections"
        selectedValue={props.sectionValue}
        onSelect={props.onSection}
        items={secItems}
        minWidthClass="min-w-[260px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />
    </div>
  );
}

function RotatedTick(props: { x?: number; y?: number; value?: any; color?: string; bold?: boolean }) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const fullText = String(props.value ?? "");
  const displayText = getDepartmentAbbr(fullText);

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{fullText}</title>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill={props.color ?? "currentColor"}
        fontSize={13}
        fontWeight={props.bold ? "bold" : "normal"}
        transform="rotate(-45)"
        style={{ cursor: "help" }}
      >
        {displayText}
      </text>
    </g>
  );
}

function TooltipShell(props: {
  title: string;
  lines: Array<{ label: string; value: any; color: string }>;
  footer?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ color: "#1f2937", fontWeight: "bold", marginBottom: "8px" }}>
        {props.title}
      </p>
      {props.lines.map((l, idx) => (
        <p key={idx} style={{ color: l.color, margin: "4px 0", fontSize: "13px" }}>
          {l.label}: {l.value}
        </p>
      ))}
      {props.footer && (
        <p
          style={{
            color: "#DC2626",
            fontWeight: "bold",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid #fee2e2",
            fontSize: "12px",
          }}
        >
          {props.footer}
        </p>
      )}
    </div>
  );
}

function PagingControls(props: {
  show: boolean;
  pageIndex: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  if (!props.show) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button size="sm" variant="outline" onClick={props.onPrev} disabled={!props.canPrev}>
        Previous
      </Button>
      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {props.pageIndex + 1} of {props.totalPages}
      </span>
      <Button size="sm" variant="outline" onClick={props.onNext} disabled={!props.canNext}>
        Next
      </Button>
    </div>
  );
}

/* =====================================================
   Chart Cards
   ===================================================== */
function TotalChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;

  summaryItems?: Array<{
    label: string;
    value: number;
    color: string;
  }>;

  data: TotalRow[];
  yDomain: [number, number];
  yTicks?: number[];

  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;

  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;

  divisions: string[];
  departments: string[];
  sections: string[];

  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;

  showPaging: boolean;
  pageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrev: boolean;
  canNext: boolean;

  loading?: boolean;
}) { 
  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-lg sm:text-xl">{props.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {props.subtitle}
                </p>
                {props.loading && (
                  <p className="text-xs text-muted-foreground mt-1">Loading...</p>
                )}
              </div>
            </div>

            <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
          </div>

          {props.summaryItems && props.summaryItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {props.summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border px-3 py-2 text-xs bg-white/70"
                  style={{ borderColor: item.color }}
                >
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <HierarchyDropdowns
            divisionValue={props.divisionValue}
            departmentValue={props.departmentValue}
            sectionValue={props.sectionValue}
            divisions={props.divisions}
            departments={props.departments}
            sections={props.sections}
            onDivision={props.onDivision}
            onDepartment={props.onDepartment}
            onSection={props.onSection}
            divisionAllLabel="All Divisions (Paged)"
          />

          <p className="text-xs text-muted-foreground mt-2 italic">
            Condition: Division empty → show Divisions (paged). Division chosen → show Departments. Department chosen → show Sections.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[500px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 50, right: 40, left: 20, bottom: 140 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={(tp: any) => <RotatedTick x={tp.x} y={tp.y} value={tp.payload?.value} />}
                tickLine={{ stroke: "currentColor" }}
                height={130}
                interval={0}
              />
              <YAxis
                domain={props.yDomain}
                ticks={props.yTicks}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 12 },
                }}
              />
              <Tooltip
                content={(tip: any) => {
                  const { active, payload, label } = tip;
                  if (!(active && payload && payload.length)) return null;
                  const d = payload[0].payload as TotalRow;

                  return (
                    <TooltipShell
                      title={String(label ?? "")}
                      lines={[
                        { label: "Plan", value: d.plan, color: "#006187" },
                        { label: "Actual", value: d.actual, color: "#EE642E" },
                      ]}
                    />
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />

              <Bar dataKey="plan" name="Plan" fill="#006187" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="plan"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill="#006187"
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>

              <Bar dataKey="actual" name="Actual" fill="#EE642E" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value } = p;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill="#EE642E"
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <PagingControls
          show={props.showPaging}
          pageIndex={props.pageIndex}
          totalPages={props.totalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          canPrev={props.canPrev}
          canNext={props.canNext}
        />
      </CardContent>
    </Card>
  );
}

function PlanActualChartCard(props: {
  title: string;
  subtitle: string;
  accentColor: string;

  data: PlanActualRow[];
  yDomain: [number, number];
  yTicks?: number[];

  year: string;
  month: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;

  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;

  divisions: string[];
  departments: string[];
  sections: string[];

  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;

  showPaging: boolean;
  pageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrev: boolean;
  canNext: boolean;

  planColor?: string;
  actualColor?: string;
  hideFilters?: boolean;
}) {
  const planColor = props.planColor || "#006187";
  const actualColor = props.actualColor || props.accentColor || "#EE642E";
  return (
    <Card className="shadow-lg border-0 bg-card h-full">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: props.accentColor }} />
              <div>
                <CardTitle className="text-lg sm:text-xl">{props.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{props.subtitle}</p>
              </div>
            </div>

            {!props.hideFilters && (
              <YearMonthControls year={props.year} month={props.month} onYear={props.onYear} onMonth={props.onMonth} />
            )}
          </div>

          {!props.hideFilters && (
            <>
              <HierarchyDropdowns
                divisionValue={props.divisionValue}
                departmentValue={props.departmentValue}
                sectionValue={props.sectionValue}
                divisions={props.divisions}
                departments={props.departments}
                sections={props.sections}
                onDivision={props.onDivision}
                onDepartment={props.onDepartment}
                onSection={props.onSection}
                divisionAllLabel="All Divisions (Paged)"
              />

              <p className="text-xs text-muted-foreground mt-2 italic">
                Default view shows 5 divisions (pagination). Select division/department for detail.
              </p>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="w-full h-[500px] sm:h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 50, right: 40, left: 20, bottom: 140 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="department"
                tick={(tp: any) => {
                  const idx = tp.index as number;
                  const d = props.data[idx];
                  const isUnderTarget = !!d && d.Plan > 0 && d.Actual < d.Plan;

                  return (
                    <RotatedTick
                      x={tp.x}
                      y={tp.y}
                      value={tp.payload?.value}
                      color={isUnderTarget ? "#DC2626" : "currentColor"}
                      bold={isUnderTarget}
                    />
                  );
                }}
                tickLine={{ stroke: "currentColor" }}
                height={130}
                interval={0}
              />

              <YAxis
                domain={props.yDomain}
                ticks={props.yTicks}
                tick={{ fill: "currentColor", fontSize: 14 }}
                tickLine={{ stroke: "currentColor" }}
                label={{
                  value: props.title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "currentColor", fontSize: 14 },
                }}
              />

              <Tooltip
                content={(tip: any) => {
                  const { active, payload, label } = tip;
                  if (!(active && payload && payload.length)) return null;

                  const d = payload[0].payload as PlanActualRow;
                  const isUnderTarget = d.Plan > 0 && d.Actual < d.Plan;

                  return (
                    <TooltipShell
                      title={String(label ?? "")}
                      lines={[
                        { label: "Plan", value: d.Plan, color: planColor },
                        { label: "Actual", value: d.Actual, color: actualColor },
                      ]}
                      footer={isUnderTarget ? "⚠️ Not Achieved" : undefined}
                    />
                  );
                }}
              />

              <Legend wrapperStyle={{ paddingTop: "100px" }} iconType="square" />

              <Bar dataKey="Plan" fill={planColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Plan" position="top" offset={12} style={{ fill: planColor, fontSize: 12, fontWeight: "bold" }} />
              </Bar>

              <Bar dataKey="Actual" fill={actualColor} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="Actual"
                  position="top"
                  content={(p: any) => {
                    const { x, y, width, value, index } = p;
                    const d = props.data[index];
                    if (!d) return null;

                    const isUnderTarget = d.Plan > 0 && d.Actual < d.Plan;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + 8}
                        fill={isUnderTarget ? "#DC2626" : actualColor}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <PagingControls
          show={props.showPaging}
          pageIndex={props.pageIndex}
          totalPages={props.totalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          canPrev={props.canPrev}
          canNext={props.canNext}
        />
      </CardContent>
    </Card>
  );
}

/* =====================================================
   ✅ SS chart bound (labels from API first)
   ===================================================== */
function useSsChartBound(params: {
  rows: SsChartApiRow[];
  filter: ReturnType<typeof useChartFilter>;
  mergedDivisions: string[];
  mergedDepartments: string[];
  mergedSections: string[];
  orgFallback: ReturnType<typeof useOrgOptionsFromStructure>;
}) {
  const { rows, filter, mergedDivisions, mergedDepartments, mergedSections, orgFallback } = params;

  return useMemo(() => {
    const divisionSel = String(filter.division ?? "").trim();
    const deptSel = String(filter.department ?? "").trim();
    const secSel = String(filter.section ?? "").trim();

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(mergedDivisions.length / pageSize));
    const hasPrevPage = filter.pageIndex > 0;
    const hasNextPage = (filter.pageIndex + 1) * pageSize < mergedDivisions.length;

    const level: "division" | "department" | "section" =
      !divisionSel ? "division" : !deptSel ? "department" : "section";

    const divMap = buildMaxMap(rows, "division", "totalSSPerDivision");
    const deptMap = buildMaxMap(rows, "department", "totalSSPerDepartment");
    const secMap = buildMaxMap(rows, "section", "totalSSPerSection");

    const divKey = normKey(divisionSel);
    const deptKey = normKey(deptSel);

    const apiDivisions = uniqueLabelsFromRows(rows, "division");
    const apiDepartments = uniqueSorted(
      rows
        .filter((r) => !divisionSel || normKey(r.division) === divKey)
        .map((r) => String(r.department ?? "").trim())
        .filter(Boolean)
    );

    const apiSections = uniqueSorted(
      rows
        .filter((r) => !divisionSel || normKey(r.division) === divKey)
        .filter((r) => !deptSel || normKey(r.department) === deptKey)
        .map((r) => String(r.section ?? "").trim())
        .filter(Boolean)
    );

    const fallbackDepartments = divisionSel
      ? orgFallback.departmentsByDivision[divisionSel] || []
      : orgFallback.allDepartments;

    const fallbackSections = deptSel
      ? orgFallback.sectionsByDepartment[deptSel] || []
      : uniqueSorted(fallbackDepartments.flatMap((d) => orgFallback.sectionsByDepartment[d] || []));

    let labels: string[] = [];
    if (level === "division") {
      // Urutkan berdasarkan totalSSPerDivision terbanyak
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.division;
        if (key) actualMap[key] = Number(r.totalSSPerDivision ?? 0);
      }
      const source = (mergedDivisions.length ? mergedDivisions : apiDivisions)
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    } else if (level === "department") {
      // Urutkan berdasarkan totalSSPerDepartment terbanyak
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.department;
        if (key) actualMap[key] = Number(r.totalSSPerDepartment ?? 0);
      }
      const source = (apiDepartments.length ? apiDepartments : (orgFallback.departmentsByDivision[divisionSel] || mergedDepartments || []))
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    } else {
      // Urutkan berdasarkan totalSSPerSection terbanyak
      const actualMap: Record<string, number> = {};
      for (const r of rows) {
        const key = r.section;
        if (key) actualMap[key] = Number(r.totalSSPerSection ?? 0);
      }
      const source = (secSel
        ? [secSel]
        : apiSections.length
        ? apiSections
        : (orgFallback.sectionsByDepartment[deptSel] || (fallbackSections.length ? fallbackSections : mergedSections)))
        .slice()
        .sort((a, b) => (actualMap[b] || 0) - (actualMap[a] || 0));
      const start = filter.pageIndex * pageSize;
      labels = source.slice(start, start + pageSize);
    }

    const data: PlanActualRow[] = labels.map((label) => {
      // Cari row hasil SsChartApiRow yang label/department/division/section-nya sama
      const found = rows.find(
        (r) =>
          (level === "division" && r.division === label) ||
          (level === "department" && r.department === label) ||
          (level === "section" && r.section === label)
      );
      const actual =
        found?.actual !== undefined
          ? Number(found.actual ?? 0)
          : level === "division"
          ? Number(found?.totalSSPerDivision ?? 0)
          : level === "department"
          ? Number(found?.totalSSPerDepartment ?? 0)
          : Number(found?.totalSSPerSection ?? 0);

      return {
        department: label,
        Plan: found ? Number(found.planSS ?? found.plan ?? 0) : 0,
        Actual: actual,
        Achievement: 0,
      };
    });

    return {
      level,
      data,
      filteredDepartments:
        level === "division"
          ? (apiDepartments.length ? apiDepartments : mergedDepartments)
          : fallbackDepartments,
      filteredSections: level !== "section" ? fallbackSections : labels,
      hasPrevPage,
      hasNextPage,
      showPaging: level === "division",
      totalPages,
      pageSize,
    };
  }, [
    rows,
    filter.division,
    filter.department,
    filter.section,
    filter.pageIndex,
    mergedDivisions,
    mergedDepartments,
    mergedSections,
    orgFallback.allDepartments,
    orgFallback.departmentsByDivision,
    orgFallback.sectionsByDepartment,
  ]);
}

/* =====================================================
   MONITORING (refactor): source list by module
   ===================================================== */
function normalizeProjectStatus(p: Project): Project {
  if (p.type === "SS") {
    const s = String(p.status ?? "");
    const isNew =
      s === SS_STATUS.REVIEW_LEADER ||
      s === SS_STATUS.REVIEW_BPI ||
      s === SS_STATUS.COMPLETE;
    return { ...p, status: isNew ? (p.status as SSStatus) : normalizeSSStatus(s) };
  }
  return p;
}

function useMonitoring(params: {
  projects: Project[];
  modules: ModuleConfig[];
  ssRows: Project[]; // ✅ feed SS from API list (stable)
}) {
  const { projects, modules, ssRows } = params;

  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const resetAllFilters = useCallback(() => {
    setSelectedStatus(null);
    setSelectedStep(null);
    setSelectedSite(null);
    setSelectedDivision(null);
    setSelectedDepartment(null);
    setSelectedSection(null);
  }, []);

  const getBaseList = useCallback(
    (moduleId: ModuleId) => {
      if (moduleId === "ss") return ssRows.map(normalizeProjectStatus);

      const type = MODULE_TYPE_MAP[moduleId];
      return projects.filter((p) => p.type === type).map(normalizeProjectStatus);
    },
    [projects, ssRows]
  );

  const filteredProjects = useMemo(() => {
    if (!selectedModule) return [];

    let list = getBaseList(selectedModule);

    if (selectedStatus) {
      if (isQFamily(selectedModule)) {
        const wanted = normalizeQStatusKey(selectedStatus);
        if (wanted === "registered") {
          list = list.filter((p) => {
            const s = normalizeQStatusKey(p.status);
            return s === "registered" || s === "submitted";
          });
        } else if (wanted === "in-progress" || wanted === "finished") {
          list = list.filter((p) => normalizeQStatusKey(p.status) === wanted);
        } else {
          list = list.filter((p) => String(p.status) === selectedStatus);
        }
      } else {
        list = list.filter((p) => String(p.status) === selectedStatus);
      }
    }

    if (isQFamily(selectedModule) && selectedStatus === "in-progress" && selectedStep) {
      list = list.filter((p) => pickNumber((p as any).step, 0) === selectedStep);
    }

    if (selectedSite) list = list.filter((p) => (p.members || []).some((m) => m.site === selectedSite));
    if (selectedDivision) list = list.filter((p) => (p.members || []).some((m) => m.division === selectedDivision));
    if (selectedDepartment) list = list.filter((p) => (p.members || []).some((m) => m.department === selectedDepartment));
    if (selectedSection) list = list.filter((p) => (p.members || []).some((m) => m.section === selectedSection));

    return list;
  }, [
    getBaseList,
    selectedModule,
    selectedStatus,
    selectedStep,
    selectedSite,
    selectedDivision,
    selectedDepartment,
    selectedSection,
  ]);

  useEffect(() => {
    if (!selectedModule) return;
    if (!isQFamily(selectedModule)) return;
    if (normalizeQStatusKey(selectedStatus) !== "in-progress") return;
    if (selectedStep != null) return;
    setSelectedStep(1);
  }, [selectedModule, selectedStatus, selectedStep]);

  // fallback options derived from current list
  const memberOptions = useMemo<MemberOptions>(() => {
    if (!selectedModule) return { sites: [], divisions: [], departments: [], sections: [] };
    const targetProjects = getBaseList(selectedModule);

    const sites: string[] = [];
    const divisions: string[] = [];
    const departments: string[] = [];
    const sections: string[] = [];

    for (const p of targetProjects) {
      for (const m of p.members || []) {
        if (m.site) sites.push(m.site);
        if (m.division) divisions.push(m.division);
        if (m.department) departments.push(m.department);
        if (m.section) sections.push(m.section);
      }
    }

    return {
      sites: uniqueSorted(sites),
      divisions: uniqueSorted(divisions),
      departments: uniqueSorted(departments),
      sections: uniqueSorted(sections),
    };
  }, [getBaseList, selectedModule]);

  const getModuleStats = useCallback(
    (moduleId: ModuleId) => {
      const list = getBaseList(moduleId);
      const byStatusExact = (s: string) => list.filter((p) => String(p.status) === s).length;
      const byStatusNorm = (s: string) => list.filter((p) => normalizeQStatusKey(p.status) === s).length;

      return {
        registered: isQFamily(moduleId) ? byStatusNorm("registered") + byStatusNorm("submitted") : byStatusExact("registered"),
        inProgress: isQFamily(moduleId) ? byStatusNorm("in-progress") : byStatusExact("in-progress"),
        finished: isQFamily(moduleId) ? byStatusNorm("finished") : byStatusExact("finished"),
        reviewByLeader: byStatusExact(SS_STATUS.REVIEW_LEADER),
        reviewByBPI: byStatusExact(SS_STATUS.REVIEW_BPI),
        completed: byStatusExact(SS_STATUS.COMPLETE),
      };
    },
    [getBaseList]
  );

  const getTypeColor = useCallback(
    (type: ProjectType) => {
      const m = modules.find((x) => x.type === type);
      const bg = m?.iconColor || "#0f766e";
      return { bg, text: "#fff" };
    },
    [modules]
  );

  const getStatusBadge = useCallback((status: string, step: any) => {
    const stepObj = step && typeof step === "object" ? step : null;
    const stepVal = stepObj ? (stepObj.step ?? stepObj.Step) : step;
    const stepStatusRaw = stepObj ? (stepObj.stepStatus ?? stepObj.StepStatus) : undefined;
    const stepStatusKey = normalizeQStatusKey(stepStatusRaw);
    const stepStatusLabel =
      stepStatusKey === "approved"
        ? "Approved"
        : stepStatusKey === "submitted"
        ? "Submitted"
        : stepStatusKey === "rejected"
        ? "Rejected"
        : stepStatusRaw
        ? String(stepStatusRaw)
        : "";

    const map: Record<string, { label: string; cls: string }> = {
      [SS_STATUS.REVIEW_LEADER]: { label: SS_STATUS.REVIEW_LEADER, cls: "bg-blue-600 text-white" },
      [SS_STATUS.REJECT_LEADER]: { label: SS_STATUS.REJECT_LEADER, cls: "bg-red-600 text-white" },
      [SS_STATUS.REVIEW_BPI]: { label: SS_STATUS.REVIEW_BPI, cls: "bg-yellow-600 text-white" },
      [SS_STATUS.COMPLETE]: { label: SS_STATUS.COMPLETE, cls: "bg-green-600 text-white" },
      [SS_STATUS.REVIEW_LEADER.toLowerCase()]: { label: SS_STATUS.REVIEW_LEADER, cls: "bg-blue-600 text-white" },
      [SS_STATUS.REJECT_LEADER.toLowerCase()]: { label: SS_STATUS.REJECT_LEADER, cls: "bg-red-600 text-white" },
      [SS_STATUS.REVIEW_BPI.toLowerCase()]: { label: SS_STATUS.REVIEW_BPI, cls: "bg-yellow-600 text-white" },
      [SS_STATUS.COMPLETE.toLowerCase()]: { label: SS_STATUS.COMPLETE, cls: "bg-green-600 text-white" },
      "review-by-leader": { label: SS_STATUS.REVIEW_LEADER, cls: "bg-blue-600 text-white" },
      "reject-by-leader": { label: SS_STATUS.REJECT_LEADER, cls: "bg-red-600 text-white" },
      "review-by-bpi": { label: SS_STATUS.REVIEW_BPI, cls: "bg-yellow-600 text-white" },
      completed: { label: SS_STATUS.COMPLETE, cls: "bg-green-600 text-white" },

      registered: { label: "Registered", cls: "bg-blue-600 text-white" },
      submitted: { label: "Submitted", cls: "bg-blue-600 text-white" },
      "in-progress": {
        label: `In Progress${
          stepVal ? ` (Step ${stepVal}${stepStatusLabel ? ` - ${stepStatusLabel}` : ""})` : ""
        }`,
        cls: "bg-yellow-600 text-white",
      },
      finished: { label: "Finished", cls: "bg-green-600 text-white" },
    };

    const key = normalizeQStatusKey(status);
    const statusTrim = String(status ?? "").trim();
    const v = map[key] || map[statusTrim] || map[statusTrim.toLowerCase()] || { label: statusTrim || status, cls: "bg-muted text-foreground" };
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold inline-block", v.cls)}>
        {v.label}
      </span>
    );
  }, []);

  return {
    selectedModule,
    setSelectedModule,

    selectedStatus,
    setSelectedStatus,
    selectedStep,
    setSelectedStep,

    selectedSite,
    setSelectedSite,
    selectedDivision,
    setSelectedDivision,
    selectedDepartment,
    setSelectedDepartment,
    selectedSection,
    setSelectedSection,

    resetAllFilters,
    memberOptions,
    filteredProjects,

    getModuleStats,
    getTypeColor,
    getStatusBadge,
  };
}

/* =====================================================
   Monitoring UI components
   ===================================================== */
function StatTile(props: {
  active: boolean;
  onClick: () => void;
  label: string;
  value: number;
  activeCls: string;
  baseCls: string;
  valueCls: string;
}) {
  return (
    <div
      className={cn(
        "text-center p-3 rounded-lg cursor-pointer hover:bg-white/70 transition-colors",
        props.active ? props.activeCls : props.baseCls
      )}
      onClick={props.onClick}
    >
      <p className="text-xs text-muted-foreground mb-1">{props.label}</p>
      <p className={cn("text-2xl font-bold", props.valueCls)}>{props.value}</p>
    </div>
  );
}

function StatsPanel(props: {
  moduleId: ModuleId;
  selectedStatus: string | null;
  setSelectedStatus: (v: string | null) => void;
  setSelectedStep: (v: number | null) => void;
  getModuleStats: (id: ModuleId) => {
    registered: number;
    inProgress: number;
    finished: number;
    reviewByLeader: number;
    reviewByBPI: number;
    completed: number;
  };
  ssOverrideTotals?: {
    reviewByLeader: number;
    reviewByBPI: number;
    completed: number;
  };
}) {
  const base = props.getModuleStats(props.moduleId);

  const s =
    props.moduleId === "ss" && props.ssOverrideTotals
      ? {
          ...base,
          reviewByLeader: props.ssOverrideTotals.reviewByLeader,
          reviewByBPI: props.ssOverrideTotals.reviewByBPI,
          completed: props.ssOverrideTotals.completed,
        }
      : base;

  if (isQFamily(props.moduleId)) {
    const registeredLabel =
      props.moduleId === "tebp" ? "Project Charter Approved" : "Project Registered";

    return (
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          active={props.selectedStatus === "registered"}
          onClick={() => {
            props.setSelectedStatus(props.selectedStatus === "registered" ? null : "registered");
            props.setSelectedStep(null);
          }}
          label={registeredLabel}
          value={s.registered}
          activeCls="bg-blue-100 ring-2 ring-blue-600"
          baseCls="bg-white/50"
          valueCls="text-blue-600"
        />

        <StatTile
          active={props.selectedStatus === "in-progress"}
          onClick={() => props.setSelectedStatus(props.selectedStatus === "in-progress" ? null : "in-progress")}
          label="In Progress"
          value={s.inProgress}
          activeCls="bg-yellow-100 ring-2 ring-yellow-600"
          baseCls="bg-white/50"
          valueCls="text-yellow-600"
        />

        <StatTile
          active={props.selectedStatus === "finished"}
          onClick={() => {
            props.setSelectedStatus(props.selectedStatus === "finished" ? null : "finished");
            props.setSelectedStep(null);
          }}
          label="Finished"
          value={s.finished}
          activeCls="bg-green-100 ring-2 ring-green-600"
          baseCls="bg-white/50"
          valueCls="text-green-600"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile
        active={props.selectedStatus === SS_STATUS.REVIEW_LEADER}
        onClick={() => props.setSelectedStatus(props.selectedStatus === SS_STATUS.REVIEW_LEADER ? null : SS_STATUS.REVIEW_LEADER)}
        label={SS_STATUS.REVIEW_LEADER}
        value={s.reviewByLeader}
        activeCls="bg-blue-100 ring-2 ring-blue-600"
        baseCls="bg-white/50"
        valueCls="text-blue-600"
      />

      <StatTile
        active={props.selectedStatus === SS_STATUS.REVIEW_BPI}
        onClick={() => props.setSelectedStatus(props.selectedStatus === SS_STATUS.REVIEW_BPI ? null : SS_STATUS.REVIEW_BPI)}
        label={SS_STATUS.REVIEW_BPI}
        value={s.reviewByBPI}
        activeCls="bg-yellow-100 ring-2 ring-yellow-600"
        baseCls="bg-white/50"
        valueCls="text-yellow-600"
      />

      <StatTile
        active={props.selectedStatus === SS_STATUS.COMPLETE}
        onClick={() => props.setSelectedStatus(props.selectedStatus === SS_STATUS.COMPLETE ? null : SS_STATUS.COMPLETE)}
        label={SS_STATUS.COMPLETE}
        value={s.completed}
        activeCls="bg-green-100 ring-2 ring-green-600"
        baseCls="bg-white/50"
        valueCls="text-green-600"
      />
    </div>
  );
}

function StepsPanel(props: {
  moduleId: ModuleId;
  projects: Project[];
  selectedStep: number | null;
  setSelectedStep: (v: number | null) => void;
}) {
  const type = MODULE_TYPE_MAP[props.moduleId];

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs text-muted-foreground mb-2">Select Step:</p>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
          const count = props.projects.filter((p) => p.type === type && normalizeQStatusKey(p.status) === "in-progress" && pickNumber((p as any).step, 0) === step).length;
          const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];

          return (
            <div
              key={step}
              className={cn(
                "text-center p-2 rounded-lg cursor-pointer hover:bg-white/70 transition-colors text-xs",
                props.selectedStep === step ? "bg-orange-100 ring-2 ring-orange-600" : "bg-white/50"
              )}
              onClick={() => props.setSelectedStep(props.selectedStep === step ? null : step)}
            >
              <p className="text-[10px] text-muted-foreground mb-1">Langkah {step}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mb-1">({monthNames[step]})</p>
              <p className="text-lg font-bold text-orange-600">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemberFilters(props: {
  options: MemberOptions;
  orgLoading?: boolean;

  selectedSite: string | null;
  selectedDivision: string | null;
  selectedDepartment: string | null;
  selectedSection: string | null;

  setSelectedSite: (v: string | null) => void;
  setSelectedDivision: (v: string | null) => void;
  setSelectedDepartment: (v: string | null) => void;
  setSelectedSection: (v: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<null | "site" | "division" | "department" | "section">(null);
  useOutsideClick(wrapRef as any, () => setOpen(null));

  const siteItems = useMemo(() => props.options.sites.map((x) => ({ value: x, label: x })), [props.options.sites]);
  const divItems = useMemo(() => props.options.divisions.map((x) => ({ value: x, label: x })), [props.options.divisions]);
  const deptItems = useMemo(() => props.options.departments.map((x) => ({ value: x, label: x })), [props.options.departments]);
  const secItems = useMemo(() => props.options.sections.map((x) => ({ value: x, label: x })), [props.options.sections]);

  const orgDisabled = !!props.orgLoading;

  return (
    <div ref={wrapRef} className="mt-4 flex flex-wrap gap-2">
      <DropdownFilter
        open={open === "site"}
        onToggle={() => setOpen((v) => (v === "site" ? null : "site"))}
        onClose={() => setOpen(null)}
        allLabel="All Site"
        selectedValue={props.selectedSite}
        onSelect={props.setSelectedSite}
        items={siteItems}
        minWidthClass="min-w-[140px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "division"}
        onToggle={() => setOpen((v) => (v === "division" ? null : "division"))}
        onClose={() => setOpen(null)}
        allLabel="All Division"
        selectedValue={props.selectedDivision}
        onSelect={(v) => {
          props.setSelectedDivision(v);
          props.setSelectedDepartment(null);
          props.setSelectedSection(null);
        }}
        items={divItems}
        minWidthClass="min-w-[160px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
        disabled={orgDisabled}
      />

      <DropdownFilter
        open={open === "department"}
        onToggle={() => setOpen((v) => (v === "department" ? null : "department"))}
        onClose={() => setOpen(null)}
        allLabel="All Department"
        selectedValue={props.selectedDepartment}
        onSelect={(v) => {
          props.setSelectedDepartment(v);
          props.setSelectedSection(null);
        }}
        items={deptItems}
        minWidthClass="min-w-[220px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
        disabled={orgDisabled}
      />

      <DropdownFilter
        open={open === "section"}
        onToggle={() => setOpen((v) => (v === "section" ? null : "section"))}
        onClose={() => setOpen(null)}
        allLabel="All Section"
        selectedValue={props.selectedSection}
        onSelect={props.setSelectedSection}
        items={secItems}
        minWidthClass="min-w-[240px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
        disabled={orgDisabled}
      />
    </div>
  );
}

/* =====================================================
   Projects Table (SS server paging / others client paging)
   ===================================================== */
type PageSizeValue = "10" | "100" | "all";

function useClientPagination<T>(rows: T[], resetDeps: any[] = []) {
  const [pageSize, setPageSize] = useState<PageSizeValue>("10");
  const [pageIndex, setPageIndex] = useState(0);

  const total = rows.length;

  const pageSizeNumber = useMemo(() => {
    if (pageSize === "all") return Math.max(total, 1);
    return Number(pageSize);
  }, [pageSize, total]);

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(total / pageSizeNumber));
  }, [pageSize, pageSizeNumber, total]);

  useEffect(() => {
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  useEffect(() => {
    setPageIndex((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const start = pageSize === "all" ? 0 : pageIndex * pageSizeNumber;
  const end = pageSize === "all" ? total : Math.min(total, start + pageSizeNumber);

  const pageRows = useMemo(() => {
    if (pageSize === "all") return rows;
    return rows.slice(start, end);
  }, [rows, pageSize, start, end]);

  const canPrev = pageSize !== "all" && pageIndex > 0;
  const canNext = pageSize !== "all" && pageIndex < totalPages - 1;

  return {
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    total,
    totalPages,
    start,
    end,
    pageRows,
    canPrev,
    canNext,
  };
}

function ProjectsTable(props: {
  selectedModule: ModuleId;
  filteredProjects: Project[];

  selectedStatus: string | null;
  selectedStep: number | null;

  setSelectedStatus: (v: string | null) => void;
  setSelectedStep: (v: number | null) => void;

  getTypeColor: (t: ProjectType) => { bg: string; text: string };
  getStatusBadge: (status: string, step: any) => React.ReactNode;
  onQccStepSubmitted?: () => void;

  ssPaging?: {
    pageNumber: number; // 0-based
    pageSize: number;
    totalRows: number;
    totalPages: number;
    setPageNumber: (n: number) => void;
    setPageSize: (n: number) => void;
  };

  showDetailModal: (project: Project) => void;
  showEditModal: (project: Project) => void;
}) {
  const isSS = props.selectedModule === "ss";
  const isServerPaging = isSS && !!props.ssPaging;
  const ss = props.ssPaging;

  const statusButtons = useMemo(() => {
    if (isQFamily(props.selectedModule)) {
      return [
        {
          key: "registered",
          label: props.selectedModule === "tebp" ? "Project Charter Approved" : "Project Registered",
          activeCls: "bg-blue-600 text-white hover:bg-blue-700",
        },
        { key: "in-progress", label: "In Progress", activeCls: "bg-yellow-600 text-white hover:bg-yellow-700" },
        { key: "finished", label: "Finished", activeCls: "bg-green-600 text-white hover:bg-green-700" },
      ] as const;
    }

    return [
      { key: SS_STATUS.REVIEW_LEADER, label: SS_STATUS.REVIEW_LEADER, activeCls: "bg-blue-600 text-white hover:bg-blue-700" },
      { key: SS_STATUS.REVIEW_BPI, label: SS_STATUS.REVIEW_BPI, activeCls: "bg-yellow-600 text-white hover:bg-yellow-700" },
      { key: SS_STATUS.COMPLETE, label: SS_STATUS.COMPLETE, activeCls: "bg-green-600 text-white hover:bg-green-700" },
    ] as const;
  }, [props.selectedModule]);

  const pag = useClientPagination<Project>(props.filteredProjects, [
    props.selectedModule,
    props.selectedStatus,
    props.selectedStep,
    props.filteredProjects.length,
  ]);

  const ssStart = useMemo(() => {
    if (!ss || ss.totalRows <= 0) return 0;
    return ss.pageNumber * ss.pageSize + 1;
  }, [ss]);

  const ssEnd = useMemo(() => {
    if (!ss || ss.totalRows <= 0) return 0;
    const end = ss.pageNumber * ss.pageSize + props.filteredProjects.length;
    return Math.min(ss.totalRows, end);
  }, [ss, props.filteredProjects.length]);

  const tableRows = isServerPaging ? props.filteredProjects : pag.pageRows;

  // State untuk modal detail dan konfirmasi delete QCC
  const [qccDetail, setQccDetail] = useState<Project|null>(null);
  const [qccDelete, setQccDelete] = useState<Project|null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");
  async function handleDeleteQcc(project: Project) {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(API.QCC_DELETE + "/" + project.id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json?.responseCode !== 200) throw new Error(json?.message || "Gagal delete");
      setQccDelete(null);
      // Refresh halaman (atau panggil ulang fetch QCC)
      window.location.reload();
    } catch (e: any) {
      setDeleteError(e?.message || "Gagal delete");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="w-full mt-3">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          onClick={() => {
            props.setSelectedStatus(null);
            props.setSelectedStep(null);
            if (isServerPaging && ss) ss.setPageNumber(0);
          }}
          variant={props.selectedStatus === null ? "default" : "outline"}
          size="sm"
          className={props.selectedStatus === null ? "bg-gradient-to-r from-[#006187] to-[#007B5F] text-white" : ""}
        >
          All Projects
        </Button>

        {statusButtons.map((b) => (
          <Button
            key={b.key}
            onClick={() => {
              props.setSelectedStatus(props.selectedStatus === b.key ? null : (b.key as string));
              if (b.key !== "in-progress") props.setSelectedStep(null);
              if (isServerPaging && ss) ss.setPageNumber(0);
            }}
            variant={props.selectedStatus === b.key ? "default" : "outline"}
            size="sm"
            className={props.selectedStatus === b.key ? b.activeCls : ""}
          >
            {b.label}
          </Button>
        ))}
      </div>

      {isQFamily(props.selectedModule) && props.selectedStatus === "in-progress" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
            <Button
              key={step}
              onClick={() => props.setSelectedStep(props.selectedStep === step ? null : step)}
              variant={props.selectedStep === step ? "default" : "outline"}
              size="sm"
              className={props.selectedStep === step ? "bg-orange-600 text-white hover:bg-orange-700" : ""}
            >
              Langkah {step}
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        {isServerPaging && ss ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows:</span>

              <Select
                value={String(ss.pageSize)}
                onValueChange={(v: string) => {
                  const n = Number(v);
                  ss.setPageSize(n);
                  ss.setPageNumber(0);
                }}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground">
                {ss.totalRows === 0 ? "No data" : `Showing ${ssStart}-${ssEnd} of ${ss.totalRows}`}
              </span>
            </div>

            {ss.totalRows > 0 && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => ss.setPageNumber(Math.max(0, ss.pageNumber - 1))} disabled={ss.pageNumber <= 0}>
                  Previous
                </Button>

                <span className="px-2 text-xs text-muted-foreground">
                  Page {ss.pageNumber + 1} of {Math.max(1, ss.totalPages)}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ss.setPageNumber(Math.min(ss.totalPages - 1, ss.pageNumber + 1))}
                  disabled={ss.pageNumber + 1 >= ss.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows:</span>
              <Select
                value={pag.pageSize}
                onValueChange={(v: string) => {
                  pag.setPageSize(v as PageSizeValue);
                  pag.setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground">
                {pag.total === 0 ? "No data" : `Showing ${pag.start + 1}-${pag.end} of ${pag.total}`}
              </span>
            </div>

            {pag.pageSize !== "all" && pag.total > 0 && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => pag.setPageIndex((p) => Math.max(0, p - 1))} disabled={!pag.canPrev}>
                  Previous
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  Page {pag.pageIndex + 1} of {pag.totalPages}
                </span>
                <Button size="sm" variant="outline" onClick={() => pag.setPageIndex((p) => p + 1)} disabled={!pag.canNext}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {tableRows.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {props.selectedStatus ? `No projects with selected status` : `No projects yet.`}
        </div>
      ) : (
        <div style={{ width: '100%', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxHeight: 480, overflowY: 'auto', overflowX: 'auto' }}>
          <div>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">No</TableHead>
                {isSS ? (
                  <>
                    <TableHead className="text-center">Project Type</TableHead>
                    <TableHead className="text-center">Ide Number</TableHead>
                    <TableHead className="text-center">Judul SS</TableHead>
                    <TableHead className="text-center">Name Pembuat SS</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-center">Judul</TableHead>
                    <TableHead className="text-center">Leader/Creator</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {tableRows.map((project, i) => {
                const typeColor = props.getTypeColor(project.type);
                const rowNo = isServerPaging && ss ? ss.pageNumber * ss.pageSize + i + 1 : pag.start + i + 1;
                
                if (isSS) {
                  const ssStatus = String(project.status ?? "").trim();
                  const isRejectByLeader = normalizeSSStatus(ssStatus) === SS_STATUS.REJECT_LEADER;

                  return (
                    <TableRow key={String(project.id ?? rowNo)}>
                      <TableCell className="text-center">{rowNo}</TableCell>
                      <TableCell className="text-center">
                        <Badge style={{ backgroundColor: typeColor.bg, color: typeColor.text, border: "none" }}>SS</Badge>
                      </TableCell>
                      <TableCell className="text-center">{project.ideNumber ?? "-"}</TableCell>
                      <TableCell>{project.judulSS}</TableCell>
                      <TableCell className="text-center">{project.pembuatSS || "-"}</TableCell>
                      <TableCell className="text-center">{props.getStatusBadge(String(project.status), project.step)}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" style={{backgroundColor:'#e5e7eb',color:'#111'}} variant="ghost" onClick={() => props.showDetailModal(project)}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }

                // QCC/other project row
                return (
                  <TableRow key={String(project.id ?? rowNo)}>
                    <TableCell className="text-center">{rowNo}</TableCell>
                    <TableCell>{project.judulSS}</TableCell>
                    <TableCell className="text-center">{project.pembuatSS || project.leaderName || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge style={{ backgroundColor: typeColor.bg, color: typeColor.text, border: "none" }}>
                        {project.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {props.getStatusBadge(String(project.status), { step: project.step, stepStatus: project.stepStatus })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" style={{backgroundColor:'#e5e7eb',color:'#111'}} onClick={() => setQccDetail(project)}>
                        Detail
                      </Button>
                      {/*
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => setQccDelete(project)}>
                        Delete
                      </Button> */}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal Detail QCC */}
      {qccDetail && (
        <QccDetailModal
          project={qccDetail}
          onClose={() => setQccDetail(null)}
          onStepSubmitted={props.onQccStepSubmitted}
        />
      )}

      {/* Modal Konfirmasi Delete QCC */}
      {qccDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Hapus Project QCC?</h2>
            <div className="mb-4">Yakin ingin menghapus project <b>{qccDelete.judulSS}</b>?</div>
            {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setQccDelete(null)} disabled={deleteLoading}>Batal</Button>
              <Button variant="destructive" onClick={() => handleDeleteQcc(qccDelete)} disabled={deleteLoading}>
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   MODULE GRID
   ===================================================== */
function QuickModuleGrid(props: {
  modules: ModuleConfig[];
  selected: ModuleId | null; 
  onSelect: (id: ModuleId | null) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {props.modules.map((m) => {
        const Icon = m.icon;
        const id = m.id;
        const theme = MODULE_THEME[id];

        const active = props.selected === id;
        const dimmed = !!props.selected && props.selected !== id;

        return (
          <Button
            key={m.id}
            onClick={() => {
              props.onSelect(active ? null : id);
              props.onResetFilters();
            }}
            className={cn(
              "h-auto py-5 px-4 flex flex-col items-center gap-2.5 border-0 transition-all duration-300",
              active ? "ring-2 ring-white ring-offset-2" : ""
            )}
            style={{
              background: theme.baseGradient,
              opacity: dimmed ? 0.5 : 1,
              color: "#FFFFFF",
              fontWeight: "700",
              borderRadius: "15px",
              boxShadow: active ? theme.boxShadow.active : theme.boxShadow.normal,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!props.selected || active) e.currentTarget.style.background = theme.hoverGradient;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = theme.baseGradient;
            }}
          >
            <Icon className={id === "tebp" ? "w-5 h-5 text-[#E8FFFA]" : "w-5 h-5"} />
            <p className="text-xs text-center leading-tight" style={{ fontWeight: "700" }}>
              {id === "crp" ? "Cost Reduction" : m.title}
            </p>
          </Button>
        );
      })}
    </div>
  );
}

/* =====================================================
   MAIN
   ===================================================== */
export default function DashboardAnalyticsAndMonitoring(props: DashboardAnalyticsAndMonitoringProps) {
    const loginNrp = useLoginNrp();
  // ----- token -----
  const token = useAuthToken();
  const [qccRefreshKey, setQccRefreshKey] = useState(0);
  const [selectedChartModule, setSelectedChartModule] = useState<ModuleId | null>(null);

  // Fetch QCC list by NRP
  const qccListApiUrl = API.QCC_LIST;
  const qccList = useQccListByNrp({
    enabled: !!qccListApiUrl && !!loginNrp,
    url: qccListApiUrl,
    nrp: loginNrp ?? "",
    token,
    refreshKey: qccRefreshKey,
  });

  // Fetch QCP list by NRP
  const qcpListApiUrl = (API as any).QCP_LIST as string;
  const qcpList = useQcpListByNrp({
    enabled: !!qcpListApiUrl && !!loginNrp,
    url: qcpListApiUrl,
    nrp: loginNrp ?? "",
    token,
    refreshKey: qccRefreshKey,
  });

    // TODO: Integrasi ke useMonitoring (step berikutnya)
  // Detail API hook
  const ssDetailApi = useSsDetailApi();
  // =========================
  // Detail Modal State & Component (cleaned up)
  // =========================
  const [detailModalProject, setDetailModalProject] = useState<Project | null>(null);
  const showDetailModal = (project: Project) => {
    ssDetailApi.fetchDetail(project.itemKey || project.ideNumber || "");
    setDetailModalProject(project);
  };
  const [editModalProject, setEditModalProject] = useState<Project | null>(null);
  const showEditModal = (project: Project) => {
    ssDetailApi.fetchDetail(project.itemKey || project.ideNumber || "");
    setEditModalProject(project);
  };

  // Validation helper
  function validateRequired(state: any) {
    if(!state.masalah?.trim()) return "Masalah wajib diisi.";
    if (!state.uraianMasalah?.trim()) return "Uraian masalah wajib diisi.";
    if (!state.ideDiajukan?.trim()) return "Ide diajukan wajib diisi.";
    if (!state.uraianProcess?.trim()) return "Uraian process wajib diisi.";
    // if (!state.evalQuality?.trim()) return "Eval Quality wajib diisi.";
    // if (!state.evalCost?.trim()) return "Eval Cost wajib diisi.";
    // if (!state.evalDelivery?.trim()) return "Eval Delivery wajib diisi.";
    // if (!state.evalSafety?.trim()) return "Eval Safety wajib diisi.";
    // if (!state.evalMorale?.trim()) return "Eval Morale wajib diisi.";
    // if (!state.evalProductivity?.trim()) return "Eval Productivity wajib diisi.";
    return "";
  }

  const [editModalError, setEditModalError] = useState<string>("");

  const STATUS_DEFAULT = "Review by leader";
  function buildFormData(state: any)  {
      const fd = new FormData();
  
      fd.append("Action", "2");
      fd.append("CreatedBy", state.createdBy);
      fd.append('IDEANO', state.itemKey || "");
      fd.append("Masalah", state.masalah);
      fd.append("UraianMasalah", state.uraianMasalah);
      fd.append("IdeDiajukan", state.ideDiajukan);
      fd.append("UraianProcess", state.uraianProcess);
  
      fd.append("EvalQuality", state.evalQuality);
      fd.append("EvalCost", state.evalCost);
      fd.append("EvalDelivery", state.evalDelivery);
      fd.append("EvalSafety", state.evalSafety);
      fd.append("EvalMorale", state.evalMorale);
      fd.append("EvalProductivity", state.evalProductivity);
      fd.append("Status", STATUS_DEFAULT);
      
  
      return fd;
    };
  function resolveApiUrl(v: any): string {
    return typeof v === "function" ? v() : String(v ?? "");
  }
  const handleSaveEditModal = async (form: any) => {
    const error = validateRequired(form);
    const fd = buildFormData(form);
    console.log('error',error);
    if (error) {
      setEditModalError(error);
      return;
    }

    const url = resolveApiUrl((API as any).SUGGESTION_EXECUTE);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const { json, text } = await readResponse(res);

    if (!res.ok) {
      setEditModalError(json?.message ?? text ?? `HTTP ${res.status}`);
      return;
    }

    if (!isSuccess(json, true)) {
      const code = getApiCode(json);
      setEditModalError(json?.message || (code != null ? `Gagal submit (code: ${code})` : "Gagal submit IDE"));
      return;
    }

    // openSuccess(json?.message || "Sukses submit Suggestion IDE");

    // setEditModalError("");
    // TODO: Save logic here
    closeEditModal();
  }

  async function readResponse(res: Response) {
    const text = await res.text().catch(() => "");
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { text, json };
  }
  function getApiCode(json: any): number | null {
    const raw = json?.code ?? json?.responseCode ?? json?.ResponseCode ?? json?.Code ?? null;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }
  function isSuccess(json: any, httpOk: boolean) {
    if (!httpOk) return false;
    const code = getApiCode(json);
    if (code == null) return true;
    if (code === -1) return false;
    return code === 200;
  }

  const closeEditModal = () => setEditModalProject(null);
  const closeDetailModal = () => setDetailModalProject(null);

  // ----- Org for Q chart (from structure keys) -----
  const orgQ = useOrgOptionsFromStructure(props.organizationStructure);

  // ----- Chart state -----
  const chartFilter = useChartFilter("2026", "Jan");
  const ssFilter = chartFilter;
  const qccFilter = chartFilter;
  const qcpFilter = chartFilter;

  // 1) ORG MASTER FIRST (SEQUENCE)
  const orgExecuteUrl = (API as any).ORGANIZATION_EXECUTE as string;
  const orgMaster = useOrgMasterOnce({ enabled: !!orgExecuteUrl, url: orgExecuteUrl, token });

  const qccChartOrg = useChartOrgOptionsFromMaster({
    master: orgMaster,
    selectedDivisionName: qccFilter.division,
    selectedDepartmentName: qccFilter.department,
    fallback: orgQ,
  });

  const qcpChartOrg = useChartOrgOptionsFromMaster({
    master: orgMaster,
    selectedDivisionName: qcpFilter.division,
    selectedDepartmentName: qcpFilter.department,
    fallback: orgQ,
  });

  const orgDerived = useOrgDerivedFromMaster({
    master: orgMaster,
    selectedDivisionName: ssFilter.division,
    selectedDepartmentName: ssFilter.department,
  });

  // ----- QCC Chart from API -----
  const qccChartRequestBody = useMemo(
    () => ({
      division: qccFilter.division ?? "",
      department: qccFilter.department ?? "",
      section: qccFilter.section ?? "",
      year: Number(qccFilter.year) || 2024,
      month: monthToNumber(qccFilter.month),
      pageNumber: qccFilter.pageIndex + 1,
      pageSize: 5,
    }),
    [qccFilter.division, qccFilter.department, qccFilter.year, qccFilter.month, qccFilter.pageIndex]
  );

  const qccChartUrl = (API as any).QCC_CHART as string;
  const qccChartApi = useProjectChartApi({
    enabled: selectedChartModule === "qcc" && !!qccChartUrl,
    url: qccChartUrl,
    body: qccChartRequestBody,
    token,
    errorLabel: "QCC chart",
  });
  const qccChartBound = useApiPlanActualChartBound({
    rows: qccChartApi.rows,
    filter: qccFilter,
    org: qccChartOrg,
    pageSize: 5,
  });
  const qccChartData = qccChartBound.data;

  const qcpChartRequestBody = useMemo(
    () => ({
      division: qcpFilter.division ?? "",
      department: qcpFilter.department ?? "",
      section: qcpFilter.section ?? "",
      year: Number(qcpFilter.year) || 2024,
      month: monthToNumber(qcpFilter.month),
      pageNumber: qcpFilter.pageIndex + 1,
      pageSize: 5,
    }),
    [qcpFilter.division, qcpFilter.department, qcpFilter.year, qcpFilter.month, qcpFilter.pageIndex]
  );

  const qcpChartUrl = (API as any).QCP_CHART as string;
  const qcpChartApi = useProjectChartApi({
    enabled: selectedChartModule === "qcp" && !!qcpChartUrl,
    url: qcpChartUrl,
    body: qcpChartRequestBody,
    token,
    errorLabel: "QCP chart",
  });
  const qcpChartBound = useApiPlanActualChartBound({
    rows: qcpChartApi.rows,
    filter: qcpFilter,
    org: qcpChartOrg,
    pageSize: 5,
  });
  const qcpChartData = qcpChartBound.data;
  const qMax = useMemo(() => {
    let m = 0;
    for (const r of qccChartData || []) {
      m = Math.max(m, Number(r.Plan || 0), Number(r.Actual || 0));
    }
    return m;
  }, [qccChartData]);
  const qAxis = useMemo(() => buildNiceTicks(qMax, 8), [qMax]);
  const qcpMax = useMemo(() => {
    let m = 0;
    for (const r of qcpChartData || []) {
      m = Math.max(m, Number(r.Plan || 0), Number(r.Actual || 0));
    }
    return m;
  }, [qcpChartData]);
  const qcpAxis = useMemo(() => buildNiceTicks(qcpMax, 8), [qcpMax]);

  // 2) SS chart (gated by org ready)
  const ssChartRequestBody = useMemo(
    () => ({
      action: 1,
      division: ssFilter.division ?? "",
      department: ssFilter.department ?? "",
      section: ssFilter.section ?? "",
      year: Number(ssFilter.year) || 2026,
      month: monthToNumber(ssFilter.month),
      pageNumber: 0,
      pageSize: 0,
    }),
    [ssFilter.division, ssFilter.department, ssFilter.section, ssFilter.year, ssFilter.month]
  );

  const ssChartUrl = (API as any).SUGGESTION_DASHBOARDCHART as string;
  const ssDash = useProjectChartApi({
    enabled: selectedChartModule === "ss" && !!ssChartUrl && orgMaster.ready,
    url: ssChartUrl,
    body: ssChartRequestBody,
    token,
    errorLabel: "SS dashboard chart",
  });

  const ssTotalChartUrl = (API as any).SUGGESTION_DASHBOARDCHART_TOTAL as string;
  const ssTotalReq = usePostJson<{ totalActual: number; totalTarget: number }>({
    enabled: selectedChartModule === "ss" && !!ssTotalChartUrl && orgMaster.ready,
    url: ssTotalChartUrl,
    body: ssChartRequestBody,
    token,
    mapData: (raw: any) => ({
      totalActual: raw?.totalActual ?? raw?.TotalActual ?? 0,
      totalTarget: raw?.totalTarget ?? raw?.TotalTarget ?? 0,
    }),
    onError: (s, p) => console.error("SS Total Chart err", s, p),
  });

  const ssDivisionsFromChartApi = useMemo(
    () => uniqueLabelsFromRows(ssDash.rows, "division"),
    [ssDash.rows]
  );
  const orgFallbackSS = useOrgOptionsFromStructure(props.organizationStructure, ssDivisionsFromChartApi);

  const mergedDivisions = orgDerived.divisions.length ? orgDerived.divisions : orgFallbackSS.allDivisions;
  const mergedDepartments = orgDerived.departments.length ? orgDerived.departments : orgFallbackSS.allDepartments;
  const mergedSections = orgDerived.sections.length ? orgDerived.sections : [];

  // sanitize invalid selection when org data changes
  useEffect(() => {
    if (!orgMaster.ready) return;

    if (ssFilter.division && mergedDivisions.length) {
      const ok = mergedDivisions.some((d) => normKey(d) === normKey(ssFilter.division));
      if (!ok) {
        ssFilter.resetHierarchy();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgMaster.ready, mergedDivisions, ssFilter.division]);

  const ssChartBound = useSsChartBound({
    rows: ssDash.rows || [],
    filter: ssFilter,
    mergedDivisions,
    mergedDepartments,
    mergedSections,
    orgFallback: orgFallbackSS,
  });

  const ssMaxTotal = useMemo(() => {
    let m = 0;
    for (const r of ssChartBound.data || []) {
      m = Math.max(m, Number(r.Plan || 0), Number(r.Actual || 0));
    }
    return m;
  }, [ssChartBound.data]);
  const ssAxis = useMemo(() => buildNiceTicks(ssMaxTotal, 8), [ssMaxTotal]);
  const ssCollectedTotal = useMemo(
    () => (ssChartBound.data || []).reduce((sum, row) => sum + Number(row.Actual || 0), 0),
    [ssChartBound.data]
  );

  const ssClassificationRequestBody = useMemo(
    () => ({
      division: ssFilter.division ?? "",
      department: ssFilter.department ?? "",
      section: ssFilter.section ?? "",
      year: Number(ssFilter.year) || 2026,
      month: monthToNumber(ssFilter.month),
    }),
    [ssFilter.division, ssFilter.department, ssFilter.year, ssFilter.month]
  );

  const ssClassificationUrl = (API as any).SUGGESTION_CLASSIFICATION as string;
  const ssClassificationApi = useQccClassificationApi({
    enabled: selectedChartModule === "ss" && !!ssClassificationUrl,
    url: ssClassificationUrl,
    body: ssClassificationRequestBody,
    token,
  });
  const ssClassificationChartData = useMemo(
    () =>
      (ssClassificationApi.rows || []).map((row) => ({
        class: row.Class || row.class || "-",
        jumlah: Number(row.Jumlah ?? row.jumlah ?? 0),
      })),
    [ssClassificationApi.rows]
  );

  // -------------------------
  // SS LIST (server paging)
  // -------------------------
  const [ssPageNumber, setSsPageNumber] = useState(0);
  const [ssPageSize, setSsPageSize] = useState(10);

  const ssProjectTypeNumber = props.ssProjectTypeNumber ?? 1;

  const ssListBaseBody = useMemo(
    () =>
      props.ssListBaseBody ?? {
        pageNumber: 1,
        pageSize: 10,
        createdAtFrom: null,
        createdAtTo: null,
        keyword: "",
        status: "",
        projectType: ssProjectTypeNumber,
      },
    [props.ssListBaseBody, ssProjectTypeNumber]
  );

  // NOTE: ssRequestBody will be filled after mon is created (needs filter fields)
  // We'll create mon after ssList ready? No. We create mon with ssRows (which depends on ssList),
  // but ssList depends on mon filters. To break circular dependency:
  // - Build SS request body from local "ssMonFilters" state that mirrors mon's filters only when SS active.

  // ✅ Local state for SS list filters (stable, avoids circular dependencies)
  const [ssMonFilters, setSsMonFilters] = useState({
    status: "" as string,
    site: "" as string,
    division: "" as string,
    department: "" as string,
    section: "" as string,
  });

  const ssRequestBody = useMemo(
    () => ({
      ...ssListBaseBody,
      pageNumber: ssPageNumber + 1,
      pageSize: ssPageSize,
      status: ssMonFilters.status,
      projectType: ssProjectTypeNumber,
      site: ssMonFilters.site,
      division: ssMonFilters.division,
      department: ssMonFilters.department,
      section: ssMonFilters.section,
      nrp: loginNrp,
    }),
    [ssListBaseBody, ssPageNumber, ssPageSize, ssMonFilters, ssProjectTypeNumber]
  );

  const suggestionListUrl = (API as any).SUGGESTION_LIST as string;

  // Fetch SS list only when "SS module active". We will control that using a flag below.
  // Initially false (no module selected).
  const [isSsActive, setIsSsActive] = useState(false);

  const ssList = useSsList({
    enabled: isSsActive && !!suggestionListUrl,
    url: suggestionListUrl,
    body: ssRequestBody,
    token,
  });

  // ✅ Monitoring uses ssList.rows directly (memoized) -> no externalByModule -> no loop
  // Integrasi QCC/QCP ke monitoring
  const mon = useMonitoring({
    projects: [
      ...props.projects.filter((p) => p.type !== "QCC" && p.type !== "QCP"),
      ...qccList.rows, // inject hasil fetch QCC
      ...qcpList.rows, // inject hasil fetch QCP
    ],
    modules: props.modules,
    ssRows: ssList.rows,
  });

  useEffect(() => {
    setSelectedChartModule(mon.selectedModule);
  }, [mon.selectedModule]);

  // When module changes, sync isSsActive
  useEffect(() => {
    setIsSsActive(mon.selectedModule === "ss");
  }, [mon.selectedModule]);

  // Reset server paging when SS filters changed
  useEffect(() => {
    if (mon.selectedModule !== "ss") return;
    setSsPageNumber(0);
  }, [
    mon.selectedModule,
    mon.selectedStatus,
    mon.selectedSite,
    mon.selectedDivision,
    mon.selectedDepartment,
    mon.selectedSection,
    ssPageSize,
  ]);

  // Keep ssMonFilters in sync with monitoring filters (only when SS selected)
  useEffect(() => {
    if (mon.selectedModule !== "ss") return;

    setSsMonFilters({
      status: toApiSSStatus(mon.selectedStatus),
      site: mon.selectedSite ?? "",
      division: mon.selectedDivision ?? "",
      department: mon.selectedDepartment ?? "",
      section: mon.selectedSection ?? "",
    });
  }, [
    mon.selectedModule,
    mon.selectedStatus,
    mon.selectedSite,
    mon.selectedDivision,
    mon.selectedDepartment,
    mon.selectedSection,
  ]);

  // Monitoring dropdowns bound to ORG master (for division/department/section) + fallback for sites
  const memberOptionsBound = useMemberOrgOptionsFromMaster({
    master: orgMaster,
    selectedDivisionName: mon.selectedDivision,
    selectedDepartmentName: mon.selectedDepartment,
    fallback: mon.memberOptions,
  });

  const onResetModuleFilters = useCallback(() => {
    mon.resetAllFilters();
  }, [mon]);

  const selectedModuleConfig = useMemo(
    () => props.modules.find((m) => m.id === mon.selectedModule) || null,
    [props.modules, mon.selectedModule]
  );
  const selectedTheme = mon.selectedModule ? MODULE_THEME[mon.selectedModule] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {detailModalProject && (
        <DetailModal project={detailModalProject} onClose={closeDetailModal} api={ssDetailApi} />
      )}
      {editModalProject && (
        <EditModal
          initialData={editModalProject}
          onClose={closeEditModal}
          onSave={handleSaveEditModal}
          api={ssDetailApi}
        />
      )}
      {selectedChartModule === "ss" && (
        <div className="mt-0 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="shadow-lg border-0 bg-card h-full">
              <CardHeader className="p-4 sm:p-6 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: "#4472C4" }} />
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Grand Total SS</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Actual vs Target</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="w-full h-[300px] sm:h-[400px]">
                  {ssTotalReq.loading ? (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "SS Total", actual: ssTotalReq.data?.totalActual || 0, plan: ssTotalReq.data?.totalTarget || 0 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "currentColor", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                        <Bar dataKey="plan" name="Target" fill="#A5A5A5" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          <LabelList dataKey="plan" position="top" style={{ fill: "#A5A5A5", fontSize: 11, fontWeight: "bold" }} />
                        </Bar>
                        <Bar dataKey="actual" name="Actual" fill="#4472C4" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          <LabelList dataKey="actual" position="top" style={{ fill: "#4472C4", fontSize: 11, fontWeight: "bold" }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <PlanActualChartCard
              title="SS Collected"
              subtitle="Per Division/Department/Section"
              accentColor="#006187"
              planColor="#A5A5A5"
              actualColor="#4472C4"
              hideFilters={true}
              data={ssChartBound.data}
              yDomain={ssAxis.domain}
              yTicks={ssAxis.ticks}
              year={ssFilter.year}
              month={ssFilter.month}
              onYear={(v) => {
                ssFilter.setYear(v);
                ssFilter.setPageIndex(0);
              }}
              onMonth={(v) => {
                ssFilter.setMonth(v);
                ssFilter.setPageIndex(0);
              }}
              divisionValue={ssFilter.division}
              departmentValue={ssFilter.department}
              sectionValue={ssFilter.section}
              divisions={mergedDivisions}
              departments={ssChartBound.filteredDepartments.length ? ssChartBound.filteredDepartments : mergedDepartments}
              sections={ssChartBound.filteredSections.length ? ssChartBound.filteredSections : mergedSections}
              onDivision={(v) => {
                ssFilter.setDivision(v);
                ssFilter.setDepartment(null);
                ssFilter.setSection(null);
                ssFilter.setPageIndex(0);
              }}
              onDepartment={(v) => {
                ssFilter.setDepartment(v);
                ssFilter.setSection(null);
              }}
              onSection={(v) => ssFilter.setSection(v)}
              showPaging={ssChartBound.showPaging}
              pageIndex={ssFilter.pageIndex}
              totalPages={ssChartBound.totalPages}
              onPrevPage={() => ssFilter.setPageIndex((p) => Math.max(0, p - 1))}
              onNextPage={() => ssFilter.setPageIndex((p) => p + 1)}
              canPrev={ssChartBound.hasPrevPage}
              canNext={ssChartBound.hasNextPage}
            />
          </div>
        </div>
      )}

      {selectedChartModule === "qcc" && (
        <div className="mt-0">
          <PlanActualChartCard
            title="QCC Collected"
            subtitle="Per Division/Department (Cumulative YTD)"
            accentColor="#EE642E"
            data={qccChartData}
            yDomain={qAxis.domain}
            yTicks={qAxis.ticks}
            year={qccFilter.year}
            month={qccFilter.month}
            onYear={(v) => {
              qccFilter.setYear(v);
              qccFilter.setPageIndex(0);
            }}
            onMonth={(v) => {
              qccFilter.setMonth(v);
              qccFilter.setPageIndex(0);
            }}
            divisionValue={qccFilter.division}
            departmentValue={qccFilter.department}
            sectionValue={qccFilter.section}
            divisions={qccChartOrg.allDivisions}
            departments={qccChartBound.filteredDepartments}
            sections={qccChartBound.filteredSections}
            onDivision={(v) => {
              qccFilter.setDivision(v);
              qccFilter.setDepartment(null);
              qccFilter.setSection(null);
              qccFilter.setPageIndex(0);
            }}
            onDepartment={(v) => {
              qccFilter.setDepartment(v);
              qccFilter.setSection(null);
            }}
            onSection={(v) => qccFilter.setSection(v)}
            showPaging={qccChartBound.showPaging}
            pageIndex={qccFilter.pageIndex}
            totalPages={qccChartBound.totalPages}
            onPrevPage={() => qccFilter.setPageIndex((p) => Math.max(0, p - 1))}
            onNextPage={() => qccFilter.setPageIndex((p) => p + 1)}
            canPrev={qccChartBound.hasPrevPage}
            canNext={qccChartBound.hasNextPage}
          />
        </div>
      )}

      {selectedChartModule === "qcp" && (
        <div className="mt-0">
          <PlanActualChartCard
            title="QCP Collected"
            subtitle="Per Division/Department (Cumulative YTD)"
            accentColor="#5FCEA0"
            data={qcpChartData}
            yDomain={qcpAxis.domain}
            yTicks={qcpAxis.ticks}
            year={qcpFilter.year}
            month={qcpFilter.month}
            onYear={(v) => {
              qcpFilter.setYear(v);
              qcpFilter.setPageIndex(0);
            }}
            onMonth={(v) => {
              qcpFilter.setMonth(v);
              qcpFilter.setPageIndex(0);
            }}
            divisionValue={qcpFilter.division}
            departmentValue={qcpFilter.department}
            sectionValue={qcpFilter.section}
            divisions={qcpChartOrg.allDivisions}
            departments={qcpChartBound.filteredDepartments}
            sections={qcpChartBound.filteredSections}
            onDivision={(v) => {
              qcpFilter.setDivision(v);
              qcpFilter.setDepartment(null);
              qcpFilter.setSection(null);
              qcpFilter.setPageIndex(0);
            }}
            onDepartment={(v) => {
              qcpFilter.setDepartment(v);
              qcpFilter.setSection(null);
            }}
            onSection={(v) => qcpFilter.setSection(v)}
            showPaging={qcpChartBound.showPaging}
            pageIndex={qcpFilter.pageIndex}
            totalPages={qcpChartBound.totalPages}
            onPrevPage={() => qcpFilter.setPageIndex((p) => Math.max(0, p - 1))}
            onNextPage={() => qcpFilter.setPageIndex((p) => p + 1)}
            canPrev={qcpChartBound.hasPrevPage}
            canNext={qcpChartBound.hasNextPage}
          />
        </div>
      )}

      {/* Monitoring */}
      <div className="mt-12">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Project Monitoring</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Track all project submissions and their status
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-card-foreground">Quick Filter by Module</h3>
                <p className="text-xs text-muted-foreground mt-1">Click to view specific module statistics</p>
              </div>

              <QuickModuleGrid
                modules={props.modules}
                selected={mon.selectedModule}
                onSelect={mon.setSelectedModule}
                onResetFilters={onResetModuleFilters}
              />

              {mon.selectedModule && selectedModuleConfig && selectedTheme && (
                <div
                  className="mt-4 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 border-2"
                  style={{ background: selectedTheme.panelBg, borderColor: selectedTheme.panelBorder }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ color: selectedTheme.panelTitle }}>
                      {selectedModuleConfig.title} Statistics
                    </h4>

                    <button
                      onClick={() => {
                        mon.setSelectedModule(null);
                        mon.resetAllFilters();
                      }}
                      className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                      type="button"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  {mon.selectedModule === "ss" && ssList.loading && (
                    <div className="text-xs text-muted-foreground mb-3">Loading SS list...</div>
                  )}

                  <StatsPanel
                    moduleId={mon.selectedModule}
                    selectedStatus={mon.selectedStatus}
                    setSelectedStatus={mon.setSelectedStatus}
                    setSelectedStep={mon.setSelectedStep}
                    getModuleStats={mon.getModuleStats}
                    ssOverrideTotals={
                      mon.selectedModule === "ss"
                        ? {
                            reviewByLeader: ssList.totals.reviewByLeader,
                            reviewByBPI: ssList.totals.reviewByBPI,
                            completed: ssList.totals.completed,
                          }
                        : undefined
                    }
                  />

                  {isQFamily(mon.selectedModule) && mon.selectedStatus === "in-progress" && (
                    <StepsPanel
                      moduleId={mon.selectedModule}
                      projects={mon.filteredProjects}
                      selectedStep={mon.selectedStep}
                      setSelectedStep={mon.setSelectedStep}
                    />
                  )}

                  <MemberFilters
                    options={memberOptionsBound}
                    orgLoading={orgMaster.loading}
                    selectedSite={mon.selectedSite}
                    selectedDivision={mon.selectedDivision}
                    selectedDepartment={mon.selectedDepartment}
                    selectedSection={mon.selectedSection}
                    setSelectedSite={mon.setSelectedSite}
                    setSelectedDivision={mon.setSelectedDivision}
                    setSelectedDepartment={mon.setSelectedDepartment}
                    setSelectedSection={mon.setSelectedSection}
                  />
                </div>
              )}
            </div>

            {mon.selectedModule ? (
              <ProjectsTable
                selectedModule={mon.selectedModule}
                filteredProjects={mon.filteredProjects}
                selectedStatus={mon.selectedStatus}
                selectedStep={mon.selectedStep}
                setSelectedStatus={mon.setSelectedStatus}
                setSelectedStep={mon.setSelectedStep}
                getTypeColor={mon.getTypeColor}
                getStatusBadge={mon.getStatusBadge}
                onQccStepSubmitted={() => setQccRefreshKey((v) => v + 1)}
                ssPaging={
                  mon.selectedModule === "ss"
                    ? {
                        pageNumber: ssPageNumber,
                        pageSize: ssPageSize,
                        totalRows: ssList.totalRows,
                        totalPages: ssList.totalPages,
                        setPageNumber: setSsPageNumber,
                        setPageSize: setSsPageSize,
                      }
                    : undefined
                }
                showDetailModal={showDetailModal}
                showEditModal={showEditModal}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <LayoutDashboard className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p>Select a module above to view filtered projects</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hook untuk fetch detail SS dari API
function useSsDetailApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchDetail = useCallback(async (itemKey: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const url = (API as any)?.SUGGESTION_RETRIEVE;
      if (!url) throw new Error("API.SUGGESTION_RETRIEVE not set");
      const body = {
        pageNumber: 0,
        pageSize: 0,
        createdAtFrom: null,
        createdAtTo: null,
        keyword: "",
        division: "",
        department: "",
        section: "",
        itemKey,
        status: "",
        projectType: 0,
      };
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (json?.responseCode && json.responseCode !== 200) throw new Error(json?.message ?? "API error");
      setData(json?.data ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Gagal load detail SS");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, fetchDetail };
}

// Modal detail SS (refactor, pakai data dari API)
function DetailModal({ project, onClose, api }: { project: Project; onClose: () => void; api: ReturnType<typeof useSsDetailApi> }) {
  const detail = api.data || {};
  const safeStr = (v: any, fallback = "-") => (v == null || v === "" ? fallback : v);
  const formatAuditDate = (v: any) => v ? new Date(v).toLocaleDateString() : "-";

  // PDF & Document logic (mirroring historical)
  const templateB64 = String(detail.documentTemplateBase64 ?? "").trim();
  const hasTemplatePdf = !!templateB64;
  const templateMime = hasTemplatePdf ? "application/pdf" : "";
  const templateExt = templateMime === "application/pdf" ? ".pdf" : "";
  const ssB64 = hasTemplatePdf ? templateB64 : "";
  const canViewSs = !api.loading && !api.error && !!detail && hasTemplatePdf;
  const canDownloadSs = canViewSs;

  // Handler for PDF view/download
  const handleViewSsPdf = () => {
    if (!hasTemplatePdf) return;
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src='data:application/pdf;base64,${ssB64}' width='100%' height='100%'></iframe>`
      );
    }
  };
  const handleDownloadSsPdf = () => {
    if (!hasTemplatePdf) return;
    const baseName = String(detail.ideano || detail.itemKey || "SS").trim() || "SS";
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${ssB64}`;
    link.download = `Form-SS-${baseName}${templateExt || ".pdf"}`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Badge variant="outline" style={{ backgroundColor: '#00618715', color: '#006187', borderColor: '#006187' }}>SS</Badge>
            <span>{safeStr(detail.judulSS || project.judulSS)}</span>
          </h2>
          <Button onClick={onClose} variant="ghost">✕</Button>
        </div>
        <div className="px-6 pt-2 pb-4">
          <div className="text-xs text-muted-foreground mb-2">
            ItemKey: <b>{safeStr(detail.itemKey || project.ideNumber)}</b>
          </div>
          {api.loading && <div className="text-sm text-muted-foreground mb-2">Loading detail...</div>}
          {api.error && <div className="text-sm text-red-600 mb-2">{api.error}</div>}
          {!api.loading && !api.error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge variant="outline" style={{ backgroundColor: '#22c55e15', color: '#22c55e', borderColor: '#22c55e' }}>{safeStr(detail.status || project.status)}</Badge>
                  </div>
                  {detail.rejectAtasan1At && (
                     <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="text-xs text-muted-foreground">Alasan Penolakan</div>
                      <div className="text-sm mt-1">{safeStr(detail.rejectAtasan1Reason)}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Pembuat</label>
                  <div>{safeStr(detail.pembuatSS || project.pembuatSS)}</div>
                  <label className="text-sm font-medium text-muted-foreground mt-2 block">Atasan 1</label>
                  <div>{safeStr(detail.atasan1 || project.leader)}</div>
                  <label className="text-sm font-medium text-muted-foreground mt-2 block">Atasan 2</label>
                  <div>{safeStr(detail.atasan2)}</div>
                  <label className="text-sm font-medium text-muted-foreground mt-2 block">Site</label>
                  <div>{safeStr(detail.site || project.site)}</div>
                </div>
              </div>
              {/* Field lain sesuai historical */}
              {detail.hubunganPenemuan && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Hubungan Penemuan</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{safeStr(detail.hubunganPenemuan)}</div>
                </div>
              )}
              {detail.masalah && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Masalah</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{safeStr(detail.masalah)}</div>
                </div>
              )}
              {detail.uraianMasalah && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Uraian Masalah</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{safeStr(detail.uraianMasalah)}</div>
                </div>
              )}
              {detail.ideDiajukan && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Ide Diajukan</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{safeStr(detail.ideDiajukan)}</div>
                </div>
              )}
              {detail.uraianProcess && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Uraian Process</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{safeStr(detail.uraianProcess)}</div>
                </div>
              )}
              {/* Evaluation */}
              {(detail.evalQuality || detail.evalCost ||  detail.evalSafety) && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Evaluation</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detail.evalQuality && (
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Quality</div>
                        <div className="text-sm mt-1">{safeStr(detail.evalQuality)}</div>
                      </div>
                    )}
                    {detail.evalCost && (
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                        <div className="text-sm mt-1">{safeStr(detail.evalCost)}</div>
                      </div>
                    )}
                    {detail.evalSafety && (
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Culture Development</div>
                        <div className="text-sm mt-1">{safeStr(detail.evalSafety)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Audit Trail */}
              <div className="mb-2">
                <label className="text-sm font-medium text-muted-foreground">Audit Trail</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Submitted From Creator</div>
                    <div className="text-sm mt-1">{formatAuditDate(detail.createdAt)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Period</div>
                    <div className="text-sm mt-1">{safeStr(detail.period)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Tanggal Disetujui Atasan 1</div>
                    <div className="text-sm mt-1">{formatAuditDate(detail.approvalAtasan1At)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Disetujui Atasan 1</div>
                    <div className="text-sm mt-1">{safeStr(detail.approvalAtasan1By)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Tanggal disetujui Atasan 2</div>
                    <div className="text-sm mt-1">{formatAuditDate(detail.approvalAtasan2At)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Disetujui Atasan 2</div>
                    <div className="text-sm mt-1">{safeStr(detail.approvalAtasan2By)}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Tanggal Penolakan</div>
                    <div className="text-sm mt-1">-</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Ditolak Oleh</div>
                    <div className="text-sm mt-1">-</div>
                  </div>
                </div>
              </div>
              {/* Tombol PDF dan Download jika ada */}
              <div className="flex gap-2 mt-4 justify-end">
                <Button
                  className="shrink-0"
                  variant="outline"
                  size="sm"
                  onClick={handleViewSsPdf}
                  disabled={!canViewSs}
                  title={!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View SS (PDF)
                </Button>
                <Button
                  className="shrink-0"
                  variant="default"
                  size="sm"
                  onClick={handleDownloadSsPdf}
                  disabled={!canDownloadSs}
                  title={!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SS
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// Modal untuk edit detail SS
function EditModal({
  initialData,
  onClose,
  onSave,
  api
}: {
  initialData: any;
  onClose: () => void;
  onSave: (data: any) => void;
  api: ReturnType<typeof useSsDetailApi>;
}) {
  const detail = api.data || {};
  const [form, setForm] = React.useState(() => ({
    itemKey: initialData.itemKey || "",
    masalah: "",
    uraianMasalah: "",
    ideDiajukan: "",
    uraianProcess: "",
    evalQuality: "",
    evalCost: "",
    evalDelivery: "",
    evalSafety: "",
    evalMorale: "",
    evalProductivity: "",
  }));

  // Update form state when detail data is loaded
  React.useEffect(() => {
    if (detail && Object.keys(detail).length > 0) {
      setForm((prev) => ({
        ...prev,
        createdBy: detail.createdBy || "",
        masalah: detail.masalah || "",
        uraianMasalah: detail.uraianMasalah || "",
        ideDiajukan: detail.ideDiajukan || "",
        uraianProcess: detail.uraianProcess || "",
        evalQuality: detail.evalQuality || "",
        evalCost: detail.evalCost || "",
        evalDelivery: detail.evalDelivery || "",
        evalSafety: detail.evalSafety || "",
        evalMorale: detail.evalMorale || "",
        evalProductivity: detail.evalProductivity || "",
      }));
    }
  }, [detail]);

  // Show loading indicator if detail is loading or not yet available
  const isLoading = api.loading || !api.data || Object.keys(api.data).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <h2 className="text-lg font-bold">Edit SS Detail</h2>
          <Button onClick={onClose} variant="ghost">✕</Button>
        </div>
        {isLoading ? (
          <div className="px-6 pt-6 pb-8 text-center text-muted-foreground text-sm">Loading data...</div>
        ) : (
          <form className="px-6 pt-2 pb-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Masalah</label>
              <textarea
                name="masalah"
                className="w-full border rounded p-3 mt-1"
                rows={2}
                value={form.masalah}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Uraian Masalah</label>
              <textarea
                name="uraianMasalah"
                className="w-full border rounded p-3 mt-1"
                rows={2}
                value={form.uraianMasalah}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ide Diajukan</label>
              <textarea
                name="ideDiajukan"
                className="w-full border rounded p-3 mt-1"
                rows={2}
                value={form.ideDiajukan}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Uraian Process</label>
              <textarea
                name="uraianProcess"
                className="w-full border rounded p-3 mt-1"
                rows={2}
                value={form.uraianProcess}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Quality</label>
                <input
                  name="evalQuality"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalQuality}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Cost</label>
                <input
                  name="evalCost"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalCost}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Delivery</label>
                <input
                  name="evalDelivery"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalDelivery}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Safety</label>
                <input
                  name="evalSafety"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalSafety}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Morale</label>
                <input
                  name="evalMorale"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalMorale}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evaluation - Productivity</label>
                <input
                  name="evalProductivity"
                  className="w-full border rounded p-2 mt-1"
                  value={form.evalProductivity}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>Batal</Button>
              <Button variant="default" type="submit">
                Simpan
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
