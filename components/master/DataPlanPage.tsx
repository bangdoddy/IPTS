import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { API } from "../../config";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const LOOKUP_PAGE_SIZE = 5000;

type DataPlanRow = {
  id: number;
  divisionCode: string;
  departmentCode: string;
  sectionCode: string;
  divisionName: string;
  departmentName: string;
  sectionName: string;
  month: number;
  year: number;
  ss: number;
  qcc: number;
  qcp: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

type DivisionLookupRow = {
  divisionCode: string;
  divisionName: string;
};

type DepartmentLookupRow = {
  divisionCode: string;
  divisionName?: string | null;
  departmentCode: string;
  departmentName: string;
};

type SectionLookupRow = {
  divisionCode: string;
  divisionName?: string | null;
  departmentCode: string;
  departmentName?: string | null;
  sectionCode: string;
  sectionName: string;
};

type ApiResponse<T> = {
  responseCode?: number;
  ResponseCode?: number;
  message?: string;
  Message?: string;
  data?: T;
  Data?: T;
};

type PagedPayload<T> = {
  items?: T[];
  Items?: T[];
  pageNumber?: number;
  PageNumber?: number;
  pageSize?: number;
  PageSize?: number;
  totalCount?: number;
  TotalCount?: number;
  totalPages?: number;
  TotalPages?: number;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = await resp.json();
  } catch {
    json = null;
  }

  const code = Number(json?.responseCode ?? json?.ResponseCode ?? resp.status);
  if (!resp.ok || code !== 200) {
    throw new Error(json?.message ?? json?.Message ?? `HTTP ${resp.status}`);
  }

  return (json?.data ?? json?.Data ?? null) as T;
}

function buildPagedUrl(baseUrl: string, pageNumber: number, pageSize: number) {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  return `${baseUrl}?${query.toString()}`;
}

function normalizePagedPayload<T>(raw: unknown, pageNumber: number, pageSize: number) {
  const payload = (raw ?? {}) as PagedPayload<T>;
  const items = (payload.items ?? payload.Items ?? []) as T[];
  const totalCount = Number(payload.totalCount ?? payload.TotalCount ?? items.length) || 0;
  const safePageSize = Number(payload.pageSize ?? payload.PageSize ?? pageSize) || pageSize;
  const safePageNumber = Number(payload.pageNumber ?? payload.PageNumber ?? pageNumber) || pageNumber;
  const totalPages =
    Number(payload.totalPages ?? payload.TotalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(1, safePageSize)))) || 1;

  return {
    items,
    pageNumber: safePageNumber,
    pageSize: safePageSize,
    totalCount,
    totalPages,
  };
}

function toText(v: unknown) {
  return String(v ?? "").trim();
}

function buildOptionValue(...parts: string[]) {
  return parts.join("||");
}

function resolveDivisionCode(row: DivisionLookupRow) {
  const code = toText(row.divisionCode);
  if (code && code !== "0") return code;
  return toText(row.divisionName);
}

function resolveDepartmentCode(row: DepartmentLookupRow) {
  const code = toText(row.departmentCode);
  if (code && code !== "0") return code;
  return toText(row.departmentName);
}

function resolveSectionCode(row: SectionLookupRow) {
  const code = toText(row.sectionCode);
  if (code && code !== "0") return code;
  return toText(row.sectionName);
}

