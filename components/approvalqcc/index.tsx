import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { API, CONFIG } from "../../config";
import { getCookieJson } from "../../libs/cookie";
import {
  Search,
  CalendarIcon,
  Eye,
  Building2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Download,
  Upload,
  List,
  User,
  Rows,
} from "lucide-react";

type ApprovalQccRow = {
  id?: number;
  itemKey?: string;
  namaGroupQccp?: string;
  temaQccp?: string;
  department?: string;
  section?: string;
  createdAt?: string;
  createdBy?: string;
  leaderNrp?: string;
  leader?: string;
  status?: string;
  step?: string;
  stepStatus?: string;
  stepFileDoc?: string;
  stepDesc?: string;
  stepCreatedAt?: string;
  stepCreatedBy?: string;
  cost?: number;
  costType?: string;
};

function formatThousandSeparator(val: number | string): string {
  const num = Math.round(Number(val));
  if (isNaN(num)) return "-";
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type ApiResponse<T> = {
  responseCode?: number;
  message?: string;
  data?: T;
};

function normalizeStatus(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function getLoginNrp() {
  try {
    const c = getCookieJson<any>("inovasis_auth");
    return c?.nrp ?? c?.NRP ?? c?.username ?? null;
  } catch {
    return null;
  }
}

function getLoginJobsite() {
  try {
    const c = getCookieJson<any>("inovasis_auth");
    return c?.jobsite ?? c?.Jobsite ?? null;
  } catch {
    return null;
  }
}

export function ApprovalQcc() {
  const leaderNrp = useMemo(() => getLoginNrp(), []);
  const jobsite = useMemo(() => getLoginJobsite(), []);
  const [rows, setRows] = useState<ApprovalQccRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState<ApprovalQccRow | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchList = useCallback(async () => {
    if (!leaderNrp) {
      setError("NRP login tidak ditemukan.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(API.QCC_APPROVAL_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LeaderNrp: String(leaderNrp), jobsite: jobsite }),
      });
      const json = (await resp.json().catch(() => ({}))) as ApiResponse<ApprovalQccRow[]>;
      console.log('xxx: ', json.data);
      const code = Number(json?.responseCode ?? resp.status);
      if (code !== 200) throw new Error(json?.message ?? "Gagal load approval QCC");
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e: any) {
      setError(e?.message || "Gagal load approval QCC");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [leaderNrp]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const canApprove = useMemo(() => {
    if (!detail) return false;
    const step = Number(detail.step ?? 0);
    return (
      normalizeStatus(detail.stepStatus) === "submitted" &&
      !!String(detail.itemKey || "").trim()
    );
  }, [detail]);

  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailDataLoading, setDetailDataLoading] = useState(false);

  const templateB64 = String(detailData?.documentTemplateBase64 ?? "").trim();
  const hasTemplatePdf = !!templateB64;
  const templateMime = hasTemplatePdf ? guessMimeFromBase64(templateB64) : "";
  const ssB64 = hasTemplatePdf ? templateB64 : "";
  const templateExt = templateMime.includes("pdf") ? ".pdf" : templateMime.includes("word") ? ".docx" : ".pdf";
  const canViewForm = detailData?.status.toLowerCase() !== "submitted";

  function openBase64InSmallWindow(base64Raw: string) {
    const mime = guessMimeFromBase64(base64Raw);
    const blob = base64ToBlob(base64Raw, mime);
    const url = URL.createObjectURL(blob);

    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      url,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function stripDataUrlPrefix(b64: string) {
    const s = String(b64 ?? "").trim();
    const idx = s.indexOf("base64,");
    return idx >= 0 ? s.slice(idx + "base64,".length).trim() : s;
  }

  function guessMimeFromBase64(b64Raw: string) {
    const b64 = stripDataUrlPrefix(b64Raw);
    if (b64.startsWith("JVBERi0x")) return "application/pdf";
    return "application/octet-stream";
  }

  function base64ToBlob(base64Raw: string, mime = "application/octet-stream") {
    const base64 = stripDataUrlPrefix(base64Raw);

    const sliceSize = 1024;
    const byteChars = atob(base64);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
      const slice = byteChars.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  function downloadBase64File(base64Raw: string, filename: string) {
    const mime = guessMimeFromBase64(base64Raw);
    const blob = base64ToBlob(base64Raw, mime);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "document";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const handleViewSsPdf = useCallback(() => {
    if (!hasTemplatePdf) return;
    openBase64InSmallWindow(ssB64);
  }, [hasTemplatePdf, ssB64]);

  const handleDownloadSsPdf = useCallback(() => {
    if (!hasTemplatePdf) return;
    const baseName = String(detailData?.itemKey ?? detail?.itemKey ?? "QCC").replace(/\//g, "_");
    downloadBase64File(ssB64, `Form-QCC-${baseName}${templateExt || ".pdf"}`);
  }, [detailData, detail, hasTemplatePdf, ssB64, templateExt]);


  const handleApprove = useCallback(async () => {
    if (!detail) return;
    setActionError("");
    setActionLoading(true);
    try {
      const step = Number(detail.step ?? 0);
      const stepStatus = detail.stepStatus ? String(detail.stepStatus).trim() : "";
      const itemKey = detail.itemKey ? String(detail.itemKey).trim() : "";

      let nextStatus: string | undefined;

      if (stepStatus.toLowerCase() === "review judul - bpi") {
        nextStatus = "Review judul - Fasilitator";
      } else if (stepStatus.toLowerCase() === "review judul - fasilitator") {
        nextStatus = "Review judul - Atasan 1";
      } else if (stepStatus.toLowerCase() === "review judul - atasan 1") {
        if (itemKey.toUpperCase().includes("ADMO")) {
          nextStatus = "Review judul - BPI Final";
        } else {
          nextStatus = "Review judul - Atasan 2";
        }
      } else if (stepStatus.toLowerCase() === "review judul - atasan 2") {
        if (!itemKey.toUpperCase().includes("ADMO")) {
          nextStatus = "Review judul - BPI Final";
        }
      }

      const resp = await fetch(API.QCC_STEP_APPROVE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ItemKey: detail.itemKey,
          Step: step,
          ApproveBy: leaderNrp,
          NextStatus: nextStatus,
        }),
      });
      const json = (await resp.json().catch(() => ({}))) as ApiResponse<any>;
      const code = Number(json?.responseCode ?? resp.status);
      if (code !== 200) throw new Error(json?.message ?? "Gagal approve");
      setDetail(null);
      await fetchList();
    } catch (e: any) {
      setActionError(e?.message || "Gagal approve");
    } finally {
      setActionLoading(false);
    }
  }, [detail, leaderNrp, fetchList]);

  const handleReject = useCallback(async () => {
    if (!detail) return;
    setActionError("");
    setActionLoading(true);
    try {
      const reason = String(rejectReason || "").trim();
      if (!reason) throw new Error("Reason wajib diisi");
      const step = Number(detail.step ?? 0);
      const resp = await fetch(API.QCC_STEP_REJECT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ItemKey: detail.itemKey,
          Step: step,
          ApproveBy: leaderNrp,
          Reason: reason,
        }),
      });
      const json = (await resp.json().catch(() => ({}))) as ApiResponse<any>;
      const code = Number(json?.responseCode ?? resp.status);
      if (code !== 200) throw new Error(json?.message ?? "Gagal reject");
      setRejectReason("");
      setRejectOpen(false);
      setDetail(null);
      await fetchList();
    } catch (e: any) {
      setActionError(e?.message || "Gagal reject");
    } finally {
      setActionLoading(false);
    }
  }, [detail, leaderNrp, rejectReason, fetchList]);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg sm:text-xl">Approval QCC</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Menampilkan item dengan last step status = Submitted untuk Leader NRP: <b>{String(leaderNrp ?? "-")}</b>
              </div>
            </div>
            <Button variant="outline" onClick={fetchList} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>ItemKey</TableHead>
                  <TableHead>Tema QCC</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Step Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((r, idx) => (
                    <TableRow key={String(r.id ?? r.itemKey ?? idx)}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.itemKey}</TableCell>
                      <TableCell>{r.temaQccp ?? "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r.leader ?? "-"} ({r.leaderNrp ?? "-"})
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status ?? "-"}</Badge>
                      </TableCell>
                      <TableCell>{r.step ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.stepStatus ?? "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ backgroundColor: "#e5e7eb", color: "#111" }}
                          onClick={() => {
                            setActionError("");
                            setRejectReason("");
                            setRejectOpen(false);
                            setDetail(r);
                            setDetailData(r);
                          }}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {detail && !rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Badge variant="outline" style={{ backgroundColor: "#EE642E15", color: "#EE642E", borderColor: "#EE642E" }}>
                  QCC
                </Badge>
                <span>{detail.temaQccp ?? detail.itemKey ?? "-"}</span>
              </h2>
              <Button onClick={() => setDetail(null)} variant="ghost">
                ✕
              </Button>
            </div>
            <div className="mt-1 flex flex-wrap p-2 gap-2 justify-end">
              <Button
                className="shrink-0"
                variant="outline"
                size="sm"
                onClick={handleViewSsPdf}
                disabled={detailDataLoading || !canViewForm}
                title={detailDataLoading ? "Loading template..." : (!hasTemplatePdf || !canViewForm ? "documentTemplateBase64 belum tersedia." : undefined)}
              >
                {detailDataLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                View QCC Form (PDF)
              </Button>

              <Button
                className="shrink-0"
                variant="default"
                size="sm"
                onClick={handleDownloadSsPdf}
                disabled={detailDataLoading || !canViewForm}
                title={detailDataLoading ? "Loading template..." : (!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined)}
              >
                {detailDataLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download QCC
              </Button>

              {/* {String(selectedProject?.status).toLowerCase() === 'reject by leader'.toLowerCase() && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="ml-2"
                                                      onClick={() => handleOpenEdit(selectedProject)}
                                                    >
                                                      Revise Data
                                                    </Button>
                                                  )} */}
            </div>
            <div className="p-6 space-y-4">
              {actionError && <div className="text-sm text-red-600">{actionError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">ItemKey</div>
                  <div className="font-semibold">{detail.itemKey ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Leader</div>
                  <div className="font-semibold">
                    {detail.leader ?? "-"} ({detail.leaderNrp ?? "-"})
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div>{detail.status ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Step</div>
                  <div>
                    {detail.step ?? "-"} ({detail.stepStatus ?? "-"})
                  </div>
                </div>
              </div>

              {normalizeStatus(detail.stepStatus) === "submitted" && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50 space-y-4">
                  <div className="space-y-1">
                    <label className="text-md font-semibold text-orange-800">
                      Cost ( in USD )
                    </label>
                    <div className="p-2">
                      <label className="text-sm font-medium text-slate-800">
                        {detail.cost != null ? formatThousandSeparator(detail.cost) : "-"}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-md font-semibold text-orange-800 block">
                      Cost Type
                    </label>
                    <div className="flex flex-row gap-6 items-center p-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(detail.costType?.includes("Cost"))}
                          disabled
                          className="w-4 h-4 rounded text-orange-600 border-orange-300 cursor-not-allowed accent-orange-600"
                        />
                        <label className="text-sm font-medium text-slate-700 cursor-not-allowed select-none">
                          Cost
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(detail.costType?.includes("Revenue"))}
                          disabled
                          className="w-4 h-4 rounded text-orange-600 border-orange-300 cursor-not-allowed accent-orange-600"
                        />
                        <label className="text-sm font-medium text-slate-700 cursor-not-allowed select-none">
                          Revenue
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold mb-2">Dokumen Step</div>
                <div className="text-sm mb-2">{detail.stepFileDoc ?? "-"}</div>
                {detail.stepFileDoc ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`${CONFIG.apiBaseUrl}/qcc/steps/${detail.stepFileDoc}`, "_blank", "noopener,noreferrer")}
                  >
                    Download
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">Tidak ada file</div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDetail(null)} disabled={actionLoading}>
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectOpen(true)}
                  style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" }}
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  style={{ backgroundColor: "#16a34a", color: "#fff" }}
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detail &&
        rejectOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Reject Reason</h3>
                <Button onClick={() => setRejectOpen(false)} variant="ghost" disabled={actionLoading}>
                  ✕
                </Button>
              </div>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={actionLoading}
              />
              <div className="flex gap-2 justify-end pt-3">
                <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={actionLoading}>
                  Batal
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{ backgroundColor: "#dc2626", color: "#fff" }}
                >
                  {actionLoading ? "Processing..." : "Submit Reject"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
