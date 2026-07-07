import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom";
import { endOfDay, format, parseISO } from "date-fns";
import {
  Building2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  Download,
  FileText,
} from "lucide-react";

import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

import { getCookieJson } from "../../libs/cookie";
import { API, CONFIG } from "../../config";
import { authGet } from "../../libs/auth";

/* =====================================================
   Types
   ===================================================== */
type ProjectType = "SS";

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
  atasan2?: string;

  site?: string;
  jobsite?: string;
  division?: string;
  department?: string;
  section?: string;

  createdBy?: string;

  documentBase64?: string;
  documentFileName?: string;
  documentTemplateBase64?: string;

  suggestionDocumentResponseDtos?: SuggestionDocumentResponseDto[];

  totalRows?: number;
  totalPages?: number;

  pembuat?: string;

  [k: string]: any;
};

type SuggestionListResponse = {
  responseCode?: number;
  message?: string;
  data?: SuggestionRow[];
};

type ApiBaseResponse = {
  responseCode?: number;
  message?: string;
  data?: any;
};

interface ApprovalProject {
  nomor: string;
  itemKey?: string;

  type: ProjectType;
  projectName: string;
  leader: string;
  leader2?: string;
  nrpAtasan2?: string;
  presentationDate: string;
  color: string;
  description: string;
  status: string;

  period?: number;

  site?: string;
  division?: string;
  department?: string;
  section?: string;

  problemStatement?: string;
  currentSituation?: string;
  proposedSolution?: string;

  createdBy?: string;

  documentBase64?: string;
  documentFileName?: string;
  documentTemplateBase64?: string;

  suggestionDocumentResponseDtos?: SuggestionDocumentResponseDto[];

  pembuat?: string;
}

const STATUS_OPTIONS = [
  { key: "ALL", label: "All" },
  { key: "Review by leader 1", label: "Review by leader 1" },
  { key: "Review by leader 2", label: "Review by leader 2" },
  { key: "Reject by leader", label: "Reject by leader" },
  { key: "Review by BPI", label: "Review by BPI" },
  { key: "Complete", label: "Complete" },
  { key: "Close", label: "Close" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["key"];

type ScoringHistoryRow = Record<string, any> & {
  itemkey?: string;
  roleplay?: string;
};

type MessageKind = "info" | "error";

/* =====================================================
   Constants
   ===================================================== */
const ITEMS_PER_PAGE = 10;
const PROJECT_TYPE_STATIC: ProjectType = "SS";
const PROJECT_TYPE_NUMBER = 0;
const PROJECT_COLOR = "#006187";

/* =====================================================
   Score
   ===================================================== */
const SCORE_MAX = {
  kualitas: 30,
  reduksiBiaya: 1000,
  delivery: 15,
  she: 15,
  manfaat: 15,
  keaslianIde: 15,
  kepekaan: 6,
  perencanaan: 10,
  pelaksanaanIde: 15,
  sumberDaya: 9,
} as const;

type ScoreKey = keyof typeof SCORE_MAX;
type ScoreState = Record<ScoreKey, string>;

const SCORE_DEFAULT: ScoreState = {
  kualitas: "",
  reduksiBiaya: "",
  delivery: "",
  she: "",
  manfaat: "",
  keaslianIde: "",
  kepekaan: "",
  perencanaan: "",
  pelaksanaanIde: "",
  sumberDaya: "",
};

const SCORE_ZERO: ScoreState = {
  kualitas: "0",
  reduksiBiaya: "0",
  delivery: "0",
  she: "0",
  manfaat: "0",
  keaslianIde: "0",
  kepekaan: "0",
  perencanaan: "0",
  pelaksanaanIde: "0",
  sumberDaya: "0",
};

type BaselineState = {
  hasBaseline: boolean;
  scores: ScoreState;
};

type CriteriaGuideItem = {
  range: string;
  description: string;
};

type CriteriaMeta = {
  key: ScoreKey;
  title: string;
  max: number;
  guides: CriteriaGuideItem[];
};

const SCORE_CRITERIA: Record<ScoreKey, CriteriaMeta> = {
  kualitas: {
    key: "kualitas",
    title: "Kualitas",
    max: SCORE_MAX.kualitas,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–10", description: "Peningkatan kualitas kerja di tempat kerja pengusul SS" },
      {
        range: "11–20",
        description:
          "Peningkatan kualitas kerja di tempat kerja pengusul SS dan kualitas kerja proses sesudahnya / sebelumnya",
      },
      {
        range: "21–30",
        description: "Peningkatan kualitas produk (hasil kerja) dan meningkatkan image perusahaan",
      },
    ],
  },
  reduksiBiaya: {
    key: "reduksiBiaya",
    title: "Reduksi Biaya",
    max: SCORE_MAX.reduksiBiaya,
    guides: [
      {
        range: "Aturan",
        description:
          "1 poin untuk setiap penghematan Rp 50.000 per tahun, dan berlaku kelipatannya.",
      },
    ],
  },
  delivery: {
    key: "delivery",
    title: "Delivery",
    max: SCORE_MAX.delivery,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–5", description: "Memperlancar proses kerja pengusul SS" },
      {
        range: "6–10",
        description: "Menjamin delivery hasil kerja yang tepat waktu pada proses berikutnya",
      },
      {
        range: "11–15",
        description: "Menjamin delivery hasil kerja yang tepat waktu pada setiap proses",
      },
    ],
  },
  she: {
    key: "she",
    title: "Safety, Health & Environment",
    max: SCORE_MAX.she,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–5", description: "Menjadi lebih aman dari sebelumnya" },
      { range: "6–10", description: "Mencegah kecelakaan karena kecerobohan" },
      {
        range: "11–15",
        description: "Mencegah kecelakaan sekalipun sudah berhati-hati / tidak ceroboh",
      },
      {
        range: "16–20",
        description: "Dalam kondisi apapun kecelakaan bisa dicegah / tidak ada",
      },
    ],
  },
  manfaat: {
    key: "manfaat",
    title: "Manfaat",
    max: SCORE_MAX.manfaat,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–5", description: "Hanya dapat digunakan untuk dirinya / prosesnya sendiri" },
      {
        range: "6–10",
        description: "Dapat dimanfaatkan oleh rekan kerja lain dalam satu bagian",
      },
      { range: "11–15", description: "Dapat dimanfaatkan oleh semua bagian atau site" },
    ],
  },
  keaslianIde: {
    key: "keaslianIde",
    title: "Keaslian Ide",
    max: SCORE_MAX.keaslianIde,
    guides: [
      { range: "0", description: "Tidak ada" },
      {
        range: "1–3",
        description: "Ide sederhana dan hampir sama, dapat ditemukan di tempat lain",
      },
      { range: "4–7", description: "Modifikasi dari alat atau metode yang sudah ada" },
      {
        range: "8–11",
        description: "Kombinasi dari beberapa ide, tapi ada penyempurnaan dari ide sendiri",
      },
      {
        range: "12–15",
        description: "Merupakan ide yang baru, kreatif, dan inovatif",
      },
    ],
  },
  kepekaan: {
    key: "kepekaan",
    title: "Kepekaan",
    max: SCORE_MAX.kepekaan,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–2", description: "Memperbaiki atas saran / keluhan orang lain" },
      {
        range: "3–4",
        description: "Inisiatif sendiri pada masalah sendiri yang sudah parah",
      },
      {
        range: "5–6",
        description: "Memperbaiki hal-hal penting yang tidak diperhatikan orang lain",
      },
    ],
  },
  perencanaan: {
    key: "perencanaan",
    title: "Perencanaan",
    max: SCORE_MAX.perencanaan,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–5", description: "Perencanaan sederhana tanpa analisa data" },
      { range: "6–10", description: "Perencanaan dengan analisa data" },
    ],
  },
  pelaksanaanIde: {
    key: "pelaksanaanIde",
    title: "Pelaksanaan Ide",
    max: SCORE_MAX.pelaksanaanIde,
    guides: [
      { range: "0", description: "Tidak ada" },
      {
        range: "1–3",
        description: "Dapat direalisir dengan mudah tanpa persiapan khusus",
      },
      {
        range: "4–7",
        description: "Perlu persiapan khusus untuk merealisasikan perbaikan",
      },
      {
        range: "8–11",
        description:
          "Perlu kesungguhan dan melibatkan bagian lain untuk merealisasikan perbaikan",
      },
      {
        range: "12–15",
        description:
          "Perlu perhitungan teknis dan persetujuan pihak lain atau pemenuhan persyaratan standar",
      },
    ],
  },
  sumberDaya: {
    key: "sumberDaya",
    title: "Sumber Daya",
    max: SCORE_MAX.sumberDaya,
    guides: [
      { range: "0", description: "Tidak ada" },
      { range: "1–3", description: "Menggunakan sumber daya yang baru" },
      { range: "4–6", description: "Sebagian menggunakan sumber daya yang ada" },
      { range: "7–9", description: "Seluruhnya menggunakan sumber daya yang ada" },
    ],
  },
};

const SCORE_FIELD_ORDER: ScoreKey[] = [
  "kualitas",
  "reduksiBiaya",
  "delivery",
  "she",
  "manfaat",
  "keaslianIde",
  "kepekaan",
  "perencanaan",
  "pelaksanaanIde",
  "sumberDaya",
];

/* =====================================================
   Small utils
   ===================================================== */
function safeStr(v: any, fallback = "-") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function tryFormatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy HH:mm");
  } catch {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return format(d, "dd MMM yyyy HH:mm");
    return String(dateStr);
  }
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
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return format(d, "dd MMM yyyy");
    return String(dateStr);
  }
}

function toIsoOrNull(d?: Date, isEnd?: boolean) {
  if (!d) return null;
  const use = isEnd ? endOfDay(d) : d;
  return use.toISOString();
}

