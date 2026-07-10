import dashboardData from "../../components/dashboard-demo/DashboardDemoData.json";
import { buildExtraSsDummyRows } from "./buildSsDummyRows";
import { buildExtraSsDummyRows2024 } from "./buildSsDummyRows2024";
import type {
  DummyQccQcpProject,
  DummyStepRow,
  DummySuggestionRetrieveData,
  DummySuggestionRow,
} from "./types";
import { DUMMY_LOAD_DELAY_MS } from "./config";

type DashboardRow = Record<string, unknown>;

const ssSourceBase = (dashboardData.ssList ?? []) as DashboardRow[];
const ssSourceExtra = buildExtraSsDummyRows(ssSourceBase.length);
const ssSourceExtra2024 = buildExtraSsDummyRows2024(ssSourceBase.length + ssSourceExtra.length);
const ssSource = [...ssSourceBase, ...ssSourceExtra, ...ssSourceExtra2024];
const qccSource = (dashboardData.qccList ?? []) as DashboardRow[];
const qcpSource = (dashboardData.qcpList ?? []) as DashboardRow[];

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function inDateRange(createdAt: unknown, from: string | null, to: string | null) {
  const d = parseDate(createdAt);
  if (!d) return true;
  if (from) {
    const f = new Date(from);
    if (!Number.isNaN(f.getTime()) && d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    if (!Number.isNaN(t.getTime()) && d > t) return false;
  }
  return true;
}

/** Normalisasi untuk bandingkan "Review by bpi" vs "review-by-bpi" */
export function ssStatusKey(raw: unknown) {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "");
}

export function ssStatusEquals(a: unknown, b: unknown) {
  const ka = ssStatusKey(a);
  const kb = ssStatusKey(b);
  if (!ka || !kb) return false;
  return ka === kb;
}

function matchesSsStatus(rowStatus: unknown, statusFilter: string) {
  const f = statusFilter.trim().toLowerCase();
  if (!f || f === "all") return true;
  return ssStatusEquals(rowStatus, statusFilter);
}

function filterSsDummyRows(
  requestBody: {
    createdAtFrom?: string | null;
    createdAtTo?: string | null;
    keyword?: string;
    status?: string;
  },
  includeStatus = true
) {
  const keyword = String(requestBody.keyword ?? "");
  const statusFilter = String(requestBody.status ?? "").trim();

  return ssRowsAll.filter((row) => {
    if (!matchesKeyword(row, keyword)) return false;
    if (
      !inDateRange(row.createdAt, requestBody.createdAtFrom ?? null, requestBody.createdAtTo ?? null)
    ) {
      return false;
    }
    if (includeStatus && !matchesSsStatus(row.status, statusFilter)) return false;
    return true;
  });
}

