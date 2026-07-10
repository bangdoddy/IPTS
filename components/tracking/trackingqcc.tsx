import React, { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
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
}

interface QccStep {
    step: string;
    status: string;
    tanggal: string;
    file?: string;
    reason?: string;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    try {
        const d = dateStr.includes("T") ? parseISO(dateStr) : parseISO(`${dateStr}T00:00:00`);
        return format(d, "dd-MM-yyyy");
    } catch {
        const d = new Date(dateStr);
        if (!Number.isNaN(d.getTime())) return format(d, "dd-MM-yyyy");
        return String(dateStr);
    }
}

function formatThousandSeparator(val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
    const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
    const [costInput, setCostInput] = useState("");
    const [costTypeCost, setCostTypeCost] = useState(false);
    const [costTypeRevenue, setCostTypeRevenue] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const { stepFilter, setStepFilter, stepOptions, filteredRows } = useStepFilter(rows.filter(p => p.status !== "finished"));

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
            console.log(json.data);
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
                tanggal: formatDate(s.createdAt ?? s.CreatedAt ?? ""),
                file: s.fileDoc ?? s.FileDoc ? `${CONFIG.apiBaseUrl}/qcc/steps/${s.fileDoc ?? s.FileDoc}` : undefined,
                reason: s.reason ?? s.Reason ?? "",
            })) : [];
            setStepHistory(data);
        } catch {
            setStepHistory([]);
        } finally {
            setStepLoading(false);
        }
    }, []);

    const handleUploadStepFile = useCallback(async () => {
        if (!detail || !selectedUploadFile) return;
        setActionError("");
        setActionLoading(true);
        try {
            const isJudulApproved = detail.stepStatus?.toLowerCase() === "judul approved";
            const isRejected = detail.stepStatus?.toLowerCase() === "rejected";
            const targetStep = isJudulApproved ? 1 : (isRejected ? Number(detail.step ?? 1) : Number(detail.step ?? 0) + 1);

            if (targetStep === 4 && !costInput.trim()) {
                setActionError("Nilai Cost wajib diisi");
                setActionLoading(false);
                return;
            }

            if (targetStep === 4 && !costTypeCost && !costTypeRevenue) {
                setActionError("Tipe Cost wajib dipilih (Cost atau Revenue)");
                setActionLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("ItemKey", detail.itemKey || "");
            formData.append("Step", String(targetStep));
            formData.append("Desc", detail.temaQccp || "");
            formData.append("FileDoc", selectedUploadFile);
            formData.append("CreatedBy", loginNrp || "");
            if (targetStep === 4) {
                const rawCost = costInput.replace(/\./g, "");
                formData.append("Cost", rawCost);

                const selectedTypes: string[] = [];
                if (costTypeCost) selectedTypes.push("Cost");
                if (costTypeRevenue) selectedTypes.push("Revenue");
                formData.append("CostType", selectedTypes.join(", "));
            }

            const resp = await fetch(API.QCC_STEP_CREATE, {
                method: "POST",
                body: formData,
            });
            const json = await resp.json().catch(() => ({}));
            const code = Number(json?.responseCode ?? resp.status);
            if (code !== 200) throw new Error(json?.message ?? "Gagal upload file");

            setSelectedUploadFile(null);
            setCostInput("");
            setCostTypeCost(false);
            setCostTypeRevenue(false);
            // Clear file inputs on page
            const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
            fileInputs.forEach(input => { input.value = ''; });

            setDetail(null);
            await fetchList();
        } catch (e: any) {
            setActionError(e?.message || "Gagal upload file");
        } finally {
            setActionLoading(false);
        }
    }, [detail, selectedUploadFile, costInput, costTypeCost, costTypeRevenue, loginNrp, fetchList]);

    // Handle open detail
    const handleOpenDetail = (row: QccProject) => {
        setDetail(row);
        if (row.itemKey) fetchStepHistory(row.itemKey);
    };

    return (
        <>
            <HistoricalProjectPageShell
                title="Tracking Project QCC"
                subtitle="On Going Quality Control Circle Project"
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
                                        <TruncatedReadMoreCell text={r.temaQccp ?? "-"} />
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
                                <span>{detail.temaQccp ?? detail.itemKey ?? "-"}</span>
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
                                                <TableHead>Reject Reason</TableHead>
                                                <TableHead>File</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stepHistory.length ? stepHistory.map((s, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{s.step}</TableCell>
                                                    <TableCell>{s.status}</TableCell>
                                                    <TableCell>{formatDate(s.tanggal)}</TableCell>
                                                    <TableCell>{s.reason || "-"}</TableCell>
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
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No step history</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            {(() => {
                                const isJudulApproved = detail.stepStatus?.toLowerCase() === "judul approved";
                                const isRejected = detail.stepStatus?.toLowerCase() === "rejected";
                                const targetStep = isJudulApproved ? 1 : (isRejected ? Number(detail.step ?? 1) : Number(detail.step ?? 0) + 1);
                                const showUpload = (isJudulApproved || detail.stepStatus?.toLowerCase() === "approved" || isRejected) && targetStep <= 8;

                                if (!showUpload) return null;

                                return (
                                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50 space-y-4 mt-4">
                                        {targetStep === 4 && (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label htmlFor="cost-input" className="text-md font-semibold text-orange-800">
                                                        Cost ( in USD ) <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="p-2">
                                                        <input
                                                            id="cost-input"
                                                            type="text"
                                                            placeholder="Masukkan Nilai Cost"
                                                            value={costInput}
                                                            onChange={(e) => setCostInput(formatThousandSeparator(e.target.value))}
                                                            className="block w-full text-sm rounded-md border border-orange-200 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="text-md font-semibold text-orange-800">
                                                        Cost Type <span className="text-red-500">*</span>
                                                    </div>
                                                    <div className="flex flex-row gap-6 items-center p-2">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="cost-type-cost"
                                                                checked={costTypeCost}
                                                                onChange={(e) => setCostTypeCost(e.target.checked)}
                                                                className="w-4 h-4 rounded text-orange-600 border-orange-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                                                            />
                                                            <label htmlFor="cost-type-cost" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                                                Cost
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="cost-type-revenue"
                                                                checked={costTypeRevenue}
                                                                onChange={(e) => setCostTypeRevenue(e.target.checked)}
                                                                className="w-4 h-4 rounded text-orange-600 border-orange-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                                                            />
                                                            <label htmlFor="cost-type-revenue" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                                                Revenue
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {actionError && <div className="text-xs text-red-600">{actionError}
                                        </div>
                                        }
                                        <div className="font-semibold text-orange-800">Upload Dokumen Step {targetStep}</div>

                                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setSelectedUploadFile(file);
                                                }}
                                                className="block w-full text-sm text-slate-500
                        border border-orange-200 rounded-lg bg-white px-3 py-2
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-orange-50 file:text-orange-700
                          hover:file:bg-orange-100"
                                            />
                                            <Button
                                                onClick={handleUploadStepFile}
                                                disabled={!selectedUploadFile || actionLoading}
                                                style={{ backgroundColor: "#EE642E", color: "#fff" }}
                                            >
                                                {actionLoading ? "Uploading..." : "Upload File"}
                                            </Button>
                                        </div>

                                    </div>
                                );
                            })()}

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