function clampNumber(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function parseScore(value: string, max: number) {
  const v = String(value ?? "").trim();
  if (v === "") return 0;
  const digits = v.replace(/[^\d]/g, "");
  if (digits === "") return 0;
  const n = Number(digits);
  if (Number.isNaN(n)) return 0;
  return clampNumber(n, 0, max);
}

function resolveApiUrl(v: any) {
  return typeof v === "function" ? v() : String(v ?? "");
}

function pickAny(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

function getRowsFromApi(json: SuggestionListResponse): SuggestionRow[] {
  return Array.isArray(json?.data) ? json.data : [];
}

function getPagingFromApi(rows: SuggestionRow[], pageSize: number) {
  const first = rows[0] ?? {};
  const totalRows = Number(first.totalRows ?? rows.length ?? 0);
  const apiTotalPages = Number(first.totalPages ?? 0);
  const computedTotalPages = Math.max(1, Math.ceil((totalRows || 0) / pageSize));
  return {
    totalRows,
    totalPages: apiTotalPages > 0 ? apiTotalPages : computedTotalPages,
  };
}

function sanitizeItemKey(raw: any) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

function normalizeStatus(raw: any): StatusFilter {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s.includes("reject")) return "Reject by leader";
  if (s.includes("bpi")) return "Review by BPI";
  if (s.includes("close")) return "Close";
  if (s.includes("complete")) return "Complete";
  if (s.includes("leader 1")) return "Review by leader 1";
  return "Review by leader 2";
}

function normalizeIdeano(raw: any) {
  return String(raw ?? "").trim().toUpperCase();
}

function statusBadgeStyle(status: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("reject")) {
    return { backgroundColor: "#ef444415", borderColor: "#ef4444", color: "#b91c1c" };
  }
  if (s.includes("bpi")) {
    return { backgroundColor: "#5FCEA015", borderColor: "#5FCEA0", color: "#5FCEA0" };
  }
  if (s.includes("complete")) {
    return { backgroundColor: "#7FED8415", borderColor: "#7FED84", color: "#2E7D32" };
  }
  if (s.includes("close")) {
    return { backgroundColor: "#9CA3AF15", borderColor: "#9CA3AF", color: "#6B7280" };
  }
  return {
    backgroundColor: `${PROJECT_COLOR}15`,
    borderColor: PROJECT_COLOR,
    color: PROJECT_COLOR,
  };
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
  if (b64.startsWith("iVBORw0KGgo")) return "image/png";
  if (b64.startsWith("/9j/")) return "image/jpeg";
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

function openBase64InNewTab(base64Raw: string) {
  const mime = guessMimeFromBase64(base64Raw);
  const blob = base64ToBlob(base64Raw, mime);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function openBase64InPopupWindow(base64Raw: string) {
  const mime = guessMimeFromBase64(base64Raw);
  const blob = base64ToBlob(base64Raw, mime);
  const url = URL.createObjectURL(blob);
  const width = 800;
  const height = 900;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  window.open(
    url,
    "_blank",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,noopener,noreferrer`
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

function ensureFileExt(name: string, mime: string) {
  const n = String(name ?? "").trim();
  if (!n) return n;

  const lower = n.toLowerCase();
  if (mime === "application/pdf" && !lower.endsWith(".pdf")) return `${n}.pdf`;
  if (mime === "image/png" && !lower.endsWith(".png")) return `${n}.png`;
  if (mime === "image/jpeg" && !lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) return `${n}.jpg`;
  return n;
}

/* =====================================================
   History helpers
   ===================================================== */
const HISTORY_LABEL_MAP_LOWER: Record<string, string> = {
  roleplay: "Role",
  totalscore: "Total Score",
  reduksibiaya: "Reduksi Biaya",
  keaslianide: "Keaslian Ide",
  pelaksanaanide: "Pelaksanaan Ide",
  sumberdaya: "Sumber Daya",
};

function prettifyKey(key: string) {
  const k = String(key ?? "");
  const lower = k.toLowerCase();

  if (k == 'evalCost')
    return 'Efficiency'
  else if (k == 'evalDelivery')
    return 'Culture Development'

  if (HISTORY_LABEL_MAP_LOWER[lower]) return HISTORY_LABEL_MAP_LOWER[lower];

  const spaced = k.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim();

  return spaced
    .split(/\s+/g)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
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

function isExcludedHistoryKey(key: string) {
  const k = String(key ?? "").trim().toLowerCase();
  if (/^(itemkey|item_key)$/.test(k)) return true;
  if (/^(createdat|created_at|createdby|created_by)$/.test(k)) return true;
  if (/^(updatedat|updated_at|updatedby|updated_by)$/.test(k)) return true;
  if (/^(deletedat|deleted_at|deletedby|deleted_by)$/.test(k)) return true;
  return false;
}

function sortHistoryDesc(rows: ScoringHistoryRow[]) {
  return [...rows].sort((a, b) => {
    const ta = new Date(a?.createD_AT ?? a?.createdAt ?? a?.created_at ?? 0).getTime();
    const tb = new Date(b?.createD_AT ?? b?.createdAt ?? b?.created_at ?? 0).getTime();
    const na = Number.isNaN(ta) ? 0 : ta;
    const nb = Number.isNaN(tb) ? 0 : tb;
    return nb - na;
  });
}

function buildNoHistoryMessage(itemKey: string, apiMessage?: string) {
  const base = `ItemKey "${itemKey}" belum memiliki history penilaian.`;
  return apiMessage ? `${base} (${apiMessage})` : base;
}

function buildHistoryColumns(rows: ScoringHistoryRow[]) {
  if (!rows || rows.length === 0) return [];

  const keys = new Set<string>();
  for (const r of rows) Object.keys(r ?? {}).forEach((k) => keys.add(k));

  const cols = [...keys].filter((k) => !isExcludedHistoryKey(k));

  cols.sort((a, b) => {
    const score = (k: string) => {
      const l = k.toLowerCase();
      if (l === "roleplay") return 0;
      if (l === "totalscore") return 999;
      return 50;
    };
    return score(a) - score(b) || a.localeCompare(b);
  });

  return cols;
}

/* =====================================================
   Score hydration
   ===================================================== */
const SCORE_HISTORY_ALIASES: Record<ScoreKey, string[]> = {
  kualitas: ["kualitas", "Kualitas", "KUALITAS"],
  reduksiBiaya: ["reduksiBiaya", "reduksibiaya", "ReduksiBiaya", "REDUKSIBIAYA", "reduksi_biaya", "REDUKSI_BIAYA"],
  delivery: ["delivery", "Delivery", "DELIVERY"],
  she: ["she", "SHE"],
  manfaat: ["manfaat", "Manfaat", "MANFAAT"],
  keaslianIde: ["keaslianIde", "keaslianide", "KeaslianIde", "KEASLIANIDE", "keaslian_ide", "KEASLIAN_IDE"],
  kepekaan: ["kepekaan", "Kepekaan", "KEPEKAAN"],
  perencanaan: ["perencanaan", "Perencanaan", "PERENCANAAN"],
  pelaksanaanIde: ["pelaksanaanIde", "pelaksanaanide", "PelaksanaanIde", "PELAKSANAANIDE", "pelaksanaan_ide", "PELAKSANAAN_IDE"],
  sumberDaya: ["sumberDaya", "sumberdaya", "SumberDaya", "SUMBERDAYA", "sumber_daya", "SUMBER_DAYA"],
};

const SCORE_FEEDBACK_ALIASES: Record<ScoreKey, string[]> = {
  kualitas: ["kualitas", "quality"],
  reduksiBiaya: ["reduksi biaya", "reduksibiaya", "efficiency", "cost"],
  delivery: ["delivery"],
  she: ["she", "safety", "health", "environment"],
  manfaat: ["manfaat", "benefit"],
  keaslianIde: ["keaslian ide", "keaslianide", "originality"],
  kepekaan: ["kepekaan", "awareness"],
  perencanaan: ["perencanaan", "planning"],
  pelaksanaanIde: ["pelaksanaan ide", "pelaksanaanide", "execution"],
  sumberDaya: ["sumber daya", "sumberdaya", "resource"],
};

function escapeRegex(value: string) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFeedbackScore(rawFeedback: string, aliases: string[], max: number) {
  const feedback = String(rawFeedback ?? "");
  for (const alias of aliases) {
    const a = escapeRegex(alias);
    const regex = new RegExp(`(?:^|\\b)${a}\\s*[:=\\-]?\\s*(\\d{1,4})(?:\\b|$)`, "i");
    const m = feedback.match(regex);
    if (!m?.[1]) continue;
    const parsed = Number(m[1]);
    if (Number.isNaN(parsed)) continue;
    return clampNumber(parsed, 0, max);
  }
  return 0;
}

function parseScoresFromFeedback(rawFeedback: string): ScoreState {
  const next: Partial<ScoreState> = {};
  (Object.keys(SCORE_MAX) as ScoreKey[]).forEach((k) => {
    const aliases = SCORE_FEEDBACK_ALIASES[k] ?? [k];
    const score = extractFeedbackScore(rawFeedback, aliases, SCORE_MAX[k]);
    next[k] = String(score);
  });
  return next as ScoreState;
}

function coerceHistoryScore(raw: any, max: number): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const digits = String(raw).replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  if (Number.isNaN(n)) return "";
  return String(clampNumber(n, 0, max));
}

function hydrateScoresFromHistoryRow(row: any): ScoreState {
  const next: Partial<ScoreState> = { ...SCORE_DEFAULT };
  (Object.keys(SCORE_MAX) as ScoreKey[]).forEach((k) => {
    const aliases = SCORE_HISTORY_ALIASES[k] ?? [k];
    const raw = pickAny(row, aliases);
    next[k] = coerceHistoryScore(raw, SCORE_MAX[k]);
  });
  return next as ScoreState;
}

/* =====================================================
   UI components
   ===================================================== */
function TypeBadge({ type, color }: { type: ProjectType; color: string }) {
  return (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${color}15`, color, borderColor: color }}
      title="Suggestion System"
    >
      {type}
    </Badge>
  );
}