export default function DataPlanPage() {
  const [rows, setRows] = useState<DataPlanRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  const [divisionCode, setDivisionCode] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [divisionValue, setDivisionValue] = useState("");
  const [departmentValue, setDepartmentValue] = useState("");
  const [sectionValue, setSectionValue] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState(new Date().getFullYear() + "");
  const [ss, setSs] = useState("0");
  const [qcc, setQcc] = useState("0");
  const [qcp, setQcp] = useState("0");
  const [createdBy, setCreatedBy] = useState("system");
  const [divisionLookup, setDivisionLookup] = useState<DivisionLookupRow[]>([]);
  const [departmentLookup, setDepartmentLookup] = useState<DepartmentLookupRow[]>([]);
  const [sectionLookup, setSectionLookup] = useState<SectionLookupRow[]>([]);

  const divisionOptions = useMemo(
    () =>
      divisionLookup.map((row, index) => ({
        row,
        value: buildOptionValue(resolveDivisionCode(row), toText(row.divisionName), String(index)),
      })),
    [divisionLookup]
  );

  const selectedDivision = useMemo(
    () => divisionOptions.find((item) => item.value === divisionValue)?.row ?? null,
    [divisionOptions, divisionValue]
  );

  const filteredDepartments = useMemo(() => {
    if (!selectedDivision) return [] as DepartmentLookupRow[];

    const selectedDivisionCode = toText(selectedDivision.divisionCode);
    const selectedDivisionName = toText(selectedDivision.divisionName).toLowerCase();

    return departmentLookup.filter((row) => {
      const sameCode = toText(row.divisionCode) === selectedDivisionCode;
      const sameName = toText(row.divisionName).toLowerCase() === selectedDivisionName;
      if (selectedDivisionCode && selectedDivisionCode !== "0") return sameCode;
      return sameCode && sameName;
    });
  }, [departmentLookup, selectedDivision]);

  const departmentOptions = useMemo(
    () =>
      filteredDepartments.map((row, index) => ({
        row,
        value: buildOptionValue(resolveDepartmentCode(row), toText(row.departmentName), String(index)),
      })),
    [filteredDepartments]
  );

  const selectedDepartment = useMemo(
    () => departmentOptions.find((item) => item.value === departmentValue)?.row ?? null,
    [departmentOptions, departmentValue]
  );

  const filteredSections = useMemo(() => {
    if (!selectedDivision || !selectedDepartment) return [] as SectionLookupRow[];

    const selectedDivisionCode = toText(selectedDivision.divisionCode);
    const selectedDivisionName = toText(selectedDivision.divisionName).toLowerCase();
    const selectedDepartmentCode = toText(selectedDepartment.departmentCode);
    const selectedDepartmentName = toText(selectedDepartment.departmentName).toLowerCase();

    return sectionLookup.filter((row) => {
      const sameDivisionCode = toText(row.divisionCode) === selectedDivisionCode;
      const sameDivisionName = toText(row.divisionName).toLowerCase() === selectedDivisionName;
      const sameDepartmentCode = toText(row.departmentCode) === selectedDepartmentCode;
      const sameDepartmentName = toText(row.departmentName).toLowerCase() === selectedDepartmentName;

      const divisionMatch = selectedDivisionCode && selectedDivisionCode !== "0" ? sameDivisionCode : sameDivisionCode && sameDivisionName;
      const departmentMatch = selectedDepartmentCode && selectedDepartmentCode !== "0" ? sameDepartmentCode : sameDepartmentCode && sameDepartmentName;
      return divisionMatch && departmentMatch;
    });
  }, [sectionLookup, selectedDivision, selectedDepartment]);

  const sectionOptions = useMemo(
    () =>
      filteredSections.map((row, index) => ({
        row,
        value: buildOptionValue(resolveSectionCode(row), toText(row.sectionName), String(index)),
      })),
    [filteredSections]
  );

  const loadLookups = useCallback(async () => {
    setLookupLoading(true);
    try {
      const [divisionRaw, departmentRaw, sectionRaw] = await Promise.all([
        fetchJson<unknown>(buildPagedUrl(API.MASTER_DIVISION, 1, LOOKUP_PAGE_SIZE)),
        fetchJson<unknown>(buildPagedUrl(API.MASTER_DEPARTMENT, 1, LOOKUP_PAGE_SIZE)),
        fetchJson<unknown>(buildPagedUrl(API.MASTER_SECTION, 1, LOOKUP_PAGE_SIZE)),
      ]);

      const divisionData = normalizePagedPayload<DivisionLookupRow>(divisionRaw, 1, LOOKUP_PAGE_SIZE);
      const departmentData = normalizePagedPayload<DepartmentLookupRow>(departmentRaw, 1, LOOKUP_PAGE_SIZE);
      const sectionData = normalizePagedPayload<SectionLookupRow>(sectionRaw, 1, LOOKUP_PAGE_SIZE);

      setDivisionLookup(divisionData.items);
      setDepartmentLookup(departmentData.items);
      setSectionLookup(sectionData.items);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const raw = await fetchJson<unknown>(buildPagedUrl(API.MASTER_DATA_PLAN, page, pageSize));
      const data = normalizePagedPayload<DataPlanRow>(raw, page, pageSize);
      setRows(data.items);
      setTotalRows(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data plan");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [page, totalPages]);

  function resetForm() {
    setDivisionCode("");
    setDepartmentCode("");
    setSectionCode("");
    setDivisionValue("");
    setDepartmentValue("");
    setSectionValue("");
    setMonth(new Date().getMonth() + 1 + "");
    setYear(new Date().getFullYear() + "");
    setSs("0");
    setQcc("0");
    setQcp("0");
    setCreatedBy("system");
    setSaveError("");
  }

  async function handleAdd() {
    setSaveError("");

    const payload = {
      divisionCode: divisionCode.trim(),
      departmentCode: departmentCode.trim(),
      sectionCode: sectionCode.trim(),
      month: Number(month),
      year: Number(year),
      ss: Number(ss),
      qcc: Number(qcc),
      qcp: Number(qcp),
      createdBy: createdBy.trim(),
    };

    if (!payload.divisionCode || !payload.departmentCode || !payload.sectionCode || !payload.createdBy) {
      setSaveError("Division, Department, Section, dan Created By wajib diisi.");
      return;
    }

    if (payload.ss < 0 || payload.qcc < 0 || payload.qcp < 0) {
      setSaveError("Nilai SS, QCC, dan QCP tidak boleh negatif.");
      return;
    }

    setSaving(true);
    try {
      await fetchJson(API.MASTER_DATA_PLAN, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDialogOpen(false);
      resetForm();
      if (page !== 1) setPage(1);
      await loadData();
    } catch (e: any) {
      setSaveError(e?.message || "Gagal menambah data");
    } finally {
      setSaving(false);
    }
  }

  const shownStart = useMemo(() => (totalRows === 0 ? 0 : (page - 1) * pageSize + 1), [totalRows, page, pageSize]);
  const shownEnd = useMemo(() => (totalRows === 0 ? 0 : (page - 1) * pageSize + rows.length), [totalRows, page, pageSize, rows.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">Data Plan</CardTitle>
            <Button type="button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Data Plan
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="overflow-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">No</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead className="text-right">SS</TableHead>
                  <TableHead className="text-right">QCC</TableHead>
                  <TableHead className="text-right">QCP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      {loading ? "Memuat data..." : "Belum ada data."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center">{(page - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>{row.divisionName}</TableCell>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell>{row.sectionName}</TableCell>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell className="text-right">{row.ss}</TableCell>
                      <TableCell className="text-right">{row.qcc}</TableCell>
                      <TableCell className="text-right">{row.qcp}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan {shownStart}-{shownEnd} dari {totalRows} data
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(pageSize)} onValueChange={(value: string) => { setPageSize(Number(value)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[84px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Prev
              </Button>
              <span className="min-w-16 text-center text-sm">{page}/{totalPages}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Tambah Data Plan</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Division Code</Label>
              <Select
                value={divisionValue}
                onValueChange={(value: string) => {
                  setDivisionValue(value);
                  const selected = divisionOptions.find((item) => item.value === value)?.row;
                  setDivisionCode(selected ? resolveDivisionCode(selected) : "");
                  setDepartmentValue("");
                  setDepartmentCode("");
                  setSectionValue("");
                  setSectionCode("");
                }}
                disabled={saving || lookupLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lookupLoading ? "Memuat division..." : "Pilih division"} />
                </SelectTrigger>
                <SelectContent>
                  {divisionOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {resolveDivisionCode(item.row)} - {item.row.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department Code</Label>
              <Select
                value={departmentValue}
                onValueChange={(value: string) => {
                  setDepartmentValue(value);
                  const selected = departmentOptions.find((item) => item.value === value)?.row;
                  setDepartmentCode(selected ? resolveDepartmentCode(selected) : "");
                  setSectionValue("");
                  setSectionCode("");
                }}
                disabled={saving || lookupLoading || !selectedDivision}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDivision ? "Pilih department" : "Pilih division dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {resolveDepartmentCode(item.row)} - {item.row.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section Code</Label>
              <Select
                value={sectionValue}
                onValueChange={(value: string) => {
                  setSectionValue(value);
                  const selected = sectionOptions.find((item) => item.value === value)?.row;
                  setSectionCode(selected ? resolveSectionCode(selected) : "");
                }}
                disabled={saving || lookupLoading || !selectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDepartment ? "Pilih section" : "Pilih department dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {resolveSectionCode(item.row)} - {item.row.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Created By</Label>
              <Input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="NRP / username" disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={month} onValueChange={setMonth} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Jan</SelectItem>
                  <SelectItem value="2">Feb</SelectItem>
                  <SelectItem value="3">Mar</SelectItem>
                  <SelectItem value="4">Apr</SelectItem>
                  <SelectItem value="5">Mei</SelectItem>
                  <SelectItem value="6">Jun</SelectItem>
                  <SelectItem value="7">Jul</SelectItem>
                  <SelectItem value="8">Agu</SelectItem>
                  <SelectItem value="9">Sep</SelectItem>
                  <SelectItem value="10">Okt</SelectItem>
                  <SelectItem value="11">Nov</SelectItem>
                  <SelectItem value="12">Des</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Input type="number" min={2000} max={2100} value={year} onChange={(e) => setYear(e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label>SS</Label>
              <Input type="number" min={0} value={ss} onChange={(e) => setSs(e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label>QCC</Label>
              <Input type="number" min={0} value={qcc} onChange={(e) => setQcc(e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>QCP</Label>
              <Input type="number" min={0} value={qcp} onChange={(e) => setQcp(e.target.value)} disabled={saving} />
            </div>
          </div>

          {saveError && <div className="text-sm text-red-600">{saveError}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="button" onClick={() => void handleAdd()} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
