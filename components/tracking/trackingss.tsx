import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { endOfDay, format, parseISO } from "date-fns";
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

import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

import { API } from "../../config";
import {
    USE_DUMMY_PROJECT_STATUS,
    simulateDummyDelay,
    fetchDummySsList,
    findDummySsByIdeano,
    fetchDummySsDetail,
} from "../../libs/projectStatusDummy";

import { authUserOrNull } from "../../libs/auth";

/* =====================================================
   Types
   ===================================================== */
type ProjectStatus = "Review By Leader 1" | "Review By Leader" | "Review by BPI" | "Complete" | "Close" | "Reject by leader";

type HistoryMessageKind = "info" | "error";
type ScoringHistoryRow = Record<string, any>;

type ApiBaseResponse<T = any> = {
    responseCode?: number;
    message?: string;
    data?: T;
};

type SuggestionRow = {
    ideano?: string;
    itemKey?: string;
    judul?: string;
    masalah?: string;
    uraianMasalah?: string;
    ideDiajukan?: string;
    status?: string;
    createdAt?: string;

    approvalAtasan1At?: string;
    approvalAtasan1By?: string;
    approvalAtasan2At?: string;
    approvalAtasan2By?: string;

    period?: number;

    atasan1?: string;
    createdBy?: string;
    site?: string;
    jobsite?: string;
    division?: string;
    department?: string;
    section?: string;
    totalRows?: number;
    totalPages?: number;
    documentCount?: number;
    hasDocument?: boolean;
    [k: string]: any;
};

type SuggestionListResponse = {
    responseCode?: number;
    message?: string;
    data?: SuggestionRow[];
    items?: SuggestionRow[];
    rows?: SuggestionRow[];
};

type SuggestionDocumentResponseDto = {
    documentId?: number;
    itemKey?: string;
    fileName?: string;
    fileExtension?: string;
    contentType?: string;
    fileSize?: number;
    documentBase64?: string;
    documentBlobUri?: string;
    isActive?: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
};

type SuggestionRetrieveData = {
    itemKey?: string;
    ideano?: string;
    judul?: string;

    masalah?: string;
    hubunganPenemuan?: string;
    uraianMasalah?: string;
    ideDiajukan?: string;
    uraianProcess?: string;

    evalQuality?: string;
    evalCost?: string;
    evalDelivery?: string;
    evalSafety?: string;
    evalMorale?: string;
    evalProductivity?: string;

    directorate?: string;
    division?: string;
    department?: string;
    section?: string;

    nrpAtasan1?: string;
    nrpAtasan2?: string;
    atasan1?: string;
    atasan2?: string;
    pembuat?: string;

    approvalAtasan1At?: string;
    approvalAtasan1By?: string;
    approvalAtasan2At?: string;
    approvalAtasan2By?: string;
    rejectAtasan1At?: string;
    rejectAtasan1By?: string;
    rejectAtasan1Reason?: string;

    period?: number;

    documentBase64?: string;
    documentTemplateBase64?: string;

    documentCount?: number;
    hasDocument?: boolean;

    suggestionDocumentResponseDtos?: SuggestionDocumentResponseDto[];

    status?: string;

    createdAt?: string;
    createdBy?: string;
    totalRows?: number;
    totalPages?: number;
    totalReviewByLeader?: number;
    totalReviewByBpi?: number;
    totalComplete?: number;

    [k: string]: any;
};

type HistoricalProject = {
    id: string;
    type: "SS";
    projectName: string;
    leader: string;
    creatorName?: string;
    completionDate: string;
    presentationDate: string;
    color: string;
    description: string;
    status: ProjectStatus;

    period?: number;

    site?: string;
    division?: string;
    department?: string;
    section?: string;

    currentSituation?: string;
    proposedSolution?: string;

    itemKey?: string;
    ideano?: string;
    rejectAtasan1At?: string;
    rejectAtasan1By?: string;
    rejectAtasan1Reason?: string;
    uraianProcess?: string;
};

/* =====================================================
   Constants
   ===================================================== */
const SS_COLOR = "#EE642E";
const ITEMS_PER_PAGE = 10;
const PROJECT_TYPE_NUMBER = 0;

/** Historical SS tab: hanya tampilkan ide Complete */
const HISTORICAL_SS_STATUS = "Complete";

const DETAIL_EXCLUDE_KEYS = new Set<string>([
    "createdAt",
    "createdBy",
    "totalRows",
    "totalPages",
    "totalReviewByLeader",
    "totalReviewByBpi",
    "totalComplete",
    "jobsite",
]);


const HISTORY_EXCLUDE_KEYS_LOWER = new Set<string>([
    "itemkey",
    "item_key",
    "created_at",
    "createdat",
    "created_by",
    "createdby",
    "updated_at",
    "updatedat",
    "updated_by",
    "updatedby",
    "deleted_at",
    "deletedat",
    "deleted_by",
    "deletedby",
]);

/* =====================================================
   Small utils
   ===================================================== */
function safeStr(v: any, fallback = "-") {
    const s = String(v ?? "").trim();
    return s ? s : fallback;
}