function ScoreField({
  label,
  value,
  max,
  disabled,
  changed,
  onOpen,
}: {
  label: string;
  value: string;
  max: number;
  disabled?: boolean;
  changed?: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label className={changed ? "text-red-600" : undefined}>{label}</Label>

      <button type="button" onClick={onOpen} disabled={disabled} className="w-full text-left">
        <Input
          type="text"
          readOnly
          value={value}
          placeholder={`Klik untuk isi nilai (0 - ${max})`}
          className="tabular-nums cursor-pointer"
        />
      </button>

      <div className="text-xs text-muted-foreground">Max {max}</div>
    </div>
  );
}

function HistoryTable({ rows, columns }: { rows: ScoringHistoryRow[]; columns: string[] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-3 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{prettifyKey(col)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={`${row.itemkey ?? "item"}-${row.roleplay ?? "role"}-${idx}`}>
              {columns.map((col) => (
                <TableCell key={col} className={typeof row?.[col] === "number" ? "tabular-nums" : undefined}>
                  {formatCellValue(row?.[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* =====================================================
   API helpers
   ===================================================== */
async function postJson<T>(url: string, body: any, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
    credentials: "include",
  });

  const rawText = await res.text();

  let parsed: any = null;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch { }

  if (!res.ok) {
    throw new Error(parsed?.message || parsed?.title || rawText || `HTTP ${res.status} ${res.statusText}`);
  }

  return (parsed ?? {}) as T;
}

async function fetchSuggestionList(url: string, body: any, signal?: AbortSignal): Promise<SuggestionRow[]> {
  const json = await postJson<SuggestionListResponse>(url, body, signal);
  if (json?.responseCode !== 200) throw new Error(json?.message ?? "API error");
  return getRowsFromApi(json);
}

function getRetrieveRow(json: ApiBaseResponse): SuggestionRow | null {
  const d = (json as any)?.data;
  if (Array.isArray(d)) return (d[0] as SuggestionRow) ?? null;
  if (d && typeof d === "object") return d as SuggestionRow;
  return null;
}

async function fetchSuggestionRetrieve(url: string, body: any, signal?: AbortSignal): Promise<SuggestionRow> {
  const json = await postJson<ApiBaseResponse>(url, body, signal);

  if (json?.responseCode && json.responseCode !== 200) {
    throw new Error(json?.message ?? "SUGGESTION_RETRIEVE failed");
  }

  const row = getRetrieveRow(json);
  if (!row) throw new Error("SUGGESTION_RETRIEVE: data kosong / format tidak dikenali");

  return row;
}

async function fetchSuggestionByIdeano(url: string, ideano: string, signal?: AbortSignal): Promise<SuggestionRow | null> {
  const keyword = String(ideano ?? "").trim();
  if (!keyword) return null;

  const rows = await fetchSuggestionList(
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

  if (!rows.length) return null;

  const wanted = normalizeIdeano(keyword);
  return rows.find((r) => normalizeIdeano(pickAny(r, ["ideano", "IDEANO", "Ideano"])) === wanted) ?? null;
}

function getArrayFromApi(json: ApiBaseResponse): any[] {
  const d = (json as any)?.data;
  return Array.isArray(d) ? d : [];
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
      kind: "info" as MessageKind,
      message: buildNoHistoryMessage(itemKey, json?.message),
    };
  }

  const rows = (getArrayFromApi(json) as ScoringHistoryRow[]) ?? [];
  if (rows.length === 0) {
    return {
      rows: [] as ScoringHistoryRow[],
      kind: "info" as MessageKind,
      message: buildNoHistoryMessage(itemKey),
    };
  }

  return { rows: sortHistoryDesc(rows) };
}

/* =====================================================
   Mapping
   ===================================================== */
function mapSuggestionToApprovalProject(row: SuggestionRow): ApprovalProject {
  const itemKeyAny = pickAny(row, ["itemKey", "ITEMKEY", "ItemKey", "itemkey"]);
  const ideanoAny = pickAny(row, ["ideano", "IDEANO", "Ideano"]);

  const nomor = safeStr(ideanoAny ?? itemKeyAny ?? "", "");

  const createdBy = pickAny(row, ["CREATED_BY", "createdBy", "CreatedBy", "created_by"]);
  const docB64 = pickAny(row, ["DocumentBase64", "documentBase64", "DOCUMENT_BASE64"]);
  const docName = pickAny(row, ["DocumentFileName", "documentFileName", "FILE_NAME", "FileName"]);
  const docTemplateB64 = pickAny(row, ["documentTemplateBase64", "DocumentTemplateBase64"]);
  const docs = pickAny(row, ["suggestionDocumentResponseDtos", "SuggestionDocumentResponseDtos"]);

  const pembuat = pickAny(row, [
    "pembuat",
    "Pembuat",
    "namaPembuat",
    "NamaPembuat",
    "CREATED_BY_NAME",
    "CreatedByName",
    "createdByName",
    "NAMA_PEMBUAT",
    "NAMA",
  ]);


  const leader2 = pickAny(row, ["atasan2", "Atasan2", "LEADER2", "leader2"]);
  const nrpAtasan2 = pickAny(row, ["nrpAtasan2", "NRPAtasan2", "nrp_atasan2", "NrpAtasan2"]);

  return {
    nomor: nomor || `missing_nomor_${Date.now()}`,
    itemKey: itemKeyAny ? String(itemKeyAny) : undefined,

    type: PROJECT_TYPE_STATIC,
    projectName: safeStr(row.judul),
    leader: safeStr(row.atasan1),
    leader2: leader2 ? String(leader2) : undefined,
    nrpAtasan2: nrpAtasan2 ? String(nrpAtasan2) : undefined,
    presentationDate: safeStr(row.createdAt, ""),
    color: PROJECT_COLOR,
    description: safeStr(row.masalah, "Suggestion System submission"),
    status: safeStr(row.status, "Review by leader 1"),

    period: Number(row.period ?? 0) || undefined,

    site: row.site ? safeStr(row.site, "") : row.jobsite ? safeStr(row.jobsite, "") : undefined,
    division: row.division ? safeStr(row.division, "") : undefined,
    department: row.department ? safeStr(row.department, "") : undefined,
    section: row.section ? safeStr(row.section, "") : undefined,

    problemStatement: row.masalah ? safeStr(row.masalah, "") : undefined,
    currentSituation: row.uraianMasalah ? safeStr(row.uraianMasalah, "") : undefined,
    proposedSolution: row.ideDiajukan ? safeStr(row.ideDiajukan, "") : undefined,

    createdBy: createdBy ? String(createdBy) : undefined,
    documentBase64: docB64 ? String(docB64) : undefined,
    documentFileName: docName ? String(docName) : undefined,
    documentTemplateBase64: docTemplateB64 ? String(docTemplateB64) : undefined,

    suggestionDocumentResponseDtos: Array.isArray(docs) ? docs : undefined,

    pembuat: pembuat ? String(pembuat) : undefined,
  };
}

/* =====================================================
   Auth helpers
   ===================================================== */
function readAuthCookie() {
  return getCookieJson<any>("inovasis_auth") ?? getCookieJson<any>("auth") ?? getCookieJson<any>("user") ?? null;
}

function getActorTypeFromCookie(raw: any): string {
  const v =
    raw?.actorType ??
    raw?.ActorType ??
    raw?.actortype ??
    raw?.user?.actorType ??
    raw?.user?.ActorType ??
    raw?.user?.actortype;
  return String(v ?? "").trim();
}

function getRolePlayFromCookie(raw: any): string {
  const v =
    raw?.rolePlay ??
    raw?.RolePlay ??
    raw?.role ??
    raw?.Role ??
    raw?.user?.rolePlay ??
    raw?.user?.RolePlay ??
    raw?.user?.role ??
    raw?.user?.Role ??
    raw?.actorType;
  return String(v ?? "").trim();
}

function getCreatedByFromCookie(raw: any): string {
  const v =
    raw?.nrp ??
    raw?.NRP ??
    raw?.username ??
    raw?.Username ??
    raw?.userName ??
    raw?.UserName ??
    raw?.email ??
    raw?.Email ??
    raw?.user?.nrp ??
    raw?.user?.NRP ??
    raw?.user?.username ??
    raw?.user?.Username ??
    raw?.user?.email ??
    raw?.user?.Email;
  return String(v ?? "").trim();
}

function canAccessApproval(actorType: string) {
  const up = actorType.toUpperCase();
  return up === "REVIEWER" || up === "SUPERIOR";
}

function getForcedStatusByActor(actorType: string): StatusFilter | null {
  const up = String(actorType ?? "").trim().toUpperCase();
  if (up === "REVIEWER") return "Review by BPI";
  if (up === "SUPERIOR") return "Review by leader 1";
  return null;
}

function useAuthSnapshot(pollMs = 1000) {
  const [cookieStr, setCookieStr] = useState<string>(() => document.cookie);

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const cur = document.cookie;
      setCookieStr((prev) => (prev === cur ? prev : cur));
    };

    const id = window.setInterval(tick, pollMs);
    const onVis = () => tick();

    window.addEventListener("focus", onVis);
    document.addEventListener("visibilitychange", onVis);

    tick();

    return () => {
      mounted = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onVis);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pollMs]);

  const snapshot = useMemo(() => readAuthCookie(), [cookieStr]);
  return { snapshot };
}

/* =====================================================
   Debounce
   ===================================================== */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
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
   Data hook
   ===================================================== */
function useApprovalList(params: { allowed: boolean; url: string; body: any }) {
  const { allowed, url, body } = params;

  const [items, setItems] = useState<ApprovalProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const reload = useCallback(
    async (signal?: AbortSignal) => {
      if (!allowed) return;

      if (!url) {
        setErrorMsg("API.SUGGESTION_LIST is empty.");
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const rows = await fetchSuggestionList(url, body, signal);
        const mapped = rows.map(mapSuggestionToApprovalProject);
        const paging = getPagingFromApi(rows, ITEMS_PER_PAGE);
        const userGet = readAuthCookie();
        const userNameUpper = String(userGet?.nama || "").trim().toUpperCase();
        const isReviewer = String(userGet?.actortype || userGet?.actorType || "").toUpperCase() === "REVIEWER";

        console.log(userGet?.actortype + ': ' + mapped.filter(p => p.itemKey === 'ADMO/07/2026/SS/0001'));
        const filtered = mapped.filter((p) => {
          const status = String(p.status || "").toLowerCase();
          const leader1 = String(p.leader || "").trim().toUpperCase();
          const leader2 = String(p.leader2 || "").trim().toUpperCase();

          if (status === "review by leader 1" && leader1 === userNameUpper) {
            return true;
          }
          if (status === "review by leader 2" && leader2 === userNameUpper) {
            return true;
          }
          if (status === "review by bpi" && isReviewer) {
            return true;
          }
          return false;
        });

        console.log("Filtered mapped:", filtered);
        setItems(filtered);
        setTotalItems(paging.totalRows);
        setTotalPages(Math.max(1, paging.totalPages));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
        setErrorMsg(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [allowed, url, body]
  );

  useEffect(() => {
    if (!allowed) return;
    const ac = new AbortController();
    reload(ac.signal);
    return () => ac.abort();
  }, [allowed, reload]);

  return { items, loading, errorMsg, totalPages, totalItems, reload, setErrorMsg };
}

/* =====================================================
   Component
   ===================================================== */
export function Approval() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchKeyword, setSearchKeyword] = useState("");
  const keywordDebounced = useDebouncedValue(searchKeyword, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProject, setSelectedProject] = useState<ApprovalProject | null>(null);
  const [detailData, setDetailData] = useState<SuggestionRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailTargetKey, setDetailTargetKey] = useState<string | null>(null);
  const [selectedUploadedFileId, setSelectedUploadedFileId] = useState<string>("");

  const detailAbort = useAbortController();
  const [isfromInject, setIsfromInject] = useState(false);

  const [detailHistoryRows, setDetailHistoryRows] = useState<ScoringHistoryRow[]>([]);
  const [detailHistoryLoading, setDetailHistoryLoading] = useState(false);
  const [detailHistoryMessage, setDetailHistoryMessage] = useState<string | null>(null);
  const [detailHistoryKind, setDetailHistoryKind] = useState<MessageKind>("info");
  const detailHistoryAbort = useAbortController();

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingProject, setRatingProject] = useState<ApprovalProject | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectProject, setRejectProject] = useState<ApprovalProject | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [scores, setScores] = useState<ScoreState>(SCORE_DEFAULT);
  const [baseline, setBaseline] = useState<BaselineState>({
    hasBaseline: false,
    scores: SCORE_DEFAULT,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  // State for Feedback BPI
  const [feedbackBPI, setFeedbackBPI] = useState("");
  // State for Feedback Leader
  const [feedbackLeader, setFeedbackLeader] = useState("");

  const [historyRows, setHistoryRows] = useState<ScoringHistoryRow[]>([]);
  const [historyLatestScores, setHistoryLatestScores] = useState<ScoreState>(SCORE_ZERO);
  const [hasHistoryLatestScores, setHasHistoryLatestScores] = useState(false);

  const totalScore = useMemo(() => {
    return (Object.keys(scores) as ScoreKey[]).reduce((sum, k) => sum + parseScore(scores[k], SCORE_MAX[k]), 0);
  }, [scores]);


  // lastTotalScore: nilai total score terakhir dari history, tidak berubah saat user edit score
  const [lastTotalScore, setLastTotalScore] = useState<number | null>(null);
  // Enable Feedback BPI only if totalScore !== lastTotalScore
  const feedbackBPIEnabled = useMemo(() => {
    if (lastTotalScore === null) return false;
    return totalScore !== lastTotalScore;
  }, [totalScore, lastTotalScore]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [historyKind, setHistoryKind] = useState<MessageKind>("info");
  const historyAbort = useAbortController();

  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [activeCriteriaKey, setActiveCriteriaKey] = useState<ScoreKey | null>(null);
  const [criteriaDraftValue, setCriteriaDraftValue] = useState("");

  const { snapshot: cookieSnapshot } = useAuthSnapshot(1000);
  const actorType = useMemo(() => getActorTypeFromCookie(cookieSnapshot), [cookieSnapshot]);
  const allowed = useMemo(() => canAccessApproval(actorType), [actorType]);

  const suggestionListUrl = useMemo(() => resolveApiUrl((API as any)?.SUGGESTION_LIST), []);
  const suggestionRetrieveUrl = useMemo(() => resolveApiUrl((API as any)?.SUGGESTION_RETRIEVE), []);
  const scoringRetrieveUrl = useMemo(() => resolveApiUrl((API as any)?.SCORING_RETRIEVE), []);
  const scoringExecuteUrl = useMemo(() => resolveApiUrl((API as any)?.SCORING_EXECUTE), []);
  const rejectExecuteUrl = useMemo(() => resolveApiUrl((API as any)?.REJECT_EXECUTE), []);

  const ideanoFromUrl = useMemo(() => String(searchParams.get("ideano") ?? "").trim(), [searchParams]);
  const autoOpenAbort = useAbortController();
  const autoOpenRef = useRef<string>("");

  const authGet = readAuthCookie();

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, keywordDebounced, statusFilter]);


  const requestStatus = useMemo(() => {
    const forced = getForcedStatusByActor(actorType);
    if (forced) return forced;
    return statusFilter === "ALL" ? "" : statusFilter;
  }, [actorType, statusFilter]);

  const userNrp = (authGet?.actortype !== 'CREATOR') ? '' : authGet?.nrp;

  const requestBody = useMemo(() => {
    return {
      pageNumber: 0,
      pageSize: 9999,
      createdAtFrom: toIsoOrNull(startDate, false),
      createdAtTo: toIsoOrNull(endDate, true),
      keyword: keywordDebounced ?? "",
      jobsite: authGet?.jobsite ?? "",
      status: '',
      projectType: PROJECT_TYPE_NUMBER,
      nrp: userNrp,
    };
  }, [startDate, endDate, keywordDebounced, requestStatus]);

  const { items, loading, errorMsg, totalPages: apiTotalPages, totalItems: apiTotalItems, reload, setErrorMsg } = useApprovalList({
    allowed,
    url: suggestionListUrl,
    body: requestBody,
  });

  const filteredItems = useMemo(() => {
    let resultList = items || [];

    const query = (keywordDebounced || "").trim().toLowerCase();
    if (query) {
      resultList = resultList.filter((p) => {
        const itemKey = String(p.itemKey || "").toLowerCase();
        const projectName = String(p.projectName || "").toLowerCase();
        const leader = String(p.leader || "").toLowerCase();
        const pembuat = String(p.pembuat || "").toLowerCase();
        return itemKey.includes(query) || projectName.includes(query) || leader.includes(query) || pembuat.includes(query);
      });
    }

    return resultList;
  }, [items, keywordDebounced]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / 10));
  const totalItems = filteredItems.length;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filteredItems.slice(start, start + 10);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems]);

  const historyColumns = useMemo(() => buildHistoryColumns(historyRows), [historyRows]);
  const detailHistoryColumns = useMemo(() => buildHistoryColumns(detailHistoryRows), [detailHistoryRows]);

  const activeCriteria = useMemo(
    () => (activeCriteriaKey ? SCORE_CRITERIA[activeCriteriaKey] : null),
    [activeCriteriaKey]
  );

  const effectiveTitle = useMemo(
    () => safeStr(detailData?.judul ?? selectedProject?.projectName, "-"),
    [detailData, selectedProject]
  );

  const effectiveStatus = useMemo(
    () => normalizeStatus(detailData?.status ?? selectedProject?.status),
    [detailData, selectedProject]
  );

  const effectiveNomor = useMemo(
    () => String(detailData?.ideano ?? selectedProject?.nomor ?? "").trim(),
    [detailData, selectedProject]
  );

  const effectiveItemKey = useMemo(
    () => sanitizeItemKey(detailData?.itemKey ?? selectedProject?.itemKey),
    [detailData, selectedProject]
  );

  const effectivePeriod = useMemo(
    () => detailData?.period ?? selectedProject?.period ?? undefined,
    [detailData, selectedProject]
  );

  const uploadedDocuments = useMemo(() => {
    const docs = detailData?.suggestionDocumentResponseDtos ?? selectedProject?.suggestionDocumentResponseDtos ?? [];
    if (docs.length > 0) return docs;

    const singleB64 = String(detailData?.documentBase64 ?? selectedProject?.documentBase64 ?? "").trim();
    if (!singleB64) return [];

    return [
      {
        documentId: 0,
        itemKey: detailData?.itemKey ?? selectedProject?.itemKey,
        fileName:
          String(detailData?.documentFileName ?? selectedProject?.documentFileName ?? "").trim() ||
          `Document-${effectiveNomor || effectiveItemKey || "File"}.pdf`,
        fileExtension: ".pdf",
        contentType: guessMimeFromBase64(singleB64),
        documentBase64: singleB64,
        isActive: true,
      } as SuggestionDocumentResponseDto,
    ];
  }, [detailData, selectedProject, effectiveNomor, effectiveItemKey]);

  const selectedUploadedDocument = useMemo(() => {
    if (!uploadedDocuments.length) return null;
    return (
      uploadedDocuments.find((d) => String(d.documentId ?? "") === String(selectedUploadedFileId)) ??
      uploadedDocuments[0]
    );
  }, [uploadedDocuments, selectedUploadedFileId]);

  useEffect(() => {
    if (uploadedDocuments.length > 0) {
      setSelectedUploadedFileId(String(uploadedDocuments[0]?.documentId ?? ""));
    } else {
      setSelectedUploadedFileId("");
    }
  }, [uploadedDocuments]);

  const selectedUploadedBase64 = String(selectedUploadedDocument?.documentBase64 ?? "").trim();
  const hasUploadedDoc = !!selectedUploadedBase64;

  const selectedUploadedMime =
    String(selectedUploadedDocument?.contentType ?? "").trim() ||
    (hasUploadedDoc ? guessMimeFromBase64(selectedUploadedBase64) : "");

  const selectedUploadedName =
    String(selectedUploadedDocument?.fileName ?? "").trim() ||
    `Document-${effectiveNomor || effectiveItemKey || "File"}`;

  const templateB64 = useMemo(
    () => String(detailData?.documentTemplateBase64 ?? selectedProject?.documentTemplateBase64 ?? "").trim(),
    [detailData, selectedProject]
  );
  const hasTemplatePdf = !!templateB64;

  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

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

  const setScore = useCallback((key: ScoreKey, raw: string) => {
    const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
    if (cleaned === "") {
      setScores((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    const n = Number(cleaned);
    const max = SCORE_MAX[key];
    const clamped = Number.isNaN(n) ? 0 : clampNumber(n, 0, max);
    setScores((prev) => ({ ...prev, [key]: String(clamped) }));
  }, []);

  const isScoreChanged = useCallback(
    (k: ScoreKey) => {
      if (!baseline.hasBaseline) return false;
      return String(scores[k] ?? "").trim() !== String(baseline.scores[k] ?? "").trim();
    },
    [scores, baseline]
  );

  const closeCriteriaModal = useCallback(() => {
    setCriteriaModalOpen(false);
    setActiveCriteriaKey(null);
    setCriteriaDraftValue("");
  }, []);

  const openCriteriaModal = useCallback(
    (key: ScoreKey) => {
      setActiveCriteriaKey(key);
      setCriteriaDraftValue(String(scores[key] ?? "0"));
      setCriteriaModalOpen(true);
    },
    [scores]
  );

  const saveCriteriaValue = useCallback(() => {
    if (!activeCriteriaKey || !activeCriteria) return;
    setScore(activeCriteriaKey, criteriaDraftValue);
    closeCriteriaModal();
  }, [activeCriteriaKey, activeCriteria, criteriaDraftValue, setScore, closeCriteriaModal]);

  const retrieveScoresFromHistory = useCallback(() => {
    if (!hasHistoryLatestScores) return;
    setScores(historyLatestScores);
    setBaseline({ hasBaseline: true, scores: historyLatestScores });
  }, [hasHistoryLatestScores, historyLatestScores]);

  const clearDetailState = useCallback(() => {
    setSelectedProject(null);
    setDetailData(null);
    setDetailError(null);
    setDetailLoading(false);
    setDetailTargetKey(null);
    setSelectedUploadedFileId("");
    detailAbort.abort();

    setDetailHistoryRows([]);
    setDetailHistoryLoading(false);
    setDetailHistoryMessage(null);
    setDetailHistoryKind("info");
    detailHistoryAbort.abort();
  }, [detailAbort, detailHistoryAbort]);

  const handleResetFilter = useCallback(() => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchKeyword("");
    setStatusFilter("ALL");
    clearDetailState();
    setCurrentPage(1);
    setErrorMsg(null);
    setIdeanoQuery("");
    autoOpenRef.current = "";
  }, [clearDetailState, setErrorMsg, setIdeanoQuery]);

  const handleViewDoc = useCallback(() => {
    if (!hasUploadedDoc) return;
    openBase64InPopupWindow(selectedUploadedBase64);
  }, [hasUploadedDoc, selectedUploadedBase64]);

  const handleDownloadDoc = useCallback(() => {
    if (!hasUploadedDoc) return;
    downloadBase64File(selectedUploadedBase64, ensureFileExt(selectedUploadedName, selectedUploadedMime));
  }, [hasUploadedDoc, selectedUploadedBase64, selectedUploadedName, selectedUploadedMime]);

  const handleViewSsPdf = useCallback(() => {
    if (!hasTemplatePdf) return;
    openBase64InPopupWindow(templateB64);
  }, [hasTemplatePdf, templateB64]);

  const handleDownloadSsPdf = useCallback(() => {
    if (!hasTemplatePdf) return;
    downloadBase64File(templateB64, `Form-SS-${effectiveNomor || effectiveItemKey || "SS"}.pdf`);
  }, [hasTemplatePdf, templateB64, effectiveNomor, effectiveItemKey]);

  const loadDetailHistory = useCallback(
    async (itemKeyRaw: any) => {
      const itemKey = sanitizeItemKey(itemKeyRaw);

      if (!itemKey) {
        setDetailHistoryRows([]);
        setDetailHistoryKind("info");
        setDetailHistoryMessage("itemKey kosong.");
        return;
      }

      if (!scoringRetrieveUrl) {
        setDetailHistoryRows([]);
        setDetailHistoryKind("error");
        setDetailHistoryMessage("API.SCORING_RETRIEVE is empty.");
        return;
      }

      setDetailHistoryLoading(true);
      setDetailHistoryRows([]);
      setDetailHistoryMessage(null);
      setDetailHistoryKind("info");

      const ac = detailHistoryAbort.next();

      try {
        const result = await fetchScoringHistory(scoringRetrieveUrl, itemKey, ac.signal);
        setDetailHistoryRows(result.rows ?? []);

        // Cek apakah data berasal dari injeksi excel ?
        const TotalScore = result.rows.reduce((sum, row) => sum + row.totalscore, 0);

        if (TotalScore == 0) {
          setIsfromInject(true);
        }
        if ((result as any).message) {
          setDetailHistoryMessage((result as any).message);
          setDetailHistoryKind(((result as any).kind as MessageKind) ?? "info");
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setDetailHistoryRows([]);
        setDetailHistoryKind("error");
        setDetailHistoryMessage(e?.message ?? "Gagal load history penilaian");
      } finally {
        setDetailHistoryLoading(false);
      }
    },
    [scoringRetrieveUrl, detailHistoryAbort]
  );

  const openDetail = useCallback(
    async (p: ApprovalProject) => {
      setDetailError(null);
      setDetailData(null);
      setDetailHistoryRows([]);
      setDetailHistoryLoading(false);
      setDetailHistoryMessage(null);
      setDetailHistoryKind("info");

      const itemKey = sanitizeItemKey(p.itemKey);
      setSelectedProject(p);

      if (!itemKey || !suggestionRetrieveUrl) return;

      setDetailTargetKey(itemKey);
      setDetailLoading(true);

      const ac = detailAbort.next();

      try {
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

        const row = await fetchSuggestionRetrieve(suggestionRetrieveUrl, body, ac.signal);
        setDetailData(row);

        const mapped = mapSuggestionToApprovalProject(row);
        setSelectedProject((prev) => ({
          ...(prev ?? p),
          ...mapped,
          nomor: mapped.nomor || (prev?.nomor ?? p.nomor),
          itemKey: mapped.itemKey || (prev?.itemKey ?? p.itemKey),
        }));

        await loadDetailHistory(itemKey);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setDetailError(e?.message ?? "Gagal load detail");
        setSelectedProject(p);
      } finally {
        setDetailLoading(false);
        setDetailTargetKey(null);
      }
    },
    [suggestionRetrieveUrl, detailAbort, loadDetailHistory]
  );

  useEffect(() => {
    if (!allowed) return;
    if (!suggestionListUrl) return;
    if (!ideanoFromUrl) return;

    const normalized = normalizeIdeano(ideanoFromUrl);
    if (!normalized) return;
    if (autoOpenRef.current === normalized) return;

    const ac = autoOpenAbort.next();

    (async () => {
      try {
        setErrorMsg(null);
        const row = await fetchSuggestionByIdeano(suggestionListUrl, ideanoFromUrl, ac.signal);

        if (!row) {
          setErrorMsg(`Data dengan ideano "${ideanoFromUrl}" tidak ditemukan.`);
          return;
        }

        const mapped = mapSuggestionToApprovalProject(row);
        autoOpenRef.current = normalized;

        await openDetail(mapped);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErrorMsg(e?.message ?? `Gagal membuka detail ideano "${ideanoFromUrl}".`);
      }
    })();

    return () => ac.abort();
  }, [allowed, suggestionListUrl, ideanoFromUrl, openDetail, autoOpenAbort, setErrorMsg]);

  const openRatingModal = useCallback(
    async (p: ApprovalProject) => {
      console.log('p', p);
      setRatingProject(p);
      setScores(SCORE_ZERO);
      setBaseline({ hasBaseline: false, scores: SCORE_DEFAULT });
      setSubmitLoading(false);
      setRatingOpen(true);
      setHistoryLatestScores(SCORE_ZERO);
      setHasHistoryLatestScores(false);

      setHistoryRows([]);
      setHistoryMessage(null);
      setHistoryKind("info");

      const itemKey = sanitizeItemKey(p.itemKey);
      if (!itemKey || !scoringRetrieveUrl) {
        if (!scoringRetrieveUrl) {
          setHistoryKind("error");
          setHistoryMessage("API.SCORING_RETRIEVE is empty.");
        }
        return;
      }

      setHistoryLoading(true);
      const ac = historyAbort.next();

      try {
        const result = await fetchScoringHistory(scoringRetrieveUrl, itemKey, ac.signal);
        const rows = result.rows ?? [];
        setHistoryRows(rows);

        if (rows.length > 0) {
          const latest = rows[0];
          const hydrated = hydrateScoresFromHistoryRow(latest);
          setHistoryLatestScores(hydrated);
          setHasHistoryLatestScores(true);
          // Set lastTotalScore dari history
          const lastScore = (Object.keys(hydrated) as ScoreKey[]).reduce(
            (sum, k) => sum + parseScore(hydrated[k], SCORE_MAX[k]),
            0
          );
          setLastTotalScore(lastScore);
        } else {
          setScores(SCORE_ZERO);
          setBaseline({ hasBaseline: false, scores: SCORE_DEFAULT });
          setLastTotalScore(0);
          setHistoryLatestScores(SCORE_ZERO);
          setHasHistoryLatestScores(false);
        }

        if ((result as any).message) {
          setHistoryMessage((result as any).message);
          setHistoryKind(((result as any).kind as MessageKind) ?? "info");
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setHistoryRows([]);
        setHistoryKind("error");
        setHistoryMessage(e?.message ?? "Gagal load history penilaian");
        setScores(SCORE_ZERO);
        setBaseline({ hasBaseline: false, scores: SCORE_DEFAULT });
        setHistoryLatestScores(SCORE_ZERO);
        setHasHistoryLatestScores(false);
      } finally {
        setHistoryLoading(false);
      }
    },
    [scoringRetrieveUrl, historyAbort]
  );

  const openRejectModal = useCallback((p: ApprovalProject) => {
    setRejectProject(p);
    setRejectReason("");
    setRejectModal(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal(false);
    setRejectReason("");
    setRejectProject(null);
  }, []);
  const closeDetailModal = useCallback(() => {
    clearDetailState();
    setIdeanoQuery("");
    autoOpenRef.current = "";
  }, [clearDetailState, setIdeanoQuery]);
  const submitRejection = useCallback(async () => {
    if (!rejectProject) return;
    const payload = {
      itemKey: rejectProject.itemKey,
      rejectReason: String(rejectReason ?? "").trim(),
      rejectUser: authGet.nrp ?? "Unknown User",
    };

    await postRejectSS(payload);
    closeRejectModal();
    closeDetailModal();
    await reload();
  }, [rejectProject, rejectReason, closeRejectModal, closeDetailModal, reload]);

  const postRejectSS = useCallback(
    async (payload: any) => {
      console.log("Submitting rejection with payload:", payload);
      console.log('url', rejectExecuteUrl)
      const json = await postJson<ApiBaseResponse>(rejectExecuteUrl, payload);
      if (json?.responseCode && json.responseCode !== 200) {
        throw new Error(json?.message ?? "REJECT_EXECUTE failed");
      }
      return json;
    },
    [scoringExecuteUrl]
  );

  // State for BPI Edit Modal
  const [bpiEditModalOpen, setBpiEditModalOpen] = useState(false);
  const [bpiEditDropdown, setBpiEditDropdown] = useState({ atasan1: "", atasan2: "", divisi: "", department: "" });
  const [bpiEditMasterData, setBpiEditMasterData] = useState({ masterList: [], divisionList: [], departmentList: [] });

  useEffect(() => {
    if (!bpiEditModalOpen) return;
    // Fetch masterdata when modal opens
    (async () => {
      try {
        const res = await fetch(`${CONFIG.apiBaseUrl}/api/master/masterdata`);
        const json = await res.json();
        setBpiEditMasterData({
          masterList: json.masterList || [],
          divisionList: json.divisionList || [],
          departmentList: json.departmentList || [],
        });
      } catch (e) {
        setBpiEditMasterData({ masterList: [], divisionList: [], departmentList: [] });
      }
    })();
  }, [bpiEditModalOpen]);
  const openBPIEdit = useCallback((p: ApprovalProject) => {
    setBpiEditModalOpen(true);
    setRejectProject(p);
    setRejectReason("");
  }, []);
  const closeBPIEditModal = useCallback(() => {
    setBpiEditModalOpen(false);
    setBpiEditDropdown({ atasan1: "", atasan2: "", divisi: "", department: "" });
  }, []);
  const saveBPIEditModal = useCallback(async () => {
    // Hit API update-ss
    console.log('data', rejectProject, bpiEditDropdown.atasan1 + "|" + bpiEditDropdown.atasan2 + "|" + bpiEditDropdown.divisi + "|" + bpiEditDropdown.department);
    if (rejectProject && bpiEditDropdown.atasan1 && bpiEditDropdown.atasan2 && bpiEditDropdown.divisi && bpiEditDropdown.department) {
      try {
        console.log('masuk');
        const payload = {
          itemKey: rejectProject.itemKey,
          atasan1: bpiEditDropdown.atasan1,
          atasan2: bpiEditDropdown.atasan2,
          division: bpiEditDropdown.divisi,
          department: bpiEditDropdown.department,
        };
        await fetch(`${CONFIG.apiBaseUrl}/api/suggestion/update-ss`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setBpiEditModalOpen(false);
        setBpiEditDropdown({ atasan1: "", atasan2: "", divisi: "", department: "" });
      } catch (e) {
        // Optionally handle error
        console.log('er', e);
      }
    }
  }, [rejectProject, bpiEditDropdown]);

  const closeRatingModal = useCallback(() => {
    historyAbort.abort();
    closeCriteriaModal();
    setRatingOpen(false);
    setRatingProject(null);
    setScores(SCORE_ZERO);
    setBaseline({ hasBaseline: false, scores: SCORE_DEFAULT });
    setSubmitLoading(false);
    setHistoryRows([]);
    setHistoryLoading(false);
    setHistoryMessage(null);
    setHistoryKind("info");
    setHistoryLatestScores(SCORE_ZERO);
    setHasHistoryLatestScores(false);
  }, [historyAbort, closeCriteriaModal]);



  const postScoringExecute = useCallback(
    async (payload: any) => {
      if (!scoringExecuteUrl) throw new Error("API.SCORING_EXECUTE is empty.");
      const json = await postJson<ApiBaseResponse>(scoringExecuteUrl, payload);
      if (json?.responseCode && json.responseCode !== 200) {
        throw new Error(json?.message ?? "SCORING_EXECUTE failed");
      }
      return json;
    },
    [scoringExecuteUrl]
  );

  const submitScoring = useCallback(async () => {
    if (!ratingProject || submitLoading) return;

    const itemKey = sanitizeItemKey(ratingProject.itemKey);
    if (!itemKey) {
      alert("itemKey kosong. Pastikan API list mengembalikan itemKey.");
      return;
    }

    const lastStatus = ratingProject?.status ? String(ratingProject.status).trim() : "";
    let processedItemKey = itemKey;
    if (lastStatus.toLowerCase() === "review by bpi") {
      if (processedItemKey.toUpperCase().startsWith("REQ")) {
        processedItemKey = processedItemKey.slice(3);
        if (processedItemKey.startsWith("/") || processedItemKey.startsWith("-") || processedItemKey.startsWith("_")) {
          processedItemKey = processedItemKey.slice(1);
        }
      }
    }

    const rolePlay = getRolePlayFromCookie(cookieSnapshot) || actorType || "REVIEWER";
    const createdBy = getCreatedByFromCookie(cookieSnapshot) || "SYSTEM";

    const payload = {
      action: 1,
      itemKey: processedItemKey,
      rolePlay,
      kualitas: parseScore(scores.kualitas, SCORE_MAX.kualitas),
      reduksiBiaya: parseScore(scores.reduksiBiaya, SCORE_MAX.reduksiBiaya),
      delivery: parseScore(scores.delivery, SCORE_MAX.delivery),
      she: parseScore(scores.she, SCORE_MAX.she),
      manfaat: parseScore(scores.manfaat, SCORE_MAX.manfaat),
      keaslianIde: parseScore(scores.keaslianIde, SCORE_MAX.keaslianIde),
      kepekaan: parseScore(scores.kepekaan, SCORE_MAX.kepekaan),
      perencanaan: parseScore(scores.perencanaan, SCORE_MAX.perencanaan),
      pelaksanaanIde: parseScore(scores.pelaksanaanIde, SCORE_MAX.pelaksanaanIde),
      sumberDaya: parseScore(scores.sumberDaya, SCORE_MAX.sumberDaya),
      totalScore,
      createdBy,
      updatedBy: "",
      deletedBy: "",
      reason: ratingProject?.status === "Review by bpi" ? feedbackBPI : feedbackLeader,
    };

    setSubmitLoading(true);
    try {
      await postScoringExecute(payload);
      closeRatingModal();
      await reload();
    } catch (e: any) {
      alert(e?.message ?? "Gagal submit scoring (SCORING_EXECUTE)");
    } finally {
      setSubmitLoading(false);
    }
  }, [
    ratingProject,
    submitLoading,
    cookieSnapshot,
    actorType,
    scores,
    totalScore,
    postScoringExecute,
    closeRatingModal,
    reload,
  ]);

  const otherFields = useMemo(() => {
    if (!detailData) return [];

    const buildAtasan = (name?: any, nrp?: any) => {
      const n = String(name ?? "").trim();
      const p = String(nrp ?? "").trim();
      if (!n && !p) return null;
      if (n && p) return `${n} - ${p}`;
      return n || p;
    };

    const combinedAtasan1 = buildAtasan(detailData.atasan1, (detailData as any).nrpAtasan1);
    const combinedAtasan2 = buildAtasan(detailData.atasan2, (detailData as any).nrpAtasan2);

    const excluded = new Set<string>([
      "ideano",
      "itemkey",
      "itemKey",
      "judul",
      "masalah",
      "uraianMasalah",
      "ideDiajukan",
      "status",
      "createdAt",
      "site",
      "jobsite",
      "division",
      "department",
      "section",
      "pembuat",
      "createdBy",
      "documentBase64",
      "documentFileName",
      "documentTemplateBase64",
      "suggestionDocumentResponseDtos",
      "totalRows",
      "totalPages",
      "totalComplete",
      "totalReviewByBpi",
      "totalReviewByLeader",
      "hubunganPenemuan",
      "nrpAtasan1",
      "nrpAtasan2",
      "approvalAtasan1At",
      "approvalAtasan1By",
      "approvalAtasan2At",
      "approvalAtasan2By",
      "period",
      "evalMorale",
      "evalQuality",
      "evalProductivity",
    ]);

    const mergedDetailData: Record<string, any> = {
      ...detailData,
      ...(combinedAtasan1 !== null ? { atasan1: combinedAtasan1 } : {}),
      ...(combinedAtasan2 !== null ? { atasan2: combinedAtasan2 } : {}),
    };
    console.log('mergedDetailData:', mergedDetailData);
    return Object.entries(mergedDetailData)
      .filter(([k, v]) => !excluded.has(k) && v !== null && v !== undefined && String(v).trim() !== "")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        key: k,
        label: prettifyKey(k),
        value: v,
      }));
  }, [detailData]);

  if (!allowed) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Approval</h1>
          <p className="text-sm text-white/90 mt-1">You don’t have access to this page.</p>
        </div>

        <Card className="p-6">
          <p className="text-sm">
            Access only for <b>REVIEWER</b> or <b>SUPERIOR</b>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            actorType from cookie: <b>{actorType || "-"}</b>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Approval</h1>
        <p className="text-sm text-white/90 mt-1">Review, search, and view project details</p>
        <p className="text-xs text-white/70 mt-1">
          Request body status (effective): <b>{requestStatus || "(empty = all)"}</b>
        </p>
      </div>

      <Card className="p-6 space-y-4">

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
            <Input value={PROJECT_TYPE_STATIC} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-keyword">Search by Keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-keyword"
                type="text"
                placeholder="Search judul / atasan / ideano..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
      </Card>

      <Card className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((p) => {
                const k = sanitizeItemKey(p.itemKey);
                const isThisDetail = detailLoading && detailTargetKey && k && detailTargetKey === k;

                return (
                  <TableRow key={`${p.nomor}-${p.itemKey ?? ""}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{p.projectName}</TableCell>

                    <TableCell>
                      <TypeBadge type={p.type} color={p.color} />
                    </TableCell>

                    <TableCell className="text-muted-foreground">{p.leader}</TableCell>

                    <TableCell>
                      <Badge variant="outline" style={statusBadgeStyle(p.status)}>
                        {normalizeStatus(p.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{formatDateCell(p.presentationDate)}</TableCell>

                    <TableCell className="text-muted-foreground">{String(p.period ?? "-")}</TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIdeanoQuery(p.nomor);
                          autoOpenRef.current = normalizeIdeano(p.nomor);
                          openDetail(p);
                        }}
                        disabled={detailLoading}
                      >
                        {isThisDetail ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading
                          </span>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Detail
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center px-4 py-2">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage <= 1 || loading || detailLoading}>
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {Math.min(currentPage, totalPages)} of {totalPages} • {totalItems} items
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentPage >= totalPages || loading || detailLoading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Dialog open={!!selectedProject} onOpenChange={(open: boolean) => !open && closeDetailModal()}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto overscroll-contain">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    style={{ backgroundColor: `${PROJECT_COLOR}15`, borderColor: PROJECT_COLOR, color: PROJECT_COLOR }}
                  >
                    SS
                  </Badge>
                  <span>{effectiveTitle}</span>
                </DialogTitle>

                <DialogDescription asChild>
                  <div className="space-y-2">
                    <div>
                      {detailLoading ? (
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading detail...
                        </span>
                      ) : detailError ? (
                        <span className="text-sm text-red-600">{detailError}</span>
                      ) : (
                        <span>{safeStr(detailData?.masalah ?? detailData?.uraianMasalah, selectedProject.description)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground min-w-[240px]">
                        Nomor: <b>{effectiveNomor || "-"}</b> • ItemKey: <b>{effectiveItemKey || "-"}</b>
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleViewSsPdf}
                          disabled={!hasTemplatePdf || isfromInject}
                          title={!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View SS
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={handleDownloadSsPdf}
                          disabled={!hasTemplatePdf || isfromInject}
                          title={!hasTemplatePdf ? "documentTemplateBase64 belum tersedia." : undefined}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download SS
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogDescription>
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

                      <Button variant="outline" onClick={handleViewDoc} disabled={!hasUploadedDoc}>
                        <FileText className="w-4 h-4 mr-2" />
                        View File
                      </Button>

                      <Button onClick={handleDownloadDoc} disabled={!hasUploadedDoc}>
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
                    <p className="mt-1">
                      <Badge variant="outline" style={statusBadgeStyle(effectiveStatus)}>
                        {effectiveStatus}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nama Pembuat</label>
                    <p className="mt-1">
                      {safeStr(detailData?.pembuat ?? selectedProject.pembuat ?? selectedProject.createdBy, "-")}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Atasan 1</label>
                    <p className="mt-1">{safeStr(detailData?.atasan1 ?? selectedProject.leader, "-")}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Atasan 2</label>
                    <p className="mt-1">{safeStr(detailData?.atasan2, "-")}</p>
                  </div>
                </div>



                <div className="grid grid-cols-2 gap-4">
                  {(detailData?.division ?? selectedProject.division) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Division</label>
                      <p className="mt-1">{safeStr(detailData?.division ?? selectedProject.division)}</p>
                    </div>
                  )}

                  {(detailData?.department ?? selectedProject.department) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="mt-1">{safeStr(detailData?.department ?? selectedProject.department)}</p>
                    </div>
                  )}

                  {(detailData?.section ?? selectedProject.section) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      <p className="mt-1">{safeStr(detailData?.section ?? selectedProject.section)}</p>
                    </div>
                  )}

                  {(detailData?.site ?? detailData?.jobsite ?? selectedProject.site) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Site</label>
                      <p className="mt-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {safeStr(detailData?.site ?? detailData?.jobsite ?? selectedProject.site)}
                      </p>
                    </div>
                  )}
                </div>

                {(detailData?.masalah ?? selectedProject.problemStatement) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Problem Statement</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                      {safeStr(detailData?.masalah ?? selectedProject.problemStatement)}
                    </p>
                  </div>
                )}

                {(detailData?.uraianMasalah ?? selectedProject.currentSituation) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Situation</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                      {safeStr(detailData?.uraianMasalah ?? selectedProject.currentSituation)}
                    </p>
                  </div>
                )}

                {(detailData?.ideDiajukan ?? selectedProject.proposedSolution) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Proposed Solution</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                      {safeStr(detailData?.ideDiajukan ?? selectedProject.proposedSolution)}
                    </p>
                  </div>
                )}

                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label>Riwayat Penilaian</Label>
                      <div className="text-xs text-muted-foreground mt-1">
                        ItemKey: <b>{effectiveItemKey || "-"}</b>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadDetailHistory(effectiveItemKey)}
                        disabled={detailHistoryLoading || !effectiveItemKey}
                      >
                        Refresh
                      </Button>

                      {detailHistoryLoading && (
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </span>
                      )}
                    </div>
                  </div>

                  {detailHistoryMessage && (
                    <div
                      className={
                        detailHistoryKind === "error"
                          ? "text-sm text-red-600 mt-3"
                          : "text-sm text-muted-foreground mt-3"
                      }
                    >
                      {detailHistoryMessage}
                    </div>
                  )}

                  {!detailHistoryLoading && !detailHistoryMessage && detailHistoryRows.length === 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">Belum ada penilaian.</div>
                  )}

                  {!detailHistoryLoading && detailHistoryRows.length > 0 && (
                    <HistoryTable rows={detailHistoryRows} columns={detailHistoryColumns} />
                  )}
                </Card>

                {otherFields.length > 0 && (
                  <div className="space-y-2">
                    <Label>Other Information</Label>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                      {otherFields.map((f) => (
                        <div key={f.key} className="p-3 rounded-lg border bg-muted/20">
                          <div className="text-xs text-muted-foreground">{f.label}</div>
                          <div className="text-sm mt-1 whitespace-pre-wrap">{formatCellValue(f.value)}</div>
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
                      <div className="text-sm mt-1">
                        {formatAuditDate(detailData?.createdAt ?? selectedProject?.presentationDate)}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="text-xs text-muted-foreground">Period</div>
                      <div className="text-sm mt-1">{effectivePeriod ?? "-"}</div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="text-xs text-muted-foreground">Tanggal Disetujui Atasan 1</div>
                      <div className="text-sm mt-1">{formatAuditDate(detailData?.approvalAtasan1At)}</div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="text-xs text-muted-foreground">Disetujui Atasan 1</div>
                      <div className="text-sm mt-1">{safeStr(detailData?.approvalAtasan1By, "-")}</div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="text-xs text-muted-foreground">Tanggal Disetujui Atasan 2</div>
                      <div className="text-sm mt-1">{formatAuditDate(detailData?.approvalAtasan2At)}</div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="text-xs text-muted-foreground">Disetujui Atasan 2</div>
                      <div className="text-sm mt-1">{safeStr(detailData?.approvalAtasan2By, "-")}</div>
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

                <div className="flex justify-end gap-2 pt-2">
                  {String(effectiveStatus).toLowerCase().includes('bpi') && (
                    <Button
                      variant="default"
                      style={{ backgroundColor: '#2563eb', color: 'white', borderColor: '#2563eb' }}
                      onClick={() => {
                        openBPIEdit(selectedProject);
                        closeDetailModal();
                      }}
                      disabled={detailLoading || !selectedProject?.itemKey}
                    >
                      Edit Data BPI
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      openRatingModal(selectedProject);
                      closeDetailModal();
                    }}
                    disabled={detailLoading || !selectedProject?.itemKey}
                  >
                    Beri Penilaian
                  </Button>

                  <Button
                    variant="destructive"
                    style={{ backgroundColor: '#dc2626', color: 'white', borderColor: '#b91c1c' }}
                    onClick={() => {
                      openRejectModal(selectedProject);
                      closeDetailModal();
                    }}
                    disabled={detailLoading || !selectedProject?.itemKey}
                  >
                    Tolak Pengajuan
                  </Button>

                  <Button variant="outline" onClick={closeDetailModal} disabled={detailLoading}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={ratingOpen}
        onOpenChange={(v: boolean) => {
          if (!v) closeRatingModal();
          else setRatingOpen(true);
        }}
      >
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle>Penilaian</DialogTitle>
            <DialogDescription>
              {ratingProject ? (
                <>
                  ItemKey: <b>{sanitizeItemKey(ratingProject.itemKey) || "-"}</b> • Project: <b>{ratingProject.projectName}</b>
                </>
              ) : (
                "Penilaian"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Riwayat Penilaian</Label>
                  <div className="text-xs text-muted-foreground mt-1">
                    {historyRows.length > 0 ? (
                      <>
                        Auto-filled from latest history:{" "}
                        <b>{tryFormatDate(historyRows[0]?.createD_AT ?? historyRows[0]?.createdAt ?? historyRows[0]?.created_at)}</b>
                      </>
                    ) : (
                      "Tidak ada history (label tetap hitam)."
                    )}
                  </div>
                </div>

                {historyLoading && (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading history...
                  </span>
                )}
              </div>

              {historyMessage && (
                <div className={historyKind === "error" ? "text-sm text-red-600 mt-3" : "text-sm text-muted-foreground mt-3"}>
                  {historyMessage}
                </div>
              )}

              {!historyLoading && !historyMessage && historyRows.length === 0 && (
                <div className="mt-3 text-sm text-muted-foreground">Belum ada penilaian sebelumnya.</div>
              )}

              {!historyLoading && historyRows.length > 0 && <HistoryTable rows={historyRows} columns={historyColumns} />}
            </Card>


            <Card className="p-4">
              <div className="space-y-2">
                <Label>Total Score</Label>
                <Input className="w-full" value={String(totalScore)} readOnly />
                {lastTotalScore !== null && (
                  <div className="text-xs text-muted-foreground mt-1">Last: {lastTotalScore}</div>
                )}
              </div>
              <span className="block mt-2 text-xs text-muted-foreground">
                rolePlay & createdBy dikirim dari frontend (diambil dari cookie).
              </span>
            </Card>

            {ratingProject?.status === "Review by bpi" && (
              /* Feedback BPI Card */
              <Card className="p-4">
                <div className="space-y-2">
                  <Label>Feedback BPI</Label>
                  <Textarea
                    className="w-full min-h-[80px] bg-white disabled:bg-gray-100"
                    placeholder="Masukkan feedback BPI..."
                    value={feedbackBPI}
                    onChange={e => setFeedbackBPI(e.target.value)}
                    disabled={!feedbackBPIEnabled}
                    readOnly={!feedbackBPIEnabled}
                  />
                  {!feedbackBPIEnabled && (
                    <div className="text-xs text-gray-400 mt-1">Feedback hanya bisa diisi jika Total Score berbeda dari sebelumnya.</div>
                  )}
                </div>
              </Card>
            )}
            {ratingProject?.status === "Review by leader" && (
              /* Feedback Leader Card */
              <Card className="p-4">
                <div className="space-y-2">
                  <Label>Feedback Leader</Label>
                  <Textarea
                    className="w-full min-h-[80px] bg-white disabled:bg-gray-100"
                    placeholder="Masukkan feedback Leader..."
                    value={feedbackLeader}
                    disabled={!feedbackBPIEnabled}
                    readOnly={!feedbackBPIEnabled}
                    onChange={e => setFeedbackLeader(e.target.value)}
                  />
                </div>
              </Card>
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Score Detail</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={retrieveScoresFromHistory}
                  disabled={!hasHistoryLatestScores}
                >
                  Retrieve
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCORE_FIELD_ORDER.map((key) => {
                  const meta = SCORE_CRITERIA[key];
                  return (
                    <ScoreField
                      key={key}
                      label={`${meta.title} (max ${meta.max})`}
                      value={scores[key]}
                      max={meta.max}
                      disabled={submitLoading}
                      changed={isScoreChanged(key)}
                      onOpen={() => openCriteriaModal(key)}
                    />
                  );
                })}
              </div>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeRatingModal} disabled={submitLoading}>
                Batal
              </Button>

              <Button onClick={submitScoring} disabled={historyLoading || submitLoading || !ratingProject}>
                {submitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan Penilaian"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={criteriaModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) closeCriteriaModal();
          else setCriteriaModalOpen(true);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle>
              {activeCriteria ? `${activeCriteria.title} (0–${activeCriteria.max})` : "Kriteria Penilaian"}
            </DialogTitle>
            <DialogDescription>
              Pilih nilai berdasarkan range penilaian di bawah ini.
            </DialogDescription>
          </DialogHeader>

          {activeCriteria && (
            <div className="space-y-5 mt-2">
              <div className="rounded-lg border bg-muted/30 overflow-hidden">
                <div className="px-4 py-3 text-sm font-medium border-b bg-muted/60">
                  Range Nilai | Keterangan
                </div>

                <div className="divide-y">
                  {activeCriteria.guides.map((g, idx) => (
                    <div key={`${activeCriteria.key}-${idx}`} className="px-4 py-3 text-sm">
                      <span className="font-medium text-foreground">{g.range}</span>
                      <span className="text-foreground"> = </span>
                      <span className="text-muted-foreground">{g.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-[0.5em]">
                <Label className="invisible mt-[0.5em] block">{activeCriteria.title}</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={activeCriteria.max}
                  step={1}
                  value={criteriaDraftValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw.replace(/[^\d]/g, "");

                    if (cleaned === "") {
                      setCriteriaDraftValue("");
                      return;
                    }

                    const n = Number(cleaned);
                    const clamped = Number.isNaN(n) ? 0 : clampNumber(n, 0, activeCriteria.max);
                    setCriteriaDraftValue(String(clamped));
                  }}
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                  autoFocus
                  className="border border-slate-300 bg-white shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <div className="text-xs text-muted-foreground">
                  Masukkan nilai 0 sampai {activeCriteria.max}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeCriteriaModal}>
                  Batal
                </Button>
                <Button onClick={saveCriteriaValue}>Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={rejectModal && !!rejectProject} onOpenChange={(open: boolean) => !open && closeRejectModal()}>
        <DialogContent className="min-w-[70vw] w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto overscroll-contain">
          {rejectProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    style={{ backgroundColor: `${PROJECT_COLOR}15`, borderColor: PROJECT_COLOR, color: PROJECT_COLOR }}
                  >
                    SS
                  </Badge>
                  <span>Tolak Pengajuan</span>
                </DialogTitle>
                <DialogDescription>
                  Nomor: <b>{rejectProject.nomor || "-"}</b>
                </DialogDescription>
              </DialogHeader>

              <Card className="p-4 space-y-2">
                <Label htmlFor="reject-reason">Reason</Label>
                <Textarea
                  id="reject-reason"
                  style={{ width: '600px', height: '180px', fontSize: '1.1rem', resize: 'vertical' }}
                  placeholder="Masukkan alasan penolakan..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </Card>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="destructive"
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    submitRejection();
                  }}
                >
                  Submit Tolak
                </Button>

                <Button variant="outline" onClick={closeRejectModal}>
                  Batal
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={bpiEditModalOpen} onOpenChange={(open: boolean) => !open && closeBPIEditModal()}>
        <DialogContent style={{ width: 600, height: 500 }} className="overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle>Edit Data BPI</DialogTitle>
            <DialogDescription>Pilih data untuk BPI</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Atasan 1</Label>
              <Select
                options={bpiEditMasterData.masterList.map((m: any) => ({ value: m.nrp, label: `${m.nrp} - (${m.nama})` }))}
                value={bpiEditMasterData.masterList
                  .map((m: any) => ({ value: m.nrp, label: `${m.nrp} - (${m.nama})` }))
                  .find(opt => opt.value === bpiEditDropdown.atasan1) || null}
                onChange={opt => setBpiEditDropdown(d => ({ ...d, atasan1: opt ? opt.value : "" }))}
                isClearable
                placeholder="Pilih Atasan 1"
                classNamePrefix="rs"
                styles={{
                  control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                  input: (base) => ({ ...base, margin: 0, padding: 0 }),
                  indicatorsContainer: (base) => ({ ...base, height: 36 }),
                }}
              />
            </div>
            <div>
              <Label>Atasan 2</Label>
              <Select
                options={bpiEditMasterData.masterList.map((m: any) => ({ value: m.nrp, label: `${m.nrp} - (${m.nama})` }))}
                value={bpiEditMasterData.masterList
                  .map((m: any) => ({ value: m.nrp, label: `${m.nrp} - (${m.nama})` }))
                  .find(opt => opt.value === bpiEditDropdown.atasan2) || null}
                onChange={opt => setBpiEditDropdown(d => ({ ...d, atasan2: opt ? opt.value : "" }))}
                isClearable
                placeholder="Pilih Atasan 2"
                classNamePrefix="rs"
                styles={{
                  control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                  input: (base) => ({ ...base, margin: 0, padding: 0 }),
                  indicatorsContainer: (base) => ({ ...base, height: 36 }),
                }}
              />
            </div>
            <div>
              <Label>Divisi</Label>
              <Select
                options={bpiEditMasterData.divisionList.map((d: any) => ({ value: d.divisionName, label: d.divisionName }))}
                value={bpiEditMasterData.divisionList
                  .map((d: any) => ({ value: d.divisionName, label: d.divisionName }))
                  .find(opt => opt.value === bpiEditDropdown.divisi) || null}
                onChange={opt => setBpiEditDropdown(d => ({ ...d, divisi: opt ? opt.value : "" }))}
                isClearable
                placeholder="Pilih Divisi"
                classNamePrefix="rs"
                styles={{
                  control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                  input: (base) => ({ ...base, margin: 0, padding: 0 }),
                  indicatorsContainer: (base) => ({ ...base, height: 36 }),
                }}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select
                options={bpiEditMasterData.departmentList.map((d: any) => ({ value: d.departmentName, label: d.departmentName }))}
                value={bpiEditMasterData.departmentList
                  .map((d: any) => ({ value: d.departmentName, label: d.departmentName }))
                  .find(opt => opt.value === bpiEditDropdown.department) || null}
                onChange={opt => setBpiEditDropdown(d => ({ ...d, department: opt ? opt.value : "" }))}
                isClearable
                placeholder="Pilih Department"
                classNamePrefix="rs"
                styles={{
                  control: (base) => ({ ...base, minHeight: 36, borderRadius: 6 }),
                  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
                  input: (base) => ({ ...base, margin: 0, padding: 0 }),
                  indicatorsContainer: (base) => ({ ...base, height: 36 }),
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeBPIEditModal}>Close</Button>
              <Button variant="default" onClick={saveBPIEditModal}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
