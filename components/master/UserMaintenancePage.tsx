import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Pencil, RefreshCw, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { API } from "../../config";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

// --- Types ---

type UserRow = {
  nrp: string;
  nama: string;
  divisionId?: string;
  divisionName?: string;
  departmentId?: string;
  departmentName?: string;
  sectionId?: string;
  sectionName?: string;
  religion?: string;
  emailOffice?: string;
  superiorName?: string;
};

type DivisionRow = {
  divisionCode: string;
  divisionName: string;
};

type DepartmentRow = {
  divisionCode: string;
  departmentCode: string;
  departmentName: string;
};

type SectionRow = {
  divisionCode: string;
  departmentCode: string;
  sectionCode: string;
  sectionName: string;
};

type ApiResponse<T> = {
  responseCode: number;
  message: string;
  data: T;
};

// --- Utils ---

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = await resp.json() as ApiResponse<T>;
  if (!resp.ok || json.responseCode !== 200) {
    throw new Error(json.message || `HTTP ${resp.status}`);
  }

  return json.data;
}

// --- Main Component ---

export default function UserMaintenancePage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const [divisions, setDivisions] = useState<DivisionRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);

  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    divisionId: "",
    departmentId: "",
    sectionId: "",
  });

  // --- Data Fetching ---

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        pageNumber: String(page),
        pageSize: String(pageSize),
      });
      const data = await fetchJson<UserRow[]>(`${API.USER_MAINTENANCE}?${query.toString()}`);
      setUsers(data);
      if (data.length > 0) {
        setTotalRows((data[0] as any).totalRows || data.length);
      } else {
        setTotalRows(0);
      }
    } catch (err: any) {
      toast.error("Gagal mengambil data user: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  const loadLookups = useCallback(async () => {
    try {
      const [divData, deptData, secData] = await Promise.all([
        fetchJson<any>(`${API.MASTER_DIVISION}?pageSize=1000`),
        fetchJson<any>(`${API.MASTER_DEPARTMENT}?pageSize=1000`),
        fetchJson<any>(`${API.MASTER_SECTION}?pageSize=1000`),
      ]);

      setDivisions((divData.items || divData.Items || []).map((d: any) => ({
        divisionCode: d.divisionCode || d.DivisionCode,
        divisionName: d.divisionName || d.DivisionName,
      })));
      setDepartments((deptData.items || deptData.Items || []).map((d: any) => ({
        divisionCode: d.divisionCode || d.DivisionCode,
        departmentCode: d.departmentCode || d.DepartmentCode,
        departmentName: d.departmentName || d.DepartmentName,
      })));
      setSections((secData.items || secData.Items || []).map((s: any) => ({
        divisionCode: s.divisionCode || s.DivisionCode,
        departmentCode: s.departmentCode || s.DepartmentCode,
        sectionCode: s.sectionCode || s.SectionCode,
        sectionName: s.sectionName || s.Name || s.SectionName,
      })));
    } catch (err: any) {
      console.error("Lookup load error:", err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // --- Handlers ---

  const handleEdit = (user: UserRow) => {
    setEditUser(user);
    setForm({
      divisionId: user.divisionId || "",
      departmentId: user.departmentId || "",
      sectionId: user.sectionId || "",
    });
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      await fetchJson(`${API.USER_MAINTENANCE}/${editUser.nrp}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("User berhasil diperbarui");
      setEditUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error("Gagal memperbarui user: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Helpers ---

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      const div = d.divisionCode || (d as any).DivisionCode;
      return div === form.divisionId;
    });
  }, [departments, form.divisionId]);

  const filteredSections = useMemo(() => {
    return sections.filter(s => {
      const div = s.divisionCode || (s as any).DivisionCode;
      const dept = s.departmentCode || (s as any).DepartmentCode;
      return div === form.divisionId && dept === form.departmentId;
    });
  }, [sections, form.divisionId, form.departmentId]);

  // --- Render ---

  return (
    <div className="py-6 space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <UserCog className="w-8 h-8" />
            User Maintenance
          </h1>
          <p className="text-white/80">Kelola organisasi user (Division, Department, Section)</p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          onClick={() => loadUsers()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Card - Styled like Approval/SS */}
      <Card className="shadow-sm border-0 bg-white p-6 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-2 col-span-1 sm:col-span-1">
            <Label htmlFor="search-nrp-name" className="text-sm font-medium text-slate-700">Search NRP / Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="search-nrp-name"
                placeholder="Search NRP / Nama..."
                className="pl-9 h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-800">Daftar User</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto border rounded-lg shadow-inner bg-slate-50/20">
            <Table className="w-[1400px] max-w-none table-fixed">
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[50px] text-center font-bold text-slate-600">No</TableHead>
                  <TableHead className="w-[100px] font-bold text-slate-600">NRP</TableHead>
                  <TableHead className="w-[200px] font-bold text-slate-600">Nama</TableHead>
                  <TableHead className="w-[150px] font-bold text-slate-600">Division</TableHead>
                  <TableHead className="w-[150px] font-bold text-slate-600">Department</TableHead>
                  <TableHead className="w-[150px] font-bold text-slate-600">Section</TableHead>
                  <TableHead className="w-[100px] font-bold text-slate-600">Religion</TableHead>
                  <TableHead className="w-[180px] font-bold text-slate-600">Email</TableHead>
                  <TableHead className="w-[150px] font-bold text-slate-600">Superior</TableHead>
                  <TableHead className="w-[120px] text-center font-bold text-slate-600 sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Memuat data user...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                      Tidak ada data user ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => (
                    <TableRow key={user.nrp} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-center font-medium text-slate-500">{((page - 1) * pageSize + idx + 1)}</TableCell>
                      <TableCell className="font-mono font-medium text-blue-600">{user.nrp}</TableCell>
                      <TableCell className="font-bold text-slate-700 truncate max-w-[200px]" title={user.nama}>{user.nama}</TableCell>
                      <TableCell>
                        {user.divisionName ? (
                          <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100">
                            {user.divisionName}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {user.departmentName ? (
                          <Badge variant="outline" className="font-medium border-slate-200 text-slate-600">
                            {user.departmentName}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {user.sectionName ? (
                          <Badge variant="outline" className="font-medium opacity-70 border-slate-100 text-slate-500">
                            {user.sectionName}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{user.religion || "-"}</TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-[150px] truncate" title={user.emailOffice}>
                        {user.emailOffice ? (
                          <a href={`mailto:${user.emailOffice}`} className="text-blue-600 hover:underline">
                            {user.emailOffice}
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 truncate max-w-[150px]" title={user.superiorName}>{user.superiorName || "-"}</TableCell>
                      <TableCell className="text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="font-bold"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Standard Approval/SS style */}
          <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bold text-slate-600 border-slate-200 hover:bg-white transition-all"
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="text-sm font-medium text-slate-500">
              Page <span className="text-slate-800">{page}</span> of <span className="text-slate-800">{totalPages}</span> • <span className="text-slate-800">{totalRows}</span> items
            </div>

            <Button
              variant="outline"
              size="sm"
              className="font-bold text-slate-600 border-slate-200 hover:bg-white transition-all"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Organisasi User</DialogTitle>
            <DialogDescription className="text-slate-500">
              Tentukan Division, Department, dan Section untuk <b className="text-slate-800">{editUser?.nama}</b> ({editUser?.nrp})
            </DialogDescription>
          </DialogHeader>

          {/* Profile Context Section */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 uppercase font-bold tracking-wider">Religion</p>
              <p className="font-medium text-slate-700">{editUser?.religion || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 uppercase font-bold tracking-wider">Superior</p>
              <p className="font-medium text-slate-700">{editUser?.superiorName || "-"}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-slate-400 uppercase font-bold tracking-wider">Email Office</p>
              <p className="font-medium text-slate-700">{editUser?.emailOffice || "-"}</p>
            </div>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Division</Label>
              <Select 
                value={form.divisionId} 
                onValueChange={(val) => setForm({ ...form, divisionId: val, departmentId: "", sectionId: "" })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih Division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map(d => (
                    <SelectItem key={d.divisionCode} value={d.divisionCode}>
                      {d.divisionCode} - {d.divisionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Department</Label>
              <Select 
                value={form.departmentId} 
                disabled={!form.divisionId}
                onValueChange={(val) => setForm({ ...form, departmentId: val, sectionId: "" })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={form.divisionId ? "Pilih Department" : "Pilih Division dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDepts.map(d => (
                    <SelectItem key={d.departmentCode} value={d.departmentCode}>
                      {d.departmentCode} - {d.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Section</Label>
              <Select 
                value={form.sectionId} 
                disabled={!form.departmentId}
                onValueChange={(val) => setForm({ ...form, sectionId: val })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={form.departmentId ? "Pilih Section" : "Pilih Department dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.map(s => (
                    <SelectItem key={s.sectionCode} value={s.sectionCode}>
                      {s.sectionCode} - {s.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={submitting} className="font-bold">
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 font-bold">
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