function matchesKeyword(row: DummySuggestionRow, keyword: string) {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;
  const hay = [
    row.ideano,
    row.itemKey,
    row.judul,
    row.masalah,
    row.createdBy,
    row.atasan1,
    row.site,
    row.jobsite,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(k);
}

function normalizeIdeano(raw: unknown) {
  return String(raw ?? "").trim().toUpperCase();
}

function firstMember(row: DashboardRow) {
  const members = row.members;
  if (Array.isArray(members) && members[0] && typeof members[0] === "object") {
    return members[0] as Record<string, unknown>;
  }
  return {};
}

export function simulateDummyDelay(ms = DUMMY_LOAD_DELAY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function mapSsDemoToSuggestionRow(row: DashboardRow, index: number): DummySuggestionRow {
  const ideano = String(row.ideano ?? row.itemKey ?? `DEMO/SS/${index + 1}`);
  const site = String(row.site ?? row.jobsite ?? "ADMO");
  return {
    ...row,
    ideano,
    itemKey: String(row.itemKey ?? ideano),
    judul: String(row.judul ?? row.namaGroupQccp ?? "—"),
    masalah: String(row.masalah ?? `Suggestion System improvement at ${site}`),
    uraianMasalah: String(row.uraianMasalah ?? row.masalah ?? ""),
    ideDiajukan: String(row.ideDiajukan ?? "Implementasi ide peningkatan operasional."),
    status: String(row.status ?? "Complete"),
    createdAt: String(row.createdAt ?? row.submittedDate ?? new Date().toISOString()),
    createdBy: String(row.pembuat ?? row.createdBy ?? "DEMO_USER"),
    atasan1: String(row.atasan1 ?? row.pembuat ?? "DEMO_LEADER"),
    site,
    jobsite: String(row.jobsite ?? site),
    division: row.division ? String(row.division) : undefined,
    department: row.department ? String(row.department) : undefined,
    section: row.section ? String(row.section) : undefined,
  };
}

export function mapSsDemoToRetrieve(row: DummySuggestionRow): DummySuggestionRetrieveData {
  return {
    ...row,
    pembuat: String(row.createdBy ?? row.atasan1 ?? "—"),
    hubunganPenemuan: "Operasional / Produktivitas",
    uraianProcess: "Proses standar site terkait",
    evalQuality: "High",
    evalCost: "Medium",
    evalDelivery: "High",
    evalSafety: "High",
    evalMorale: "Medium",
    evalProductivity: "High",
    documentCount: 0,
    hasDocument: false,
    suggestionDocumentResponseDtos: [],
  };
}

function mapQccQcpDemoToProject(
  row: DashboardRow,
  index: number,
  module: "QCC" | "QCP"
): DummyQccQcpProject {
  const member = firstMember(row);
  const site = String(row.siteName ?? row.lokasi ?? row.site ?? "ADMO");
  const itemKey = String(
    row.itemKey ?? `${site}/01/26/${module}/${pad4(index + 1)}`
  );
  const stepNum = Number(row.step ?? 1);
  const stepStatus =
    String(row.stepStatus ?? "") ||
    (stepNum >= 7 ? "Finished" : stepNum >= 4 ? "On Progress" : "Submitted");

  return {
    id: Number(row.id ?? index + 1),
    itemKey,
    namaGroupQccp: String(row.namaGroupQccp ?? row.judulSS ?? "—"),
    department: String(row.department ?? member.department ?? "—"),
    section: String(row.section ?? member.section ?? "—"),
    createdAt: String(row.createdAt ?? row.submittedDate ?? new Date().toISOString()),
    createdBy: String(row.createdBy ?? row.pembuatSS ?? "DEMO_USER"),
    leaderNrp: String(row.leaderNrp ?? "0110001"),
    leader: String(row.leader ?? row.leaderName ?? "—"),
    status: String(row.status ?? "in-progress"),
    step: String(stepNum),
    stepStatus,
    namaTim: String(row.namaTim ?? "—"),
    SupportingDocument: row.supportingDocument ? String(row.supportingDocument) : undefined,
  };
}

function buildStepHistory(currentStep: number, createdAt: string): DummyStepRow[] {
  const max = Math.max(1, Math.min(7, currentStep || 1));
  const base = parseDate(createdAt) ?? new Date();
  const rows: DummyStepRow[] = [];
  for (let i = 1; i <= max; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - (max - i) * 7);
    const isRejected = i === 2 && max > 2;
    const status = isRejected ? "Rejected" : (i < max ? "Approved" : "On Progress");
    rows.push({
      step: String(i),
      status,
      tanggal: d.toISOString(),
      reason: isRejected ? "Format PDF kurang lengkap dan lampiran tidak jelas" : undefined,
    });
  }
  return rows;
}

const ssRowsAll = ssSource.map(mapSsDemoToSuggestionRow);

export function getSsDummyRowsAll(): DummySuggestionRow[] {
  return ssRowsAll;
}

function normalizeSsStatus(s: unknown) {
  return String(s ?? "").toLowerCase().trim();
}

export function computeSsDummyStatusTotals(rows: DummySuggestionRow[] = ssRowsAll) {
  return {
    reviewByLeader: rows.filter((r) => normalizeSsStatus(r.status) === "review by leader").length,
    reviewByBPI: rows.filter((r) => normalizeSsStatus(r.status) === "review by bpi").length,
    completed: rows.filter((r) => normalizeSsStatus(r.status) === "complete").length,
  };
}

/** Untuk dashboard demo (mock API / monitoring) */
export function getSsDummySourceRows(): DashboardRow[] {
  return ssSource;
}
const qccRowsAll = qccSource.map((r, i) => mapQccQcpDemoToProject(r, i, "QCC"));
const qcpRowsAll = qcpSource.map((r, i) => mapQccQcpDemoToProject(r, i, "QCP"));

const qccStepByKey = new Map<string, DummyStepRow[]>(
  qccRowsAll.map((r) => [
    String(r.itemKey),
    buildStepHistory(Number(r.step ?? 1), String(r.createdAt ?? "")),
  ])
);

const qcpStepByKey = new Map<string, DummyStepRow[]>(
  qcpRowsAll.map((r) => [
    String(r.itemKey),
    buildStepHistory(Number(r.step ?? 1), String(r.createdAt ?? "")),
  ])
);

export type DummySsListResult = {
  rows: DummySuggestionRow[];
  totalRows: number;
  totalPages: number;
};

/** Total status untuk panel statistik (tanpa filter status tab) */
export function computeSsDummyMonitoringTotals(
  requestBody: Pick<
    Parameters<typeof fetchDummySsList>[0],
    "createdAtFrom" | "createdAtTo" | "keyword"
  >
) {
  return computeSsDummyStatusTotals(filterSsDummyRows({ ...requestBody, status: "" }, false));
}

export function fetchDummySsList(requestBody: {
  pageNumber?: number;
  pageSize?: number;
  createdAtFrom?: string | null;
  createdAtTo?: string | null;
  keyword?: string;
  status?: string;
}): DummySsListResult {
  const pageSize = Math.max(1, Number(requestBody.pageSize ?? 10));
  const pageNumber = Math.max(0, Number(requestBody.pageNumber ?? 0));

  const baseFiltered = filterSsDummyRows(requestBody, false);
  const statusTotals = computeSsDummyStatusTotals(baseFiltered);

  let filtered = filterSsDummyRows(requestBody, true);
  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = pageNumber * pageSize;
  filtered = filtered.slice(start, start + pageSize);

  if (filtered.length > 0) {
    filtered = filtered.map((r, i) =>
      i === 0
        ? {
            ...r,
            totalRows,
            totalPages,
            totalReviewByLeader: statusTotals.reviewByLeader,
            totalReviewByBpi: statusTotals.reviewByBPI,
            totalComplete: statusTotals.completed,
          }
        : r
    );
  }

  return { rows: filtered, totalRows, totalPages };
}

export function findDummySsByIdeano(ideano: string): DummySuggestionRow | null {
  const wanted = normalizeIdeano(ideano);
  if (!wanted) return null;
  return (
    ssRowsAll.find(
      (r) =>
        normalizeIdeano(r.ideano) === wanted || normalizeIdeano(r.itemKey) === wanted
    ) ?? null
  );
}

export function fetchDummySsDetail(itemKey: string): DummySuggestionRetrieveData | null {
  const key = String(itemKey ?? "").trim();
  if (!key) return null;
  const row =
    ssRowsAll.find(
      (r) =>
        String(r.itemKey ?? "").trim() === key ||
        normalizeIdeano(r.ideano) === normalizeIdeano(key)
    ) ?? null;
  return row ? mapSsDemoToRetrieve(row) : null;
}

export function fetchDummyQccList(): DummyQccQcpProject[] {
  return qccRowsAll;
}

export function fetchDummyQcpList(): DummyQccQcpProject[] {
  return qcpRowsAll;
}

export function fetchDummyQccStepHistory(itemKey: string): DummyStepRow[] {
  return qccStepByKey.get(itemKey) ?? [];
}

export function fetchDummyQcpStepHistory(itemKey: string): DummyStepRow[] {
  return qcpStepByKey.get(itemKey) ?? [];
}
