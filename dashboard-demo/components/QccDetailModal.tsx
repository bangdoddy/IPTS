import React, { useState, useEffect } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { PdfPopupViewer } from "../../ui/PdfPopupViewer";
import { Project } from "../types";
import { API, CONFIG } from "../../../config";
import { formatDate, pickNumber, normalizeQStatusKey } from "../utils";

const safeStr = (v: any, fallback = "-") => (v == null || v === "" ? fallback : v);

export function QccDetailModal({
  project,
  onClose,
  onStepSubmitted,
  loginNrp,
}: {
  project: Project;
  onClose: () => void;
  onStepSubmitted?: () => void;
  loginNrp: string | null;
}) {
  const [stepOpen, setStepOpen] = useState(false);
  const [stepFile, setStepFile] = useState<File | null>(null);
  const [stepDesc, setStepDesc] = useState("");
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState("");
  const [stepSuccess, setStepSuccess] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);
  
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
