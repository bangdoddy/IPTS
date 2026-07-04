import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layers3, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { API } from "../../config";
import { PATHS } from "../../routes/paths";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

type MasterTab = "division" | "department" | "section";
type DialogMode = "create" | "edit";

type DivisionRow = {
  divisionCode: string;
  divisionName: string;
  departmentCount?: number | null;
  sectionCount?: number | null;
};

type DepartmentRow = {
  divisionCode: string;
  divisionName?: string | null;
  departmentCode: string;
  departmentName: string;
  sectionCount?: number | null;
};

type SectionRow = {
  divisionCode: string;
  divisionName?: string | null;
  departmentCode: string;
  departmentName?: string | null;
  sectionCode: string;
  sectionName: string;
};

type DialogState =
  | { entity: "division"; mode: DialogMode; initial?: DivisionRow | null }
  | { entity: "department"; mode: DialogMode; initial?: DepartmentRow | null }
  | { entity: "section"; mode: DialogMode; initial?: SectionRow | null };

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

type TabMeta = {
  key: MasterTab;
  title: string;
  subtitle: string;
  path: string;
};

const TAB_META: Record<MasterTab, TabMeta> = {
  division: {
    key: "division",
    title: "Division Master",
    subtitle: "Kelola Division_T dan code-nya",
    path: PATHS.app.masterDivision,
  },
  department: {
    key: "department",
    title: "Department Master",
    subtitle: "Kelola Department_T dengan hierarki division",
    path: PATHS.app.masterDepartment,
  },
  section: {
    key: "section",
    title: "Section Master",
    subtitle: "Kelola Section_T dengan hierarki division dan department",
    path: PATHS.app.masterSection,
  },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const LOOKUP_PAGE_SIZE = 5000;

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function apiPathForTab(tab: MasterTab) {
  if (tab === "division") return API.MASTER_DIVISION;
  if (tab === "department") return API.MASTER_DEPARTMENT;
  return API.MASTER_SECTION;
}

function toText(v: unknown) {
  return String(v ?? "").trim();
}

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

function entityLabel(entity: DialogState["entity"]) {
  return entity === "division" ? "Division" : entity === "department" ? "Department" : "Section";
}

function blankDialog(entity: DialogState["entity"]): DialogState {
  return { entity, mode: "create" };
}

function getActiveTab(pathname: string): MasterTab {
  const lower = pathname.toLowerCase();
  if (lower.includes("/master/section")) return "section";
  if (lower.includes("/master/department")) return "department";
  return "division";
}

function buildTabRows(tab: MasterTab, data: { divisions: DivisionRow[]; departments: DepartmentRow[]; sections: SectionRow[] }) {
  if (tab === "division") return data.divisions;
  if (tab === "department") return data.departments;
  return data.sections;
}

function sortByCode(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
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

function resolveDivisionCode(row: DivisionRow) {
  const code = toText(row.divisionCode);
  if (code && code !== "0") return code;
  const fallback = toText(row.divisionName);
  return fallback || code;
}

function buildOptionValue(...parts: string[]) {
  return parts.join("||");
}

function MasterDialog(props: {
  open: boolean;
  state: DialogState | null;
  divisions: DivisionRow[];
  departments: DepartmentRow[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  submitting: boolean;
}) {
  const entity = props.state?.entity ?? "division";
  const initial = props.state?.initial ?? null;

  const [divisionCode, setDivisionCode] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [divisionSelectValue, setDivisionSelectValue] = useState("");
  const [departmentSelectValue, setDepartmentSelectValue] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const divisionOptions = useMemo(
    () =>
      props.divisions.map((row, index) => ({
        row,
        value: buildOptionValue(resolveDivisionCode(row), toText(row.divisionName), String(index)),
      })),
    [props.divisions]
  );

  const selectedDivision = useMemo(
    () => divisionOptions.find((item) => item.value === divisionSelectValue)?.row ?? null,
    [divisionOptions, divisionSelectValue]
  );

  const filteredDepartments = useMemo(() => {
    const selectedDivisionCode = toText(selectedDivision?.divisionCode);
    const selectedDivisionName = toText(selectedDivision?.divisionName).toLowerCase();

    return props.departments
      .filter((row) => {
        const rowDivisionCode = toText(row.divisionCode);
        const rowDivisionName = toText(row.divisionName).toLowerCase();

        if (selectedDivisionCode && selectedDivisionCode !== "0") {
          return rowDivisionCode === selectedDivisionCode;
        }

        return !!selectedDivisionName && rowDivisionName === selectedDivisionName;
      })
      .sort((a, b) => a.departmentCode.localeCompare(b.departmentCode, undefined, { numeric: true, sensitivity: "base" }));
  }, [props.departments, selectedDivision]);

  const departmentOptions = useMemo(
    () =>
      filteredDepartments.map((row, index) => ({
        row,
        value: buildOptionValue(toText(row.departmentCode), toText(row.departmentName), String(index)),
      })),
    [filteredDepartments]
  );

  useEffect(() => {
    if (!props.open) return;

    if (entity === "division") {
      const divisionInitial = initial as DivisionRow | null;
      const initialDivision = divisionInitial ?? props.divisions[0] ?? null;
      const nextDivisionCode = initialDivision ? resolveDivisionCode(initialDivision) : "";
      const nextDivisionSelect =
        divisionOptions.find((item) => item.row.divisionCode === initialDivision?.divisionCode && item.row.divisionName === initialDivision?.divisionName)?.value ?? "";

      setDivisionCode(nextDivisionCode);
      setDivisionSelectValue(nextDivisionSelect);
      setDepartmentCode("");
      setDepartmentSelectValue("");
      setSectionCode("");
      setName(divisionInitial?.divisionName ?? "");
      setError("");
      return;
    }

    if (entity === "department") {
      const departmentInitial = initial as DepartmentRow | null;
      const initialDivisionOption =
        divisionOptions.find((item) => item.row.divisionCode === departmentInitial?.divisionCode && toText(item.row.divisionName) === toText(departmentInitial?.divisionName)) ??
        divisionOptions[0];

      setDivisionCode(initialDivisionOption ? resolveDivisionCode(initialDivisionOption.row) : "");
      setDivisionSelectValue(initialDivisionOption?.value ?? "");
      setDepartmentCode(String(departmentInitial?.departmentCode ?? ""));
      setDepartmentSelectValue("");
      setSectionCode("");
      setName(departmentInitial?.departmentName ?? "");
      setError("");
      return;
    }

    const sectionInitial = initial as SectionRow | null;
    const initialDivisionOption =
      divisionOptions.find((item) => item.row.divisionCode === sectionInitial?.divisionCode && toText(item.row.divisionName) === toText(sectionInitial?.divisionName)) ??
      divisionOptions[0];

    const initialDepartments = props.departments.filter((row) => {
      if (!initialDivisionOption) return false;
      const selectedCode = toText(initialDivisionOption.row.divisionCode);
      if (selectedCode && selectedCode !== "0") return toText(row.divisionCode) === selectedCode;
      return toText(row.divisionName).toLowerCase() === toText(initialDivisionOption.row.divisionName).toLowerCase();
    });

    const initialDepartment =
      initialDepartments.find((row) => row.departmentCode === sectionInitial?.departmentCode && toText(row.departmentName) === toText(sectionInitial?.departmentName)) ??
      initialDepartments[0] ??
      null;

    setDivisionCode(initialDivisionOption ? resolveDivisionCode(initialDivisionOption.row) : "");
    setDivisionSelectValue(initialDivisionOption?.value ?? "");
    setDepartmentCode(String(initialDepartment?.departmentCode ?? ""));
    setDepartmentSelectValue(
      initialDepartment
        ? buildOptionValue(toText(initialDepartment.departmentCode), toText(initialDepartment.departmentName), String(initialDepartments.findIndex((item) => item === initialDepartment)))
        : ""
    );
    setSectionCode(String(sectionInitial?.sectionCode ?? ""));
    setName(sectionInitial?.sectionName ?? "");
    setError("");
  }, [props.open, entity, initial, props.divisions, props.departments, divisionOptions]);

  useEffect(() => {
    if (!props.open) return;
    if (entity === "department") {
      setDepartmentCode((prev) => (prev ? prev : ""));
    }
    if (entity === "section") {
      if (!departmentOptions.length) {
        setDepartmentCode("");
        setDepartmentSelectValue("");
        return;
      }
      const selectedDepartment = departmentOptions.find((item) => item.value === departmentSelectValue)?.row ?? null;
      const exists = !!selectedDepartment && toText(selectedDepartment.departmentCode) === toText(departmentCode);
      if (!exists) {
        setDepartmentSelectValue(departmentOptions[0].value);
        setDepartmentCode(toText(departmentOptions[0].row.departmentCode));
      }
    }
  }, [entity, props.open, departmentOptions, departmentSelectValue, departmentCode]);

  async function handleSubmit() {
    setError("");

    try {
      if (entity === "division") {
        const payload = {
          divisionCode: toText(divisionCode),
          divisionName: toText(name),
        };
        if (!payload.divisionCode || !payload.divisionName) throw new Error("Division code dan name wajib diisi.");
        await props.onSubmit(payload);
        return;
      }

      if (entity === "department") {
        const payload = {
          divisionCode: toText(divisionCode),
          departmentCode: toText(departmentCode),
          departmentName: toText(name),
        };
        if (!payload.divisionCode || !payload.departmentCode || !payload.departmentName) throw new Error("Division, department code, dan name wajib diisi.");
        await props.onSubmit(payload);
        return;
      }

      const payload = {
        divisionCode: toText(divisionCode),
        departmentCode: toText(departmentCode),
        sectionCode: toText(sectionCode),
        sectionName: toText(name),
      };
      if (!payload.divisionCode || !payload.departmentCode || !payload.sectionCode || !payload.sectionName) {
        throw new Error("Division, department, section code, dan name wajib diisi.");
      }
      await props.onSubmit(payload);
    } catch (e: any) {
      setError(e?.message || "Gagal menyimpan data");
    }
  }

  const title = `${props.state?.mode === "edit" ? "Edit" : "Tambah"} ${entityLabel(entity)}`;

  return (
    <Dialog open={props.open} onOpenChange={(open: boolean) => !open && !props.submitting && props.onClose()}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Simpan kode hierarchy secara eksplisit. Update akan memakai kode lama dari data yang diedit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {entity !== "division" && (
            <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={divisionSelectValue}
                onValueChange={(value: string) => {
                  setDivisionSelectValue(value);
                  const selected = divisionOptions.find((item) => item.value === value)?.row;
                  setDivisionCode(selected ? resolveDivisionCode(selected) : "");
                  setDepartmentSelectValue("");
                  setDepartmentCode("");
                }}
                disabled={props.submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih division" />
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
          )}

          {entity === "section" && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentSelectValue}
                onValueChange={(value: string) => {
                  setDepartmentSelectValue(value);
                  const selected = departmentOptions.find((item) => item.value === value)?.row;
                  setDepartmentCode(toText(selected?.departmentCode));
                }}
                disabled={props.submitting || departmentOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={departmentOptions.length ? "Pilih department" : "Tidak ada department"} />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.row.departmentCode} - {item.row.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(entity === "department" || entity === "section") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{entity === "department" ? "Department Code" : "Section Code"}</Label>
                <Input
                  type="text"
                  value={entity === "department" ? departmentCode : sectionCode}
                  onChange={(e) => (entity === "department" ? setDepartmentCode(e.target.value) : setSectionCode(e.target.value))}
                  disabled={props.submitting}
                  placeholder="Kode"
                />
              </div>
              <div className="space-y-2">
                <Label>{entity === "department" ? "Department Name" : "Section Name"}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={props.submitting}
                  placeholder="Nama"
                />
              </div>
            </div>
          )}

          {entity === "division" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Division Code</Label>
                <Input
                  type="text"
                  value={divisionCode}
                  onChange={(e) => setDivisionCode(e.target.value)}
                  disabled={props.submitting}
                  placeholder="Kode"
                />
              </div>
              <div className="space-y-2">
                <Label>Division Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={props.submitting}
                  placeholder="Nama"
                />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={props.onClose} disabled={props.submitting}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={props.submitting}>
            {props.submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MasterTable(props: {
  tab: MasterTab;
  rows: DivisionRow[] | DepartmentRow[] | SectionRow[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  rowStart: number;
  onEdit: (row: DivisionRow | DepartmentRow | SectionRow) => void;
  onDelete: (row: DivisionRow | DepartmentRow | SectionRow) => void;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
}) {
  const shownStart = props.totalRows === 0 ? 0 : props.rowStart + 1;
  const shownEnd = props.totalRows === 0 ? 0 : props.rowStart + props.rows.length;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {props.tab === "division" ? "Division" : props.tab === "department" ? "Department" : "Section"} List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">No</TableHead>
                {props.tab === "division" && (
                  <>
                    <TableHead>Division Code</TableHead>
                    <TableHead>Division Name</TableHead>
                    <TableHead className="text-center">Department Count</TableHead>
                    <TableHead className="text-center">Section Count</TableHead>
                  </>
                )}
                {props.tab === "department" && (
                  <>
                    <TableHead>Division</TableHead>
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead className="text-center">Section Count</TableHead>
                  </>
                )}
                {props.tab === "section" && (
                  <>
                    <TableHead>Division</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Section Code</TableHead>
                    <TableHead>Section Name</TableHead>
                  </>
                )}
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={props.tab === "division" ? 6 : props.tab === "department" ? 6 : 6} className="py-8 text-center text-muted-foreground">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              ) : (
                props.rows.map((row, index) => {
                  const rowKey =
                    props.tab === "division"
                      ? String((row as DivisionRow).divisionCode)
                      : props.tab === "department"
                      ? `${(row as DepartmentRow).divisionCode}-${(row as DepartmentRow).departmentCode}`
                      : `${(row as SectionRow).divisionCode}-${(row as SectionRow).departmentCode}-${(row as SectionRow).sectionCode}`;

                  return (
                    <TableRow key={rowKey}>
                      <TableCell className="text-center">{props.rowStart + index + 1}</TableCell>

                      {props.tab === "division" && (
                        <>
                          <TableCell className="font-medium">{(row as DivisionRow).divisionCode}</TableCell>
                          <TableCell>{(row as DivisionRow).divisionName}</TableCell>
                          <TableCell className="text-center">{(row as DivisionRow).departmentCount ?? 0}</TableCell>
                          <TableCell className="text-center">{(row as DivisionRow).sectionCount ?? 0}</TableCell>
                        </>
                      )}

                      {props.tab === "department" && (
                        <>
                          <TableCell>
                            <Badge variant="secondary">
                              {(row as DepartmentRow).divisionCode} {toText((row as DepartmentRow).divisionName) ? `- ${(row as DepartmentRow).divisionName}` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{(row as DepartmentRow).departmentCode}</TableCell>
                          <TableCell>{(row as DepartmentRow).departmentName}</TableCell>
                          <TableCell className="text-center">{(row as DepartmentRow).sectionCount ?? 0}</TableCell>
                        </>
                      )}

                      {props.tab === "section" && (
                        <>
                          <TableCell>
                            <Badge variant="secondary">
                              {(row as SectionRow).divisionCode} {toText((row as SectionRow).divisionName) ? `- ${(row as SectionRow).divisionName}` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(row as SectionRow).departmentCode} {toText((row as SectionRow).departmentName) ? `- ${(row as SectionRow).departmentName}` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{(row as SectionRow).sectionCode}</TableCell>
                          <TableCell>{(row as SectionRow).sectionName}</TableCell>
                        </>
                      )}

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => props.onEdit(row)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => props.onDelete(row)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {shownStart}-{shownEnd} dari {props.totalRows} data
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-muted-foreground">Rows</Label>
            <Select value={String(props.pageSize)} onValueChange={(value: string) => props.onPageSizeChange(Number(value))}>
              <SelectTrigger className="h-8 w-[82px]">
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

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => props.onPageChange(props.page - 1)}
              disabled={props.page <= 1}
            >
              Prev
            </Button>

            <span className="min-w-16 text-center text-sm">
              {props.page}/{props.totalPages}
            </span>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => props.onPageChange(props.page + 1)}
              disabled={props.page >= props.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MasterManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => getActiveTab(location.pathname), [location.pathname]);

  const [divisions, setDivisions] = useState<DivisionRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<DivisionRow[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageByTab, setPageByTab] = useState<Record<MasterTab, number>>({
    division: 1,
    department: 1,
    section: 1,
  });
  const [pageSizeByTab, setPageSizeByTab] = useState<Record<MasterTab, number>>({
    division: 20,
    department: 20,
    section: 20,
  });
  const [totalRowsByTab, setTotalRowsByTab] = useState<Record<MasterTab, number>>({
    division: 0,
    department: 0,
    section: 0,
  });
  const [totalPagesByTab, setTotalPagesByTab] = useState<Record<MasterTab, number>>({
    division: 1,
    department: 1,
    section: 1,
  });
  const [deleteState, setDeleteState] = useState<{
    tab: MasterTab;
    row: DivisionRow | DepartmentRow | SectionRow;
  } | null>(null);

  const loadLookups = useCallback(async () => {
    const [divisionLookupRaw, departmentLookupRaw] = await Promise.all([
      fetchJson<unknown>(buildPagedUrl(apiPathForTab("division"), 1, LOOKUP_PAGE_SIZE)),
      fetchJson<unknown>(buildPagedUrl(apiPathForTab("department"), 1, LOOKUP_PAGE_SIZE)),
    ]);

    const divisionLookup = normalizePagedPayload<DivisionRow>(divisionLookupRaw, 1, LOOKUP_PAGE_SIZE);
    const departmentLookup = normalizePagedPayload<DepartmentRow>(departmentLookupRaw, 1, LOOKUP_PAGE_SIZE);

    setDivisionOptions([...(divisionLookup.items ?? [])].sort((a, b) => sortByCode(a.divisionCode, b.divisionCode)));
    setDepartmentOptions(
      [...(departmentLookup.items ?? [])].sort(
        (a, b) =>
          a.divisionCode.localeCompare(b.divisionCode, undefined, { numeric: true, sensitivity: "base" }) ||
          a.departmentCode.localeCompare(b.departmentCode, undefined, { numeric: true, sensitivity: "base" })
      )
    );
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [divisionRaw, departmentRaw, sectionRaw] = await Promise.all([
        fetchJson<unknown>(buildPagedUrl(apiPathForTab("division"), pageByTab.division, pageSizeByTab.division)),
        fetchJson<unknown>(buildPagedUrl(apiPathForTab("department"), pageByTab.department, pageSizeByTab.department)),
        fetchJson<unknown>(buildPagedUrl(apiPathForTab("section"), pageByTab.section, pageSizeByTab.section)),
      ]);

      const divisionData = normalizePagedPayload<DivisionRow>(divisionRaw, pageByTab.division, pageSizeByTab.division);
      const departmentData = normalizePagedPayload<DepartmentRow>(departmentRaw, pageByTab.department, pageSizeByTab.department);
      const sectionData = normalizePagedPayload<SectionRow>(sectionRaw, pageByTab.section, pageSizeByTab.section);

      setDivisions([...(divisionData.items ?? [])].sort((a, b) => sortByCode(a.divisionCode, b.divisionCode)));
      setDepartments(
        [...(departmentData.items ?? [])].sort(
          (a, b) =>
            a.divisionCode.localeCompare(b.divisionCode, undefined, { numeric: true, sensitivity: "base" }) ||
            a.departmentCode.localeCompare(b.departmentCode, undefined, { numeric: true, sensitivity: "base" })
        )
      );
      setSections(
        [...(sectionData.items ?? [])].sort(
          (a, b) =>
            a.divisionCode.localeCompare(b.divisionCode, undefined, { numeric: true, sensitivity: "base" }) ||
            a.departmentCode.localeCompare(b.departmentCode, undefined, { numeric: true, sensitivity: "base" }) ||
            a.sectionCode.localeCompare(b.sectionCode, undefined, { numeric: true, sensitivity: "base" })
        )
      );

      setTotalRowsByTab({
        division: divisionData.totalCount,
        department: departmentData.totalCount,
        section: sectionData.totalCount,
      });

      setTotalPagesByTab({
        division: divisionData.totalPages,
        department: departmentData.totalPages,
        section: sectionData.totalPages,
      });

      await loadLookups();
    } catch (e: any) {
      setError(e?.message || "Gagal memuat master data");
    } finally {
      setLoading(false);
    }
  }, [loadLookups, pageByTab.department, pageByTab.division, pageByTab.section, pageSizeByTab.department, pageSizeByTab.division, pageSizeByTab.section]);

  useEffect(() => {
    if (location.pathname === PATHS.app.master) {
      navigate(PATHS.app.masterDivision, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (pageByTab.division > totalPagesByTab.division) {
      setPageByTab((prev) => ({ ...prev, division: Math.max(1, totalPagesByTab.division) }));
    }
  }, [pageByTab.division, totalPagesByTab.division]);

  useEffect(() => {
    if (pageByTab.department > totalPagesByTab.department) {
      setPageByTab((prev) => ({ ...prev, department: Math.max(1, totalPagesByTab.department) }));
    }
  }, [pageByTab.department, totalPagesByTab.department]);

  useEffect(() => {
    if (pageByTab.section > totalPagesByTab.section) {
      setPageByTab((prev) => ({ ...prev, section: Math.max(1, totalPagesByTab.section) }));
    }
  }, [pageByTab.section, totalPagesByTab.section]);

  const summary = useMemo(
    () => [
      { label: "Division", value: totalRowsByTab.division, color: "#006187" },
      { label: "Department", value: totalRowsByTab.department, color: "#EE642E" },
      { label: "Section", value: totalRowsByTab.section, color: "#5FCEA0" },
    ],
    [totalRowsByTab.department, totalRowsByTab.division, totalRowsByTab.section]
  );

  const onChangeTab = useCallback(
    (tab: string) => {
      const next = tab as MasterTab;
      navigate(TAB_META[next].path);
    },
    [navigate]
  );

  const onChangePage = useCallback((tab: MasterTab, nextPage: number) => {
    setPageByTab((prev) => ({ ...prev, [tab]: Math.max(1, nextPage) }));
  }, []);

  const onChangePageSize = useCallback((tab: MasterTab, nextPageSize: number) => {
    setPageSizeByTab((prev) => ({ ...prev, [tab]: nextPageSize }));
    setPageByTab((prev) => ({ ...prev, [tab]: 1 }));
  }, []);

  const openCreate = useCallback(() => {
    setDialog(blankDialog(activeTab));
  }, [activeTab]);

  const openEdit = useCallback(
    (row: DivisionRow | DepartmentRow | SectionRow) => {
      setDialog({ entity: activeTab, mode: "edit", initial: row as any });
    },
    [activeTab]
  );

  const askDelete = useCallback(
    (row: DivisionRow | DepartmentRow | SectionRow) => {
      setDeleteState({ tab: activeTab, row });
    },
    [activeTab]
  );

  const submitDialog = useCallback(
    async (payload: any) => {
      if (!dialog) return;
      setSubmitting(true);
      setError("");
      try {
        const tab = dialog.entity;
        const isEdit = dialog.mode === "edit";
        const baseUrl = apiPathForTab(tab);

        if (tab === "division") {
          const initial = dialog.initial as DivisionRow | undefined;
          const url = isEdit ? `${baseUrl}/${initial?.divisionCode}` : baseUrl;
          await fetchJson(url, {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify(payload),
          });
        }

        if (tab === "department") {
          const initial = dialog.initial as DepartmentRow | undefined;
          const url = isEdit
            ? `${baseUrl}/${initial?.divisionCode}/${initial?.departmentCode}`
            : baseUrl;
          await fetchJson(url, {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify(payload),
          });
        }

        if (tab === "section") {
          const initial = dialog.initial as SectionRow | undefined;
          const url = isEdit
            ? `${baseUrl}/${initial?.divisionCode}/${initial?.departmentCode}/${initial?.sectionCode}`
            : baseUrl;
          await fetchJson(url, {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify(payload),
          });
        }

        setDialog(null);
        await loadAll();
      } catch (e: any) {
        throw new Error(e?.message || "Gagal menyimpan data");
      } finally {
        setSubmitting(false);
      }
    },
    [dialog, loadAll]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteState) return;
    setSubmitting(true);
    setError("");
    try {
      const { tab, row } = deleteState;
      const baseUrl = apiPathForTab(tab);

      if (tab === "division") {
        await fetchJson(`${baseUrl}/${(row as DivisionRow).divisionCode}`, { method: "DELETE" });
      }

      if (tab === "department") {
        const current = row as DepartmentRow;
        await fetchJson(`${baseUrl}/${current.divisionCode}/${current.departmentCode}`, { method: "DELETE" });
      }

      if (tab === "section") {
        const current = row as SectionRow;
        await fetchJson(`${baseUrl}/${current.divisionCode}/${current.departmentCode}/${current.sectionCode}`, { method: "DELETE" });
      }

      setDeleteState(null);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Gagal menghapus data");
    } finally {
      setSubmitting(false);
    }
  }, [deleteState, loadAll]);

  const tabValue = activeTab;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#006187] via-[#0A8291] to-[#EE642E] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Layers3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Master Data Management</h1>
              <p className="text-sm text-white/80">Kelola division, department, dan section lengkap dengan kode hierarki.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <div className="text-xs text-white/70">{item.label}</div>
                <div className="text-xl font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">{TAB_META[activeTab].title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{TAB_META[activeTab].subtitle}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void loadAll()} disabled={loading || submitting}>
                <RefreshCw className={cn("mr-2 h-4 w-4", loading ? "animate-spin" : "")} />
                Refresh
              </Button>
              <Button onClick={openCreate} disabled={loading || submitting}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah {entityLabel(activeTab)}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={tabValue} onValueChange={onChangeTab} className="space-y-6">
            <TabsList className="w-full justify-start bg-muted/60 p-1">
              <TabsTrigger value="division">Division</TabsTrigger>
              <TabsTrigger value="department">Department</TabsTrigger>
              <TabsTrigger value="section">Section</TabsTrigger>
            </TabsList>

            <TabsContent value="division">
              <MasterTable
                tab="division"
                rows={divisions}
                page={pageByTab.division}
                pageSize={pageSizeByTab.division}
                totalRows={totalRowsByTab.division}
                totalPages={totalPagesByTab.division}
                rowStart={(pageByTab.division - 1) * pageSizeByTab.division}
                onPageChange={(nextPage) => onChangePage("division", nextPage)}
                onPageSizeChange={(nextPageSize) => onChangePageSize("division", nextPageSize)}
                onEdit={openEdit}
                onDelete={askDelete}
              />
            </TabsContent>

            <TabsContent value="department">
              <MasterTable
                tab="department"
                rows={departments}
                page={pageByTab.department}
                pageSize={pageSizeByTab.department}
                totalRows={totalRowsByTab.department}
                totalPages={totalPagesByTab.department}
                rowStart={(pageByTab.department - 1) * pageSizeByTab.department}
                onPageChange={(nextPage) => onChangePage("department", nextPage)}
                onPageSizeChange={(nextPageSize) => onChangePageSize("department", nextPageSize)}
                onEdit={openEdit}
                onDelete={askDelete}
              />
            </TabsContent>

            <TabsContent value="section">
              <MasterTable
                tab="section"
                rows={sections}
                page={pageByTab.section}
                pageSize={pageSizeByTab.section}
                totalRows={totalRowsByTab.section}
                totalPages={totalPagesByTab.section}
                rowStart={(pageByTab.section - 1) * pageSizeByTab.section}
                onPageChange={(nextPage) => onChangePage("section", nextPage)}
                onPageSizeChange={(nextPageSize) => onChangePageSize("section", nextPageSize)}
                onEdit={openEdit}
                onDelete={askDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {loading && <div className="mt-2 text-xs text-muted-foreground">Memuat data master...</div>}

      <MasterDialog
        open={!!dialog}
        state={dialog}
        divisions={divisionOptions}
        departments={departmentOptions}
        onClose={() => setDialog(null)}
        onSubmit={submitDialog}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteState} onOpenChange={(open: boolean) => !open && !submitting && setDeleteState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteState ? entityLabel(deleteState.tab) : "data"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data hierarchy dari database. Pastikan tidak ada data turunan yang masih bergantung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} disabled={submitting}>
              {submitting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
