import { MONTH_ORDER } from "./constants";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(dt: string | Date | undefined): string {
  if (!dt) return "-";
  if (typeof dt === "string") return dt;
  if (dt instanceof Date && !isNaN(dt.getTime())) {
    return dt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  }
  return "-";
}

export function uniqueSorted(list: string[]) {
  return Array.from(new Set(list))
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function pickNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function monthToNumber(m: string): number {
  const idx = MONTH_ORDER.indexOf(m as any);
  return idx >= 0 ? idx + 1 : 1;
}

export function isQFamily(mid: string | null): boolean {
  return mid === "qcc" || mid === "qcp";
}

export function calcAchievement(plan: number, actual: number) {
  return plan > 0 ? Math.round((actual / plan) * 100) : 0;
}

export const normKey = (v: any) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

export function normalizeQStatusKey(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function buildNiceTicks(maxValue: number, tickCount = 8) {
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

export function getDepartmentAbbr(full: string): string {
  const s = String(full || "").trim();
  if (!s) return "-";
  if (s.length <= 15) return s;

  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return s.slice(0, 12) + "...";

  return parts
    .map((p) => {
      if (/^(and|&|the|of|for)$/i.test(p)) return "";
      return p[0].toUpperCase();
    })
    .join("");
}

export function buildMaxMap(rows: any[], keyField: string, valField: string) {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r[keyField] ?? "").trim();
    if (!k) continue;
    const v = Number(r[valField] ?? 0);
    if (v > (map[k] ?? 0)) map[k] = v;
  }
  return map;
}

export function uniqueLabelsFromRows(rows: any[], key: string): string[] {
  const list = rows.map((r) => String(r[key] ?? "").trim()).filter(Boolean);
  return uniqueSorted(list);
}

export function mapProjectChartRowsToPlanActual(rows: any[]): any[] {
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

export function normalizeSSStatus(raw?: string): any {
  const s = String(raw || "").trim().toLowerCase();
  const map: Record<string, string> = {
    "review-by-leader": "Review by leader",
    "reject-by-leader": "Reject by leader",
    "review-by-bpi": "Review by bpi",
    completed: "Complete",
    "review by leader": "Review by leader",
    "reject by leader": "Reject by leader",
    "review by bpi": "Review by bpi",
    complete: "Complete",
    done: "Complete",
    finished: "Complete",
  };
  return map[s] || "Review by leader";
}

export function safeUuid() {
  return Math.random().toString(36).substring(2, 11);
}
