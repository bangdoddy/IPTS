import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

/** Gradient sama dengan top bar AppShell (tab Dashboard) */
export const DASHBOARD_HEADER_GRADIENT = "linear-gradient(90deg, #e88539 0%, #0a8291 100%)";

export function HistoricalProjectPageShell(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full min-w-0">
      <Card className="shadow-lg border border-border/50 bg-card overflow-hidden rounded-2xl">
        <CardHeader
          className="p-4 sm:p-6 pb-4 border-0"
          style={{ background: DASHBOARD_HEADER_GRADIENT }}
        >
          <CardTitle className="text-lg sm:text-xl text-white font-semibold tracking-tight">
            {props.title}
          </CardTitle>
          {props.subtitle ? (
            <p className="text-sm text-white/90 mt-1">{props.subtitle}</p>
          ) : null}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">{props.children}</CardContent>
      </Card>
    </div>
  );
}

export function TruncatedReadMoreCell({ text, limit = 80 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const safe = String(text ?? "").trim() || "-";
  const isLong = safe.length > limit;

  if (!isLong) {
    return <span className="text-sm break-words [overflow-wrap:anywhere]">{safe}</span>;
  }

  return (
    <div className="min-w-0 w-full max-w-full">
      <p className="text-sm break-words [overflow-wrap:anywhere] m-0 leading-snug">
        {expanded ? safe : `${safe.slice(0, limit)}…`}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="ml-1 text-xs font-semibold text-[#EE642E] hover:underline whitespace-nowrap align-baseline"
        >
          {expanded ? "Tutup" : "Baca selengkapnya"}
        </button>
      </p>
    </div>
  );
}

export function HistoricalProjectTable(props: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border/40">
      <Table className="w-full min-w-[1100px]">
        <colgroup>
          <col style={{ width: 48 }} />
          <col style={{ width: "12%", minWidth: 120 }} />
          <col style={{ width: "40%", minWidth: 320 }} />
          <col style={{ width: "22%", minWidth: 180 }} />
          <col style={{ width: "12%", minWidth: 100 }} />
          <col style={{ width: 56 }} />
          <col style={{ width: 88 }} />
        </colgroup>
        {props.children}
      </Table>
    </div>
  );
}

export function HistoricalProjectTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="whitespace-nowrap">No</TableHead>
        <TableHead className="whitespace-nowrap">ItemKey</TableHead>
        <TableHead>Judul</TableHead>
        <TableHead className="whitespace-nowrap">Leader</TableHead>
        <TableHead className="whitespace-nowrap">Status</TableHead>
        <TableHead className="whitespace-nowrap">Step</TableHead>
        <TableHead className="text-center whitespace-nowrap">Aksi</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export const historicalTableCell = {
  no: "align-middle whitespace-nowrap",
  itemKey: "align-top text-xs break-all [overflow-wrap:anywhere]",
  judul: "align-top min-w-0 overflow-hidden",
  leader: "align-top text-sm break-words [overflow-wrap:anywhere] min-w-[180px]",
  status: "align-middle whitespace-nowrap",
  step: "align-middle whitespace-nowrap text-center",
  aksi: "align-middle text-center whitespace-nowrap",
} as const;

export function StepFilterBar(props: {
  value: string;
  onChange: (value: string) => void;
  steps: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Label htmlFor="step-filter" className="text-sm text-muted-foreground shrink-0">
        Filter Langkah
      </Label>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger id="step-filter" className="w-[180px] h-9">
          <SelectValue placeholder="Semua langkah" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua langkah</SelectItem>
          {props.steps.map((s) => (
            <SelectItem key={s} value={s}>
              Langkah {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function useStepFilter<T extends { step?: string }>(rows: T[]) {
  const [stepFilter, setStepFilter] = useState("all");

  const stepOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const s = String(r.step ?? "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (stepFilter === "all") return rows;
    return rows.filter((r) => String(r.step ?? "") === stepFilter);
  }, [rows, stepFilter]);

  return { stepFilter, setStepFilter, stepOptions, filteredRows };
}
