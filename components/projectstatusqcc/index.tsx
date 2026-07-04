import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CONFIG, API } from "../../config";
import { PdfPopupViewer } from "../ui/PdfPopupViewer";
import { getCookieJson } from "../../libs/cookie";
import {
  USE_DUMMY_PROJECT_STATUS,
  simulateDummyDelay,
  fetchDummyQccList,
  fetchDummyQccStepHistory,
} from "../../libs/projectStatusDummy";
import {
  TruncatedReadMoreCell,
  StepFilterBar,
  useStepFilter,
  HistoricalProjectPageShell,
  HistoricalProjectTable,
  HistoricalProjectTableHeader,
  historicalTableCell,
} from "../projectstatus/shared";

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

// Tipe data QCC Project
interface QccProject {
  id?: number;
  itemKey?: string;
  namaGroupQccp?: string;
  department?: string;
  section?: string;
  createdAt?: string;
  createdBy?: string;
  leaderNrp?: string;
  leader?: string;
  status?: string;
  step?: string;
  stepStatus?: string;
}

interface QccStep {
  step: string;
  status: string;
  tanggal: string;
  file?: string;
}

export default function ProjectStatusQcc() {
  const loginNrp = useLoginNrp();
  const [refreshKey] = useState(0);
  const [rows, setRows] = useState<QccProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<QccProject | null>(null);
  const [stepHistory, setStepHistory] = useState<QccStep[]>([]);
  const [stepLoading, setStepLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const { stepFilter, setStepFilter, stepOptions, filteredRows } = useStepFilter(rows);

  // Fetch QCC list
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (USE_DUMMY_PROJECT_STATUS) {
        await simulateDummyDelay();
        setRows(fetchDummyQccList() as QccProject[]);
        return;
      }

      const createdBy = loginNrp || "";
      const resp = await fetch(API.QCC_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CreatedBy: createdBy, RefreshKey: refreshKey }),
      });
      const json = await resp.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e: any) {
      setError(e?.message || "Gagal load QCC");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [loginNrp, refreshKey]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Fetch QCC step history
  const fetchStepHistory = useCallback(async (itemKey: string) => {
    setStepLoading(true);
    try {
      if (USE_DUMMY_PROJECT_STATUS) {
        await simulateDummyDelay();
        setStepHistory(fetchDummyQccStepHistory(itemKey));
        return;
      }

      const resp = await fetch(`${CONFIG.apiBaseUrl}/api/QccProject/step/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemKey),
      });
      const json = await resp.json();
      // Map backend fields to FE QccStep
      const data = Array.isArray(json?.data) ? json.data.map((s: any) => ({
        step: s.step ?? s.Step ?? "",
        status: s.status ?? s.Status ?? "",
        tanggal: s.createdAt ?? s.CreatedAt ?? "",
        file: s.fileDoc ?? s.FileDoc ? `${CONFIG.apiBaseUrl}/qcc/steps/${s.fileDoc ?? s.FileDoc}` : undefined,
      })) : [];
      setStepHistory(data);
    } catch {
      setStepHistory([]);
    } finally {
      setStepLoading(false);
    }
  }, []);

  // Handle open detail
  const handleOpenDetail = (row: QccProject) => {
    setDetail(row);
    if (row.itemKey) fetchStepHistory(row.itemKey);
  };

  return (
    <>
      <HistoricalProjectPageShell
        title="Historical Project QCC"
        subtitle="Riwayat proyek Quality Control Circle"
      >
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          <StepFilterBar value={stepFilter} onChange={setStepFilter} steps={stepOptions} />
          <HistoricalProjectTable>
              <HistoricalProjectTableHeader />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length ? (
                  filteredRows.map((r, idx) => (
                    <TableRow key={String(r.id ?? r.itemKey ?? idx)}>
                      <TableCell className={historicalTableCell.no}>{idx + 1}</TableCell>
                      <TableCell className={historicalTableCell.itemKey}>{r.itemKey}</TableCell>
                      <TableCell className={historicalTableCell.judul}>
                        <TruncatedReadMoreCell text={r.namaGroupQccp ?? "-"} />
                      </TableCell>
                      <TableCell className={historicalTableCell.leader}>
                        {r.leader ?? "-"} ({r.leaderNrp ?? "-"})
                      </TableCell>
                      <TableCell className={historicalTableCell.status}><Badge variant="outline">{r.status ?? "-"}</Badge></TableCell>
                      <TableCell className={historicalTableCell.step}>{r.step ?? "-"}</TableCell>
                      <TableCell className={historicalTableCell.aksi}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDetail(r)}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
          </HistoricalProjectTable>
      </HistoricalProjectPageShell>

      {/* Detail QCC */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Badge variant="outline" style={{ backgroundColor: "#EE642E15", color: "#EE642E", borderColor: "#EE642E" }}>
                  QCC
                </Badge>
                <span>{detail.namaGroupQccp ?? detail.itemKey ?? "-"}</span>
              </h2>
              <Button onClick={() => setDetail(null)} variant="ghost">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">ItemKey</div>
                  <div className="font-semibold">{detail.itemKey ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Leader</div>
                  <div className="font-semibold">{detail.leader ?? "-"} ({detail.leaderNrp ?? "-"})</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div>{detail.status ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Dokumen</div>
                  {detail.SupportingDocument ? (
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 transition text-xs"
                        onClick={() => setPdfUrl(`${CONFIG.apiBaseUrl}/qcc/${detail.SupportingDocument}`)}
                      >
                        Lihat PDF
                      </button>
                      <a
                        href={`${CONFIG.apiBaseUrl}/qcc/${detail.SupportingDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline cursor-pointer text-xs"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Langkah Terakhir</div>
                  <div>{detail.step ?? "-"}</div>
                </div>
              </div>
              {/* Table Step History */}
              <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                <div className="font-semibold mb-2">Riwayat Step QCC</div>
                {stepLoading ? (
                  <div>Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>File</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stepHistory.length ? stepHistory.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.step}</TableCell>
                          <TableCell>{s.status}</TableCell>
                          <TableCell>{s.tanggal}</TableCell>
                          <TableCell>
                            {s.file ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 transition text-xs"
                                  onClick={() => { setPdfUrl(s.file!); setPdfOpen(true); }}
                                >
                                  Lihat PDF
                                </button>
                                <a
                                  href={s.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline cursor-pointer text-xs"
                                >
                                  Download
                                </a>
                              </div>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No step history</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Tutup
                </Button>
              </div>
              {/* PDF Popup Viewer */}
              <PdfPopupViewer fileUrl={pdfUrl || ""} open={pdfOpen} onClose={() => setPdfOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
