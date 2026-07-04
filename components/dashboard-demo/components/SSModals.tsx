import React, { useState, useCallback } from "react";
import { FileText, Download } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Project } from "../types";
import { API, CONFIG } from "../../../config";
import { formatDate } from "../utils";

/* =====================================================
   Hook Detail SS
   ===================================================== */
export function useSsDetailApi() {
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

/* =====================================================
   DetailModal Component
   ===================================================== */
export function DetailModal({
  project,
  onClose,
  api,
}: {
  project: Project;
  onClose: () => void;
  api: ReturnType<typeof useSsDetailApi>;
}) {
  const detail = api.data || {};
  const safeStr = (v: any, fallback = "-") => (v == null || v === "" ? fallback : v);
  const formatAuditDate = (v: any) => (v ? new Date(v).toLocaleDateString() : "-");

  const templateB64 = String(detail.documentTemplateBase64 ?? "").trim();
  const hasTemplatePdf = !!templateB64;
  const templateMime = hasTemplatePdf ? "application/pdf" : "";
  const templateExt = templateMime === "application/pdf" ? ".pdf" : "";
  const ssB64 = hasTemplatePdf ? templateB64 : "";
  const canViewSs = !api.loading && !api.error && !!detail && hasTemplatePdf;
  const canDownloadSs = canViewSs;

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
            <Badge
              variant="outline"
              style={{ backgroundColor: "#00618715", color: "#006187", borderColor: "#006187" }}
            >
              SS
            </Badge>
            <span>{safeStr(detail.judulSS || project.judulSS)}</span>
          </h2>
          <Button onClick={onClose} variant="ghost">
            ✕
          </Button>
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
                    <Badge
                      variant="outline"
                      style={{ backgroundColor: "#22c55e15", color: "#22c55e", borderColor: "#22c55e" }}
                    >
                      {safeStr(detail.status || project.status)}
                    </Badge>
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
              {detail.hubunganPenemuan && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Hubungan Penemuan</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {safeStr(detail.hubunganPenemuan)}
                  </div>
                </div>
              )}
              {detail.masalah && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Masalah</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {safeStr(detail.masalah)}
                  </div>
                </div>
              )}
              {detail.uraianMasalah && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Uraian Masalah</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {safeStr(detail.uraianMasalah)}
                  </div>
                </div>
              )}
              {detail.ideDiajukan && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Ide Diajukan</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {safeStr(detail.ideDiajukan)}
                  </div>
                </div>
              )}
              {detail.uraianProcess && (
                <div className="mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Uraian Process</label>
                  <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {safeStr(detail.uraianProcess)}
                  </div>
                </div>
              )}
              {(detail.evalQuality || detail.evalCost || detail.evalSafety) && (
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
                </div>
              </div>
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

/* =====================================================
   EditModal Component
   ===================================================== */
export function EditModal({
  initialData,
  onClose,
  onSave,
  api,
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
          <Button onClick={onClose} variant="ghost">
            ✕
          </Button>
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
              <Button variant="outline" type="button" onClick={onClose}>
                Batal
              </Button>
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