function safeId(v: any) {
    const s = String(v ?? "").trim();
    return s ? s : `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function resolveApiUrl(v: any): string {
    return typeof v === "function" ? v() : String(v ?? "");
}

function sanitizeItemKey(raw: any) {
    const s = String(raw ?? "").trim();
    if (!s) return "";
    return s.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

function normalizeStatus(raw: any): ProjectStatus {
    const s = String(raw ?? "").trim().toLowerCase();
    if (s.includes("leader 1") || s.includes("atasan 1")) return "Review By Leader 1";
    if (s.includes("bpi")) return "Review by BPI";
    if (s.includes("close")) return "Close";
    if (s.includes("complete")) return "Complete";
    if (s.includes("reject")) return "Reject by leader";
    return "Review By Leader";
}

function normalizeIdeano(raw: any) {
    return String(raw ?? "").trim().toUpperCase();
}

function statusBadgeStyle(status: string) {
    const s = String(status || "").toLowerCase();
    if (s.includes("bpi")) return { backgroundColor: "#5FCEA015", borderColor: "#5FCEA0", color: "#5FCEA0" };
    if (s.includes("complete")) return { backgroundColor: "#7FED8415", borderColor: "#7FED84", color: "#2E7D32" };
    if (s.includes("close")) return { backgroundColor: "#9CA3AF15", borderColor: "#9CA3AF", color: "#6B7280" };
    if (s.includes("reject")) return { backgroundColor: "#EF535015", borderColor: "#EF5350", color: "#C62828" };
    return { backgroundColor: `${SS_COLOR}15`, borderColor: SS_COLOR, color: SS_COLOR };
}

function formatDateCell(dateStr?: string) {
    if (!dateStr) return "-";
    try {
        const d = dateStr.includes("T") ? parseISO(dateStr) : parseISO(`${dateStr}T00:00:00`);
        return format(d, "dd MMM yyyy");
    } catch {
        return String(dateStr);
    }
}

function formatAuditDate(dateStr?: string) {
    if (!dateStr) return "-";
    try {
        const d = dateStr.includes("T") ? parseISO(dateStr) : parseISO(`${dateStr}T00:00:00`);
        return format(d, "dd MMM yyyy");
    } catch {
        return String(dateStr || "-");
    }
}

function toIsoOrNull(d?: Date, isEnd?: boolean) {
    if (!d) return null;
    const use = isEnd ? endOfDay(d) : d;
    return use.toISOString();
}

function getRowsFromApi(json: any): SuggestionRow[] {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.rows)) return json.rows;
    return [];
}

function getPagingFromApi(rows: SuggestionRow[], pageSize: number) {
    const first = rows[0] ?? {};
    const totalRows = Number(first.totalRows ?? rows.length ?? 0);
    const apiTotalPages = Number(first.totalPages ?? 0);
    const computed = Math.max(1, Math.ceil((totalRows || 0) / pageSize));
    return {
        totalRows: totalRows || rows.length,
        totalPages: apiTotalPages > 0 ? apiTotalPages : computed,
    };
}

function mapSuggestionToHistoricalProject(x: SuggestionRow): HistoricalProject {
    const id = safeId(x?.itemKey ?? x?.ideano);
    const projectName = safeStr(x?.judul, "-");
    const leader = safeStr(x?.atasan1 ?? x?.createdBy, "-");
    const creatorName = safeStr(x?.createdBy, leader);

    const createdAt = safeStr(x?.createdAt, "");
    const status = normalizeStatus(x?.status);
    const description = safeStr(x?.masalah ?? x?.uraianMasalah, "Suggestion System project");
    return {
        id,
        type: "SS",
        projectName,
        leader,
        creatorName,
        completionDate: createdAt,
        presentationDate: createdAt,
        color: SS_COLOR,
        description,
        status,
        period: Number(x?.period ?? 0) || undefined,

        site: x?.site ? safeStr(x.site, "") : x?.jobsite ? safeStr(x.jobsite, "") : undefined,
        division: x?.division ? safeStr(x.division, "") : undefined,
        department: x?.department ? safeStr(x.department, "") : undefined,
        section: x?.section ? safeStr(x.section, "") : undefined,

        currentSituation: x?.uraianMasalah ? safeStr(x.uraianMasalah, "") : undefined,
        proposedSolution: x?.ideDiajukan ? safeStr(x.ideDiajukan, "") : undefined,

        itemKey: x?.itemKey ? String(x.itemKey) : undefined,
        ideano: x?.ideano ? String(x.ideano) : undefined,
        rejectAtasan1At: x?.rejectAtasan1At ? String(x.rejectAtasan1At) : undefined,
        rejectAtasan1By: x?.rejectAtasan1By ? String(x.rejectAtasan1By) : undefined,
        rejectAtasan1Reason: x?.rejectAtasan1Reason ? String(x.rejectAtasan1Reason) : undefined,
        uraianProcess: x?.uraianProcess ? safeStr(x.uraianProcess, "") : undefined,

        evalCost: x?.evalCost ? String(x.evalCost) : undefined,
        evalQuality: x?.evalQuality ? String(x.evalQuality) : undefined,
        evalSafety: x?.evalSafety ? String(x.evalSafety) : undefined,
    };
}

/* =====================================================
   Debounce hook
   ===================================================== */
function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

/* =====================================================
   Abort hook
   ===================================================== */
function useAbortController() {
    const ref = useRef<AbortController | null>(null);

    const abort = useCallback(() => {
        if (ref.current) ref.current.abort();
        ref.current = null;
    }, []);

    const next = useCallback(() => {
        abort();
        const ac = new AbortController();
        ref.current = ac;
        return ac;
    }, [abort]);

    useEffect(() => abort, [abort]);
    return useMemo(() => ({ ref, abort, next }), [abort, next]);
}

/* =====================================================
   HTTP helper
   ===================================================== */
async function postJson<T>(url: string, body: any, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
        signal,
    });

    const rawText = await res.text();
    let parsed: any = null;
    try {
        parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
        parsed = null;
    }

    if (!res.ok) throw new Error(parsed?.message || parsed?.title || rawText || `HTTP ${res.status} ${res.statusText}`);
    return (parsed ?? {}) as T;
}

async function fetchSuggestionByIdeano(url: string, ideano: string, signal?: AbortSignal): Promise<SuggestionRow | null> {
    const keyword = String(ideano ?? "").trim();
    if (!keyword) return null;

    if (USE_DUMMY_PROJECT_STATUS) {
        if (signal?.aborted) return null;
        await simulateDummyDelay();
        return findDummySsByIdeano(keyword) as SuggestionRow | null;
    }

    const json = await postJson<SuggestionListResponse>(
        url,
        {
            pageNumber: 0,
            pageSize: 50,
            createdAtFrom: null,
            createdAtTo: null,
            keyword,
            status: "",
            projectType: PROJECT_TYPE_NUMBER,
        },
        signal
    );

    if (json?.responseCode && json.responseCode !== 200) throw new Error(json?.message ?? "API error");

    const rows = getRowsFromApi(json);
    if (!rows.length) return null;

    const wanted = normalizeIdeano(keyword);
    return rows.find((r) => normalizeIdeano(r?.ideano) === wanted) ?? null;
}

/* =====================================================
   Base64 helpers
   ===================================================== */
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

/* =====================================================
   Scoring helpers
   ===================================================== */
function isExcludedHistoryKey(key: string) {
    return HISTORY_EXCLUDE_KEYS_LOWER.has(String(key ?? "").trim().toLowerCase());
}

function prettifyKey(key: string) {
    const k = String(key ?? "");
    return k
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim()
        .split(/\s+/g)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

function normalizeKeyLoose(s: any) {
    return String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]+/g, "")
        .replace(/[^\p{L}\p{N}]/gu, "");
}

function normalizeValueForCompare(v: any) {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v).trim().toLowerCase();
}

function formatCellValue(v: any) {
    if (v === null || v === undefined || v === "") return "-";
    if (Array.isArray(v)) {
        return v
            .map((item) => {
                if (item && typeof item === "object") {
                    return item.typeName || item.typeCode || item.TypeName || item.TypeCode || JSON.stringify(item);
                }
                return String(item);
            })
            .filter(Boolean)
            .join(", ");
    }
    if (typeof v === "object") {
        try {
            return JSON.stringify(v);
        } catch {
            return String(v);
        }
    }
    return String(v);
}

function getArrayFromApi(json: ApiBaseResponse): any[] {
    const d = (json as any)?.data;
    return Array.isArray(d) ? d : [];
}

function buildNoHistoryMessage(itemKey: string, apiMessage?: string) {
    const base = `ItemKey "${itemKey}" belum memiliki riwayat penilaian.`;
    return apiMessage ? `${base} (${apiMessage})` : base;
}

function getRowTime(r: any) {
    const raw =
        r?.createdAt ??
        r?.created_at ??
        r?.CreatedAt ??
        r?.CREATED_AT ??
        r?.createD_AT ??
        0;

    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? 0 : t;
}

async function fetchScoringHistory(scoringRetrieveUrl: string, itemKey: string, signal?: AbortSignal) {
    const body = {
        action: 2,
        itemKey,
        nrp: "",
        pageNumber: 0,
        pageSize: 0,
        search: "",
        includeDeleted: false,
        orderBy: "",
        orderDir: "",
    };

    const json = await postJson<ApiBaseResponse>(scoringRetrieveUrl, body, signal);

    if (json?.responseCode && json.responseCode !== 200) {
        return {
            rows: [] as ScoringHistoryRow[],
            kind: "info" as HistoryMessageKind,
            message: buildNoHistoryMessage(itemKey, json?.message),
        };
    }

    const rows = (getArrayFromApi(json) as ScoringHistoryRow[]) ?? [];
    if (rows.length === 0) return { rows: [], kind: "info" as HistoryMessageKind, message: buildNoHistoryMessage(itemKey) };

    const sorted = [...rows].sort((a, b) => getRowTime(b) - getRowTime(a));
    return { rows: sorted };
}

/* =====================================================
   Detail helpers
   ===================================================== */
function pickDetailDescription(d?: SuggestionRetrieveData | null, fallback = "-") {
    if (!d) return fallback;
    return safeStr(d?.masalah ?? d?.uraianMasalah, fallback);
}

function toPairsAllFields(d: SuggestionRetrieveData | null, exclude: Set<string>, alsoExclude: Set<string>) {
    if (!d) return [];
    const keys = Object.keys(d ?? {}).filter((k) => !exclude.has(k) && !alsoExclude.has(k));
    keys.sort((a, b) => a.localeCompare(b));
    return keys.map((k) => ({ key: k, label: prettifyKey(k), value: (d as any)[k] }));
}


/* =====================================================
   Dedicated hooks
   ===================================================== */
function useApiUrls() {
    const suggestionListUrl = useMemo(() => resolveApiUrl((API as any)?.SUGGESTION_LIST), []);
    const suggestionRetrieveUrl = useMemo(() => resolveApiUrl((API as any)?.SUGGESTION_RETRIEVE), []);
    const scoringRetrieveUrl = useMemo(() => resolveApiUrl((API as any)?.SCORING_RETRIEVE), []);
    return { suggestionListUrl, suggestionRetrieveUrl, scoringRetrieveUrl };
}

function useSuggestionList(params: { suggestionListUrl: string; requestBody: any; pageSize: number }) {
    const { suggestionListUrl, requestBody, pageSize } = params;
    const aborter = useAbortController();

    const [projects, setProjects] = useState<HistoricalProject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            if (!suggestionListUrl) {
                setErrorMsg("API.SUGGESTION_LIST is empty.");
                setProjects([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setIsLoading(true);
            setErrorMsg(null);

            try {
                if (USE_DUMMY_PROJECT_STATUS) {
                    if (signal?.aborted) return;
                    await simulateDummyDelay();
                    const { rows, totalRows, totalPages } = fetchDummySsList(requestBody);
                    const mapped = rows.map((r) => mapSuggestionToHistoricalProject(r as SuggestionRow));
                    setProjects(mapped);
                    setTotalItems(totalRows);
                    setTotalPages(Math.max(1, totalPages));
                    return;
                }

                const json = await postJson<SuggestionListResponse>(suggestionListUrl, requestBody, signal);
                if (json?.responseCode && json.responseCode !== 200) throw new Error(json?.message ?? "API error");

                const rows = getRowsFromApi(json);
                const mapped = rows.map(mapSuggestionToHistoricalProject);
                const paging = getPagingFromApi(rows, pageSize);

                setProjects(mapped);
                setTotalItems(paging.totalRows);
                setTotalPages(Math.max(1, paging.totalPages));
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                setProjects([]);
                setTotalItems(0);
                setTotalPages(1);
                setErrorMsg(e?.message ?? "Failed to fetch suggestions");
            } finally {
                setIsLoading(false);
            }
        },
        [suggestionListUrl, requestBody, pageSize]
    );

    const refresh = useCallback(() => {
        const ac = aborter.next();
        load(ac.signal);
    }, [aborter, load]);

    useEffect(() => {
        const ac = aborter.next();
        load(ac.signal);
        return () => ac.abort();
    }, [aborter, load]);

    return { projects, isLoading, errorMsg, totalPages, totalItems, refresh, abort: aborter.abort, setErrorMsg };
}

function useSuggestionDetail(params: { suggestionRetrieveUrl: string; detailAbort: ReturnType<typeof useAbortController> }) {
    const { suggestionRetrieveUrl, detailAbort } = params;

    const lastKeyRef = useRef<string>("");

    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<SuggestionRetrieveData | null>(null);

    const reset = useCallback(() => {
        lastKeyRef.current = "";
        setDetailLoading(false);
        setDetailError(null);
        setDetailData(null);
    }, []);

    const load = useCallback(
        async (itemKeyRaw: any, force = false) => {
            const itemKey = sanitizeItemKey(itemKeyRaw);
            if (!itemKey) return;

            if (!force && lastKeyRef.current === itemKey) return;
            lastKeyRef.current = itemKey;

            if (!suggestionRetrieveUrl) {
                setDetailError("API.SUGGESTION_RETRIEVE is empty.");
                return;
            }

            setDetailLoading(true);
            setDetailError(null);
            setDetailData(null);

            const ac = detailAbort.next();

            try {
                if (USE_DUMMY_PROJECT_STATUS) {
                    if (ac.signal.aborted) return;
                    await simulateDummyDelay();
                    const data = fetchDummySsDetail(itemKey);
                    if (!data) throw new Error("Detail data is empty.");
                    setDetailData(data as SuggestionRetrieveData);
                    return;
                }

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
                    projectType: PROJECT_TYPE_NUMBER,
                };

                const json = await postJson<ApiBaseResponse<SuggestionRetrieveData>>(suggestionRetrieveUrl, body, ac.signal);
                if (json?.responseCode && json.responseCode !== 200) throw new Error(json?.message ?? "API error");
                console.log('Adalah: ', json?.data);
                const data = (json?.data ?? null) as SuggestionRetrieveData | null;
                if (!data) throw new Error("Detail data is empty.");
                setDetailData(data);
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                setDetailError(e?.message ?? "Gagal load detail suggestion");
                setDetailData(null);
            } finally {
                setDetailLoading(false);
            }
        },
        [suggestionRetrieveUrl, detailAbort]
    );

    return { detailLoading, detailError, detailData, reset, load };
}


function useScoringHistory(params: { scoringRetrieveUrl: string; scoringAbort: ReturnType<typeof useAbortController> }) {
    const { scoringRetrieveUrl, scoringAbort } = params;

    const lastKeyRef = useRef<string>("");

    const [showScoring, setShowScoring] = useState(false);
    const [rows, setRows] = useState<ScoringHistoryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageKind, setMessageKind] = useState<HistoryMessageKind>("info");

    const reset = useCallback(() => {
        lastKeyRef.current = "";
        setShowScoring(false);
        setRows([]);
        setLoading(false);
        setMessage(null);
        setMessageKind("info");
    }, []);


    const load = useCallback(
        async (itemKeyRaw: any, force = false) => {
            const itemKey = sanitizeItemKey(itemKeyRaw);
            if (!itemKey || !scoringRetrieveUrl) return;

            if (!force && lastKeyRef.current === itemKey) return;
            lastKeyRef.current = itemKey;

            setLoading(true);
            const ac = scoringAbort.next();

            try {
                if (USE_DUMMY_PROJECT_STATUS) {
                    if (ac.signal.aborted) return;
                    await simulateDummyDelay();
                    setRows([]);
                    setMessage("Scoring history tidak tersedia pada mode dummy.");
                    setMessageKind("info");
                    return;
                }

                const result = await fetchScoringHistory(scoringRetrieveUrl, itemKey, ac.signal);
                setRows(result.rows);

                console.log('scoring: ', result.rows);
                if ((result as any).message) {
                    setMessage((result as any).message);
                    setMessageKind((result as any).kind ?? "info");
                } else {
                    setMessage(null);
                    setMessageKind("info");
                }
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                setRows([]);
                setMessageKind("error");
                setMessage(e?.message ?? "Gagal load riwayat penilaian");
            } finally {
                setLoading(false);
            }
        },
        [scoringRetrieveUrl, scoringAbort]
    );

    const columns = useMemo(() => {
        if (!rows || rows.length === 0) return [];
        const keys = new Set<string>();
        for (const r of rows) Object.keys(r ?? {}).forEach((k) => keys.add(k));
        const cols = [...keys].filter((k) => !isExcludedHistoryKey(k));

        cols.sort((a, b) => {
            const rank = (k: string) => {
                const l = normalizeKeyLoose(k);
                if (l === "roleplay" || l === "actortype" || l === "actortyp" || l === "reviewer") return 0;
                if (l === "totalscore") return 999;
                return 50;
            };
            return rank(a) - rank(b) || a.localeCompare(b);
        });

        return cols;
    }, [rows]);

    const hasScoring = rows.length > 0;

    const actorTypeKey = useMemo(() => {
        const cols = columns ?? [];
        const candidates = ["roleplay", "actortype", "actor_type", "actor", "reviewer"];
        for (const c of candidates) {
            const found = cols.find((k) => normalizeKeyLoose(k) === normalizeKeyLoose(c));
            if (found) return found;
        }
        return (
            cols.find((k) => {
                const l = normalizeKeyLoose(k);
                return l.includes("role") || l.includes("review") || l.includes("actor");
            }) ?? null
        );
    }, [columns]);

    const REVIEWER_HIGHLIGHT_COLS = useMemo(
        () =>
            new Set<string>([
                "delivery",
                "keaslianide",
                "kepekaan",
                "kualitas",
                "manfaat",
                "pelaksanaanide",
                "perencanaan",
                "reduksibiaya",
                "she",
                "sumberdaya",
                "totalscore",
            ]),
        []
    );

    const COLUMN_LABEL_MAP = useMemo(() => {
        const m = new Map<string, string>();
        m.set("delivery", "Delivery");
        m.set("keaslianide", "Keaslian Ide");
        m.set("kepekaan", "Kepekaan");
        m.set("kualitas", "Kualitas");
        m.set("manfaat", "Manfaat");
        m.set("pelaksanaanide", "Pelaksanaan Ide");
        m.set("perencanaan", "Perencanaan");
        m.set("reduksibiaya", "Reduksi Biaya");
        m.set("she", "SHE");
        m.set("sumberdaya", "Sumber Daya");
        m.set("totalscore", "Total Score");
        return m;
    }, []);

    const getColumnLabel = useCallback(
        (col: string) => {
            const norm = normalizeKeyLoose(col);
            return COLUMN_LABEL_MAP.get(norm) ?? prettifyKey(col);
        },
        [COLUMN_LABEL_MAP]
    );

    const getActorType = useCallback(
        (rowIndex: number) => {
            if (!actorTypeKey) return "";
            return String(rows?.[rowIndex]?.[actorTypeKey] ?? "").trim().toLowerCase();
        },
        [actorTypeKey, rows]
    );

    const isReviewerRowLocal = useCallback(
        (rowIndex: number) => {
            const t = getActorType(rowIndex);
            return t === "reviewer" || t.includes("reviewer");
        },
        [getActorType]
    );

    const isSuperiorRowLocal = useCallback(
        (rowIndex: number) => {
            const t = getActorType(rowIndex);
            return t === "superior" || t.includes("superior") || t.includes("leader") || t.includes("atasan");
        },
        [getActorType]
    );

    const getCompareBaseIndexForReviewer = useCallback(
        (reviewerIndex: number): number | null => {
            if (!actorTypeKey) return null;
            if (!isReviewerRowLocal(reviewerIndex)) return null;

            for (let i = reviewerIndex + 1; i < rows.length; i++) {
                if (isSuperiorRowLocal(i)) return i;
            }
            for (let i = reviewerIndex + 1; i < rows.length; i++) {
                if (!isReviewerRowLocal(i)) return i;
            }
            return null;
        },
        [actorTypeKey, isReviewerRowLocal, isSuperiorRowLocal, rows.length]
    );

    const isDifferentFromBase = useCallback(
        (rowIndex: number, col: string) => {
            if (!isReviewerRowLocal(rowIndex)) return false;
            if (actorTypeKey && col === actorTypeKey) return false;

            const normCol = normalizeKeyLoose(col);
            if (!REVIEWER_HIGHLIGHT_COLS.has(normCol)) return false;

            const baseIndex = getCompareBaseIndexForReviewer(rowIndex);
            if (baseIndex === null) return false;

            const a = normalizeValueForCompare(rows?.[rowIndex]?.[col]);
            const b = normalizeValueForCompare(rows?.[baseIndex]?.[col]);
            return a !== b;
        },
        [actorTypeKey, getCompareBaseIndexForReviewer, isReviewerRowLocal, rows, REVIEWER_HIGHLIGHT_COLS]
    );

    return {
        showScoring,
        setShowScoring,
        rows,
        loading,
        message,
        messageKind,
        columns,
        hasScoring,
        reset,
        load,
        actorTypeKey,
        isDifferentFromBase,
        getColumnLabel,
    };
}

/* =====================================================
   Component
   ===================================================== */
export function Home() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [searchKeyword, setSearchKeyword] = useState('');
    const keywordDebounced = useDebouncedValue(searchKeyword, 300);
    // Jobsite filter state
    const [jobsiteFilter, setJobsiteFilter] = useState<string>("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProject, setSelectedProject] = useState<HistoricalProject | null>(null);
    const [selectedUploadedFileId, setSelectedUploadedFileId] = useState<string>("");

    const { suggestionListUrl, suggestionRetrieveUrl, scoringRetrieveUrl } = useApiUrls();

    const detailAbort = useAbortController();
    const scoringAbort = useAbortController();
    const autoOpenAbort = useAbortController();

    const ideanoFromUrl = useMemo(() => String(searchParams.get("ideano") ?? "").trim(), [searchParams]);
    const autoOpenRef = useRef<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState<string | null>(null);

    const handleImportExcelClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportMessage(null);

        const fd = new FormData();
        fd.append("file", file);

        try {
            const url = (API as any).SUGGESTION_IMPORT;
            const res = await fetch(url, {
                method: "POST",
                body: fd,
                credentials: "include",
            });

            const json = await res.json();
            if (!res.ok || json?.responseCode !== 200) {
                throw new Error(json?.message || "Import failed");
            }

            setImportMessage(`Import successful! ${json?.message || ""}`);
            list.refresh();
        } catch (err: any) {
            setImportMessage(err.message || "Failed to import Excel file.");
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) setEndDate(startDate);
    }, [startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, keywordDebounced]);

    const user = useMemo(() => authUserOrNull(), []);
    const userNrp = (user?.actortype !== 'CREATOR') ? '' : user?.nrp;

    const requestBodyList = useMemo(
        () => ({
            pageNumber: 0,
            pageSize: 9999,
            createdAtFrom: toIsoOrNull(startDate, false),
            createdAtTo: toIsoOrNull(endDate, true),
            keyword: keywordDebounced,
            jobsite: user?.jobsite,
            status: '', //HISTORICAL_SS_STATUS,
            projectType: PROJECT_TYPE_NUMBER,
            nrp: userNrp,
        }),
        [startDate, endDate, keywordDebounced, user?.jobsite, userNrp]
    );

    const list = useSuggestionList({ suggestionListUrl, requestBody: requestBodyList, pageSize: 9999 });
    const detail = useSuggestionDetail({ suggestionRetrieveUrl, detailAbort });
    const scoring = useScoringHistory({ scoringRetrieveUrl, scoringAbort });


    // Cek apakah data berasal dari injeksi excel ?
    const TotalScore = scoring.rows.reduce((sum, row) => sum + row.totalscore, 0);
    const isImport = scoring.rows.reduce((sum, row) => sum + row.IsImport, 0);
    const isfromInject = scoring.rows.length > 0 || isImport > 0;

    // Extract unique jobsites from itemKey (e.g., 'JAHO/01/2026/SS/0001' => 'JAHO')
    const jobsiteOptions = useMemo(() => {
        const set = new Set<string>();
        (list.projects || []).forEach((p) => {
            const itemKey = String(p.itemKey || "");
            const jobsite = itemKey.split("/")[0];
            if (jobsite) set.add(jobsite);
        });
        return ["all", ...Array.from(set).sort()];
    }, [list.projects]);

    const setIdeanoQuery = useCallback(
        (ideano?: string) => {
            const clean = String(ideano ?? "").trim();
            const next = new URLSearchParams(searchParams);
            if (clean) next.set("ideano", clean);
            else next.delete("ideano");
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    const resetDetailAndScoringState = useCallback(() => {
        detailAbort.abort();
        scoringAbort.abort();
        setSelectedProject(null);
        setSelectedUploadedFileId("");
        detail.reset();
        scoring.reset();
    }, [detailAbort, scoringAbort, detail, scoring]);

    const handleRefresh = useCallback(() => list.refresh(), [list]);
    const jobsite = (user?.actortype !== 'CREATOR') ? user?.jobsite : '';


    // Filtered projects by jobsite and keyword search
    const filteredProjects = useMemo(() => {
        let resultList = list.projects.filter(p => p.status !== 'Complete') || [];

        const query = (keywordDebounced || "").trim().toLowerCase();
        if (query) {
            resultList = resultList.filter((p) => {
                const itemKey = String(p.itemKey || "").toLowerCase();
                const projectName = String(p.projectName || "").toLowerCase();
                const leader = String(p.leader || "").toLowerCase();
                return itemKey.includes(query) || projectName.includes(query) || leader.includes(query);
            });
        }

        if (jobsiteFilter === "all") return resultList;
        return resultList.filter((p) => {
            const itemKey = String(p.itemKey || "");
            return itemKey.startsWith(jobsiteFilter + "/");
        });

    }, [list.projects, jobsiteFilter, keywordDebounced]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / 10));

    const goPrev = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
    const goNext = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * 10;
        return filteredProjects.slice(start, start + 10);
    }, [filteredProjects, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredProjects]);

    const handleResetFilter = useCallback(() => {
        list.abort();
        setStartDate(undefined);
        setEndDate(undefined);
        setSearchKeyword("");
        setCurrentPage(1);
        list.setErrorMsg(null);
        resetDetailAndScoringState();
        setIdeanoQuery("");
        autoOpenRef.current = "";
    }, [list, resetDetailAndScoringState, setIdeanoQuery]);

    const handleOpenDetail = useCallback(
        (p: HistoricalProject) => {
            //setIdeanoQuery(p.ideano);
            autoOpenRef.current = normalizeIdeano(p.ideano);
            setSelectedProject((prev) => {
                const a = sanitizeItemKey(prev?.itemKey);
                const b = sanitizeItemKey(p?.itemKey);
                if (a && b && a === b) return prev;
                return p;
            });
        },
        [setIdeanoQuery]
    );

    const handleCloseDetail = useCallback(() => {
        const suppressKey =
            normalizeIdeano(ideanoFromUrl) || normalizeIdeano(selectedProject?.ideano);
        if (suppressKey) autoOpenRef.current = suppressKey;
        autoOpenAbort.abort();
        resetDetailAndScoringState();
        setSelectedUploadedFileId("");
        setIdeanoQuery("");
    }, [
        resetDetailAndScoringState,
        setIdeanoQuery,
        ideanoFromUrl,
        selectedProject?.ideano,
        autoOpenAbort,
    ]);

    const selectedItemKey = useMemo(() => sanitizeItemKey(selectedProject?.itemKey), [selectedProject?.itemKey]);

    useEffect(() => {
        if (!selectedItemKey) {
            detailAbort.abort();
            scoringAbort.abort();
            detail.reset();
            scoring.reset();
            return;
        }

        detail.load(selectedItemKey, true);
        scoring.load(selectedItemKey, true);

        return () => {
            detailAbort.abort();
            scoringAbort.abort();
        };
    }, [selectedItemKey, detail.load, detail.reset, scoring.load, scoring.reset, detailAbort, scoringAbort]);

    useEffect(() => {
        if (!suggestionListUrl) return;
        if (!ideanoFromUrl) {
            autoOpenRef.current = "";
            return;
        }

        const normalized = normalizeIdeano(ideanoFromUrl);
        if (!normalized) return;
        if (autoOpenRef.current === normalized) return;

        const ac = autoOpenAbort.next();

        (async () => {
            try {
                list.setErrorMsg(null);
                const row = await fetchSuggestionByIdeano(suggestionListUrl, ideanoFromUrl, ac.signal);

                if (!row) {
                    list.setErrorMsg(`Data dengan ideano "${ideanoFromUrl}" tidak ditemukan.`);
                    return;
                }

                const mapped = mapSuggestionToHistoricalProject(row);
                autoOpenRef.current = normalized;
                setSelectedProject(mapped);
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                list.setErrorMsg(e?.message ?? `Gagal membuka detail ideano "${ideanoFromUrl}".`);
            }
        })();

        return () => ac.abort();
    }, [ideanoFromUrl, suggestionListUrl, autoOpenAbort, list]);

    useEffect(() => {
        const docs = detail.detailData?.suggestionDocumentResponseDtos ?? [];
        if (docs.length > 0) {
            setSelectedUploadedFileId(String(docs[0]?.documentId ?? ""));
        } else {
            setSelectedUploadedFileId("");
        }
    }, [detail.detailData]);

    const effectiveTitle = detail.detailData?.judul ?? selectedProject?.projectName ?? "-";
    const effectiveStatus = normalizeStatus(detail.detailData?.status ?? selectedProject?.status);
    const effectiveItemKey = sanitizeItemKey(detail.detailData?.itemKey ?? selectedProject?.itemKey);
    const effectiveIdeano = safeStr(detail.detailData?.ideano ?? selectedProject?.ideano, "-");
    const effectivePeriod = detail.detailData?.period ?? selectedProject?.period ?? undefined;

    const uploadedDocuments = useMemo(() => {
        const docs = detail.detailData?.suggestionDocumentResponseDtos ?? [];
        if (docs.length > 0) return docs;

        const singleB64 = String(detail.detailData?.documentBase64 ?? "").trim();
        if (!singleB64) return [];

        return [
            {
                documentId: 0,
                itemKey: detail.detailData?.itemKey,
                fileName: `Document-${detail.detailData?.ideano ?? detail.detailData?.itemKey ?? "File"}.pdf`,
                fileExtension: ".pdf",
                contentType: guessMimeFromBase64(singleB64),
                documentBase64: singleB64,
                isActive: true,
            } as SuggestionDocumentResponseDto,
        ];
    }, [detail.detailData]);

    const selectedUploadedDocument = useMemo(() => {
        if (!uploadedDocuments.length) return null;

        const found = uploadedDocuments.find(
            (d) => String(d.documentId ?? "") === String(selectedUploadedFileId)
        );

        return found ?? uploadedDocuments[0];
    }, [uploadedDocuments, selectedUploadedFileId]);

    const selectedUploadedBase64 = String(selectedUploadedDocument?.documentBase64 ?? "").trim();
    const hasUploadedDoc = !!selectedUploadedBase64;

    const selectedUploadedMime =
        String(selectedUploadedDocument?.contentType ?? "").trim() ||
        (hasUploadedDoc ? guessMimeFromBase64(selectedUploadedBase64) : "");

    const selectedUploadedName =
        String(selectedUploadedDocument?.fileName ?? "").trim() ||
        `Document-${effectiveIdeano || effectiveItemKey || "File"}`;

    const selectedUploadedExt =
        String(selectedUploadedDocument?.fileExtension ?? "").trim() ||
        (selectedUploadedMime === "application/pdf" ? ".pdf" : "");

    const templateB64 = String(detail.detailData?.documentTemplateBase64 ?? "").trim();
    const hasTemplatePdf = !!templateB64;
    const hasDocument = (!!detail.detailData?.documentCount);
    const templateMime = hasTemplatePdf ? guessMimeFromBase64(templateB64) : "";
    const templateExt = templateMime === "application/pdf" ? ".pdf" : "";

    const ssB64 = hasTemplatePdf ? templateB64 : "";
    const canViewSs = !detail.detailLoading && !detail.detailError && !!detail.detailData && hasDocument;
    const canDownloadSs = canViewSs;

    const handleViewUploadedDoc = useCallback(() => {
        if (!hasUploadedDoc) return;
        openBase64InSmallWindow(selectedUploadedBase64);
    }, [selectedUploadedBase64, hasUploadedDoc]);

    const handleDownloadUploadedDoc = useCallback(() => {
        if (!hasUploadedDoc) return;

        const fileName = selectedUploadedName || `Document-${effectiveIdeano || effectiveItemKey || "File"}`;
        const hasExt = /\.[A-Za-z0-9]+$/.test(fileName);
        const finalName = hasExt ? fileName : `${fileName}${selectedUploadedExt || ""}`;

        downloadBase64File(selectedUploadedBase64, finalName);
    }, [
        hasUploadedDoc,
        selectedUploadedBase64,
        selectedUploadedName,
        selectedUploadedExt,
        effectiveIdeano,
        effectiveItemKey,
    ]);

    const handleViewSsPdf = useCallback(() => {
        if (!hasTemplatePdf) return;
        openBase64InSmallWindow(ssB64);
    }, [hasTemplatePdf, ssB64]);

    const handleDownloadSsPdf = useCallback(() => {
        if (!hasTemplatePdf) return;
        const baseName = String(effectiveIdeano || effectiveItemKey || "SS").trim() || "SS";
        downloadBase64File(ssB64, `Form-SS-${baseName}${templateExt || ".pdf"}`);
    }, [effectiveIdeano, effectiveItemKey, hasTemplatePdf, ssB64, templateExt]);

    const alreadyRenderedKeys = useMemo(
        () =>
            new Set<string>([
                "itemKey",
                "ideano",
                "judul",
                "status",
                "pembuat",
                "atasan1",
                "atasan2",
                "nrpAtasan1",
                "nrpAtasan2",
                "directorate",
                "division",
                "department",
                "section",
                "hubunganPenemuan",
                "masalah",
                "uraianMasalah",
                "ideDiajukan",
                "uraianProcess",
                "evalQuality",
                "evalCost",
                "evalDelivery",
                "evalSafety",
                "evalMorale",
                "evalProductivity",
                "documentBase64",
                "documentTemplateBase64",
                "suggestionDocumentResponseDtos",
                "documentCount",
                "hasDocument",
                "approvalAtasan1At",
                "approvalAtasan1By",
                "approvalAtasan2At",
                "approvalAtasan2By",
                "period",
            ]),
        []
    );

    const otherFieldPairs = useMemo(() => {
        return toPairsAllFields(detail.detailData, DETAIL_EXCLUDE_KEYS, alreadyRenderedKeys).filter((p) => {
            const v = p.value;
            return !(v === null || v === undefined || String(v).trim() === "");
        });
    }, [detail.detailData, alreadyRenderedKeys]);

    const detailDescriptionNode = useMemo(() => {
        if (detail.detailLoading) {
            return (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading detail...
                </span>
            );
        }
        if (detail.detailError) return <span className="text-sm text-red-600">{detail.detailError}</span>;
        return <span>{pickDetailDescription(detail.detailData, selectedProject?.description ?? "-")}</span>;
    }, [detail.detailLoading, detail.detailError, detail.detailData, selectedProject?.description]);


    // State dan handler untuk Edit SS
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    const handleOpenEdit = useCallback((p: HistoricalProject) => {
        console.log("Opening detail for project:", p);
        console.log("Opening detail for project 2:", selectedProject);

        setEditData({
            masalah: p.description || "",
            uraianMasalah: p.currentSituation || "",
            ideDiajukan: p.proposedSolution || "",
            uraianProcess: p.uraianProcess || "",
            evalQuality: p.evalQuality || "",
            evalCost: p.evalCost || "",
            evalSafety: p.evalSafety || "",
            itemKey: p.itemKey,
            ideano: p.ideano,
            // Tambahkan field lain jika perlu
        });
        setEditError("");
        setEditOpen(true);
    }, [setEditData]);
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError("");
        try {
            // Ganti URL API sesuai kebutuhan
            const url = (API as any)?.SUGGESTION_EXECUTE;
            const fd = new FormData();
            fd.append("Action", "2");
            fd.append("ItemKey", editData.itemKey || "");
            fd.append("Masalah", editData.masalah || "");
            fd.append("UraianMasalah", editData.uraianMasalah || "");
            fd.append("IdeDiajukan", editData.ideDiajukan || "");
            fd.append("UraianProcess", editData.uraianProcess || "");
            fd.append("EvalQuality", editData.evalQuality || "");
            fd.append("EvalCost", editData.evalCost || "");
            fd.append("EvalSafety", editData.evalSafety || "");
            fd.append("Status", "Review By Leader");
            // Tambahkan field lain jika perlu
            const res = await fetch(url, { method: "POST", body: fd, credentials: "include" });
            const json = await res.json();
            if (!res.ok || json?.responseCode !== 200) throw new Error(json?.message || "Gagal update");
            setEditOpen(false);
            // TODO: refresh list jika perlu
        } catch (e: any) {
            setEditError(e?.message || "Gagal update");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">Projects Tracking</h1>
                <p className="text-sm text-white/90 mt-1">Suggestion System (SS) — On Going ideas only</p>
            </div>

            <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" style={{ backgroundColor: `${SS_COLOR}15`, borderColor: SS_COLOR, color: SS_COLOR }}>
                            SS
                        </Badge>
                        <span className="text-sm text-muted-foreground">Project Type is static</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            style={{ display: "none" }}
                        />
                        {user?.actortype !== 'CREATOR' && (
                            <Button
                                variant="outline" size="sm"
                                onClick={handleImportExcelClick}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Import from Excel
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={list.isLoading}>
                            {list.isLoading ? "Loading..." : "Refresh"}
                        </Button>

                        <Button variant="destructive" size="sm" onClick={handleResetFilter} disabled={list.isLoading}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Filter
                        </Button>
                    </div>
                </div>

                {list.errorMsg && <div className="text-sm text-red-600">{list.errorMsg}</div>}
                {importing && <div className="text-sm text-blue-400">Importing Excel, please wait...</div>}
                {importMessage && (
                    <div className={`text-sm ${importMessage.includes("failed") || importMessage.includes("Failed") || importMessage.includes("gagal") || importMessage.includes("Gagal") ? "text-red-500" : "text-green-500"}`}>
                        {importMessage}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="w-full flex items-center justify-start text-left font-normal h-9 px-4 py-2 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="w-full flex items-center justify-start text-left font-normal h-9 px-4 py-2 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Project Type</Label>
                        <div className="h-9 px-3 flex items-center rounded-md border bg-muted text-muted-foreground">
                            Suggestion System (SS)
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="search-keyword">Search by Keyword</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="search-keyword"
                                type="text"
                                placeholder="Search creator / leader / title..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Jobsite</label>
                        <select
                            className="h-9 px-3 flex items-center rounded-md border bg-muted text-muted-foreground"
                            value={jobsiteFilter}
                            onChange={e => setJobsiteFilter(e.target.value)}
                        >
                            {jobsiteOptions.map((js) => (
                                <option key={js} value={js}>
                                    {js === "all" ? "All" : js}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label>Group Status</label>
                        <select
                            className="h-9 px-3 flex items-center rounded-md border bg-muted text-muted-foreground"
                            value={jobsiteFilter}
                            onChange={e => setJobsiteFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="BVL">BVL</option>
                            <option value="konvensi">Konvensi Site</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="p-2">
                {/* Jobsite Dropdown */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ItemKey</TableHead>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Project Type</TableHead>
                            <TableHead>Leader</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted From Creator</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-center">Detail</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {list.isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : paginatedProjects.length > 0 ? (
                            paginatedProjects.map((p) => (
                                <TableRow key={p.id} className="hover:bg-muted/50">
                                    <TableCell className="font-mono text-xs">{p.itemKey}</TableCell>
                                    <TableCell className="font-medium">{p.projectName}</TableCell>

                                    <TableCell>
                                        <Badge variant="outline" style={{ backgroundColor: `${SS_COLOR}15`, borderColor: SS_COLOR, color: SS_COLOR }}>
                                            SS
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">{p.leader}</TableCell>

                                    <TableCell>
                                        <Badge variant="outline" style={statusBadgeStyle(p.status)}>
                                            {p.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">{formatDateCell(p.presentationDate)}</TableCell>

                                    <TableCell className="text-muted-foreground">{String(p.period ?? "-")}</TableCell>

                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(p)}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Detail
                                        </Button>
                                    </TableCell>
                                    {/* Dialog Edit SS */}
                                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                        <DialogContent className="w-full max-w-md max-h-[80vh] overflow-y-auto overscroll-contain p-6">
                                            <DialogHeader>
                                                <DialogTitle>Edit SS Detail</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleEditSubmit} className="space-y-3">
                                                <div>
                                                    <Label>Masalah</Label>
                                                    <Textarea name="masalah" value={editData?.masalah || ""} onChange={handleEditChange} required />
                                                </div>
                                                <div>
                                                    <Label>Uraian Masalah</Label>
                                                    <Textarea name="uraianMasalah" value={editData?.uraianMasalah || ""} onChange={handleEditChange} required />
                                                </div>
                                                <div>
                                                    <Label>Ide Diajukan</Label>
                                                    <Textarea name="ideDiajukan" value={editData?.ideDiajukan || ""} onChange={handleEditChange} required />
                                                </div>
                                                <div>
                                                    <Label>Uraian Process</Label>
                                                    <Textarea name="uraianProcess" value={editData?.uraianProcess || ""} onChange={handleEditChange} required />
                                                </div>
                                                <div>
                                                    <Label>Evaluation - Quality</Label>
                                                    <Input name="evalQuality" value={editData?.evalQuality || ""} onChange={handleEditChange} />
                                                </div>
                                                <div>
                                                    <Label>Evaluation - Efficiency</Label>
                                                    <Input name="evalCost" value={editData?.evalCost || ""} onChange={handleEditChange} />
                                                </div>
                                                <div>
                                                    <Label>Evaluation - Culture Development</Label>
                                                    <Input name="evalSafety" value={editData?.evalSafety || ""} onChange={handleEditChange} />
                                                </div>
                                                {editError && <div className="text-red-600 text-sm">{editError}</div>}
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button variant="outline" type="button" onClick={() => setEditOpen(false)} disabled={editLoading}>Batal</Button>
                                                    <Button variant="default" type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Simpan"}</Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                    No projects found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="flex justify-between items-center px-4 py-2">
                    <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage <= 1 || list.isLoading}>
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Page {Math.min(currentPage, totalPages)} of {totalPages} • {filteredProjects.length} items
                    </div>

                    <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage >= totalPages || list.isLoading}>
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            <Dialog open={!!selectedProject} onOpenChange={(open: boolean) => !open && handleCloseDetail()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain pr-1">
                    {selectedProject && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <Badge variant="outline" style={{ backgroundColor: `${SS_COLOR}15`, color: SS_COLOR, borderColor: SS_COLOR }}>
                                        SS
                                    </Badge>
                                    <span>{effectiveTitle}</span>
                                </DialogTitle>

                                <DialogDescription>{detailDescriptionNode}</DialogDescription>

                                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                                    <span className="text-xs text-muted-foreground min-w-[240px]">
                                        ItemKey: <b>{effectiveItemKey || "-"}</b> • Ideano: <b>{effectiveIdeano || "-"}</b>
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            className="shrink-0"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleViewSsPdf}
                                            disabled={!canViewSs || !isfromInject}
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
                                            disabled={!canDownloadSs || !isfromInject}
                                            title={!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download SS
                                        </Button>

                                        {String(selectedProject?.status).toLowerCase() === 'reject by leader'.toLowerCase() && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                                onClick={() => handleOpenEdit(selectedProject)}
                                            >
                                                Revise Data
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {uploadedDocuments.length > 0 && (
                                    <div className="p-3 rounded-lg border bg-muted/40 space-y-3">
                                        <div className="text-sm">
                                            <div className="font-medium">Lampiran Dokumen</div>
                                            <div className="text-xs text-muted-foreground">
                                                Pilih file yang ingin dilihat atau diunduh.
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-end">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Pilih File</Label>
                                                <select
                                                    value={selectedUploadedFileId}
                                                    onChange={(e) => setSelectedUploadedFileId(e.target.value)}
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                >
                                                    {uploadedDocuments.map((doc, idx) => {
                                                        const value = String(doc.documentId ?? idx);
                                                        const name =
                                                            String(doc.fileName ?? "").trim() ||
                                                            `File ${idx + 1}${doc.fileExtension ? ` (${doc.fileExtension})` : ""}`;

                                                        return (
                                                            <option key={value} value={value}>
                                                                {name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <Button variant="outline" onClick={handleViewUploadedDoc} disabled={!hasUploadedDoc}>
                                                <FileText className="w-4 h-4 mr-2" />
                                                View File
                                            </Button>

                                            <Button variant="default" onClick={handleDownloadUploadedDoc} disabled={!hasUploadedDoc}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download File
                                            </Button>
                                        </div>

                                        {selectedUploadedDocument && (
                                            <div className="text-xs text-muted-foreground">
                                                <div>Nama: {safeStr(selectedUploadedDocument.fileName, "-")}</div>
                                                <div>Tipe: {safeStr(selectedUploadedDocument.contentType, selectedUploadedMime || "-")}</div>
                                                <div>
                                                    Ukuran:{" "}
                                                    {selectedUploadedDocument.fileSize != null
                                                        ? `${(Number(selectedUploadedDocument.fileSize) / 1024).toFixed(2)} KB`
                                                        : "-"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" style={statusBadgeStyle(effectiveStatus)}>
                                                {effectiveStatus}
                                            </Badge>
                                            {detail.detailData?.rejectAtasan1At && (
                                                <div className="mt-2 space-y-1">
                                                    <label className="text-xs text-muted-foreground">Alasan Penolakan</label>
                                                    <Textarea
                                                        readOnly
                                                        rows={3}
                                                        value={detail.detailData.rejectAtasan1Reason ?? "-"}
                                                        className="resize-none text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Pembuat</label>
                                        <div className="mt-1">{safeStr(detail.detailData?.pembuat ?? selectedProject.creatorName, "-")}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Atasan 1</label>
                                        <div className="mt-1">
                                            {safeStr(detail.detailData?.atasan1 ?? selectedProject.leader, "-")}
                                            {detail.detailData?.nrpAtasan1 ? (
                                                <span className="text-xs text-muted-foreground"> • {detail.detailData.nrpAtasan1}</span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Atasan 2</label>
                                        <div className="mt-1">
                                            {safeStr(detail.detailData?.atasan2, "-")}
                                            {detail.detailData?.nrpAtasan2 ? (
                                                <span className="text-xs text-muted-foreground"> • {detail.detailData.nrpAtasan2}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {detail.detailData?.directorate && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Directorate</label>
                                            <div className="mt-1">{safeStr(detail.detailData.directorate)}</div>
                                        </div>
                                    )}

                                    {detail.detailData?.division && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Division</label>
                                            <div className="mt-1">{safeStr(detail.detailData.division)}</div>
                                        </div>
                                    )}

                                    {detail.detailData?.department && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Department</label>
                                            <div className="mt-1">{safeStr(detail.detailData.department)}</div>
                                        </div>
                                    )}

                                    {detail.detailData?.section && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Section</label>
                                            <div className="mt-1">{safeStr(detail.detailData.section)}</div>
                                        </div>
                                    )}

                                    {selectedProject.site && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Site</label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                {selectedProject.site}
                                            </div>
                                        </div>
                                    )}
                                </div>





                                {detail.detailData?.hubunganPenemuan && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Hubungan Penemuan</label>
                                        <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {safeStr(detail.detailData.hubunganPenemuan)}
                                        </div>
                                    </div>
                                )}

                                {detail.detailData?.masalah && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Masalah</label>
                                        <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {safeStr(detail.detailData.masalah)}
                                        </div>
                                    </div>
                                )}

                                {detail.detailData?.uraianMasalah && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Uraian Masalah</label>
                                        <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {safeStr(detail.detailData.uraianMasalah)}
                                        </div>
                                    </div>
                                )}

                                {detail.detailData?.ideDiajukan && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Ide Diajukan</label>
                                        <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {safeStr(detail.detailData.ideDiajukan)}
                                        </div>
                                    </div>
                                )}

                                {detail.detailData?.uraianProcess && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Uraian Process</label>
                                        <div className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {safeStr(detail.detailData.uraianProcess)}
                                        </div>
                                    </div>
                                )}

                                {(detail.detailData?.evalQuality ||
                                    detail.detailData?.evalCost ||
                                    detail.detailData?.evalDelivery ||
                                    detail.detailData?.evalSafety ||
                                    detail.detailData?.evalMorale ||
                                    detail.detailData?.evalProductivity) && (
                                        <div className="space-y-2">
                                            <Label>Evaluation</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {detail.detailData?.evalQuality && (
                                                    <div className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="text-xs text-muted-foreground">Quality</div>
                                                        <div className="text-sm mt-1">{safeStr(detail.detailData.evalQuality)}</div>
                                                    </div>
                                                )}
                                                {detail.detailData?.evalCost && (
                                                    <div className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="text-xs text-muted-foreground">Efficiency</div>
                                                        <div className="text-sm mt-1">{safeStr(detail.detailData.evalCost)}</div>
                                                    </div>
                                                )}
                                                {detail.detailData?.evalDelivery && (
                                                    <div className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="text-xs text-muted-foreground">Delivery</div>
                                                        <div className="text-sm mt-1">{safeStr(detail.detailData.evalDelivery)}</div>
                                                    </div>
                                                )}
                                                {detail.detailData?.evalSafety && (
                                                    <div className="p-3 rounded-lg border bg-muted/30">
                                                        <div className="text-xs text-muted-foreground">Culture Development</div>
                                                        <div className="text-sm mt-1">{safeStr(detail.detailData.evalSafety)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {otherFieldPairs.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Other Information</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {otherFieldPairs.map((p) => (
                                                <div key={p.key} className="p-3 rounded-lg border bg-muted/20">
                                                    <div className="text-xs text-muted-foreground">{p.label}</div>
                                                    <div className="text-sm mt-1 whitespace-pre-wrap">{formatCellValue(p.value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Audit Trail</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Submitted From Creator</div>
                                            <div className="text-sm mt-1">{formatAuditDate(detail.detailData?.createdAt)}</div>
                                        </div>

                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Period</div>
                                            <div className="text-sm mt-1">{effectivePeriod ?? "-"}</div>
                                        </div>

                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Tanggal Disetujui Atasan 1</div>
                                            <div className="text-sm mt-1">{formatAuditDate(detail.detailData?.approvalAtasan1At)}</div>
                                        </div>

                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Disetujui Atasan 1</div>
                                            <div className="text-sm mt-1">{safeStr(detail.detailData?.approvalAtasan1By, "-")}</div>
                                        </div>

                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Tanggal disetujui Atasan 2</div>
                                            <div className="text-sm mt-1">{formatAuditDate(detail.detailData?.approvalAtasan2At)}</div>
                                        </div>

                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <div className="text-xs text-muted-foreground">Disetujui Atasan 2</div>
                                            <div className="text-sm mt-1">{safeStr(detail.detailData?.approvalAtasan2By, "-")}</div>
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

                                <div className="pt-2">
                                    <div className="flex justify-end gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => scoring.setShowScoring((v) => !v)}
                                            disabled={scoring.loading || !scoring.hasScoring}
                                            title={!scoring.hasScoring ? "Belum ada penilaian." : undefined}
                                        >
                                            {scoring.loading ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Checking...
                                                </span>
                                            ) : scoring.showScoring ? (
                                                "Sembunyikan Penilaian"
                                            ) : (
                                                "Lihat Penilaian"
                                            )}
                                        </Button>

                                        <Button variant="outline" onClick={handleCloseDetail}>
                                            Close
                                        </Button>
                                    </div>

                                    {scoring.showScoring && (
                                        <Card className="p-4 mt-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <Label>Riwayat Penilaian</Label>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        ItemKey: <b>{effectiveItemKey || "-"}</b>
                                                    </div>
                                                </div>

                                                {scoring.loading && (
                                                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Loading...
                                                    </span>
                                                )}
                                            </div>

                                            {scoring.message && (
                                                <div
                                                    className={
                                                        scoring.messageKind === "error"
                                                            ? "text-sm text-red-600 mt-3"
                                                            : "text-sm text-muted-foreground mt-3"
                                                    }
                                                >
                                                    {scoring.message}
                                                </div>
                                            )}

                                            {!scoring.loading && scoring.rows.length > 0 && (
                                                <div className="mt-3 overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {scoring.columns.map((col) => (
                                                                    <TableHead key={col}>{scoring.getColumnLabel(col)}</TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>

                                                        <TableBody>
                                                            {scoring.rows.map((row, idx) => (
                                                                <TableRow key={`${row?.itemkey ?? row?.itemKey ?? effectiveItemKey ?? "item"}-${idx}`}>
                                                                    {scoring.columns.map((col) => {
                                                                        const isNumber = typeof row?.[col] === "number";
                                                                        const makeRed = scoring.isDifferentFromBase(idx, col);
                                                                        return (
                                                                            <TableCell
                                                                                key={col}
                                                                                className={[
                                                                                    isNumber ? "tabular-nums" : "",
                                                                                    makeRed ? "text-red-600 font-semibold" : "",
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(" ")}
                                                                            >
                                                                                {formatCellValue(row?.[col])}
                                                                            </TableCell>
                                                                        );
                                                                    })}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}